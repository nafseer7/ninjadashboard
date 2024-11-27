"use client";

import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";

const IndividualScore = () => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<{
    pageAuthority: number;
    domainAuthority: number;
    spamScore: number;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!url) {
      setError("Please enter a valid URL");
      return;
    }
  
    setLoading(true);
    setError(null);
    setResults(null);
  
    try {
      const response = await fetch("/api/mozProxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "614522f4-29c8-4a75-94c6-8f03bf107903",
          method: "data.site.metrics.fetch.multiple",
          params: {
            data: {
              site_queries: [
                {
                  query: url,
                  scope: "url",
                },
              ],
            },
          },
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data from the server");
      }
  
      const data = await response.json();
      console.log("API Response:", data); // Log the full response for debugging
  
      if (data.result && data.result.results_by_site) {
        const siteMetrics =
          data.result.results_by_site[0]?.site_metrics || null;
  
        if (siteMetrics) {
          setResults({
            pageAuthority: siteMetrics.page_authority,
            domainAuthority: siteMetrics.domain_authority,
            spamScore: siteMetrics.spam_score,
            url: url,
          });
        } else {
          setError("No metrics found for the provided URL.");
        }
      } else if (data.error) {
        setError(`API Error: ${data.error.message || "Unknown error"}`);
      } else {
        setError("Unexpected response format from the API.");
      }
    } catch (error) {
      setError((error as Error).message);
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
          <h1 className="text-2xl font-bold mb-4">Get Scores</h1>
          <p className="text-gray-600 mb-6">Get Your Scores</p>

          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter a URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Loading..." : "Search"}
          </button>

          {error && (
            <p className="mt-4 text-red-600">
              {error}
            </p>
          )}

          {results && (
            <div className="mt-6">
              <table className="table-auto w-full border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2">URL</th>
                    <th className="border border-gray-300 p-2">Page Authority</th>
                    <th className="border border-gray-300 p-2">Domain Authority</th>
                    <th className="border border-gray-300 p-2">Spam Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">{results.url}</td>
                    <td className="border border-gray-300 p-2">{results.pageAuthority}</td>
                    <td className="border border-gray-300 p-2">{results.domainAuthority}</td>
                    <td className="border border-gray-300 p-2">{results.spamScore}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualScore;
