"use client";

import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";

type Result = {
  originalUrl: string;
  cleanedUrl: string;
  pageAuthority: number;
  domainAuthority: number;
  spamScore: number;
  type: "WordPress" | "Shell" | "Normal Website";
};

const IP_REGEX = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;

const isIpAddress = (hostname: string) => {
  return IP_REGEX.test(hostname);
};

const getHostname = (rawUrl: string): string | null => {
  try {
    if (!/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(rawUrl)) {
      rawUrl = "http://" + rawUrl;
    }
    return new URL(rawUrl).hostname;
  } catch {
    return null;
  }
};
const classifyUrlType = (hostname: string, rawUrl: string): "WordPress" | "Shell" | "Normal Website" => {
  if (/"wordpress_administrator"|"admin"|"modxsecure"/.test(rawUrl)) {
    return "WordPress";
  } else if (hostname.includes("shell")) {
    return "Shell";
  }
  return "Normal Website";
};


const IndividualScore = () => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortCriteria, setSortCriteria] = useState<keyof Result>("pageAuthority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);


  const chunkArray = (array: string[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const exportToCSV = () => {
    const csvHeader = ["Original URL", "Cleaned URL", "Page Authority", "Domain Authority", "Spam Score", "Type"].join(",");
    const csvRows = results.map((r) =>
      [r.originalUrl, r.cleanedUrl, r.pageAuthority, r.domainAuthority, r.spamScore, r.type].join(",")
    );
    const csvContent = [csvHeader, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "results.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const classifyUrlType = (hostname: string, rawUrl: string): "WordPress" | "Shell" | "Normal Website" => {
    if (/"wordpress_administrator"|"admin"|"modxsecure"|"xtw18387/.test(rawUrl)) {
      return "WordPress";
    } else if (rawUrl.includes(".php")) {
      return "Shell";
    }
    return "Normal Website";
  };
  

  const handleSearch = async () => {
    if (!url) {
      setError("Please enter at least one valid URL.");
      return;
    }
  
    setLoading(true);
    setError(null);
    setResults([]);
  
    try {
      const urls = url
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u);
  
      if (urls.length === 0) {
        setError("Please enter at least one valid URL.");
        setLoading(false);
        return;
      }
  
      const filteredUrls = urls.filter((item) => {
        const host = getHostname(item.split(",")[0]); // Extract the URL before the first comma
        return host !== null && !isIpAddress(host);
      });
  
      if (filteredUrls.length === 0) {
        setError(
          "All provided URLs are invalid or IP-based. Please enter domain-based URLs (e.g. ftp.example.com)."
        );
        setLoading(false);
        return;
      }
  
      const urlChunks = chunkArray(filteredUrls, 30);
      const allResults: Result[] = [];
  
      for (const chunk of urlChunks) {
        const siteQueries = chunk.map((rawUrl) => {
          const originalUrl = rawUrl.split(",")[0]; // Extract original URL
          const cleanedUrl = getHostname(originalUrl) || "";
          const type = classifyUrlType(cleanedUrl, rawUrl);
  
          return {
            query: cleanedUrl,
            scope: "url",
            originalUrl,
            type,
          };
        });
  
        const response = await fetch("/api/moz", {
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
                site_queries: siteQueries.map((sq) => ({ query: sq.query, scope: sq.scope })),
              },
            },
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch data from the server.");
        }
  
        const data = await response.json();
  
        if (data.result && data.result.results_by_site) {
          const resultsArray = data.result.results_by_site.map(
            (site: any, index: number) => {
              const siteMetrics = site?.site_metrics;
              const originalUrl = siteQueries[index].originalUrl;
              const cleanedUrl = siteQueries[index].query;
              const type = siteQueries[index].type;
  
              return siteMetrics
                ? {
                    originalUrl,
                    cleanedUrl,
                    pageAuthority: siteMetrics.page_authority || 0,
                    domainAuthority: siteMetrics.domain_authority || 0,
                    spamScore: siteMetrics.spam_score || 0,
                    type,
                  }
                : null;
            }
          );
  
          const validResults = resultsArray.filter((r: any) => r !== null);
          allResults.push(...(validResults as Result[]));
        } else if (data.error) {
          setError(`API Error: ${data.error.message || "Unknown error"}`);
          break;
        } else {
          setError("Unexpected response format from the API.");
          break;
        }
      }
  
      if (allResults.length > 0) {
        // Sort results by type to group WordPress, Shell, and Normal Website
        const sortedResults = allResults.sort((a, b) => {
          const typeOrder = { "WordPress": 1, "Shell": 2, "Normal Website": 3 };
          return typeOrder[a.type] - typeOrder[b.type];
        });
        setResults(sortedResults);
        setFilteredResults(sortedResults); // Save full results for filtering
      } else {
        setError("No metrics found for the provided URLs.");
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  


  const handleSort = (criteria: keyof Result) => {
    const sortedResults = [...results].sort((a, b) => {
      const aValue = typeof a[criteria] === "number" ? (a[criteria] as number) : 0;
      const bValue = typeof b[criteria] === "number" ? (b[criteria] as number) : 0;
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    setResults(sortedResults);
    setSortCriteria(criteria);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    handleSort(sortCriteria);
  };

  type FilterType = "WordPress" | "Shell" | "Normal Website" | "All";


  const filterByType = (type: FilterType) => {
    if (type === "All") {
      setResults(filteredResults); // Show all results
    } else {
      const filtered = filteredResults.filter((result) => result.type === type);
      setResults(filtered);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <LeftNavbar />
      <div className="flex flex-col w-full">
        <Header />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Get Scores</h1>
          <p className="text-gray-600 mb-6">
            Enter multiple URLs, one per line, to get their scores. <br />
            (IPs like <code>192.168.0.1</code> will be ignored.)
          </p>

          <div className="mb-4">
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g. ftp.example.com or https://something.net"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              rows={6}
            />
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Loading..." : "Search"}
          </button>

          <button
            onClick={exportToCSV}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={results.length === 0}
          >
            Export to CSV
          </button>

          {error && <p className="mt-4 text-red-600">{error}</p>}

          {results.length > 0 && (
            <div className="mt-6">
              <div className="mb-4 flex items-center space-x-4">
                <button
                  onClick={() => handleSort("pageAuthority")}
                  className={`px-4 py-2 rounded ${sortCriteria === "pageAuthority"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-800"
                    }`}
                >
                  Sort by Page Authority
                </button>
                <button
                  onClick={() => handleSort("domainAuthority")}
                  className={`px-4 py-2 rounded ${sortCriteria === "domainAuthority"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-800"
                    }`}
                >
                  Sort by Domain Authority
                </button>
                <button
                  onClick={() => handleSort("spamScore")}
                  className={`px-4 py-2 rounded ${sortCriteria === "spamScore"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-800"
                    }`}
                >
                  Sort by Spam Score
                </button>
                <button
                  onClick={toggleSortOrder}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Toggle Order: {sortOrder === "asc" ? "Ascending" : "Descending"}
                </button>
                <button
      onClick={() => filterByType("WordPress")}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Only WordPress
    </button>
    <button
      onClick={() => filterByType("Shell")}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-2"
    >
      Only Shells
    </button>
    <button
      onClick={() => filterByType("Normal Website")}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-2"
    >
      Only Normal Websites
    </button>
    <button
      onClick={() => filterByType("All")}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
    >
      Show All
    </button>
              </div>

              <table className="table-auto w-full border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2">Original URL</th>
                    <th className="border border-gray-300 p-2">Cleaned URL</th>
                    <th className="border border-gray-300 p-2">Page Authority</th>
                    <th className="border border-gray-300 p-2">Domain Authority</th>
                    <th className="border border-gray-300 p-2">Spam Score</th>
                    <th className="border border-gray-300 p-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{r.originalUrl}</td>
                      <td className="border border-gray-300 p-2">{r.cleanedUrl}</td>
                      <td className="border border-gray-300 p-2">{r.pageAuthority}</td>
                      <td className="border border-gray-300 p-2">{r.domainAuthority}</td>
                      <td className="border border-gray-300 p-2">{r.spamScore}</td>
                      <td className="border border-gray-300 p-2">{r.type}</td>
                    </tr>
                  ))}
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

