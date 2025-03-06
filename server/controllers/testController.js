import { z } from 'zod';
import prisma from '../prisma.js';
import redisClient from '../utils/redis.js';

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

// Define schemas for validation
const userActivitySchema = z.object({
  userId: z.number().min(1),
  testId: z.number().min(1),
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
    await redisClient.del("all-tests");

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
  try {
    // Check Redis cache first
    const cachedTests = await redisClient.get("all-tests");
    if (cachedTests) {
      console.log("⏩ Serving all tests from Redis");
      return res.status(200).json(JSON.parse(cachedTests));
    }

    console.log("⏳ Fetching all tests from database...");
    const tests = await prisma.test.findMany({
      where: {
        ...(req.user?.Role !== "ADMIN" && {
          UserTests: {
            some: {
              userId: req.user.UserID,
            },
          },
        }),
      },
      include: {
        creator: {
          select: {
            FirstName: true,
            LastName: true,
          },
        },
      },
    });

    // Store in Redis for 10 minutes
    await redisClient.setEx("all-tests", 600, JSON.stringify(tests));

    res.status(200).json(tests);
  } catch (error) {
    console.error("❌ Error fetching all tests:", error);
    res.status(500).json({ error: "Failed to fetch all tests" });
  }
};


export const getTestById = async (req, res) => {
  try {
    const testId = parseInt(req.params.id);

    // Check Redis cache first
    const cacheKey = `test:${testId}`;
    const cachedTest = await redisClient.get(cacheKey);
    if (cachedTest) {
      console.log(`⏩ Serving test ${testId} from Redis`);
      return res.status(200).json(JSON.parse(cachedTest));
    }

    console.log(`⏳ Fetching test ${testId} from database...`);
    const test = await prisma.test.findUnique({
      where: { TestID: testId },
      include: {
        Questions: {
          include: {
            question: {
              include: {
                options: {
                  include: {
                    option: true,
                  },
                },
                correctOption: true,
              },
            },
          },
        },
        creator: true,
        Sessions: true,
        UserTests: true,
      },
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Store in Redis for 10 minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(test));

    res.status(200).json(test);
  } catch (error) {
    console.error(`❌ Error fetching test ${testId}:`, error);
    res.status(500).json({ error: "Failed to fetch test details" });
  }
};


export const getAllTestOfUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check Redis cache first
    const cacheKey = `user-tests:${userId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`⏩ Serving tests for user ${userId} from Redis`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log(`⏳ Fetching tests for user ${userId} from database...`);
    const assignedTests = await prisma.test.findMany({
      where: {
        UserTests: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        creator: {
          select: { FirstName: true, LastName: true },
        },
      },
    });

    // Store in Redis for 10 minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(assignedTests));

    res.status(200).json(assignedTests);
  } catch (error) {
    console.error(`❌ Error fetching tests for user ${userId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    const testId = parseInt(id);

    // Check if the test exists
    const test = await prisma.test.findUnique({
      where: { TestID: testId }
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Delete the test
    await prisma.test.delete({
      where: { TestID: testId }
    });

    await redisClient.del("all-tests");
    await redisClient.del(`test:${testId}`);


    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete test' });
  }
};

export const testMarks = async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    if (isNaN(testId)) {
      return res.status(400).json({ error: "Invalid test ID" });
    }

    // Fetch Total Marks from test
    const test = await prisma.test.findUnique({
      where: { TestID: testId },
      select: { TotalMarks: true },
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Calculate Sum of Marks of Existing Questions
    const currentMarks = await prisma.question.aggregate({
      where: { tests: { some: { testId: testId } } },
      _sum: { marks: true },
    });

    res.json({
      TotalMarks: test.TotalMarks,
      CurrentMarks: currentMarks._sum.marks || 0, // If no questions, set 0
    });
  } catch (error) {
    console.error("❌ Error fetching test marks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller function to get user activity on a particular test
export const getUserActivityOnTest = async (req, res) => {
  try {
    const data = userActivitySchema.parse(req.params);

    const userActivity = await prisma.userQuestionAttempt.findMany({
      where: {
        session: {
          userId: data.userId,
          testId: data.testId,
        },
      },
      include: {
        question: {
          include: {
            options: true,
            correctOption: {
              include: {
                option: true,
              },
            },
          },
        },
        chosenOption: true,
      },
    });

    if (userActivity.length === 0) {
      return res.status(404).json({ error: 'No activity found for this user on the specified test' });
    }

    const formattedActivity = userActivity.map(activity => ({
      questionText: activity.question.questionText,
      chosenOption: activity.chosenOption.optionText,
      correctOption: activity.question.correctOption.option.optionText,
    }));

    res.json(formattedActivity);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

export const testSummary = async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    const userId = parseInt(req.params.userId);

    if (isNaN(testId) || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid test ID or user ID" });
    }

    // Check Redis cache first
    const cacheKey = `test-summary:${testId}:${userId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`⏩ Serving test summary for test ${testId} and user ${userId} from Redis`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log(`⏳ Fetching test summary for test ${testId} and user ${userId} from database...`);

    const test = await prisma.test.findUnique({
      where: { TestID: testId },
      include: {
        Questions: {
          include: {
            question: {
              include: {
                options: {
                  include: { option: true },
                },
                correctOption: true,
              },
            },
          },
        },
      },
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    const attempts = await prisma.userQuestionAttempt.findMany({
      where: {
        session: { testId, userId },
      },
      include: {
        question: { select: { id: true, questionText: true, marks: true } },
        chosenOption: { select: { id: true, optionText: true } },
      },
    });

    const correctOptions = await prisma.correctOption.findMany({
      where: { questionId: { in: test.Questions.map((q) => q.question.id) } },
      include: { option: true },
    });

    const correctOptionsMap = correctOptions.reduce((acc, correctOpt) => {
      acc[correctOpt.questionId] = correctOpt.option;
      return acc;
    }, {});

    const questionsWithAttempts = test.Questions.map((q) => ({
      questionId: q.question.id,
      questionText: q.question.questionText,
      marks: q.question.marks,
      options: q.question.options.map((opt) => opt.option),
      correctOption: correctOptionsMap[q.question.id] || null,
      chosenOption: attempts.find((a) => a.question.id === q.question.id)?.chosenOption || null,
    }));

    const responseData = {
      testTitle: test.Title,
      testDescription: test.Description,
      totalMarks: test.TotalMarks,
      questions: questionsWithAttempts,
    };

    // Store in Redis for 10 minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Error fetching test summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

