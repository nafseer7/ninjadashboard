"use client";

import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";

type Result = {
  pageAuthority: number;
  domainAuthority: number;
  spamScore: number;
  url: string;
};

// Simple IPv4 detection (0-255 in each octet)
const IP_REGEX = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;

const isIpAddress = (hostname: string) => {
  return IP_REGEX.test(hostname);
};

/**
 * Prepend "http://" if there's no protocol, then parse.
 * Return the hostname, or null if invalid.
 */
const getHostname = (rawUrl: string): string | null => {
  try {
    // If the input doesn't start with something like "http://", "https://", "ftp://", etc.
    if (!/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(rawUrl)) {
      rawUrl = "http://" + rawUrl;
    }
    return new URL(rawUrl).hostname;
  } catch {
    return null;
  }
};

const IndividualScore = () => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortCriteria, setSortCriteria] = useState<keyof Result>("pageAuthority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  /** Split array into chunks of `chunkSize` */
  const chunkArray = (array: string[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
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
      // Split the input by newlines, trim, and remove empty lines
      const urls = url
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u);

      if (urls.length === 0) {
        setError("Please enter at least one valid URL.");
        setLoading(false);
        return;
      }

      // Exclude any URL that resolves to an IP address
      const filteredUrls = urls.filter((item) => {
        const host = getHostname(item);
        // Keep it only if the hostname is valid and NOT an IP
        return host !== null && !isIpAddress(host);
      });

      if (filteredUrls.length === 0) {
        setError(
          "All provided URLs are invalid or IP-based. Please enter domain-based URLs (e.g. ftp.example.com)."
        );
        setLoading(false);
        return;
      }

      // Break them into chunks of 30 for your API calls
      const urlChunks = chunkArray(filteredUrls, 30);
      const allResults: Result[] = [];

      // Fetch each chunk sequentially
      for (const chunk of urlChunks) {
        const siteQueries = chunk.map((u) => ({
          query: u,
          scope: "url",
        }));

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
                site_queries: siteQueries,
              },
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data from the server.");
        }

        const data = await response.json();
        console.log("API Response:", data); // For debugging

        if (data.result && data.result.results_by_site) {
          const resultsArray = data.result.results_by_site.map(
            (site: any, index: number) => {
              const siteMetrics = site?.site_metrics;
              return siteMetrics
                ? {
                    url: chunk[index],
                    pageAuthority: siteMetrics.page_authority || 0,
                    domainAuthority: siteMetrics.domain_authority || 0,
                    spamScore: siteMetrics.spam_score || 0,
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
        setResults(allResults);
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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <LeftNavbar />
      <div className="flex flex-col w-full">
        <Header />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Get Scores</h1>
          <p className="text-gray-600 mb-6">
            Enter multiple URLs, one per line, to get their scores. 
            <br />
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

          {error && <p className="mt-4 text-red-600">{error}</p>}

          {results.length > 0 && (
            <div className="mt-6">
              <div className="mb-4 flex items-center space-x-4">
                <button
                  onClick={() => handleSort("pageAuthority")}
                  className={`px-4 py-2 rounded ${
                    sortCriteria === "pageAuthority"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-800"
                  }`}
                >
                  Sort by Page Authority
                </button>
                <button
                  onClick={() => handleSort("domainAuthority")}
                  className={`px-4 py-2 rounded ${
                    sortCriteria === "domainAuthority"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-800"
                  }`}
                >
                  Sort by Domain Authority
                </button>
                <button
                  onClick={() => handleSort("spamScore")}
                  className={`px-4 py-2 rounded ${
                    sortCriteria === "spamScore"
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
              </div>

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
                  {results.map((r, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{r.url}</td>
                      <td className="border border-gray-300 p-2">{r.pageAuthority}</td>
                      <td className="border border-gray-300 p-2">{r.domainAuthority}</td>
                      <td className="border border-gray-300 p-2">{r.spamScore}</td>
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
