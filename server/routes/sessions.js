import express from "express";
import { z } from "zod";
import prisma from "../prisma.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Start test session
router.post("/start/:testId", auth, async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    if (isNaN(testId))
      return res.status(400).json({ error: "Invalid test ID" });

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        userTests: { where: { userId: req.user.id } },
      },
    });

    if (!test) return res.status(404).json({ error: "Test not found" });
    if (test.userTests.length === 0)
      return res
        .status(403)
        .json({ error: "You are not assigned to this test" });

    const activeSession = await prisma.session.findFirst({
      where: {
        userId: req.user.id,
        testId,
        status: "IN_PROGRESS",
      },
    });

    if (activeSession)
      return res
        .status(400)
        .json({ error: "You already have an active session for this test" });

    const session = await prisma.session.create({
      data: {
        userId: req.user.id,
        testId,
        status: "IN_PROGRESS",
        startTime: new Date(),
        endTime: new Date(Date.now() + test.duration * 60000),
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Record warning and increase warning count
router.post("/warning/:sessionId", auth, async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);

    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      console.log("Invalid session ID:", req.params.sessionId);
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const { warningType } = z
      .object({
        
        warningType: z.enum([
          "TAB_SWITCH",
          "COPY_PASTE",
          "SCREEN_SHARE",
          "SCREEN_RECORD",
          "SCREENSHOT",
          "RIGHT_CLICK",
          "INSPECT_ELEMENT",
          "WINDOW_CHANGE",
        ]),
      })
      .parse(req.body);

    console.log("Parsed warningType:", warningType);

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user.id },
    });

    if (!session) {
      console.log("Session not found for user:", req.user.id);
      return res
        .status(404)
        .json({ error: "Session not found or does not belong to you" });
    }

    const warning = await prisma.warning.create({
      data: {
        sessionId,
        warningType,
        timestamp: new Date(),
      },
    });

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
    if (error instanceof z.ZodError) {
      console.error("❌ Zod validation error:", error.errors);
      return res.status(400).json({ error: error.errors });
    }
    console.error("❌ Error in /warning/:sessionId:", error);
    return res.status(400).json({ error: "Invalid request" });
  }


});


// End test session
router.post("/end/:sessionId", auth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId))
      return res.status(400).json({ error: "Invalid session ID" });

    const { score } = z.object({ score: z.number().min(0) }).parse(req.body);

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user.id },
    });
    if (!session)
      return res
        .status(404)
        .json({ error: "Session not found or does not belong to you" });

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
    console.error(error);
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
