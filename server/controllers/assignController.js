import express from "express";
import prisma from "../prisma.js";
import { auth } from "../middleware/auth.js";

export const assignTest = async (req, res) => {  
    const { userId, testId } = req.body;
   
    // Ensure userId and testId are valid
    if (!userId || !testId || isNaN(userId) || isNaN(testId)) {
      return res.status(400).json({ error: "Invalid userId or testId" });
    }
   
    try {
      // Check if test exists
      const test = await prisma.test.findUnique({ where: { TestID: Number(testId) } });
      if (!test) return res.status(404).json({ error: "Test not found" });
   
      // Prevent duplicate assignment
      const existingAssignment = await prisma.userTest.findFirst({
        where: { userId: Number(userId), testId: Number(testId) },
      });
   
      if (existingAssignment) {
        return res.status(400).json({ error: "User is already assigned to this test" });
      }
   
      // Assign user to test
      const assignment = await prisma.userTest.create({
        data: { userId: Number(userId), testId: Number(testId), assignedAt: new Date() },
      });
   
      res.status(201).json({ message: "User assigned to test successfully", assignment });
    } catch (error) {
      console.error("Error assigning user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };