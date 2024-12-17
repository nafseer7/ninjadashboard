"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";
import { MongoClient, ObjectId } from "mongodb";


type UrlMapping = {
  original: string;
  cleaned: string;
};

type FileData = {
  _id: string;
  filename: string;
  urlMappings: UrlMapping[];
  status: string;
  createdAt: string;
};

const ProcessFilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);


  // Fetch files data from MongoDB API
  const fetchFilesData = async () => {
    try {
      const response = await axios.get("/api/get-shell-details"); // API to fetch MongoDB files
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files data:", error);
    }
  };


  const MONGO_URI = "mongodb+srv://nafseerck:7gbNMNAc5s236F5K@overthetop.isxuv3s.mongodb.net";
  const DB_NAME = "ninjadb";

  // Check if a URL has an input file
  const checkFileInputAndSubmit = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);

      // If the status is not 200, ignore this URL
      if (!response.ok) {
        console.error(`Skipping URL: ${url}, Status: ${response.status}`);
        return null;
      }

      // Parse the HTML content
      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");

      // Check for <input type="file"> or <input type="submit" value="Upload">
      const fileInput = doc.querySelector('input[type="file"]');
      const submitButton = doc.querySelector('input[type="submit"][value="Upload"]');

      // Return the URL if either element is found
      if (fileInput || submitButton) {
        return url;
      }

      return null; // No matching elements found
    } catch (error) {
      console.error(`Error occurred for ${url}:`, error);
      return null;
    }
  };


  // Process URLs concurrently
  const processUrlsConcurrently = async (
    urls: string[],
    maxConcurrent = 10
  ): Promise<string[]> => {
    const results: string[] = [];
    let currentProgress = 0;

    for (let i = 0; i < urls.length; i += maxConcurrent) {
      const batch = urls.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map((url) => checkFileInputAndSubmit(url))
      );
      results.push(...batchResults.filter((result) => result !== null) as string[]);

      // Simulate progress update
      currentProgress = Math.min(
        Math.round(((i + maxConcurrent) / urls.length) * 100),
        100
      );
      updateProgressSmoothly(currentProgress);
    }

    return results;
  };

  const updateProgressSmoothly = (target: number) => {
    let start = progress;
    const interval = setInterval(() => {
      start += 1;
      if (start >= target) {
        clearInterval(interval);
        setProgress(target); // Ensure final value is set
      } else {
        setProgress(start);
      }
    }, 20); // Controls the speed of the progress animation
  };
  

  // Process file URL mappings and update MongoDB
  const handleProcessFile = async (fileId: string, urlMappings: UrlMapping[]) => {
    setLoading(true);
    setProgress(1);

    try {
      const originalUrls = urlMappings.map((mapping) => mapping.original);

      // Process URLs to find those with file input
      const workingUrls = await processUrlsConcurrently(originalUrls);

      // Update the file's status and URL mappings using the API route
      const response = await fetch(`/api/update-file-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          urlMappings: urlMappings.filter((mapping) => workingUrls.includes(mapping.original)),
          status: "processed",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update file status");
      }

      // Refresh file data
      fetchFilesData();
      setProcessedUrls(workingUrls);
      alert("File processed successfully!");
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Failed to process file.");
    } finally {
      setLoading(false);
      setProgress(0);

    }
  };


  useEffect(() => {
    fetchFilesData();
  }, []);

  return (
    <>


      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-50">
          <div className="text-center">
            <div className="text-white text-3xl font-bold mb-4">Processing...</div>
            <div className="relative w-64 h-4 bg-gray-200 rounded-full">
              <div
                className="absolute h-4 bg-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-white text-xl mt-2">{progress}%</div>
          </div>
        </div>
      )}

      <div className="flex">
        <LeftNavbar />
        <div className="flex flex-col w-full">
          <Header />
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Process Files</h2>
            <p className="mb-6">Process files to check for input elements and update their status.</p>

            {/* Files Data Table */}
            <h3 className="text-lg font-semibold mb-4">Files</h3>
            {files.length === 0 ? (
              <p>No files available.</p>
            ) : (
              <table className="table-auto w-full border">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Filename</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file._id}>
                      <td className="border px-4 py-2">{file.filename}</td>
                      <td className="border px-4 py-2">{file.status}</td>
                      <td className="border px-4 py-2">
                        {file.status === "unprocessed" ? (
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => handleProcessFile(file._id, file.urlMappings)}
                            disabled={loading}
                          >
                            {loading ? "Processing..." : "Process"}
                          </button>
                        ) : (
                          <button
                            className="bg-green-500 text-white px-4 py-2 rounded"
                            onClick={() => (window.location.href = `/shell-details/${file._id}`)}
                          >
                            Access
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}

            {/* Processed URLs */}
            <h3 className="text-lg font-semibold mb-4 pt-5">Processed Files</h3>
            {processedUrls.length === 0 ? (
              <p>No processed files available.</p>
            ) : (
              <table className="table-auto w-full border mb-6">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">File Name</th>
                    <th className="border px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {processedUrls.map((fileName) => (
                    <tr key={fileName}>
                      <td className="border px-4 py-2">{fileName}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => (window.location.href = `/shell-details/${fileName}`)}
                          className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                          Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessFilesPage;
