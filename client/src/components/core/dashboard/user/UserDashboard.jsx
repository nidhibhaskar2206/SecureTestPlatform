import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import 'chart.js/auto';
import config from "../../../../utils/config";
import { BarLoader } from '../../../common/Loader';
import '../../../../App.css'

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/dashboard/user-dashboard-data`, {
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
    return <div className="flex justify-center items-center h-screen"><BarLoader/></div>;
  }

  const { assignedTests, upcomingTests, testAttempts, proctoringWarnings, sessionDetails } = dashboardData;

  const performanceData = {
    labels: testAttempts.map((attempt) => attempt.test.Title),
    datasets: [
      {
        label: 'Scores',
        data: testAttempts.map((attempt) => attempt.score || 0),
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
    <motion.div 
      className="relative flex flex-col justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="container mx-auto p-4 mt-4">
        <motion.h1 
          className="text-4xl font-bold mb-4 text-center text-orange-500"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          User Dashboard
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div 
            className="bg-white rounded-lg shadow p-6"
            whileHover={{ x: 0, y: -5, boxShadow: "0px 0px 20px rgba(0,0,0,0.5)" }}
          >
            <h2 className="text-2xl font-semibold mb-2 text-orange-500">Assigned Tests:</h2>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              <ul className="list-disc list-inside">
                {assignedTests.map((test) => (
                  <motion.li 
                    key={test.testId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {test.test.Title} - {test.test.Description}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow p-6"
            whileHover={{ x: 0, y: -5, boxShadow: "0px 0px 20px rgba(0,0,0,0.5)" }}
          >
            <h2 className="text-2xl font-semibold mb-2 text-orange-500">Upcoming Tests:</h2>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              <ul className="list-disc list-inside">
                {upcomingTests.map((test) => (
                  <motion.li 
                    key={test.Title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {test.Title} - {test.Description}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="bg-white rounded-lg shadow p-6 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-2 text-orange-500">Test Attempts:</h2>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            <ul className="list-disc list-inside">
              {testAttempts.map((attempt) => (
                <motion.li 
                  key={attempt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {attempt.test.Title} - Score: {attempt.score || 'N/A'}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow p-6 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-2 text-orange-500">Proctoring Warnings:</h2>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            <ul className="list-disc list-inside">
              {proctoringWarnings.map((warning) => (
                <motion.li 
                  key={warning.warning.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {warning.session.test.Title} - {warning.warning.warningType}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow p-6 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-2 text-orange-500">Performance Overview:</h2>
          <Bar data={performanceData} options={options} />
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow p-6 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-2 text-orange-500">Session Details:</h2>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            <ul className="list-disc list-inside">
              {sessionDetails.map((session) => (
                <motion.li 
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {session.test.Title} - Status: {session.status}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserDashboard;