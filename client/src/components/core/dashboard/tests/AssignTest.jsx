import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import config from "../../../../utils/config";
import { toast } from "react-toastify";
import Header from "../../../common/Header";

const AssignTest = () => {
  const [usersList, setUsersList] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [selectedUsers, setSelectedUsers] = useState("");

  const token = useSelector((state) => state.auth.token);
  console.log(token);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${config.API_URL}/api/auth/get-users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUsersList(response.data.users);
      } catch (error) {
        toast.error("Error fetching users");
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(
          `${config.API_URL}/api/tests/get-tests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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


  const handleAssign = async () => {
    try {
      await axios.post(
        `${config.API_URL}/api/assign`,
        { testId: selectedTest, userId: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Users assigned successfully!");
    } catch (error) {
      toast.error("Failed to assign users");
    }
  };

  return (
    // <div>
    //   <h2>Select Test</h2>
    //   <select onChange={(e) => setSelectedTest(e.target.value)}>
    //     <option value="">Select a test</option>
    //     {tests.map((test) => (
    //       <option key={test.TestID} value={test.TestID}>
    //         {test.Title}
    //       </option>
    //     ))}
    //   </select>

    //   <h2>Select User</h2>
    //   <select onChange={(e) => setSelectedUsers(e.target.value)}>
    //     <option value="">Select a user</option>
    //     {usersList.map((user) => (
    //       <option key={user.UserID} value={user.UserID}>
    //         {user.FirstName} {user.LastName} ({user.Email})
    //       </option>
    //     ))}
    //   </select>

    //   <button onClick={handleAssign}>Assign Users</button>
    // </div>
    <div className="">
      <Header />
      <div className="flex justify-center items-center">
        <div className="w-[60%] mt-20 bg-white p-6">
          <h2 className="text-5xl font-bold mb-10 text-orange-500">Assign Test</h2>

          <div className="mb-8">
            <label className="block font-semibold mb-4 text-gray-500 text-2xl">
              Select Test
            </label>
            <select
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md"
            >
              <option value="">Select a test</option>
              {tests.map((test) => (
                <option key={test.TestID} value={test.TestID}>
                  {test.Title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <label className="block font-semibold mb-4 text-gray-500 text-2xl">
              Select User
            </label>
            <select
              onChange={(e) => setSelectedUsers(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md"
            >
              <option value="">Select a user</option>
              {usersList.map((user) => (
                <option key={user.UserID} value={user.UserID}>
                  {user.FirstName} {user.LastName} ({user.Email})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAssign}
            className="bg-orange-500 text-white py-2 px-4 rounded-md"
          >
            Assign Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTest;
