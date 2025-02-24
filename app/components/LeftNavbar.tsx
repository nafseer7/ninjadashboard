import React from "react";
import Link from "next/link";
import {
  FaTachometerAlt,
  FaWordpress,
  FaTerminal,
  FaCogs,
  FaServer,
  FaJoomla,
  FaTrashAlt,
  FaSignOutAlt,
  FaCheckCircle,
  FaWindows,
} from "react-icons/fa";

const LeftNavbar = () => {
  return (
    <nav className="bg-gray-800 text-gray-100 w-64 p-6 shadow-lg" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-blue-400">Admin Panel</h3>
        <p className="text-sm text-gray-400">Manage your application</p>
      </div>

      {/* Navigation Links */}
      <ul className="space-y-4">
        <NavItem href="/" icon={<FaTachometerAlt />} text="Dashboard" />
        <NavItem href="/files" icon={<FaWordpress />} text="WordPress Access" />
        <NavItem href="/shellfiles" icon={<FaTerminal />} text="Shell Access" />
        <NavItem href="/directadmin-access" icon={<FaCogs />} text="DirectAdmin Access" />
        <NavItem href="/joomlafiles" icon={<FaJoomla />} text="Joomla Access" />
        <NavItem href="/pleskfiles" icon={<FaServer />} text="Plesk Access" />
        <NavItem href="/individual-score" icon={<FaCheckCircle />} text="Get Score Individually" />

        {/* Site Cleaners */}
        <NavItem href="/site-cleaner" icon={<FaTrashAlt />} text="Site Cleaner" />
        <NavItem href="/wordpress-cleaner" icon={<FaWordpress />} text="WordPress Site Cleaner" />
        <NavItem href="/plesk-cleaner" icon={<FaServer />} text="Plesk Site Cleaner" />
        <NavItem href="/directadmin-cleaner" icon={<FaCogs />} text="DirectAdmin Site Cleaner" />
        {/* <NavItem href="/rdweb-cleaner" icon={<FaWindows />} text="RdWeb Site Cleaner" /> */}
        <NavItem href="/joomla-cleaner" icon={<FaJoomla />} text="Joomla Site Cleaner" />
      </ul>

      {/* Logout Button */}
      <div className="mt-10">
        <button className="w-full flex items-center justify-center gap-2 bg-red-600 text-gray-100 py-2 px-4 rounded-lg hover:bg-red-500 transition duration-200">
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </nav>
  );
};

// Navigation Item Component for reusability
const NavItem = ({ href, icon, text }: { href: string; icon: JSX.Element; text: string }) => (
  <li>
    <Link href={href} className="flex items-center gap-3 text-gray-100 hover:text-blue-400 transition-colors duration-200 text-decoration-none">
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{text}</span>
    </Link>
  </li>
);

export default LeftNavbar;
