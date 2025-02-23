import express from "express";
import { z } from "zod";
import prisma from "../prisma.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 *  Assign a User to a Test
 * Endpoint: POST /assign
 */



router.get("/test", (req, res) => {
  res.json({ message: "Assign route is working" });
});



router.post("/",async (req, res) => {
  try {
    const { userId, testId } = z
      .object({
        userId: z.number().int().positive(),
        testId: z.number().int().positive(),
      })
      .parse(req.body);

    // Check if test exists
    const test = await prisma.test.findUnique({ where: { id: testId } });
    if (!test) return res.status(404).json({ error: "Test not found" });

    // Prevent duplicate assignment
    const existingAssignment = await prisma.userTest.findFirst({
      where: { userId, testId },
    });

    if (existingAssignment)
      return res
        .status(400)
        .json({ error: "User is already assigned to this test" });

    // Assign user to test
    const assignment = await prisma.userTest.create({
      data: { userId, testId, assignedAt: new Date() },
    });

    res
      .status(201)
      .json({ message: "User assigned to test successfully", assignment });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Invalid request" });
  }
});

/**
 * Get Assigned Users for a Test
 * Endpoint: GET /assign/:testId
 */
router.get("/:testId", async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    if (isNaN(testId))
      return res.status(400).json({ error: "Invalid test ID" });

    // Check if test exists
    const test = await prisma.test.findUnique({ where: { id: testId } });
    if (!test) return res.status(404).json({ error: "Test not found" });

    // Get all assigned users
    const assignedUsers = await prisma.userTest.findMany({
      where: { testId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json({ testId, assignedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
