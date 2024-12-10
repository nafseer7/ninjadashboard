"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import LeftNavbar from "@/app/components/LeftNavbar";
import axios from "axios";

type FileDetail = {
  website: string;
  domainAuthority: number | string;
  pageAuthority: number | string;
  spamScore: number | string;
};

const ShellDetailsPage: React.FC = () => {
  const router = useRouter();
  const [pageName, setPageName] = useState<string | null>(null); // Dynamic route
  const [fileDetails, setFileDetails] = useState<FileDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // Format URLs to ensure proper structure
  const formatUrl = (url: string): string => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `http://${url}`;
    }
    return url;
  };

  // Extract the page name from the route
  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const name = pathParts[pathParts.length - 1];
    setPageName(name);

    if (name) {
      fetchFileDetails(name);
    }
  }, []);

  const fetchFileDetails = async (documentName: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/get-shell-file-details/${documentName}`);
      console.log("Response Data:", response.data);  // Log to verify structure
      const enrichedData = response.data.urlMappings;
      console.log("Enriched Data:", enrichedData);  // Log to check if it's structured as expected
      setFileDetails(enrichedData);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Axios error:", err.message);
        setError("Failed to fetch file details. Please try again.");
      } else {
        console.error("Unknown error:", err);
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...fileDetails].sort((a, b) => {
      const valueA = a[key as keyof FileDetail];
      const valueB = b[key as keyof FileDetail];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      return 0;
    });

    setFileDetails(sortedData);
  };

  return (
    <div className="flex">
      <LeftNavbar />
      <div className="flex flex-col w-full">
        <Header />
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">File Details</h2>
          {pageName ? (
            <p className="mb-6">
              <strong>Document Name:</strong> {pageName}
            </p>
          ) : (
            <p>Loading file details...</p>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : fileDetails.length === 0 ? (
            <p>No details found for this file.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th
                      className="p-3 text-gray-700 font-semibold cursor-pointer"
                      onClick={() => handleSort("website")}
                    >
                      Website {sortConfig?.key === "website" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="p-3 text-gray-700 font-semibold cursor-pointer"
                      onClick={() => handleSort("domainAuthority")}
                    >
                      Domain Authority{" "}
                      {sortConfig?.key === "domainAuthority" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="p-3 text-gray-700 font-semibold cursor-pointer"
                      onClick={() => handleSort("pageAuthority")}
                    >
                      Page Authority{" "}
                      {sortConfig?.key === "pageAuthority" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="p-3 text-gray-700 font-semibold cursor-pointer"
                      onClick={() => handleSort("spamScore")}
                    >
                      Spam Score{" "}
                      {sortConfig?.key === "spamScore" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th className="p-3 text-gray-700 font-semibold">Quick Access</th>
                  </tr>
                </thead>
                <tbody>
                  {fileDetails.length === 0 ? (
                    <tr>
                      <td colSpan={5}>No data available</td>
                    </tr>
                  ) : (
                    fileDetails.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{item.website}</td>
                        <td className="p-3">{item.domainAuthority}</td>
                        <td className="p-3">{item.pageAuthority}</td>
                        <td className="p-3">{item.spamScore}</td>
                        <td className="p-3">
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                            onClick={() => window.open(formatUrl(item.website), "_blank")}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200"
              onClick={() => history.back()}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShellDetailsPage;
