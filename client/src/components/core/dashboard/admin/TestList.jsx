import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../../../../utils/config";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { encode as base64Encode } from 'js-base64';
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 9;
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/tests/get-tests`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Sort tests by createdAt (latest first)
        const sortedTests = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTests(sortedTests.reverse());
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
      <div className="flex flex-col items-center">
        <h2 className="text-5xl font-bold mb-6 text-orange-500 mt-12">
          Available Tests
        </h2>

        {/* Grid Layout */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
          {currentTests.map((test) => (
            <Link
            key={test.TestID}
            to={`/test-preview/${base64Encode(test.TestID)}`} 
            className="bg-white p-8 shadow-md rounded-md border flex flex-col items-center justify-center border-gray-300 hover:shadow-2xl transition-all duration-300"
          >
            <h3 className="text-xl font-semibold text-gray-800">
              {test.Title}
            </h3>
            <p className="text-gray-600">{test.Description}</p>
            <p className="mt-2 text-sm text-gray-500">
              Duration: {test.Duration} min | Marks: {test.TotalMarks}
            </p>
          </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center mt-6 space-x-4 fixed bottom-0 w-full bg-white p-12 z-20">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`rounded-full h-10 w-10 flex items-center justify-center  ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <span className="text-gray-700 font-semibold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`rounded-full h-10 w-10 flex items-center justify-center ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestList;
