import React, { useState } from "react";
import { 
  FaWordpress, FaTerminal, FaSearch, FaServer, FaJoomla, FaCogs, FaTrashAlt, FaChartLine 
} from "react-icons/fa";

const MainPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sections with their corresponding data
  const sections = [
    {
      title: "📂 Access",
      data: [
        { href: "wordpress-access", icon: <FaWordpress className="text-blue-600 text-4xl" />, title: "WordPress Access", description: "Manage your WordPress site easily" },
        { href: "shell-access", icon: <FaTerminal className="text-gray-600 text-4xl" />, title: "Shell Access", description: "Directly access server terminal" },
        { href: "pleskfiles", icon: <FaServer className="text-purple-600 text-4xl" />, title: "Plesk Access", description: "Manage hosting with Plesk" },
        { href: "directadmin-access", icon: <FaCogs className="text-orange-600 text-4xl" />, title: "DirectAdmin Access", description: "Access DirectAdmin panel" },
        { href: "joomlafiles", icon: <FaJoomla className="text-green-600 text-4xl" />, title: "Joomla Access", description: "Manage your Joomla CMS" }
      ]
    },
    {
      title: "🧹 Cleaner Tools",
      data: [
        { href: "wordpress-cleaner", icon: <FaWordpress className="text-blue-500 text-4xl" />, title: "WordPress Cleaner", description: "Clean and optimize your WordPress site" },
        { href: "plesk-cleaner", icon: <FaServer className="text-purple-500 text-4xl" />, title: "Plesk Cleaner", description: "Clean unnecessary Plesk data" },
        { href: "directadmin-cleaner", icon: <FaCogs className="text-orange-500 text-4xl" />, title: "DirectAdmin Cleaner", description: "Clear and optimize DirectAdmin panel" },
        { href: "joomla-cleaner", icon: <FaJoomla className="text-green-600 text-4xl" />, title: "Joomla Cleaner", description: "Clear and optimize Joomla panel" }
      ]
    },
    {
      title: "📊 Score Finder",
      data: [
        { href: "individual-score", icon: <FaChartLine className="text-red-500 text-4xl" />, title: "Find Individual Score", description: "Get the score for a single entry" }
      ]
    }
  ];

  // Filter sections based on search term
  const filteredSections = sections.map(section => ({
    ...section,
    data: section.data.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.data.length > 0);

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-2 top-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Render Filtered Sections */}
      {filteredSections.length > 0 ? (
        filteredSections.map((section, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.data.map((item, i) => (
                <AccessCard key={i} {...item} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 text-lg mt-10">No results found</p>
      )}
    </div>
  );
};

// Reusable Card Component
const AccessCard = ({ href, icon, title, description }: { href: string; icon: JSX.Element; title: string; description: string }) => (
  <a href={href} className="group text-decoration-none">
    <div className="flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
      <div className="mr-4">{icon}</div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700 group-hover:text-blue-600">{title}</h2>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  </a>
);

export default MainPage;
