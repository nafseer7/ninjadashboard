"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import LeftNavbar from "../components/LeftNavbar";
import axios from "axios";

const ShellAccessPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successFiles, setSuccessFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]); // State to hold fetched file data

  // Fetch success files and URL data on component load
  useEffect(() => {
    fetchSuccessFiles();
    fetchFilesData(); // Fetch files data from the new API
  }, []);

  // Fetch all success files
  const fetchSuccessFiles = async () => {
    try {
      const response = await axios.get("https://gigantic-alyda-ott-bbd052a7.koyeb.app/list-success-files/");
      setSuccessFiles(response.data.success_files);
    } catch (error) {
      console.error("Error fetching success files:", error);
    }
  };

  // Fetch files data from the new API
  const fetchFilesData = async () => {
    try {
      const response = await axios.get("/api/get-shell-details"); // API call to the Next.js API route
      setFiles(response.data); // Set the files data to state
    } catch (error) {
      console.error("Error fetching files data:", error);
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Submit file to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      await axios.post("https://gigantic-alyda-ott-bbd052a7.koyeb.app/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded and processed successfully!");
      setSelectedFile(null);
      fetchSuccessFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  // Function to call the process URL API
  const handleProcessClick = async (documentId: string) => {
    try {
      setLoading(true); // Show loading state
      // API call to process the URL mappings
      const response = await axios.post(
        `https://gigantic-alyda-ott-bbd052a7.koyeb.app/process-url-mappings/${documentId}`,
      );

      if (response.data.message === "Document updated successfully.") {
        // Successfully processed, refresh files data
        fetchFilesData();
        alert("File processed successfully!");
      } else {
        alert("Failed to process the file.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file.");
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <div className="flex">
      <LeftNavbar />
      <div className="flex flex-col w-full">
        <Header />
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Shell Access</h2>
          <p className="mb-6">Upload your shell file and view the details securely.</p>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="mb-6">
            <input
              type="file"
              onChange={handleFileChange}
              className="mb-4"
              accept=".txt"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload File"}
            </button>
          </form>

          {/* Files Data Table */}
          <h3 className="text-lg font-semibold mb-4">Files</h3>
          {files.length === 0 ? (
            <p>No files available.</p>
          ) : (
            <table className="table-auto w-full border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Document ID</th>
                  <th className="border px-4 py-2">Filename</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Quick Access</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id}>
                    <td className="border px-4 py-2">{file._id}</td>
                    <td className="border px-4 py-2">{file.filename}</td>
                    <td className="border px-4 py-2">{file.status}</td>
                    <td className="border px-4 py-2">
                      {file.status === "unprocessed" ? (
                        <button
                          onClick={() => handleProcessClick(file._id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Click to Process"}
                        </button>
                      ) : (
                        <button
                          onClick={() => window.location.href = `/shell-details/${file._id}`}
                          className="bg-green-500 text-white px-4 py-2 rounded"
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

          {/* Success Files Table */}
          <h3 className="text-lg font-semibold mb-4 pt-5">Processed Files</h3>
          {successFiles.length === 0 ? (
            <p>No files available.</p>
          ) : (
            <table className="table-auto w-full border mb-6">
              <thead>
                <tr>
                  <th className="border px-4 py-2">File Name</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {successFiles.map((fileName) => (
                  <tr key={fileName}>
                    <td className="border px-4 py-2">{fileName}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => window.location.href = `/shell-details/${fileName}`}
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
  );
};

export default ShellAccessPage;
