import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import config from "../../../utils/config";
import { toast } from "react-toastify";

const TestPage = () => {
  const { testId, userId } = useParams();
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTestDetailsAndUpdateSession = async () => {
      try {
        const assignRes = await axios.get(
          `${config.API_URL}/api/sessions/check-assignment/${testId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (assignRes.data.error) {
          setMessage(assignRes.data.error);
          return;
        }
        
        // Fetch Test Details
        const response = await axios.get(
          `${config.API_URL}/api/tests/get-test/${testId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setTest(response.data);
        setQuestions(response.data.Questions.map((q) => q.question));
  
        // Update Session Status
        const statusRes = await axios.post(
          `${config.API_URL}/api/sessions/update-status`,
          { userId, testId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const updatedSession = statusRes.data.session;
        setSession(updatedSession);
  
        // Handle different session statuses
        if (updatedSession.status === "PENDING") {
          setMessage(
            `Test has not started yet. It will start at ${new Date(
              updatedSession.startTime
            ).toLocaleString()}`
          );
        } else if (updatedSession.status === "COMPLETED") {
          setMessage("Test has already ended. You missed it!");
        } else if (updatedSession.status === "IN_PROGRESS") {
          // Set Timer Based on Test Duration
          const endTime = new Date(updatedSession.endTime).getTime();
          const now = new Date().getTime();
          setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
        }
      } catch (error) {
        toast.error("Failed to update session status.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
  
    fetchTestDetailsAndUpdateSession();
  }, [testId, userId, token, navigate]);
  

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (session && session.status === "IN_PROGRESS") {
      handleSubmit();
    }
  }, [timeLeft, session]);

  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${config.API_URL}/api/sessions/end/${session.id}`,
        { score: calculateScore() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Test submitted successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Error submitting the test.");
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      const selectedOption = answers[q.id];
      if (q.correctOption.some((co) => co.optionId === selectedOption)) {
        score += q.marks;
      }
    });
    return score;
  };

  if (loading) return <div>Loading...</div>;

  // Show message if test has not started or already ended
  if (message) {
    return (
      <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-orange-500">{test?.Title}</h1>
        <p className="text-lg text-gray-600 mt-2">{test?.Description}</p>
        <div className="text-red-500 font-bold text-xl mt-2">{message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-orange-500">{test.Title}</h1>
      <p className="text-lg text-gray-600 mt-2">{test.Description}</p>
      <div className="text-red-500 font-bold text-xl mt-2">
        Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}
      </div>

      <div className="w-full max-w-2xl bg-white p-6 mt-6 rounded-lg shadow-md">
        {questions.map((question, index) => (
          <div key={question.id} className="mb-6">
            <h2 className="text-lg font-semibold">{index + 1}. {question.questionText}</h2>
            {question.options.map((option) => (
              <label key={option.option.id} className="block mt-2">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.option.id}
                  checked={answers[question.id] === option.option.id}
                  onChange={() => handleSelectOption(question.id, option.option.id)}
                  className="mr-2"
                />
                {option.option.optionText}
              </label>
            ))}
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="mt-6 w-full py-2 bg-orange-500 text-white font-semibold rounded-lg"
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default TestPage;
