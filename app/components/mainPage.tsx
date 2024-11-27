import React from "react";

const MainPage = () => {
  return (
    <div className="flex-grow p-6 bg-gray-50 min-h-screen">
      {/* Top Section: Buttons and Search */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="space-x-3">
          <a href="wordpress-access">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200">
              WordPress Access
            </button>
          </a>
          <a href="shell-access">
            <button className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition duration-200">
              Shell Access
            </button>
          </a>
        </div>
        <div className="relative w-1/2">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search..."
          />
          <button className="absolute right-2 top-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
            Search
          </button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Dashboard Overview</h2>
        <p className="text-gray-500 mb-4">Here are your dashboard insights.</p>

        {/* Placeholder for Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Card 1 */}
          <div className="bg-blue-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-blue-600 mb-2">Statistics</h3>
            <p className="text-gray-600">Overview of your website's performance metrics.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-green-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-green-600 mb-2">Recent Activity</h3>
            <p className="text-gray-600">Track recent changes and updates in your system.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-yellow-600 mb-2">Notifications</h3>
            <p className="text-gray-600">Stay informed about system alerts and updates.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-red-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-red-600 mb-2">Errors & Logs</h3>
            <p className="text-gray-600">Monitor errors and view system logs for debugging.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
