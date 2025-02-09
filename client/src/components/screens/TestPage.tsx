import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correct: "Paris",
  },
  {
    id: 2,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correct: "4",
  },
  {
    id: 3,
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correct: "Mars",
  },
  {
    id: 4,
    question: "Who wrote 'Hamlet'?",
    options: ["Shakespeare", "Hemingway", "Tolkien", "Austen"],
    correct: "Shakespeare",
  },
];

export default function TestPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const feedbackFormHandler = () => {
    navigate('/');
  }

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
    }
  };

  const handleSubmit = () => {
    setShowFeedback(true);
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    setSelectedOption(null);
  };

  return (
    <div className="flex h-screen p-5 bg-gray-100">
      {/* Sidebar Navigation - Hide when feedback is shown */}
      {!showFeedback && (
        <div className="w-20 bg-white p-4 shadow-lg rounded-lg flex flex-col items-center space-y-2">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all ${
                index === currentQuestion ? "bg-orange-400" : "bg-gray-400"
              }`}
            >
              {q.id}
            </button>
          ))}
        </div>
      )}

      {/* Quiz Section */}
      <div className="flex-1 p-6 bg-white rounded-lg shadow-lg mx-5 flex flex-col justify-between relative">
        {showFeedback ? (
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold">
              Thank you for completing the quiz!
            </h2>
            <p className="mt-4">Please provide your feedback below:</p>
            <textarea
              className="w-full p-2 border rounded-lg mt-2"
              placeholder="Your suggestions..."
            ></textarea>
            <p className="mt-4">Rate our application:</p>
            <select className="w-full p-2 border rounded-lg mt-2">
              <option>⭐</option>
              <option>⭐⭐</option>
              <option>⭐⭐⭐</option>
              <option>⭐⭐⭐⭐</option>
              <option>⭐⭐⭐⭐⭐</option>
            </select>
            <button
              onClick={feedbackFormHandler}
              className="absolute bottom-8 right-8 px-6 py-4 bg-orange-400 hover:bg-orange-500 transition-all duration-200"
            >
              Submit
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              <h2 className="text-2xl font-semibold">
                {questions[currentQuestion].question}
              </h2>
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className={`w-full p-3 text-left border rounded-lg transition-all ${
                    selectedOption === option
                      ? "bg-orange-400 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {currentQuestion > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-orange-400 text-white rounded-lg"
                >
                  Previous
                </button>
              )}
              {currentQuestion < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-orange-400 text-white rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  Submit
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
