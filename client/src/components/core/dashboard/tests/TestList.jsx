import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../../../../utils/config";
import { useSelector } from "react-redux";
import Header from "../../../common/Header";
import { Link } from "react-router-dom";

const TestsList = () => {
  const [tests, setTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 9; // Show 9 tests per page
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/tests`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Sort tests by createdAt (latest first)
        const sortedTests = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTests(sortedTests);
      } catch (error) {
        toast.error("Error fetching tests");
      }
    };

    fetchTests();
  }, [token]);

  // Pagination Logic
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = tests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(tests.length / testsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col items-center">
        <h2 className="text-5xl font-bold mb-6 text-orange-500 mt-12">
          Available Tests
        </h2>

        {/* Grid Layout */}
        <div className="grid grid-cols-3 gap-6">
          {currentTests.map((test) => (
            <Link
              key={test.id}
              to={'/addques'}
              className="bg-white p-4 shadow-md rounded-md border border-gray-300 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {test.title}
              </h3>
              <p className="text-gray-600">{test.description}</p>
              <p className="mt-2 text-sm text-gray-500">
                Duration: {test.duration} min | Marks: {test.totalMarks}
              </p>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center mt-6 space-x-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            Prev
          </button>

          <span className="text-gray-700 font-semibold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestsList;
