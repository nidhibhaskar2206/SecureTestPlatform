// sessionRoutes.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const auth = require("../middleware/auth");

// GET /session/:sessionId
// Retrieves a session along with its associated test details,
// including questions (via TestQuestionRelation) and their options,
// plus any question attempts (answers) already recorded.
router.get("/session/:sessionId", auth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    // Fetch the session, including related test data and user's attempts.
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        // Include the test associated with the session
        test: {
          include: {
            // The TestQuestionRelation holds the link between tests and questions.
            Questions: {
              include: {
                // For each relation, include the full question and its options.
                question: {
                  include: {
                    // Each question's options are stored via the QuestionOption relation.
                    options: {
                      include: {
                        option: true, // Retrieves the Option details (like optionText)
                      },
                    },
                  },
                },
              },
            },
          },
        },
          
          
        questionAttempts: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Ensure the session belongs to the authenticated user.
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /session/:sessionId/answers
// Records (or updates) the user's selected option for each question.
// Expected payload format:
// {
//   "answers": [
//     { "questionId": 1, "selectedOptionId": 2 },
//     { "questionId": 2, "selectedOptionId": 5 },
//     ...
//   ]
// }
router.post("/session/:sessionId/answers", auth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers should be an array" });
    }

    // Verify the session exists and belongs to the authenticated user.
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const savedAttempts = [];

    // Loop through each answer provided
    for (const answer of answers) {
      const { questionId, selectedOptionId } = answer;

      // Using the composite primary key (sessionId, questionId) to check for an existing attempt.
      let attempt = await prisma.userQuestionAttempt.findUnique({
        where: {
          // The compound key is auto-generated as <field1>_<field2>
          sessionId_questionId: { sessionId, questionId },
        },
      });

      if (attempt) {
        // Update the existing attempt with the new option and update the timestamp.
        attempt = await prisma.userQuestionAttempt.update({
          where: { sessionId_questionId: { sessionId, questionId } },
          data: {
            chosenOptionId: selectedOptionId,
            timestamp: new Date(),
          },
        });
      } else {
        // Create a new attempt if none exists.
        attempt = await prisma.userQuestionAttempt.create({
          data: {
            sessionId,
            questionId,
            chosenOptionId: selectedOptionId,
          },
        });
      }
      savedAttempts.push(attempt);
    }

    res
      .status(201)
      .json({ message: "Answers recorded", attempts: savedAttempts });
  } catch (error) {
    console.error("Error recording answers:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
