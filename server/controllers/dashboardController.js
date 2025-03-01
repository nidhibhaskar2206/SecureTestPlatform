import prisma from '../prisma.js';

export const getDashboardData = async (req, res) => {
  try {
    // Total tests created
    const totalTests = await prisma.test.count();

    // Total users
    const totalUsers = await prisma.user.count();

    // Tests assigned to users
    const testsAssigned = await prisma.userTest.findMany({
      include: {
        test: {
          select: {
            Title: true
          }
        },
        user: {
          select: {
            FirstName: true,
            LastName: true
          }
        }
      }
    });

    // Aggregate data for visualization
    const testsPerUser = await prisma.userTest.groupBy({
      by: ['userId'],
      _count: {
        testId: true
      },
      where: {
        user: {
          Role: 'USER'
        }
      },
    });

    // Fetch user details for aggregated data
    const userDetails = await prisma.user.findMany({
      where: {
        UserID: {
          in: testsPerUser.map((userTest) => userTest.userId),
        },
      },
      select: {
        UserID: true,
        FirstName: true,
        LastName: true,
      },
    });

    // Map user details to aggregated data
    const testsPerUserWithDetails = testsPerUser.map((userTest) => {
      const user = userDetails.find((user) => user.UserID === userTest.userId);
      return {
        ...userTest,
        user,
      };
    });

    res.status(200).json({
      totalTests,
      totalUsers,
      testsAssigned,
      testsPerUser: testsPerUserWithDetails,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};