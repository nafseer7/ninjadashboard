"use client";

import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";
import { v4 as uuidv4 } from "uuid";


const SiteCleaner = () => {
    const [input, setInput] = useState<string>("");
    const [urlMappings, setUrlMappings] = useState<{ original: string; cleaned: string }[]>([]);
    const [filteredUrls, setFilteredUrls] = useState<string[]>([]);
    const [filterExtensions, setFilterExtensions] = useState<string>("");
    const [removeExtensionsInput, setRemoveExtensionsInput] = useState<string>("");

    const extractRootUrls = () => {
        if (!input.trim()) {
            alert("Input is empty. Please enter URLs.");
            return;
        }
    
        const urls = input
            .split("\n") // Split input into lines
            .map((url) => url.trim()) // Remove leading/trailing spaces
            .filter((url) => url); // Remove empty lines
    
        console.log("Extracted URLs (Raw):", urls); // Debugging
    
        const mappings = urls.map((original) => {
            try {
                // Add `http://` if no protocol is specified
                const urlWithProtocol = original.startsWith("http://") || original.startsWith("https://")
                    ? original
                    : `http://${original}`;
    
                const { hostname } = new URL(urlWithProtocol); // Extract hostname
                console.log("Parsed Hostname:", hostname); // Debugging
    
                if (
                    hostname &&
                    /^[a-zA-Z][a-zA-Z0-9.-]*$/.test(hostname) &&
                    !hostname.startsWith("xn--") && // Exclude Punycode
                    hostname.includes(".") // Ensure hostname has a valid domain
                ) {
                    return { original, cleaned: hostname }; // Use hostname only
                } else {
                    console.warn("Invalid hostname:", hostname); // Debugging
                }
            } catch (error) {
                console.error("Failed to parse URL:", original, error); // Debugging
            }
            return null;
        });
    
        const uniqueMappings = Array.from(
            new Map(
                mappings
                    .filter((mapping): mapping is { original: string; cleaned: string } => mapping !== null)
                    .map((mapping) => [mapping.cleaned, mapping])
            ).values()
        );
    
        console.log("Unique Mappings:", uniqueMappings); // Debugging
    
        // Update state with cleaned hostnames
        setUrlMappings(uniqueMappings); // Set all mappings
        setFilteredUrls(uniqueMappings.map((mapping) => mapping.cleaned)); // Set only cleaned hostnames
    };
    
    
    

    const removeExtensions = () => {
        if (!removeExtensionsInput) {
            return;
        }

        const extensionsToRemove = removeExtensionsInput
            .split(",")
            .map((ext) => ext.trim())
            .filter((ext) => ext);

        const filtered = urlMappings.filter(
            (mapping) => !extensionsToRemove.some((ext) => mapping.cleaned.endsWith(ext))
        );

        setUrlMappings(filtered);
        setFilteredUrls(filtered.map((mapping) => mapping.cleaned));
    };

    const filterByExtensions = () => {
        if (!filterExtensions) {
            setFilteredUrls(urlMappings.map((mapping) => mapping.cleaned));
            return;
        }

        const extensions = filterExtensions
            .split(",")
            .map((ext) => ext.trim())
            .filter((ext) => ext);

        const filtered = urlMappings.filter((mapping) =>
            extensions.some((ext) => mapping.cleaned.endsWith(ext))
        );

        setFilteredUrls(filtered.map((mapping) => mapping.cleaned));
    };

    const copyToClipboard = () => {
        navigator.clipboard
            .writeText(filteredUrls.join("\n"))
            .then(() => alert("Copied to clipboard!"))
            .catch((err) => alert("Failed to copy: " + err));
    };

    const addFileToDb = async () => {
        const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
        const filename = `filename_${uuidv4()}_${currentDate}`; // Combine UUID and date
        const status = "unprocessed";

        try {
            const response = await fetch("/api/addFilesToDb", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    filename, // A valid string (e.g., "filename_one_2024-12-10")
                    urlMappings, // An array of { original, cleaned } objects
                    status, // "processed" or "unprocessed"
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
                            <div style={{ rowGap: "10px" }}>
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
