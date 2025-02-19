"use client";

import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";
import { FaClipboard, FaCheck, FaTrashAlt } from "react-icons/fa";

const DirectAdminCleaner = () => {
    const [input, setInput] = useState<string>("");
    const [processedData, setProcessedData] = useState<string[]>([]);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    const processInput = () => {
        if (!input.trim()) {
            alert("Input is empty. Please enter data.");
            return;
        }

        const lines = input
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        const formattedData = lines.map((line) => {
            const match = line.match(/(https?:\/\/)([^\|]+)\|([^\|]+)\|([^\|]+)/);
            if (match) {
                const [, , url, username, password] = match;
                return `directadmin:${url}|${username}|${password}`;
            }
            return null;
        }).filter((item): item is string => item !== null);

        setProcessedData(formattedData);
    };

    const copyToClipboard = () => {
        if (processedData.length === 0) {
            alert("No processed data to copy.");
            return;
        }
        navigator.clipboard.writeText(processedData.join("\n"))
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch((err) => alert("Failed to copy: " + err));
    };

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("username");
        localStorage.removeItem("password");
    };

    return (
        <div className="min-h-screen flex ">
            <LeftNavbar />
            <div className="flex flex-col w-full">
                <Header handleLogout={handleLogout} />
                <div className="flex flex-col md:flex-row md:space-x-4 p-6">
                    <div className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        {/* Heading */}
                        <h1 className="text-2xl font-bold text-black dark:text-gray-200 mb-4">
                            🧹 DirectAdmin Site Cleaner
                        </h1>

                        {/* Input Box */}
                        <label className="block text-black dark:text-gray-300 font-semibold mb-2">
                            Paste Raw Data:
                        </label>
                        <textarea
                            className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                            placeholder="Paste the raw data here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        ></textarea>

                        {/* Buttons */}
                        <div className="flex space-x-4 mb-6">
                            <button
                                onClick={processInput}
                                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2 shadow-md"
                            >
                                <FaTrashAlt />
                                Process Data
                            </button>
                            <button
                                onClick={() => setInput("")}
                                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200 flex items-center gap-2 shadow-md"
                            >
                                <FaTrashAlt />
                                Clear Input
                            </button>
                        </div>

                        {/* Output Box */}
                        <label className="block text-black dark:text-gray-300 font-semibold mb-2">
                            Processed Results:
                        </label>
                        <textarea
                            className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            readOnly
                            value={processedData.join("\n") || "No processed data to display"}
                        ></textarea>

                        {/* Copy to Clipboard Button */}
                        <div className="mt-4 flex justify-between items-center">
                            <button
                                onClick={copyToClipboard}
                                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-200 flex items-center gap-2 shadow-md"
                            >
                                <FaClipboard />
                                Copy to Clipboard
                            </button>

                            {/* Copy Success Notification */}
                            {copySuccess && (
                                <span className="text-green-600 font-semibold flex items-center gap-2">
                                    <FaCheck /> Copied!
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectAdminCleaner;
