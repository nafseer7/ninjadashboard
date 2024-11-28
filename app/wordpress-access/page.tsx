"use client";

import React, { useEffect, useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";
import axios from "axios";


const stripFileExtension = (fileName: string): string => {
  return fileName.replace(/\.[^/.]+$/, ""); // Removes the file extension
};

const navigateToFileDetails = (fileName: string) => {
  window.location.href = `/file-details/${stripFileExtension(fileName)}`;
};

const WordPressAccessPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<any | null>(null);
  const [processResponse, setProcessResponse] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [successFiles, setSuccessFiles] = useState<string[]>([]);

  // Fetch list of success-cleaned files
  useEffect(() => {
    const fetchSuccessFiles = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL_8080 || 'http://localhost:8080';
        const response = await axios.get(`${baseUrl}/list-success-cleaned/`);

        if (response.data) {
          setSuccessFiles(response.data.map((file: { filename: string }) => file.filename));
        }
      } catch (error) {
        console.error("Error fetching success-cleaned files:", error);
      }
    };

    fetchSuccessFiles();
  }, []);


  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };



  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL_8080 || 'http://localhost:8080'; // Fallback to localhost
      const response = await axios.post(`${baseUrl}/upload/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadResponse(response.data);
      setFile(null); // Clear the selected file
      setShowModal(false); // Close the modal
    } catch (error) {
      alert("Error uploading file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFileName = (filePath: string): string => {
    // Extract the part after the last backslash
    return filePath.replace(/^.*[\\/]/, "");
  };

  // Handle process file
  const handleProcessFile = async () => {
    if (!uploadResponse || !uploadResponse.cleaned_file_name) {
      alert("No cleaned file to process.");
      return;
    }

    const cleanedFileName = uploadResponse.cleaned_file_name;

    try {
      setLoading(true);
      const response = await axios.post(
        `http://3.16.139.158:8080/process-cleaned/?file_name=${cleanedFileName}`
      );

      setProcessResponse(response.data);
    } catch (error) {
      alert("Error processing file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <LeftNavbar />
      <div className="flex flex-col w-full">
        <Header />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">WordPress Access</h1>
          <p className="text-gray-600 mb-6">
            Manage your WordPress sites, updates, and file processing here.
          </p>


          <div className="flex gap-4 mb-6">
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              Upload File
            </button>
            <button
              className="btn btn-success"
              onClick={handleProcessFile}
              disabled={!uploadResponse || loading}
            >
              {loading ? "Processing..." : "Process File"}
            </button>
          </div>

          {/* Upload Response */}
          {uploadResponse && (
            <div className="alert alert-info" role="alert">
              <strong>Upload Response:</strong> {uploadResponse.message}
            </div>
          )}

          {/* Process Response */}
          {processResponse && (
            <div className="alert alert-success" role="alert">
              <strong>Success File:</strong>{" "}
              <a
                href={`/${processResponse.success_file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {processResponse.success_file}
              </a>
            </div>
          )}

          {/* Success Files Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Success Cleaned Files</h2>

            <div className="overflow-x-auto">
              <table className="table-auto w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-gray-700 font-semibold">File Name</th>
                    <th className="p-3 text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {successFiles.map((fileName, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{fileName}</td>
                      <td className="p-3">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => navigateToFileDetails(fileName)}
                        >
                          Show Data
                        </button>

                      </td>
                    </tr>
                  ))}
                  {successFiles.length === 0 && (
                    <tr>
                      <td className="p-3 text-gray-500" colSpan={2}>
                        No success-cleaned files available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Upload File</h2>
            <input
              type="file"
              onChange={handleFileChange}
              className="form-control mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordPressAccessPage;
