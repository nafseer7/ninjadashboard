"use client";

import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";

const WordPressCleaner = () => {
    const [input, setInput] = useState<string>("");
    const [processedUrls, setProcessedUrls] = useState<string[]>([]);
    const [filteredUrls, setFilteredUrls] = useState<string[]>([]);
    const [filterExtensions, setFilterExtensions] = useState<string>("");

    const processInput = () => {
        if (!input.trim()) {
            alert("Input is empty. Please enter data.");
            return;
        }

        const lines = input
            .split("\n") // Split input into lines
            .map((line) => line.trim()) // Remove leading/trailing spaces
            .filter((line) => line); // Remove empty lines

        const processed = lines.map((line) => {
            const parts = line.split(/\s+|,/) // Split by space or comma
                .map((part) => part.trim()) // Trim each part
                .filter((part) => part); // Remove empty parts

            if (parts.length >= 3) {
                const [sitename, username, password] = parts;
                return `"${sitename}";"${username}";"${password}"`;
            } else {
                console.warn(`Skipping line: "${line}" - Invalid format`);
                return null;
            }
        });

        const validProcessedUrls = processed.filter((url): url is string => url !== null);

        setProcessedUrls(validProcessedUrls); // Save processed data
        setFilteredUrls(validProcessedUrls); // Display all processed data by default
    };

    const filterByExtensions = () => {
        const filterValue = filterExtensions.trim();

        if (!filterValue) {
            // Reset to all processed URLs if filter input is empty
            setFilteredUrls(processedUrls);
            return;
        }

        const extensions = filterValue
            .split(",") // Split by comma
            .map((ext) => ext.trim().toLowerCase()) // Trim and lowercase each extension
            .filter((ext) => ext); // Remove empty extensions

        const filtered = processedUrls.filter((line) => {
            // Extract the domain (sitename) part from the processed line
            const sitename = line.match(/^"([^"]+)";/)?.[1] || "";
            return extensions.some((ext) => sitename.endsWith(ext)); // Check if domain ends with any extension
        });

        setFilteredUrls(filtered); // Update filtered URLs
    };

    const copyToClipboard = (data: string[]) => {
        const textToCopy = data.join("\n");
        navigator.clipboard
            .writeText(textToCopy)
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
        <>
            <div className="min-h-screen bg-gray-100 flex">
                <LeftNavbar />
                <div className="flex flex-col w-full">
                    <Header handleLogout={handleLogout} />
                    <div className="flex flex-col md:flex-row md:space-x-4 p-6">
                        <div className="flex-grow bg-white rounded-lg shadow-md p-6">
                            <h1 className="text-2xl font-bold mb-4">WordPress Cleaner</h1>
                            <textarea
                                className="w-full h-40 p-2 border border-gray-300 rounded mb-4"
                                placeholder="Enter data line by line (e.g., sitename username password)..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            ></textarea>

                            {/* Process Buttons */}
                            <div className="mb-4">
                                <button
                                    onClick={processInput}
                                    className="px-4 py-2 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700"
                                >
                                    Process Data
                                </button>
                            </div>

                            {/* Filter Section */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="p-2 border border-gray-300 rounded mr-2"
                                    placeholder="Filter by .com, .org, .net (comma-separated)"
                                    value={filterExtensions}
                                    onChange={(e) => {
                                        setFilterExtensions(e.target.value);
                                        if (!e.target.value.trim()) {
                                            setFilteredUrls(processedUrls); // Reset to all processed URLs when input is cleared
                                        }
                                    }}
                                />
                                <button
                                    onClick={filterByExtensions}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Apply Filter
                                </button>
                            </div>

                            {/* Results Section */}
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold mb-2">Processed Results</h2>
                                <textarea
                                    className="w-full h-40 p-2 border border-gray-300 rounded"
                                    readOnly
                                    value={filteredUrls.join("\n") || "No processed data to display"}
                                ></textarea>
                            </div>

                            {/* Copy Buttons */}
                            <div className="mb-4 flex space-x-4">
                                <button
                                    onClick={() => copyToClipboard(filteredUrls)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    Copy Filtered Data
                                </button>
                                <button
                                    onClick={() => copyToClipboard(processedUrls)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    Copy All Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WordPressCleaner;
