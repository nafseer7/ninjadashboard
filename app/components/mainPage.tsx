import React from "react";
import { FaWordpress, FaTerminal, FaSearch, FaServer, FaJoomla, FaCogs } from "react-icons/fa";

const MainPage = () => {
  return (
    <div className="flex-grow p-6 bg-gray-100 min-h-screen">
      {/* Top Section: Search Bar */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-700">Admin Dashboard</h1>
        <div className="relative w-1/2">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search..."
          />
          <button className="absolute right-2 top-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Access Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* WordPress Access */}
        <a href="wordpress-access" className="group text-decoration-none">
          <div className="flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
            <FaWordpress className="text-blue-600 text-4xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700 group-hover:text-blue-600">
                WordPress Access
              </h2>
              <p className="text-gray-500">Manage your WordPress site easily</p>
            </div>
          </div>
        </a>

        {/* Shell Access */}
        <a href="shell-access" className="group text-decoration-none">
          <div className="flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
            <FaTerminal className="text-gray-600 text-4xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700 group-hover:text-gray-600">
                Shell Access
              </h2>
              <p className="text-gray-500">Directly access server terminal</p>
            </div>
          </div>
        </a>

        {/* Plesk Access */}
        <a href="pleskfiles" className="group text-decoration-none">
          <div className="flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
            <FaServer className="text-purple-600 text-4xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700 group-hover:text-purple-600">
                Plesk Access
              </h2>
              <p className="text-gray-500">Manage hosting with Plesk</p>
            </div>
          </div>
        </a>

        {/* DirectAdmin Access */}
        <a href="directadmin-access" className="group text-decoration-none">
          <div className="flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
            <FaCogs className="text-orange-600 text-4xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700 group-hover:text-orange-600">
                DirectAdmin
              </h2>
              <p className="text-gray-500">Access DirectAdmin panel</p>
            </div>
          </div>
        </a>

        {/* Joomla Access */}
        <a href="joomlafiles" className="group text-decoration-none">
          <div className="flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
            <FaJoomla className="text-green-600 text-4xl mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-gray-700 group-hover:text-green-600">
                Joomla Access
              </h2>
              <p className="text-gray-500">Manage your Joomla CMS</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default MainPage;
