import express from "express";
import prisma from "../prisma.js";
import { auth } from "../middleware/auth.js";
import { assignTest } from "../controllers/assignController.js";
 
const router = express.Router();
 
/**
*  Assign a User to a Test
* Endpoint: POST /assign
*/
 
router.get("/test", (req, res) => {
  res.json({ message: "Assign route is working" });
});
 
router.post("/", assignTest);
  
/**
* Get Assigned Users for a Test
* Endpoint: GET /assign/:testId
*/
router.get("/:testId", async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    if (isNaN(testId)) return res.status(400).json({ error: "Invalid test ID" });
 
    // Check if test exists
    const test = await prisma.test.findUnique({ where: { TestID: testId } });
    if (!test) return res.status(404).json({ error: "Test not found" });
 
    // Get all assigned users
    const assignedUsers = await prisma.userTest.findMany({
      where: { testId },
      include: {
        user: {
          select: { UserID: true, FirstName: true, LastName: true, Email: true },
        },
      },
    });
 
    res.json({ testId, assignedUsers });
  } catch (error) {
    console.error("Error fetching assigned users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
 
export default router;