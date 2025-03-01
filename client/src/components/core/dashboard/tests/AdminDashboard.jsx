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
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
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
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4 text-center">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-2">Total Tests Created: {totalTests}</h2>
          <h2 className="text-2xl font-semibold">Total Users: {totalUsers}</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-2">Tests Assigned to Users:</h3>
          <ul className="list-disc list-inside">
            {testsAssigned.map((assignment) => (
              <li key={`${assignment.userId}-${assignment.testId}`}>
                {assignment.user.FirstName} {assignment.user.LastName} is assigned to {assignment.test.Title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <h3 className="text-xl font-semibold mb-2">Tests Per User:</h3>
        <Bar data={testsPerUserData} options={options} />
      </div>
    </div>
  );
};

export default Dashboard;