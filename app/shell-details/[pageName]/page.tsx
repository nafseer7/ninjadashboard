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
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
      const urls: { website: string }[] = response.data.urlMappings;

      // Add initial file details with only websites
      const initialFileDetails = urls.map((url) => ({
        website: url.website,
        domainAuthority: "Loading...",
        pageAuthority: "Loading...",
        spamScore: "Loading...",
      }));

      setFileDetails(initialFileDetails);

      // Fetch Moz metrics for each URL
      const enrichedData = await Promise.all(
        urls.map(async (urlObj) => {
          try {
            const mozResponse = await axios.post(`/api/fetch-moz-metrics`, {
              url: urlObj.website,
            });
            return {
              website: urlObj.website,
              domainAuthority: mozResponse.data.domainAuthority || "N/A",
              pageAuthority: mozResponse.data.pageAuthority || "N/A",
              spamScore: mozResponse.data.spamScore || "N/A",
            };
          } catch (err) {
            console.error("Error fetching Moz metrics for URL:", urlObj.website, err);
            return {
              website: urlObj.website,
              domainAuthority: "Error",
              pageAuthority: "Error",
              spamScore: "Error",
            };
          }
        })
      );

      setFileDetails(enrichedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching file details:", err);
      setError("Failed to fetch file details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sortedDetails = [...fileDetails].sort((a, b) => {
      const valueA = a[field as keyof FileDetail];
      const valueB = b[field as keyof FileDetail];

      if (valueA === "Error" || valueB === "Error" || valueA === "N/A" || valueB === "N/A") {
        return 0; // Keep errors or "N/A" in place
      }

      const numA = parseFloat(valueA as string);
      const numB = parseFloat(valueB as string);

      if (order === "asc") {
        return numA > numB ? 1 : -1;
      }
      return numA < numB ? 1 : -1;
    });

    setFileDetails(sortedDetails);
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogout = () => {
      setIsAuthenticated(false);

      // Clear credentials from Local Storage
      localStorage.removeItem("username");
      localStorage.removeItem("password");
  };

  return (
    <div className="flex">
      <LeftNavbar />
      <div className="flex flex-col w-full">
        <Header handleLogout={handleLogout}/>
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
                    <th className="p-3 text-gray-700 font-semibold">Website</th>
                    <th
                      className="p-3 text-gray-700 font-semibold cursor-pointer"
                      onClick={() => handleSort("domainAuthority")}
                    >
                      Domain Authority {sortField === "domainAuthority" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="p-3 text-gray-700 font-semibold cursor-pointer"
                      onClick={() => handleSort("pageAuthority")}
                    >
                      Page Authority {sortField === "pageAuthority" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="p-3 text-gray-700 font-semibold cursor-pointer"
                      onClick={() => handleSort("spamScore")}
                    >
                      Spam Score {sortField === "spamScore" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="p-3 text-gray-700 font-semibold">Quick Access</th>
                  </tr>
                </thead>
                <tbody>
                  {fileDetails.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{item.website}</td>
                      <td className="p-3">{item.domainAuthority}</td>
                      <td className="p-3">{item.pageAuthority}</td>
                      <td className="p-3">{item.spamScore}</td>
                      <td className="p-3">
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                          onClick={() =>
                            window.open(
                              item.website.startsWith("http") ? item.website : `http://${item.website}`,
                              "_blank"
                            )
                          }
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
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
