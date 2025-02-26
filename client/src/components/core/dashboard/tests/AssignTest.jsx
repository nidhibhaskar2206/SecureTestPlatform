import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import config from "../../../../utils/config";
import { toast } from "react-toastify";

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
    <div>
      <h2>Select Test</h2>
      <select onChange={(e) => setSelectedTest(e.target.value)}>
        <option value="">Select a test</option>
        {tests.map((test) => (
          <option key={test.TestID} value={test.TestID}>
            {test.Title}
          </option>
        ))}
      </select>

      <h2>Select User</h2>
      <select onChange={(e) => setSelectedUsers(e.target.value)}>
        <option value="">Select a user</option>
        {usersList.map((user) => (
          <option key={user.UserID} value={user.UserID}>
            {user.FirstName} {user.LastName} ({user.Email})
          </option>
        ))}
      </select>

      <button onClick={handleAssign}>Assign Users</button>
    </div>
  );
};

export default AssignTest;
