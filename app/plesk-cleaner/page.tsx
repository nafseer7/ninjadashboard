"use client";

import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";
const PleskCleaner = () => {
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
            .filter((line) => line.startsWith("Successful - Plesk:"));

        const formattedData = lines.map((line) => {
            const match = line.match(/Successful - Plesk: ([^|]+)\|([^|]+)\|([^|]+)/);
            if (match) {
                const [, sitename, username, password] = match;
                return `plesk:${sitename}|${username}|${password}`;
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

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <LeftNavbar />
            <div className="flex flex-col w-full">
                <Header />
                <div className="flex flex-col md:flex-row md:space-x-4 p-6">
                    <div className="flex-grow bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold mb-4">Plesk Cleaner</h1>
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

export default PleskCleaner;
