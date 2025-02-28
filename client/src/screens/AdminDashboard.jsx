import { NavLink, Outlet } from "react-router-dom";
import Header from "../components/common/Header";

const AdminDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col p-5">
        <h2 className="text-2xl font-bold text-orange-500 mb-6">Dashboard</h2>
        <nav className="flex flex-col space-y-4">
          <NavLink
            to="/testslist"
            className={({ isActive }) =>
              `p-3 rounded-lg text-lg font-medium ${
                isActive ? "bg-orange-500 text-white" : "text-gray-700"
              }`
            }
          >
            📝 Tests List
          </NavLink>
          <NavLink
            to="/addques"
            className={({ isActive }) =>
              `p-3 rounded-lg text-lg font-medium ${
                isActive ? "bg-orange-500 text-white" : "text-gray-700"
              }`
            }
          >
            ➕ Add Questions
          </NavLink>
          <NavLink
            to="/test-creation"
            className={({ isActive }) =>
              `p-3 rounded-lg text-lg font-medium ${
                isActive ? "bg-orange-500 text-white" : "text-gray-700"
              }`
            }
          >
            🎯 Assign Test
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-6">
          <Outlet /> {/* This will render the selected route */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
