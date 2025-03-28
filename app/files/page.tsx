"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";

const FilesPage = () => {
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/files"); // Internal API route
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const data = await response.json();
        setFiles(data.files); // Set the files data
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  const extractDateFromFilename = (filename: string) => {
    const match = filename.match(/_(\d{8})_(\d{6})/); // Matches the date and time in the filename
    if (!match) return "Invalid Filename";

    const [_, date, time] = match; // Extract date (YYYYMMDD) and time (HHMMSS)
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    const formattedDate = new Date(`${year}-${month}-${day}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`);
    return formattedDate.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Wordpress Processed Files</h1>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">No</th>
                  <th className="border border-gray-300 px-4 py-2">File Name</th>
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                  <th className="border border-gray-300 px-4 py-2">No of Links</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={file._id}>
                    <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{file.filename}</td>
                    <td className="border border-gray-300 px-4 py-2">{extractDateFromFilename(file.filename)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {file.wordpressUrls?.length || 0}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <Link href={`/files/${file._id}`}>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                          Access
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilesPage;
