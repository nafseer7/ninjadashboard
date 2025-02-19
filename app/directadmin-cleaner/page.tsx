"use client";

import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";
const DirectAdminCleaner = () => {
    const [input, setInput] = useState<string>("");
    const [processedData, setProcessedData] = useState<string[]>([]);

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
            .then(() => alert("Copied to clipboard!"))
            .catch((err) => alert("Failed to copy: " + err));
    };


    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const handleLogout = () => {
        setIsAuthenticated(false);

        // Clear credentials from Local Storage
        localStorage.removeItem("username");
        localStorage.removeItem("password");
    };


    return (
        <div className="min-h-screen bg-gray-100 flex">
            <LeftNavbar />
            <div className="flex flex-col w-full">
                <Header handleLogout={handleLogout} />
                <div className="flex flex-col md:flex-row md:space-x-4 p-6">
                    <div className="flex-grow bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold mb-4">DirectAdmin Site Cleaner</h1>
                        <textarea
                            className="w-full h-40 p-2 border border-gray-300 rounded mb-4"
                            placeholder="Paste the raw data here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        ></textarea>
                        <div className="mb-4">
                            <button
                                onClick={processInput}
                                className="px-4 py-2 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700"
                            >
                                Process Data
                            </button>
                        </div>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold mb-2">Processed Results</h2>
                            <textarea
                                className="w-full h-40 p-2 border border-gray-300 rounded"
                                readOnly
                                value={processedData.join("\n") || "No processed data to display"}
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectAdminCleaner;
