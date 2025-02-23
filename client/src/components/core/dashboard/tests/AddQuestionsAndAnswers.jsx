import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../../../../utils/config";
import { useSelector } from "react-redux";

const AddQuestionsAndOptions = () => {
  const [tests, setTests] = useState([]); // Available tests
  const [selectedTest, setSelectedTest] = useState(""); // Selected test ID
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]); // Store 4 options
  const [correctOption, setCorrectOption] = useState(""); // Correct option index
  const [loading, setLoading] = useState(false);

  const token = useSelector((state) => state.auth.token);

  // Fetch all tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/tests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTests(response.data);
      } catch (error) {
        toast.error("Error fetching tests");
      }
    };
    fetchTests();
  }, [token]);

  // Handle input changes for options
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Function to create a question & add options
  const handleCreateQuestionWithOptions = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create the Question
      const questionResponse = await axios.post(
        `${config.API_URL}/api/tests/questions`,
        {
          testId: Number(selectedTest),
          questionText,
          marks: Number(marks),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const questionId = questionResponse.data.id; // Extract question ID

      // Step 2: Create the 4 Options
      const optionPromises = options.map(async (optionText) => {
        return axios.post(
          `${config.API_URL}/api/tests/options`,
          {
            questionId,
            optionText,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      });

      await Promise.all(optionPromises);

      // Step 3: Map the Correct Option
      await axios.post(
        `${config.API_URL}/api/tests/correct-option`,
        {
          questionId,
          correctOption: Number(correctOption),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Question and options added successfully!");

      // Reset fields
      setQuestionText("");
      setMarks("");
      setOptions(["", "", "", ""]);
      setCorrectOption("");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add question and options");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-[60%] mt-10 bg-white p-6">
        <h2 className="text-3xl font-bold mb-6 text-orange-500">Manage Test Questions & Options</h2>

        {/* Select Test */}
        <div className="mb-6">
          <label className="block font-medium text-gray-600">Select Test</label>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="form-style w-full border px-4 py-2 rounded-md"
          >
            <option value="">-- Select a Test --</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.title}
              </option>
            ))}
          </select>
        </div>

        {/* Add Question & Options Form */}
        <form onSubmit={handleCreateQuestionWithOptions} className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Add a Question & Options</h3>

          <div className="mb-4">
            <label className="block text-gray-600">Question Text</label>
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="form-style w-full border px-4 py-2 rounded-md"
              placeholder="Enter question"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-600">Marks</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="form-style w-full border px-4 py-2 rounded-md"
              placeholder="Enter marks"
              required
            />
          </div>

          {/* Options */}
          <h3 className="text-lg font-semibold mt-6">Enter 4 Options</h3>
          {options.map((option, index) => (
            <div key={index} className="mb-4">
              <label className="block text-gray-600">Option {index + 1}</label>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="form-style w-full border px-4 py-2 rounded-md"
                placeholder={`Enter option ${index + 1}`}
                required
              />
            </div>
          ))}

          {/* Correct Option */}
          <div className="mb-4">
            <label className="block text-gray-600">Correct Option (0-3)</label>
            <input
              type="number"
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
              className="form-style w-full border px-4 py-2 rounded-md"
              placeholder="Enter correct option index"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 px-6 py-2 rounded-md text-white font-medium transition ${
              loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? "Adding Question & Options..." : "Add Question & Options"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionsAndOptions;
