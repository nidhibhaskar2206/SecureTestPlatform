import express from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Schemas
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

// Create test (Admin only)
router.post('/', auth, isAdmin, async (req, res) => {
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
});

// Add question to test (Admin only)
router.post('/questions', auth, isAdmin, async (req, res) => {
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
});

// Add option to question
router.post('/options', auth, isAdmin, async (req, res) => {
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
});

// Get all tests
router.get('/', auth, async (req, res) => {
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
});

// Get test by id with questions
router.get('/:id', auth, async (req, res) => {
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
});

export default router;























// import express from 'express';
// import { z } from 'zod';
// import prisma from '../prisma.js';
// import { auth, isAdmin } from '../middleware/auth.js';
// const router = express.Router();
// const testSchema = z.object({
//     title: z.string().min(3).max(255),
//     description: z.string(),
//     duration: z.number().min(1),
//     totalMarks: z.number().min(1),
//     questions: z.array(z.object({
//         questionText: z.string(),
//         marks: z.number().min(1),
//         correctOption: z.number().min(0).max(3),
//         options: z.array(z.string()).length(4)
//     }))
// });
// // Create test (Admin only)
// router.post('/', auth, isAdmin, async (req, res) => {
//     try {
//         const data = testSchema.parse(req.body);
//         const test = await prisma.$transaction(async (tx) => {
//             const test = await tx.test.create({
//                 data: {
//                     title: data.title,
//                     description: data.description,
//                     duration: data.duration,
//                     totalMarks: data.totalMarks,
//                     createdBy: req.user.id
//                 }
//             });
//             for (const q of data.questions) {
//                 const question = await tx.question.create({
//                     data: {
//                         questionText: q.questionText,
//                         marks: q.marks,
//                         correctOption: q.correctOption
//                     }
//                 });
//                 // Create options
//                 const options = await Promise.all(q.options.map(opt => tx.option.create({
//                     data: { optionText: opt }
//                 })));
//                 // Link options to question
//                 await Promise.all(options.map(opt => tx.questionOption.create({
//                     data: {
//                         questionId: question.id,
//                         optionId: opt.id
//                     }
//                 })));
//                 // Link question to test
//                 await tx.testQuestionRelation.create({
//                     data: {
//                         testId: test.id,
//                         questionId: question.id
//                     }
//                 });
//             }
//             return test;
//         });
//         res.status(201).json(test);
//     }
//     catch (error) {
//         res.status(400).json({ error: 'Invalid input data' });
//     }
// });
// // Get all tests
// router.get('/', auth, async (req, res) => {
//     const tests = await prisma.test.findMany({
//         where: {
//             isActive: true,
//             ...(req.user?.role !== 'ADMIN' && {
//                 userTests: {
//                     some: {
//                         userId: req.user.id
//                     }
//                 }
//             })
//         },
//         include: {
//             creator: {
//                 select: {
//                     firstName: true,
//                     lastName: true
//                 }
//             }
//         }
//     });
//     res.json(tests);
// });
// // Get test by id with questions
// router.get('/:id', auth, async (req, res) => {
//     const test = await prisma.test.findUnique({
//         where: { id: parseInt(req.params.id) },
//         include: {
//             questions: {
//                 include: {
//                     question: {
//                         include: {
//                             options: {
//                                 include: {
//                                     option: true
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     });
//     if (!test) {
//         return res.status(404).json({ error: 'Test not found' });
//     }
//     res.json(test);
// });
// export default router;
