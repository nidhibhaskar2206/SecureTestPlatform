import express from "express";
import prisma from "../prisma.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * 🔹 Start Test Session (Auto ID, Start/End Time Handling)
 * Endpoint: POST /api/session/start/:testId
 */
router.post("/start", auth, async (req, res) => {
  try {
    const { userId, testId, startTime } = req.body;

    console.log(
      "✅ Received request to start session for TestID:",
      testId,
      "UserID:",
      userId
    );

    // Validate inputs
    if (!userId || !testId || !startTime) {
      return res
        .status(400)
        .json({ error: "userId, testId, and startTime are required" });
    }

    if (isNaN(testId) || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId or testId" });
    }

    // Convert startTime to Date object
    const startDateTime = new Date(startTime);
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({ error: "Invalid startTime format" });
    }

    // ✅ Fetch the test details
    const test = await prisma.test.findUnique({
      where: { TestID: testId },
      include: { UserTests: true }, // Get all assigned users
    });

    if (!test) {
      console.error("❌ Test not found for TestID:", testId);
      return res.status(404).json({ error: "Test not found" });
    }

    // ✅ Check if user is assigned to this test
    const userAssigned = test.UserTests.some((ut) => ut.userId === userId);
    if (!userAssigned) {
      console.error("❌ User not assigned to Test:", userId);
      return res
        .status(403)
        .json({ error: "You are not assigned to this test" });
    }

    // ✅ Check if the user already has an active session
    const activeSession = await prisma.session.findFirst({
      where: { userId, testId, status: "IN_PROGRESS" },
    });

    if (activeSession) {
      return res
        .status(400)
        .json({ error: "You already have an active session for this test" });
    }

    // ✅ Calculate end time using test duration
    const endTime = new Date(startDateTime.getTime() + test.Duration * 60000);

    console.log(
      "✅ Creating new session with Start Time:",
      startDateTime,
      "and End Time:",
      endTime
    );

    // ✅ Create a new session
    const session = await prisma.session.create({
      data: {
        userId,
        testId,
        status: "PENDING", // Initially pending
        startTime: startDateTime,
        endTime,
      },
    });

    console.log("✅ Session created successfully:", session);
    res.status(201).json(session);
  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔹 Record Warning
 * Endpoint: POST /api/session/warning/:sessionId
 */
router.post("/warning/:sessionId", auth, async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);

    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      console.error("❌ Invalid SessionID:", req.params.sessionId);
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const { warningType } = req.body;
    const validWarnings = [
      "TAB_SWITCH",
      "COPY_PASTE",
      "RIGHT_CLICK",
      "INSPECT_ELEMENT",
      "WINDOW_CHANGE",
    ];

    if (!validWarnings.includes(warningType)) {
      return res.status(400).json({ error: "Invalid warning type" });
    }

    console.log("Parsed warningType:", warningType);

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user.UserID },
    });

    if (!session) {
      console.error("❌ Session not found for User:", req.user.UserID);
      return res
        .status(404)
        .json({ error: "Session not found or does not belong to you" });
    }

    // Record the warning
    const warning = await prisma.warning.create({
      data: {
        warningType,
      },
    });

    // Link warning to session
    await prisma.warningSessions.create({
      data: {
        sessionId,
        warningId: warning.id,
      },
    });

    // Increment warning count in session
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        warningCount: { increment: 1 },
      },
    });

    res.status(201).json({
      message: "Warning recorded",
      warning,
      warningCount: updatedSession.warningCount,
    });
  } catch (error) {
    console.error("❌ Error in /warning/:sessionId:", error);
    return res.status(400).json({ error: "Invalid request" });
  }
});

/**
 * 🔹 End Test Session
 * Endpoint: POST /api/session/end/:sessionId
 */
router.post("/end/:sessionId", auth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      console.error(" Invalid SessionID:", req.params.sessionId);
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const { score } = req.body;
    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ error: "Invalid score" });
    }

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user.UserID },
    });

    if (!session) {
      console.error(" Session not found for User:", req.user.UserID);
      return res
        .status(404)
        .json({ error: "Session not found or does not belong to you" });
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        endTime: new Date(),
        score,
      },
    });

    res.json(updatedSession);
  } catch (error) {
    console.error(" Error in /end/:sessionId:", error);
    res.status(400).json({ error: "Invalid request" });
  }
});

/**
 * 🔹 Update Session Attributes
 * Endpoint: PATCH /api/session/update/:sessionId
 */
router.patch("/update/:sessionId", auth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      console.error("❌ Invalid SessionID:", req.params.sessionId);
      return res.status(400).json({ error: "Invalid session ID" });
    }

    // Allowed attributes for update
    const { status, rejoinAllowed, score, warningCount } = req.body;

    console.log("🔹 Incoming update data:", {
      status,
      rejoinAllowed,
      score,
      warningCount,
    });

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      console.error("❌ Session not found:", sessionId);
      return res.status(404).json({ error: "Session not found" });
    }

    // Prepare update data (only include fields present in the request)
    const updateData = {};
    if (status) updateData.status = status;
    if (typeof rejoinAllowed === "boolean")
      updateData.rejoinAllowed = rejoinAllowed;
    if (typeof score === "number" && score >= 0) updateData.score = score;
    if (typeof warningCount === "number" && warningCount >= 0)
      updateData.warningCount = warningCount;

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update" });
    }

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
    });

    console.log("✅ Session updated successfully:", updatedSession);
    res.json(updatedSession);
  } catch (error) {
    console.error("❌ Error in /update/:sessionId:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔹 Get Session Details
 * Endpoint: GET /api/session/:sessionId
 */
router.get("/:sessionId", auth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      console.error("❌ Invalid SessionID:", req.params.sessionId);
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      console.error("❌ Session not found:", sessionId);
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("❌ Error in /:sessionId:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 🔹 Save User's Question Attempt
 * Endpoint: POST /api/session/:sessionId/attempt
 */
router.post("/:sessionId/attempt", auth, async (req, res) => {
  try {
    console.log("🔹 Received Request:", req.method, req.url);
    console.log("🔹 Request Body:", req.body);

    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      console.error("❌ Invalid SessionID:", req.params.sessionId);
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const { questionId, optionText } = req.body;

    if (!questionId || !optionText) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("🔹 Checking session for ID:", sessionId);

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user.UserID },
    });

    if (!session) {
      console.error("❌ Session not found for user:", req.user.UserID);
      return res
        .status(404)
        .json({ error: "Session not found or does not belong to you" });
    }

    console.log("✅ Session found, fetching option ID...");

    // ✅ Fetch the chosen option ID based on questionId and optionText
    const option = await prisma.option.findFirst({
      where: {
        optionText: optionText,
        questionOptions: { some: { questionId: questionId } }, // Ensure it's linked to the question
      },
      select: { id: true },
    });

    if (!option) {
      console.error("❌ Option not found for question:", questionId);
      return res
        .status(404)
        .json({ error: "Option not found for the selected question" });
    }

    console.log("✅ Option found:", option.id);

    // ✅ Save attempt in `UserQuestionAttempt` table
    const attempt = await prisma.userQuestionAttempt.create({
      data: {
        sessionId,
        questionId,
        chosenOptionId: option.id,
        timestamp: new Date(),
      },
    });

    console.log("✅ Attempt saved:", attempt);
    res.status(201).json(attempt);
  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * 🔹 Get All Question Attempts for a Session
 * Endpoint: GET /api/session/:sessionId/attempts
 */
router.get("/:sessionId/attempts", auth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      console.error("❌ Invalid SessionID:", req.params.sessionId);
      return res.status(400).json({ error: "Invalid session ID" });
    }

    console.log("🔹 Fetching attempts for session:", sessionId);

    // Verify session exists and belongs to the user
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user.UserID },
    });

    if (!session) {
      console.error("❌ Session not found for user:", req.user.UserID);
      return res
        .status(404)
        .json({ error: "Session not found or does not belong to you" });
    }

    // Fetch all question attempts for this session
    const attempts = await prisma.userQuestionAttempt.findMany({
      where: { sessionId },
      include: {
        question: {
          select: { questionText: true },
        },
        chosenOption: {
          select: { optionText: true },
        },
      },
    });

    console.log("✅ Retrieved attempts:", attempts);
    res.json(attempts);
  } catch (error) {
    console.error("❌ Error in /attempts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
