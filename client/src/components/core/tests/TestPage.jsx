import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import config from "../../../utils/config";
import { toast } from "react-toastify";

// Import Proctoring Hooks
import { useProctoring } from "../../../hooks/useProctoring";
import { useDevToolDetection } from "../../../hooks/useDevToolDetection";
import { useCamDetection } from "../../../hooks/useCamDetection";

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
  const [testStarted, setTestStarted] = useState(false);

  // ✅ Enable Proctoring Features after test starts
  const { fullScreen } = useProctoring({
    preventTabSwitch: testStarted,
    forceFullScreen: testStarted,
    preventContextMenu: testStarted,
    preventUserSelection: testStarted,
    preventCopy: testStarted,
  });

  // ✅ Detect if Developer Tools are Opened
  const { devToolsOpen } = useDevToolDetection({ disabled: false });

  // ✅ Detect Webcam Access (Optional)
  const { webCamStatus } = useCamDetection({ disabled: false });

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

        const response = await axios.get(
          `${config.API_URL}/api/tests/get-test/${testId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTest(response.data);
        setQuestions(response.data.Questions.map((q) => q.question));

        const statusRes = await axios.post(
          `${config.API_URL}/api/sessions/update-status`,
          { userId, testId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedSession = statusRes.data.session;
        setSession(updatedSession);

        if (updatedSession.status === "PENDING") {
          setMessage(
            `Test has not started yet. It will start at ${new Date(
              updatedSession.startTime
            ).toLocaleString()}`
          );
        } else if (updatedSession.status === "COMPLETED") {
          setMessage("Test has already ended. You missed it!");
        } else if (updatedSession.status === "IN_PROGRESS") {
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
    if (timeLeft > 0 && testStarted) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (session && session.status === "IN_PROGRESS" && testStarted) {
      handleSubmit();
    }
  }, [timeLeft, session, testStarted]);

  // ✅ Detect Cheating Attempts (Fullscreen Exit, DevTools, Webcam)
  useEffect(() => {
    const preventFullscreenExit = () => {
      if (!document.fullscreenElement && testStarted) {
        alert("⚠️ Warning: You cannot exit fullscreen mode during the test!");
        setTimeout(() => {
          requestFullscreen(); // ✅ Force fullscreen again
        }, 500); // ✅ Delay to ensure fullscreen request is processed
      }
    };

    document.addEventListener("fullscreenchange", preventFullscreenExit);

    return () => {
      document.removeEventListener("fullscreenchange", preventFullscreenExit);
    };
  }, [testStarted]);

  useEffect(() => {
    if (testStarted) {
      if (devToolsOpen) {
        alert("⚠️ Developer tools detected! Your test will be terminated.");
        handleSubmit();
      }
      if (webCamStatus === "blocked") {
        alert("⚠️ Webcam access is required! Your test will be terminated.");
        handleSubmit();
      }
    }
  }, [devToolsOpen, webCamStatus, testStarted]);

  // ✅ Force Fullscreen when Test Starts
  const handleStartTest = () => {
    setTestStarted(true);
    requestFullscreen(); // ✅ Force fullscreen on button click
  };

  // ✅ Function to Force Fullscreen
  const requestFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element
        .requestFullscreen()
        .catch(() => console.warn("Fullscreen request denied"));
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  // ✅ Handle Answer Selection
  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  // ✅ Submit Test
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

  // ✅ Calculate Test Score
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

      {!testStarted ? (
        <button
          onClick={handleStartTest}
          className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg"
        >
          Start Test
        </button>
      ) : (
        <>
          <div className="text-red-500 font-bold text-xl mt-2">
            Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}
          </div>

          <div className="w-full max-w-7xl bg-white p-6 mt-6 rounded-lg shadow-md">
            {questions.map((question, index) => (
              <div key={question.id} className="mb-6">
                <h2 className="text-lg font-semibold">
                  {index + 1}. {question.questionText}
                </h2>
                {question.options.map((option) => (
                  <label key={option.option.id} className="block mt-2">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.option.id}
                      checked={answers[question.id] === option.option.id}
                      onChange={() =>
                        handleSelectOption(question.id, option.option.id)
                      }
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
        </>
      )}
    </div>
  );
};

export default TestPage;
