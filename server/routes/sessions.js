import express from "express";
import prisma from "../prisma.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * 🔹 Start Test Session
 * Endpoint: POST /api/session/start/:testId
 */
router.post("/start/:testId", auth, async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    console.log("✅ Received request to start session for TestID:", testId);

    if (isNaN(testId)) {
      console.error("❌ Invalid TestID:", req.params.testId);
      return res.status(400).json({ error: "Invalid test ID" });
    }

    const test = await prisma.test.findUnique({
      where: { TestID: testId },
      include: {
        UserTests: true, // ✅ Get all assigned users
      },
    });

    // ✅ Manually check if user is assigned
    const userAssigned = test.UserTests.some(
      (ut) => ut.userId === req.user.UserID
    );

    console.log("🔹 Debug: userAssigned =", userAssigned);

    if (!userAssigned) {
      console.error("❌ User not assigned to Test:", req.user.UserID);
      return res
        .status(403)
        .json({ error: "You are not assigned to this test" });
    }

    if (!test) {
      console.error("❌ Test not found for TestID:", testId);
      return res.status(404).json({ error: "Test not found" });
    }

    if (test.UserTests.length === 0) {
      console.error("❌ User not assigned to Test:", req.user.UserID);
      return res
        .status(403)
        .json({ error: "You are not assigned to this test" });
    }

    // Check if the user already has an active session
    const activeSession = await prisma.session.findFirst({
      where: { userId: req.user.UserID, testId, status: "IN_PROGRESS" },
    });

    if (activeSession) {
      console.error(
        "❌ Active session already exists for User:",
        req.user.UserID
      );
      return res
        .status(400)
        .json({ error: "You already have an active session for this test" });
    }

    console.log("✅ Creating new session...");

    const session = await prisma.session.create({
      data: {
        userId: req.user.UserID,
        testId,
        status: "IN_PROGRESS",
        startTime: new Date(),
        endTime: new Date(Date.now() + test.Duration * 60000), // ✅ Updated duration calculation
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

    console.log("✅ Session found, creating attempt...");
    const { questionId, chosenOptionId } = req.body;

    const attempt = await prisma.userQuestionAttempt.create({
      data: {
        sessionId,
        questionId,
        chosenOptionId,
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
