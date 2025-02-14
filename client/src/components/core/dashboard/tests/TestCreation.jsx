import { useState } from "react";
import Header from "../../../common/Header";

const TestCreation = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const testDetails = {
      title,
      description,
      duration,
      totalMarks,
    };
    console.log("Test Created:", testDetails);
    alert("Test Created Successfully!");
  };

  return (
    <div className="">
      <Header />
      <div className="flex justify-center items-center">
        <div className="w-[60%] mt-20 bg-white p-6">
          <h2 className="text-5xl font-bold mb-10 text-orange-500">Create a New Test</h2>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-8">
              <label className="block font-semibold mb-4 text-gray-500 text-2xl">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-style w-full border px-4 py-2 rounded-md focus:outline-[0.5px] focus:outline-gray-300"
                placeholder="Enter test title"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-gray-500 font-medium mb-4 text-2xl">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-style w-full border px-4 py-2 rounded-md focus:outline-[0.5px] focus:outline-gray-300"
                placeholder="Enter test description"
                rows="3"
                required
              ></textarea>
            </div>

            {/* Duration */}
            <div className="mb-8">
              <label className="block text-gray-500 font-medium mb-4 text-2xl">
                Duration (in minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="form-style w-full border px-4 py-2 rounded-md focus:outline-[0.5px] focus:outline-gray-300"
                placeholder="Enter duration"
                required
              />
            </div>

            {/* Total Marks */}
            <div className="mb-8">
              <label className="block text-gray-500 font-medium mb-4 text-2xl">
                Total Marks
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="form-style w-full border px-4 py-2 rounded-md focus:outline-[0.5px] focus:outline-gray-300"
                placeholder="Enter total marks"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-10 group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-orange-500  px-6 font-medium text-white transition hover:shadow-[0_4px_15px_#ff9800]"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-[1.5s] group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20"></div>
              </div>
              <span className="mr-4 text-xl">Create Test</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestCreation;
