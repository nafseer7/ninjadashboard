"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/header";
import LeftNavbar from "../components/LeftNavbar";
import axios from "axios";

const ShellAccessPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successFiles, setSuccessFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch success files on component load
  useEffect(() => {
    fetchSuccessFiles();
  }, []);

  // Fetch all success files
  const fetchSuccessFiles = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8200/list-success-files/");
      setSuccessFiles(response.data.success_files);
    } catch (error) {
      console.error("Error fetching success files:", error);
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
      await axios.post("http://127.0.0.1:8200/upload/", formData, {
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

          {/* Success Files Table */}
          <h3 className="text-lg font-semibold mb-4">Processed Files</h3>
          {successFiles.length === 0 ? (
            <p>No files available.</p>
          ) : (
            <table className="table-auto w-full border">
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
