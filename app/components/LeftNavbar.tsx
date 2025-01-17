import React from "react";
import Link from "next/link";

const LeftNavbar = () => {
  return (
    <nav className="bg-gray-800 text-gray-100 min-h-100 w-64 p-6 shadow-lg" style={{minHeight: '100vh'}}>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-blue-400">Admin Panel</h3>
        <p className="text-sm text-gray-400">Manage your application</p>
      </div>
      <ul className="space-y-6">
        <li>
          <Link
            href="/"
            className="flex items-center gap-3 text-gray-100 hover:text-blue-400 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h11m4 0h3m-10 4v8m-4-8H3a1 1 0 01-1-1V5a1 1 0 011-1h6.75M13 21v-8M13 10h6.75M17 5a1 1 0 011 1v6"
              />
            </svg>
            <span className="font-medium">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            href="/files"
            className="flex items-center gap-3 text-gray-100 hover:text-blue-400 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.428 15.341A8.934 8.934 0 0121 12a8.935 8.935 0 01-1.572-3.341M12 2v10M12 2a9.003 9.003 0 018.464 5.341M12 2a9.003 9.003 0 00-8.464 5.341M4.572 15.341A8.935 8.935 0 013 12a8.934 8.934 0 011.572-3.341M12 22v-10M12 22a9.003 9.003 0 01-8.464-5.341M12 22a9.003 9.003 0 008.464-5.341"
              />
            </svg>
            <span className="font-medium">WordPress Access</span>
          </Link>
        </li>
        <li>
          <Link
            href="/shellfiles"
            className="flex items-center gap-3 text-gray-100 hover:text-blue-400 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 17l6-6-6-6m10 12h6"
              />
            </svg>
            <span className="font-medium">Shell Access</span>
          </Link>
        </li>
        <li>
          <Link
            href="/individual-score"
            className="flex items-center gap-3 text-gray-100 hover:text-blue-400 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 17l6-6-6-6m10 12h6"
              />
            </svg>
            <span className="font-medium">Get Score Individually</span>
          </Link>
        </li>
        <li>
          <Link
            href="/site-cleaner"
            className="flex items-center gap-3 text-gray-100 hover:text-blue-400 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 17l6-6-6-6m10 12h6"
              />
            </svg>
            <span className="font-medium">Site Cleaner</span>
          </Link>
        </li>
        <li>
          <Link
            href="/wordpress-cleaner"
            className="flex items-center gap-3 text-gray-100 hover:text-blue-400 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 17l6-6-6-6m10 12h6"
              />
            </svg>
            <span className="font-medium">Wordpress Site Cleaner</span>
          </Link>
        </li>
        
      </ul>
      <div className="mt-8">
        <button className="w-full bg-red-600 text-gray-100 py-2 px-4 rounded-lg hover:bg-red-500 transition duration-200">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default LeftNavbar;
