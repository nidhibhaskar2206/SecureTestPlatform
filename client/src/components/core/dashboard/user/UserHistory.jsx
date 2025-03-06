import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../../../../utils/config";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const UserHistory = () => {
  const [tests, setTests] = useState([]);
  const [sessions, setSessions] = useState({});
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.user.UserID);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedTests = async () => {
      try {
        const response = await axios.get(
          `${config.API_URL}/api/tests/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTests(response.data);
      } catch (error) {
        toast.error("Error fetching assigned tests");
      }
    };

    fetchAssignedTests();
  }, [token, userId]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionPromises = tests.map(async (test) => {
          const response = await axios.get(
            `${config.API_URL}/api/sessions?userId=${userId}&testId=${test.TestID}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { testId: test.TestID, session: response.data };
        });

        const sessionData = await Promise.all(sessionPromises);
        const sessionMap = sessionData.reduce((acc, { testId, session }) => {
          acc[testId] = session;
          return acc;
        }, {});

        setSessions(sessionMap);
      } catch (error) {
        toast.error("Error fetching session details");
      }
    };

    if (tests.length > 0) {
      fetchSessions();
    }
  }, [tests, token, userId]);

  // Function to handle navigation to Test Summary
  const handleCardClick = (testId) => {
    const session = sessions[testId];
    
    if (!session || session.status === "PENDING") {
      toast.warn("You have not attempted this test.");
      return;
    }

    navigate(`/test/${testId}/user/${userId}/summary`);
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen">
      <h2 className="text-5xl font-bold mb-6 text-orange-500">Test History</h2>

      {tests.length === 0 ? (
        <p className="text-gray-600 text-lg">No test history found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
          {tests.map((test) => {
            const session = sessions[test.TestID];
            const status = session?.status || "PENDING";

            return (
              <div
                key={test.TestID}
                onClick={() => handleCardClick(test.TestID)}
                className="bg-white p-8 shadow-md rounded-md border flex flex-col items-center justify-center border-gray-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-gray-800">{test.Title}</h3>
                <p className="text-gray-600">{test.Description}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Duration: {test.Duration} min
                </p>
                {session && (
                  <p className="mt-1 text-sm text-gray-500">
                    Start Time: {new Date(session.startTime).toLocaleString()}
                  </p>
                )}
                <span
                  className={`mt-3 px-4 py-2 text-white text-sm font-semibold rounded ${
                    status === "PENDING" ? "bg-yellow-500" : "bg-green-500"
                  }`}
                >
                  {status === "PENDING" ? "NOT ATTEMPTED" : "VIEW SUMMARY"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserHistory;
