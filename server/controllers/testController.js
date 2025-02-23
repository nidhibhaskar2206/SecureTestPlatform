import { z } from 'zod';
import prisma from '../prisma.js';

const testSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string(),
  duration: z.number().min(1),
  totalMarks: z.number().min(1)
});

const questionSchema = z.object({
  testId: z.number().min(1),
  questionText: z.string(),
  marks: z.number().min(1),
  correctOption: z.number().min(0).max(3)
});

const optionSchema = z.object({
  questionId: z.number().min(1),
  optionText: z.string()
});

export const createTest = async (req, res) => {
  try {
    const data = testSchema.parse(req.body);
    const test = await prisma.test.create({
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        totalMarks: data.totalMarks,
        createdBy: req.user.id
      }
    });
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

export const addQuestion = async (req, res) => {
  try {
    const data = questionSchema.parse(req.body);
    const question = await prisma.question.create({
      data: {
        questionText: data.questionText,
        marks: data.marks,
        correctOption: data.correctOption
      }
    });
    await prisma.testQuestionRelation.create({
      data: {
        testId: data.testId,
        questionId: question.id
      }
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

export const addOption = async (req, res) => {
  try {
    const data = optionSchema.parse(req.body);
    const option = await prisma.option.create({
      data: {
        optionText: data.optionText
      }
    });
    await prisma.questionOption.create({
      data: {
        questionId: data.questionId,
        optionId: option.id
      }
    });
    res.status(201).json(option);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

export const getAllTests = async (req, res) => {
  const tests = await prisma.test.findMany({
    where: {
      isActive: true,
      ...(req.user?.role !== 'ADMIN' && {
        userTests: {
          some: {
            userId: req.user.id
          }
        }
      })
    },
    include: {
      creator: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });
  res.json(tests);
};

export const getTestById = async (req, res) => {
  const test = await prisma.test.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      questions: {
        include: {
          question: {
            include: {
              options: {
                include: {
                  option: true
                }
              }
            }
          }
        }
      }
    }
  });
  if (!test) {
    return res.status(404).json({ error: 'Test not found' });
  }
  res.json(test);
};