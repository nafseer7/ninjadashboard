import React from "react";
import { FaBell, FaUserCircle, FaSignOutAlt, FaUser } from "react-icons/fa";

const Header = ({ handleLogout }: { handleLogout: () => void }) => {
  return (
    <header className="bg-gray-900 text-gray-100 shadow-lg py-4 px-6 flex justify-between items-center">
      {/* Logo and Title */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold shadow-lg">
          D
        </div>
        <h1 className="text-2xl font-bold tracking-wide text-blue-400">Admin Dashboard</h1>
      </div>

      {/* Right Section: Notifications & Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="flex items-center gap-2 bg-gray-700 hover:bg-blue-500 text-gray-100 font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md">
          <FaBell className="text-lg" />
          Notifications
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <span className="text-sm">Welcome, <strong>Admin</strong></span>
          <div className="relative">
            <FaUser className="w-16 h-16 p-2 rounded-full border-2 border-blue-500 shadow-md" />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg shadow-md transition duration-200"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
