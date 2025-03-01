import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";
import config from "../../../../utils/config";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/dashboard/dashboard-data`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (!dashboardData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const { totalTests, totalUsers, testsAssigned, testsPerUser} = dashboardData;

  const testsPerUserData = {
    labels: testsPerUser.map((user) => `${user.user.FirstName} ${user.user.LastName}`),
    datasets: [
      {
        label: 'Tests Per User',
        data: testsPerUser.map((user) => user._count.testId),
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            if (Number.isInteger(value)) {
              return value;
            }
          },
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-6">
    <h1 className="text-4xl font-bold text-orange-500 text-center mb-6">
      Dashboard
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Tests & Users */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-8 border-orange-500">
        <h2 className="text-2xl font-semibold text-gray-800">
          Total Tests Created:
          <span className="text-orange-500 ml-2">{totalTests}</span>
        </h2>
        <h2 className="text-2xl font-semibold text-gray-800 mt-2">
          Total Users:
          <span className="text-orange-500 ml-2">{totalUsers}</span>
        </h2>
      </div>

      {/* Tests Assigned to Users */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-8 border-orange-500">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Tests Assigned:
        </h3>
        <ul className="list-disc list-inside text-gray-600">
          {testsAssigned.map((assignment) => (
            <li key={`${assignment.userId}-${assignment.testId}`}>
              <span className="text-orange-500 font-medium">
                {assignment.user.FirstName} {assignment.user.LastName}
              </span>{" "}
              is assigned to{" "}
              <span className="text-orange-500 font-medium">
                {assignment.test.Title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Bar Chart - Tests Per User */}
    <div className="bg-white rounded-lg shadow-md p-6 mt-6 border-l-8 border-orange-500">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Tests Per User:
      </h3>
      <Bar data={testsPerUserData} options={options} />
    </div>
  </div>
  );
};

export default Dashboard;