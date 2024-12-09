"use client";

import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";

const SiteCleaner = () => {
    const [input, setInput] = useState<string>("");
    const [rootUrls, setRootUrls] = useState<string[]>([]);
    const [filteredUrls, setFilteredUrls] = useState<string[]>([]);
    const [filterExtensions, setFilterExtensions] = useState<string>("");
    const [removeExtensionsInput, setRemoveExtensionsInput] = useState<string>("");

    const extractRootUrls = () => {
        const urls = input
            .split("\n") // Split the input by newlines
            .map((url) => url.trim()) // Trim whitespace
            .filter((url) => url); // Remove empty lines

        const roots = urls.map((url) => {
            try {
                const { protocol, hostname } = new URL(url);

                // Validate hostname to exclude invalid or non-standard domains
                if (
                    hostname &&
                    /^[a-zA-Z][a-zA-Z0-9.-]*$/.test(hostname) && // Hostname must start with a letter
                    !hostname.startsWith("xn--") && // Exclude punycode (IDN) hostnames starting with "xn--"
                    hostname.includes(".") // Ensure the hostname has a period (e.g., "example.com")
                ) {
                    return `${protocol}//${hostname}`;
                }
                return null; // Ignore invalid hostnames
            } catch {
                return null; // Ignore invalid URLs
            }
        });

        // Remove duplicates and null values
        const uniqueRoots = Array.from(new Set(roots.filter((url) => url !== null)));
        setRootUrls(uniqueRoots as string[]);
        setFilteredUrls(uniqueRoots as string[]); // Default filtered list is the full root URLs list
    };


    const removeExtensions = () => {
        if (!removeExtensionsInput) {
            return;
        }

        const extensionsToRemove = removeExtensionsInput
            .split(",") // Split the extensions by commas
            .map((ext) => ext.trim()) // Trim whitespace
            .filter((ext) => ext); // Remove empty entries

        const filtered = filteredUrls.filter(
            (url) => !extensionsToRemove.some((ext) => url.endsWith(ext)) // Exclude URLs matching the extensions
        );
        setFilteredUrls(filtered);
    };

    const filterByExtensions = () => {
        if (!filterExtensions) {
            setFilteredUrls(rootUrls); // If no filter, reset to all root URLs
            return;
        }

        const extensions = filterExtensions
            .split(",") // Split the extensions by commas
            .map((ext) => ext.trim()) // Trim whitespace
            .filter((ext) => ext); // Remove empty entries

        const filtered = rootUrls.filter((url) =>
            extensions.some((ext) => url.endsWith(ext))
        );
        setFilteredUrls(filtered);
    };

    const copyToClipboard = () => {
        navigator.clipboard
            .writeText(filteredUrls.join("\n"))
            .then(() => alert("Copied to clipboard!"))
            .catch((err) => alert("Failed to copy: " + err));
    };

    const addFileToDb = async () => {
        const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
        const filename = `filename_one_${currentDate}`;
        const allUrls = filteredUrls; // Assuming `filteredUrls` is already available as an array
        const filteredUrlsArray = filteredUrls; // Modify as needed if different
        const status = "unprocessed"; // Set the status to 'unprocessed'
    
        try {
            const response = await fetch("/api/addFilesToDb", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    filename,
                    all_urls: allUrls,
                    filtered_urls: filteredUrlsArray,
                    status, // Include the status field
                }),
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log("Data added successfully:", result);
                alert("Added URL successfully to the database");
            } else {
                console.error("Failed to add data:", response.statusText);
            }
        } catch (error) {
            console.error("Error adding data to DB:", error);
        }
    };
    


    return (
        <>
            <div className="min-h-screen bg-gray-100 flex">
                <LeftNavbar />
                <div className="flex flex-col w-full">
                    <Header />
                    <div className="flex flex-col md:flex-row md:space-x-4 p-6">
                        <div className="flex-grow bg-white rounded-lg shadow-md p-6">
                            <h1 className="text-2xl font-bold mb-4">Site Cleaner</h1>
                            <textarea
                                className="w-full h-40 p-2 border border-gray-300 rounded mb-4"
                                placeholder="Enter URLs line by line..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            ></textarea>

                            {/* Process Buttons */}
                            <div className="mb-4">
                                <button
                                    onClick={extractRootUrls}
                                    className="px-4 py-2 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700"
                                >
                                    Process Root URLs
                                </button>
                                <button
                                    onClick={extractRootUrls}
                                    className="px-4 py-2 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700"
                                >
                                    Remove Duplicates
                                </button>
                            </div>

                            {/* Filter Section */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="p-2 border border-gray-300 rounded mr-2"
                                    placeholder="Filter by .com, .org, .net, etc. (comma-separated)"
                                    value={filterExtensions}
                                    onChange={(e) => setFilterExtensions(e.target.value)}
                                />
                                <button
                                    onClick={filterByExtensions}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Apply Filter
                                </button>
                            </div>

                            {/* Remove Specific Extensions */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="p-2 border border-gray-300 rounded mr-2"
                                    placeholder="Remove .com, .org, .net, etc. (comma-separated)"
                                    value={removeExtensionsInput}
                                    onChange={(e) => setRemoveExtensionsInput(e.target.value)}
                                />
                                <button
                                    onClick={removeExtensions}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Remove Extensions
                                </button>
                            </div>

                            {/* Results Section */}
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold mb-2">Filtered URLs</h2>
                                <textarea
                                    className="w-full h-40 p-2 border border-gray-300 rounded"
                                    readOnly
                                    value={filteredUrls.join("\n")}
                                ></textarea>
                            </div>

                            {/* Copy Button */}

                            <div style={{ rowGap: '10px' }}>
                                <button
                                    onClick={addFileToDb}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    Add files to DB
                                </button>
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
        </>
    );
};

export default SiteCleaner;
