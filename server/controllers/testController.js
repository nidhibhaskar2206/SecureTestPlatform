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
});

const optionSchema = z.object({
  questionId: z.number().min(1),
  optionText: z.string()
});

const multipleOptionsSchema = z.object({
  questionId: z.number().min(1),
  options: z.array(z.string().min(1))
});

const correctOptionSchema = z.object({
  questionId: z.number().min(1),
  optionId: z.number().min(1)
});

export const createTest = async (req, res) => {
  try {
    const data = testSchema.parse(req.body);
    const test = await prisma.test.create({
      data: {
        Title: data.title,
        Description: data.description,
        Duration: data.duration,
        TotalMarks: data.totalMarks,
        CreatedBy: req.user.UserID
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

export const addMultipleOptions = async (req, res) => {
  try {
    const data = multipleOptionsSchema.parse(req.body);
    const optionCreationPromises = data.options.map(async (optionText) => {
      const option = await prisma.option.create({
        data: {
          optionText
        }
      });
      await prisma.questionOption.create({
        data: {
          questionId: data.questionId,
          optionId: option.id
        }
      });
      return option;
    });
    const options = await Promise.all(optionCreationPromises);
    res.status(201).json(options);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

export const mapCorrectOption = async (req, res) => {
  try {
    const data = correctOptionSchema.parse(req.body);
    const correctOption = await prisma.correctOption.create({
      data: {
        questionId: data.questionId,
        optionId: data.optionId
      }
    });
    res.status(201).json(correctOption);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

export const getAllTests = async (req, res) => {
  const tests = await prisma.test.findMany({
    where: {
      ...(req.user?.Role !== 'ADMIN' && {
        UserTests: {
          some: {
            userId: req.user.UserID
          }
        }
      })
    },
    include: {
      creator: {
        select: {
          FirstName: true,
          LastName: true
        }
      }
    }
  });
  res.json(tests);
};

export const getTestById = async (req, res) => {
  const test = await prisma.test.findUnique({
    where: { TestID: parseInt(req.params.id) },
    include: {
      Questions: {
        include: {
          question: {
            include: {
              options: {
                include: {
                  option: true
                }
              },
              correctOption: true
            }
          }
        }
      },
      creator: true,
      Sessions: true,
      UserTests: true
    }
  });

  if (!test) {
    return res.status(404).json({ error: 'Test not found' });
  }

  res.json(test);
};