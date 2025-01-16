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

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex">
        <LeftNavbar />
        <div className="flex flex-col w-full">
          <Header />
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Wordpress Processed Files</h1>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">File Name</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id}>
                    <td className="border border-gray-300 px-4 py-2">{file.filename}</td>
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
