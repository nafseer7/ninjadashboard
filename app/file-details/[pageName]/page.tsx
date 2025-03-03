"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

const FileDetails = () => {
  const pathname = usePathname(); // Get the full path
  const fileName = pathname ? pathname.split("/").pop() : null; // Extract the dynamic file name
  const [fileData, setFileData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  useEffect(() => {
    if (fileName) {
      fetchFileData(fileName); // Use the extracted file name
    }
  }, [fileName]);

  const formatUrl = (url: string): string => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `http://${url}`;
    }
    return url;
  };

  const fetchFileData = async (cleanedFileName: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://worthwhile-roseanna-ott-31c6c433.koyeb.app/view-content/?file_name=${cleanedFileName}.txt` // Fetch file data
      );
      const enrichedData = await enrichWithMetrics(response.data); // Enrich data with Moz metrics
      setFileData(enrichedData);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle Axios error
        console.error("Axios error:", err.message);
        setError("Failed to fetch file data. Please try again.");
      } else {
        // Handle unknown error
        console.error("Unknown error:", err);
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleAccess = async (siteUrl: string, username: string, password: string) => {
  //   try {
  //     const payload = {
  //       site_url: formatUrl(siteUrl),
  //       username,
  //       password,
  //     };

  //     const response = await axios.post("https://worthwhile-roseanna-ott-31c6c433.koyeb.app/login-wordpress/", payload);
  //     const { admin_url } = response.data;
  //     window.open(admin_url, "_blank"); // Open the admin dashboard in a new tab
  //   } catch (error: unknown) {
  //     if (axios.isAxiosError(error)) {
  //       console.error("Failed to access WordPress:", error.message);
  //       alert("Failed to login. Please check the credentials or the site URL.");
  //     } else {
  //       console.error("An unexpected error occurred:", error);
  //       alert("An unexpected error occurred. Please try again.");
  //     }
  //   }
  // };


  // const handleAccess = async (siteUrl: string, username: string, password: string) => {
  //   try {
  //     // Ensure the payload is formatted correctly
  //     const payload = {
  //       site_url: siteUrl.trim(), // Remove extra spaces
  //       username: username.trim(),
  //       password: password.trim(),
  //     };
  
  //     // Send the POST request
  //     const response = await axios.post(
  //       "https://worthwhile-roseanna-ott-31c6c433.koyeb.app/login-wordpress/",
  //       payload,
  //       {
  //         headers: {
  //           "Content-Type": "application/json", // Ensure proper headers
  //         },
  //       }
  //     );
  
  //     const { admin_url } = response.data;
  
  //     if (admin_url) {
  //       window.open(admin_url, "_blank"); // Open admin panel in a new tab
  //     } else {
  //       alert("Failed to retrieve admin URL. Please check the credentials.");
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       console.error("Failed to access WordPress:", error.response?.data || error.message);
  //       alert(error.response?.data.message || "Failed to log in. Please try again.");
  //     } else {
  //       console.error("Unexpected error:", error);
  //       alert("An unexpected error occurred. Please try again.");
  //     }
  //   }
  // };
  

  const handleAccess = async (siteUrl: string, username: string, password: string) => {
    try {
      const response = await fetch('/api/login-wordpress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl, username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Open the login URL in a new tab
        window.open(data.loginUrl, '_blank');
      } else {
        console.error('Failed to generate login URL:', data.message);
        alert('Failed to generate login URL. Check the credentials or site URL.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred.');
    }
  };
  

  
  
  

  const enrichWithMetrics = async (data: any[]) => {
    try {
      const batchSize = 30;
      const metricsData: any[] = [];

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const siteQueries = batch.map((item) => ({
          query: item.website,
          scope: "url",
        }));

        const mozApiPayload = {
          jsonrpc: "2.0",
          id: "614522f4-29c8-4a75-94c6-8f03bf107903",
          method: "data.site.metrics.fetch.multiple",
          params: {
            data: {
              site_queries: siteQueries,
            },
          },
        };

        const config = {
          method: "post",
          url: "https://worthwhile-roseanna-ott-31c6c433.koyeb.app/proxy/moz-metrics/", // Use the proxy endpoint
          headers: {
            "Content-Type": "application/json",
          },
          data: mozApiPayload,
        };

        const metricsResponse = await axios(config);
        const batchMetrics = metricsResponse.data.result.results_by_site || [];
        metricsData.push(...batchMetrics);
      }

      return data.map((item, index) => {
        const metrics = metricsData[index]?.site_metrics || {};
        return {
          ...item,
          domainAuthority: metrics.domain_authority || "N/A",
          pageAuthority: metrics.page_authority || "N/A",
          spamScore: metrics.spam_score || "N/A",
        };
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error while fetching Moz metrics:", error.message);
      } else {
        console.error("Unknown error while fetching Moz metrics:", error);
      }
      return data; // Return the original data if metrics fetch fails
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...fileData].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      return 0;
    });

    setFileData(sortedData);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">File Details</h1>
        <p className="text-gray-600 mb-6">
          <strong>File Name:</strong> {fileName}
        </p>

        {loading && <p>Loading file data...</p>}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && fileData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th
                    className="p-3 text-gray-700 font-semibold cursor-pointer"
                    onClick={() => handleSort("website")}
                  >
                    Website
                  </th>
                  <th
                    className="p-3 text-gray-700 font-semibold cursor-pointer"
                    onClick={() => handleSort("username")}
                  >
                    Username
                  </th>
                  <th
                    className="p-3 text-gray-700 font-semibold cursor-pointer"
                    onClick={() => handleSort("domainAuthority")}
                  >
                    Domain Authority
                  </th>
                  <th
                    className="p-3 text-gray-700 font-semibold cursor-pointer"
                    onClick={() => handleSort("pageAuthority")}
                  >
                    Page Authority
                  </th>
                  <th
                    className="p-3 text-gray-700 font-semibold cursor-pointer"
                    onClick={() => handleSort("spamScore")}
                  >
                    Spam Score
                  </th>
                  <th className="p-3 text-gray-700 font-semibold">WordPress Access</th>
                </tr>
              </thead>
              <tbody>
                {fileData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{item.website}</td>
                    <td className="p-3">{item.username}</td>
                    <td className="p-3">{item.domainAuthority}</td>
                    <td className="p-3">{item.pageAuthority}</td>
                    <td className="p-3">{item.spamScore}</td>
                    <td className="p-3">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleAccess(item.website, item.username, item.password)}
                      >
                        Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && fileData.length === 0 && (
          <p>No data available for this file.</p>
        )}

        <div className="mt-6">
          <button
            className="btn btn-secondary"
            onClick={() => history.back()} // Use the browser history to go back
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileDetails;
