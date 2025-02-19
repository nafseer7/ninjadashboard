"use client";

import React, { useState } from "react";
import Header from "./components/header";
import LeftNavbar from "./components/LeftNavbar";
import MainPage from "./components/mainPage";
import NotificationPanel from "./components/NotificationPanel";
import { url } from "inspector";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Define valid credentials
  const VALID_USERNAME = "admin";
  const VALID_PASSWORD = "Ninja2025!";

  const handleLogin = () => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsAuthenticated(true); // Set authenticated state to true
      setError(""); // Clear any previous errors
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/ninjamain.jpg')" }}>
        <div className="bg-white/10 p-8 rounded-lg shadow-lg backdrop-blur-lg border border-white/20 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <img
              src="ninja.png"
              alt="Ninja Dashboard"

            />
          </div>
          <h1 className="text-3xl font-bold text-center text-white mb-6 tracking-wide">
            NINJA DASHBOARD
          </h1>
          {error && (
            <p className="text-red-400 text-center font-medium mb-4">
              {error}
            </p>
          )}
          <div className="mb-4">
            <label
              className="block text-sm font-semibold text-white mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-semibold text-white mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-600 transition duration-200"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-100 flex">
        <LeftNavbar />
        <div className="flex flex-col w-full">
          <Header />
          <div className="flex flex-col md:flex-row md:space-x-4 p-6">
           
            <div className="flex-grow bg-white rounded-lg shadow-md p-6">
              <MainPage />
            </div>
          </div>
        </div>
      </div>
  );
};

export default Home;
