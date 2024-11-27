import React from "react";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-blue-500 font-bold shadow">
          D
        </div>
        <h1 className="text-2xl font-bold tracking-wide">Admin Dashboard</h1>
      </div>
      <div className="flex items-center gap-6">
        <button className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded transition duration-200 shadow">
          Notifications
        </button>
        <div className="flex items-center gap-3">
          <span>Welcome, User!</span>
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
