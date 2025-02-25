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

        // First, split the input by common URL patterns
        const splitByDomains = input
            .replace(/https?:\/\//g, '\nhttps://')  // Add newline before each http:// or https://
            .trim()  // Remove leading/trailing whitespace
            .split('\n')
            .filter(line => line.trim());  // Remove empty lines

        const lines = splitByDomains
            .map((line) => line.trim())
            .filter((line) => line.includes('/'));  // Ensure line contains a URL

        const processed = lines.map((line) => {
            let url: string = "";
            let username: string | undefined;
            let password: string | undefined;

            // First try to process semicolon format
            if (line.includes(";")) {
                const parts = line.split(";");
                if (parts.length === 3) {
                    url = parts[0].trim();
                    username = parts[1].trim();
                    password = parts[2].trim();
                }
            } 
            // Then try hash format
            else if (line.includes("#")) {
                const [baseUrl, credentials] = line.split("#");
                url = baseUrl.trim();
                if (credentials.includes("|")) {
                    // Handle already formatted data
                    const [user, pass] = credentials.split("|");
                    username = user.trim();
                    password = pass.trim();
                } else {
                    const lastAtIndex = credentials.lastIndexOf("@");
                    if (lastAtIndex !== -1) {
                        username = credentials.substring(0, lastAtIndex).trim();
                        password = credentials.substring(lastAtIndex + 1).trim();
                    }
                }
            } 
            // Finally try colon format
            else if (line.includes(":")) {
                const parts = line.split(":");
                if (parts.length >= 3) {
                    url = parts.slice(0, -2).join(":").trim();
                    username = parts[parts.length - 2].trim();
                    password = parts[parts.length - 1].trim();
                }
            }

            if (url && username && password) {
                return `${url}#${username}|${password}`;
            } else {
                console.warn(`Skipping line: "${line}" - Invalid format`);
                return null;
            }
        });

        const validProcessedUrls = processed.filter((url): url is string => url !== null);
        setProcessedUrls(validProcessedUrls);
        setFilteredUrls(validProcessedUrls);
    };
    
    

    const filterByExtensions = () => {
        const filterValue = filterExtensions.trim();

        if (!filterValue) {
            setFilteredUrls(processedUrls);
            return;
        }

        const extensions = filterValue
            .split(",")
            .map((ext) => ext.trim().toLowerCase())
            .filter((ext) => ext);

        const filtered = processedUrls.filter((line) => {
            // Extract the URL part before the # symbol
            const url = line.split("#")[0];
            return extensions.some((ext) => url.toLowerCase().endsWith(ext));
        });

        setFilteredUrls(filtered);
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
                                placeholder="Enter data line by line (e.g., sitename:username:password or sitename#username@password)..."
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
                                <input
                                    type="text"
                                    className="p-2 border border-gray-300 rounded mr-2"
                                    placeholder="Filter by .com, .org, .net (comma-separated)"
                                    value={filterExtensions}
                                    onChange={(e) => {
                                        setFilterExtensions(e.target.value);
                                        if (!e.target.value.trim()) {
                                            setFilteredUrls(processedUrls);
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

                            <div className="mb-4">
                                <h2 className="text-lg font-semibold mb-2">Processed Results</h2>
                                <textarea
                                    className="w-full h-40 p-2 border border-gray-300 rounded"
                                    readOnly
                                    value={filteredUrls.join("\n") || "No processed data to display"}
                                ></textarea>
                            </div>

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

