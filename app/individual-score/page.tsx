"use client";

import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";
import Header from "../components/header";
import { FaSearch, FaCopy, FaWordpress, FaTerminal, FaGlobe, FaSpinner } from "react-icons/fa";


type Result = {
  originalUrl: string;
  cleanedUrl: string;
  pageAuthority: number;
  domainAuthority: number;
  spamScore: number;
  type: "WordPress" | "Shell" | "Joomla" | "Plesk" | "Normal Website";
  username?: string;
  password?: string;
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

interface StatItemProps {
  icon: JSX.Element;
  label: string;
  count: number;
}

const extractCredentials = (rawUrl: string): { username?: string; password?: string } => {
  if (rawUrl.startsWith("plesk:") || rawUrl.startsWith("directadmin:") || rawUrl.includes("login.aspx")) {
    const parts = rawUrl.split("|");
    return parts.length === 3 ? { username: parts[1].trim(), password: parts[2].trim() } : {};
  }

  const parts = rawUrl.split(",");

  // Case 1: Handling comma-separated format
  if (parts.length >= 3) {
    return {
      username: parts[1]?.trim(),
      password: parts[2]?.trim(),
    };
  }

  // Case 2: Handling format with '#' and '@'
  const hashIndex = rawUrl.indexOf("#");
  if (hashIndex !== -1) {
    const credentialsPart = rawUrl.substring(hashIndex + 1); // Extract part after #
    const [username, password] = credentialsPart.split("|"); // Split by '@' for username and password
    return {
      username: username?.trim(),
      password: password?.trim(),
    };
  }

 

  return {};
};

const removeDuplicates = (results: Result[]) => {
  const uniqueResults: Result[] = [];
  const seenUrls = new Set<string>();

  for (const result of results) {
    if (!seenUrls.has(result.cleanedUrl)) {
      uniqueResults.push(result);
      seenUrls.add(result.cleanedUrl);
    }
  }

  return uniqueResults;
};

const IndividualScore = () => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortCriteria, setSortCriteria] = useState<keyof Result>("pageAuthority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showShellPopup, setShowShellPopup] = useState<boolean>(false);
  const [showJoomlaPopup, setShowJoomlaPoup] = useState<boolean>(false);
  const [showPleskPopup, setShowPleskPopup] = useState<boolean>(false);
  const [showDirectAdminPopup, setShowDirectAdminPopup] = useState<boolean>(false);
  const [showRdWebPopup, setShowRdWebPopup] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [showShellSuccessPopup, setShowShellSuccessPopup] = useState<boolean>(false);
  const [showJoomlaSuccessPopup, setShowJoomlaSuccessPopup] = useState<boolean>(false);
  const [showPleskSuccessPopup, setShowPleskSuccessPopup] = useState<boolean>(false);
  const [showDirectAdminSuccessPopup, setshowDirectAdminSuccessPopup] = useState<boolean>(false);
  const [showRdWebSuccessPopup, setShowRdWebSuccessPopup] = useState<boolean>(false);
  const [extensionInput, setExtensionInput] = useState<string>("");





  const chunkArray = (array: string[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const exportToCSV = () => {
    const csvHeader = ["Original URL", "Cleaned URL", "Page Authority", "Domain Authority", "Spam Score", "Type", "Username", "Password"].join(",");
    const csvRows = results.map((r) =>
      [
        r.originalUrl,
        r.cleanedUrl,
        r.pageAuthority,
        r.domainAuthority,
        r.spamScore,
        r.type,
        r.username || "",
        r.password || "",
      ].join(",")
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

  const classifyUrlType = (hostname: string, rawUrl: string): "WordPress" | "Shell" | "Joomla" | "Plesk" | "DirectAdmin" | "RdWeb" | "Normal Website" => {
    if (rawUrl.startsWith("plesk:")) return "Plesk";
    if (rawUrl.startsWith("directadmin:")) return "DirectAdmin";

    const parts = rawUrl.split(","); // Split the raw URL by commas
    const domain = parts[0]?.trim(); // The first part is the domain name

    // Extract credentials for rawUrl with '#username@password'
    const hashIndex = rawUrl.indexOf("#");
    let username: string | undefined;
    let password: string | undefined;

    if (hashIndex !== -1) {
      const credentialsPart = rawUrl.substring(hashIndex + 1); // Extract part after #
      [username, password] = credentialsPart.split("|"); // Split by '@' for username and password
      username = username?.trim();
      password = password?.trim();
    } else if (parts.length >= 3) {
      // Fallback to the comma-separated format for username/password
      username = parts[1]?.trim();
      password = parts[2]?.trim();
    }

    if (domain?.includes("/administrator/index.php")) {
      return "Joomla";
    }

    if (domain?.includes("/login.aspx")) {
      return "RdWeb";
    }


    // Check if it matches the WordPress website pattern
    if (username && password) {
      return "WordPress";
    }

    // Check if the URL ends with ".php"
    if (domain?.endsWith(".php")) {
      return "Shell";
    }

    // If none of the above conditions match, classify as a Normal Website
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
      // First decode the URL-encoded text
      const decodedInput = decodeURIComponent(url)
        .replace(/%0A/g, '\n')  // Replace URL-encoded newlines
        .replace(/%7C/g, '|')   // Replace URL-encoded pipes
        .replace(/%23/g, '#')   // Replace URL-encoded hash
        .replace(/%40/g, '@')   // Replace URL-encoded @
        .replace(/\r\n/g, '\n') // Normalize Windows line endings
        .replace(/\r/g, '\n');  // Normalize Mac line endings

      const urls = decodedInput
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u);

      if (urls.length === 0) {
        setError("Please enter at least one valid URL.");
        setLoading(false);
        return;
      }

      // Ensure URLs start with http:// or https://
      const normalizedUrls = urls.map((u) => {
        if (!/^https?:\/\//i.test(u) && !u.toLowerCase().startsWith("plesk:") && !u.toLowerCase().startsWith("directadmin:")) {
          return `http://${u}`;
        }
        return u;
      });

      const filteredUrls = normalizedUrls.filter((item) => {
        const host = getHostname(item.split(",")[0]); // Extract the URL before the first comma
        return host && !isIpAddress(host); // Ensure valid hostname and not an IP address
      });

      if (filteredUrls.length === 0) {
        setError("All provided URLs are invalid or IP-based. Please enter domain-based URLs.");
        setLoading(false);
        return;
      }

      const urlChunks = chunkArray(filteredUrls, 50);
      const allResults: Result[] = []; // Initialize empty results array

      for (const chunk of urlChunks) {
        const siteQueries = chunk.map((rawUrl) => {
          const isPlesk = rawUrl.toLowerCase().startsWith("plesk:");
          const isDirectAdmin = rawUrl.toLowerCase().startsWith("directadmin:");

          const originalUrl = isPlesk
            ? rawUrl.split("|")[0].replace("plesk:", "").trim()
            : isDirectAdmin
              ? rawUrl.split("|")[0].replace("directadmin:", "").trim()
              : rawUrl.split(",")[0];


          const cleanedUrl = getHostname(originalUrl) || "";
          const type = classifyUrlType(cleanedUrl, rawUrl);
          const credentials = (type === "WordPress" || type === "Joomla" || type === "Plesk" || type === "DirectAdmin" || type === "RdWeb") ? extractCredentials(rawUrl) : {};

          return {
            query: cleanedUrl,
            scope: "url",
            originalUrl,
            type,
            ...credentials,
          };
        });

        try {
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
                const username = siteQueries[index].username;
                const password = siteQueries[index].password;

                return siteMetrics
                  ? {
                    originalUrl,
                    cleanedUrl,
                    pageAuthority: siteMetrics.page_authority || 0,
                    domainAuthority: siteMetrics.domain_authority || 0,
                    spamScore: siteMetrics.spam_score || 0,
                    type,
                    username,
                    password,
                  }
                  : null;
              }
            );

            const validResults = resultsArray.filter(
              (r: any) =>
                r !== null &&
                (r.spamScore || 0) <= 30 && // Spam Score must be 10 or less
                (r.domainAuthority || 0) > 10 && // Domain Authority must be greater than 10
                (r.pageAuthority || 0) > 10 // Page Authority must be greater than 10
            );
            allResults.push(...validResults); // Add to results
          } else if (data.error) {
            console.error(`API Error for URLs: ${siteQueries.map((sq) => sq.query).join(", ")}`);
            console.error(`Error message: ${data.error.message}`);
            continue; // Skip problematic chunk
          } else {
            console.error("Unexpected response format from the API.");
            continue; // Skip problematic chunk
          }
        } catch (error) {
          console.error(`Error processing chunk: ${chunk.join(", ")}`);
          console.error(error);
          continue; // Skip problematic chunk
        }
      }

      if (allResults.length > 0) {
        // Remove duplicates based on cleanedUrl
        const uniqueResults = removeDuplicates(allResults);

        // Sort results by type to group Joomla, WordPress, Shell, Plesk, and Normal Website
        const sortedResults = uniqueResults.sort((a, b) => {
          const typeOrder = { "WordPress": 1, "Shell": 2, "Joomla": 3, "Plesk": 4, "DirectAdmin": 5, "RdWeb": 6, "Normal Website": 6 };
          return typeOrder[a.type] - typeOrder[b.type];
        });

        setResults(sortedResults);
        setFilteredResults(sortedResults); // Save filtered results for further use
      } else {
        setError("No metrics found for the provided URLs.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };




  const removeByExtension = (extensionInput: string) => {
    const inputs = extensionInput
      .replace(/\s+/g, ",")
      .replace(/\./g, ".") // Keep dots for domain checking
      .split(",")
      .map((input) => input.trim().toLowerCase())
      .filter((input) => input);

    const updatedResults = results.filter((result) => {
      const urlExtension = result.cleanedUrl.split('.').pop()?.toLowerCase();

      // Check if the extension or domain is in the input list
      return !inputs.some((input) =>
        urlExtension === input || result.cleanedUrl.toLowerCase().includes(input)
      );
    });

    setResults(updatedResults);
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

  type FilterType = "WordPress" | "Joomla" | "Shell" | "DirectAdmin" | "RdWeb" | "Normal Website" | "All";

  const filterByType = (type: FilterType) => {
    if (type === "All") {
      setResults(filteredResults); // Show all results
    } else {
      const filtered = filteredResults.filter((result) => result.type === type);
      setResults(filtered);
    }
  };



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

  const handleProcessWordPress = async () => {
    try {
      const wordpressUrls = results
        .filter((r) => r.type === "WordPress")
        .map((r) => ({
          url: r.cleanedUrl,
          username: r.username || "",
          password: r.password || "",
        }));

      if (wordpressUrls.length === 0) {
        alert("No WordPress URLs to process.");
        return;
      }

      setProcessing(true);
      setProgress(0); // Reset progress
      setShowPopup(true); // Show initial processing popup

      // Simulate progress increment
      const simulateProgress = setInterval(() => {
        setProgress((prev) => {
          const nextValue = prev + 1;
          return nextValue >= 90 ? 90 : nextValue; // Cap progress at 90% until response
        });
      }, 500); // Increment progress every 500ms

      const response = await fetch(
        "https://foolish-emera-ott-196fcae3.koyeb.app/wordpress-process/",
        // "https://drab-lauri-ott-92c73c38.koyeb.app/wordpress-process/",
        // "http://127.0.0.1:8000/wordpress-process/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wordpressUrls }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        throw new Error(errorData.detail || "Failed to process WordPress files.");
      }

      // Clear progress simulation
      clearInterval(simulateProgress);

      // Set progress to 100% on successful response
      setProgress(100);

      const data = await response.json();
      console.log("Backend response:", data);

      setResults(data.results); // Update results with the backend response
      setProcessing(false);

      // Transition to "Added Successfully" popup
      setTimeout(() => {
        setShowPopup(false); // Close initial popup
        setTimeout(() => {
          setShowSuccessPopup(true); // Show "Added Successfully" popup
          setTimeout(() => {
            setShowSuccessPopup(false); // Automatically close "Added Successfully" popup after 5 seconds
          }, 5000);
        }, 500);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing WordPress files.");
      setProcessing(false);
    }
  };

  const handleJoomlaProcess = async () => {
    try {
      const joomlaUrls = results
        .filter((r) => r.type === "Joomla")
        .map((r) => ({
          url: r.cleanedUrl,
          username: r.username || "",
          password: r.password || "",
        }));

      if (joomlaUrls.length === 0) {
        alert("No Joomla URLs to process.");
        return;
      }

      setProcessing(true);
      setProgress(0); // Reset progress
      setShowPopup(true); // Show initial processing popup

      // Simulate progress increment
      const simulateProgress = setInterval(() => {
        setProgress((prev) => {
          const nextValue = prev + 1;
          return nextValue >= 90 ? 90 : nextValue; // Cap progress at 90% until response
        });
      }, 500); // Increment progress every 500ms

      const response = await fetch(
        "http://172.81.132.157:7350/joomla-process/",
        // "http://127.0.0.1:8000/joomla-process/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ joomlaUrls }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        throw new Error(errorData.detail || "Failed to process Joomla files.");
      }

      // Clear progress simulation
      clearInterval(simulateProgress);

      // Set progress to 100% on successful response
      setProgress(100);

      const data = await response.json();
      console.log("Backend response:", data);

      setResults(data.results); // Update results with the backend response
      setProcessing(false);

      // Transition to "Added Successfully" popup
      setTimeout(() => {
        setShowPopup(false); // Close initial popup
        setTimeout(() => {
          setShowJoomlaSuccessPopup(true); // Show "Added Successfully" popup
          setTimeout(() => {
            setShowJoomlaSuccessPopup(false); // Automatically close "Added Successfully" popup after 5 seconds
          }, 5000);
        }, 500);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing Joomla files.");
      setProcessing(false);
    }
  };

  const handlePleskProcess = async () => {
    try {
      const pleskUrls = results
        .filter((r) => r.type === "Plesk")
        .map((r) => ({
          url: r.cleanedUrl,
          username: r.username || "",
          password: r.password || "",
        }));

      if (pleskUrls.length === 0) {
        alert("No Plesk URLs to process.");
        return;
      }

      setProcessing(true);
      setProgress(0); // Reset progress
      setShowPopup(true); // Show initial processing popup

      // Simulate progress increment
      const simulateProgress = setInterval(() => {
        setProgress((prev) => {
          const nextValue = prev + 1;
          return nextValue >= 90 ? 90 : nextValue; // Cap progress at 90% until response
        });
      }, 500); // Increment progress every 500ms

      const response = await fetch(
        // "http://172.81.132.157:7350/plesk-process/",
        "https://constitutional-imelda-ott-0f75c217.koyeb.app/plesk-process/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pleskUrls }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        throw new Error(errorData.detail || "Failed to process Plesk files.");
      }

      // Clear progress simulation
      clearInterval(simulateProgress);

      // Set progress to 100% on successful response
      setProgress(100);

      const data = await response.json();
      console.log("Backend response:", data);

      setResults(data.results); // Update results with the backend response
      setProcessing(false);

      // Transition to "Added Successfully" popup
      setTimeout(() => {
        setShowPopup(false); // Close initial popup
        setTimeout(() => {
          setShowPleskSuccessPopup(true); // Show "Added Successfully" popup
          setTimeout(() => {
            setShowPleskSuccessPopup(false); // Automatically close "Added Successfully" popup after 5 seconds
          }, 5000);
        }, 500);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing Joomla files.");
      setProcessing(false);
    }
  };

  const handleRdWebProcess = async () => {
    try {
      const rdWebUrls = results
        .filter((r) => r.type === "RdWeb")
        .map((r) => ({
          url: r.cleanedUrl,
          username: r.username || "",
          password: r.password || "",
        }));

      if (rdWebUrls.length === 0) {
        alert("No RdWeb URLs to process.");
        return;
      }

      setProcessing(true);
      setProgress(0); // Reset progress
      setShowPopup(true); // Show initial processing popup

      // Simulate progress increment
      const simulateProgress = setInterval(() => {
        setProgress((prev) => {
          const nextValue = prev + 1;
          return nextValue >= 90 ? 90 : nextValue; // Cap progress at 90% until response
        });
      }, 500); // Increment progress every 500ms

      const response = await fetch(
        // "http://172.81.132.157:7350/plesk-process/",
        "https://courageous-bobbee-ott-37b0041f.koyeb.app/rdweb-process",
        // "https://constitutional-imelda-ott-0f75c217.koyeb.app/plesk-process/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rdWebUrls }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        throw new Error(errorData.detail || "Failed to process Plesk files.");
      }

      // Clear progress simulation
      clearInterval(simulateProgress);

      // Set progress to 100% on successful response
      setProgress(100);

      const data = await response.json();
      console.log("Backend response:", data);

      setResults(data.results); // Update results with the backend response
      setProcessing(false);

      // Transition to "Added Successfully" popup
      setTimeout(() => {
        setShowRdWebPopup(false); // Close initial popup
        setTimeout(() => {
          setShowRdWebSuccessPopup(true); // Show "Added Successfully" popup
          setTimeout(() => {
            setShowRdWebSuccessPopup(false); // Automatically close "Added Successfully" popup after 5 seconds
          }, 5000);
        }, 500);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing RDWEB files.");
      setProcessing(false);
    }
  };

  const handleDirectAdminProcess = async () => {
    try {
      const directAdminUrls = results
        .filter((r) => r.type === "DirectAdmin")
        .map((r) => ({
          url: r.cleanedUrl,
          username: r.username || "",
          password: r.password || "",
        }));

      if (directAdminUrls.length === 0) {
        alert("No DirectAdmin URLs to process.");
        return;
      }

      setProcessing(true);
      setProgress(0); // Reset progress
      setShowDirectAdminPopup(true); // Show initial processing popup

      // Simulate progress increment
      const simulateProgress = setInterval(() => {
        setProgress((prev) => {
          const nextValue = prev + 1;
          return nextValue >= 90 ? 90 : nextValue; // Cap progress at 90% until response
        });
      }, 500); // Increment progress every 500ms

      const response = await fetch(
        // "http://172.81.132.157:7350/plesk-process/",
        "https://alternative-gilligan-ott-04797199.koyeb.app/directAdmin-process/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ directAdminUrls }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        throw new Error(errorData.detail || "Failed to process Plesk files.");
      }

      // Clear progress simulation
      clearInterval(simulateProgress);

      // Set progress to 100% on successful response
      setProgress(100);

      const data = await response.json();
      console.log("Backend response:", data);

      setResults(data.results); // Update results with the backend response
      setProcessing(false);

      // Transition to "Added Successfully" popup
      setTimeout(() => {
        setShowPopup(false); // Close initial popup
        setTimeout(() => {
          setshowDirectAdminSuccessPopup(true); // Show "Added Successfully" popup
          setTimeout(() => {
            setshowDirectAdminSuccessPopup(false); // Automatically close "Added Successfully" popup after 5 seconds
          }, 5000);
        }, 500);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing DirectAdmin files.");
      setProcessing(false);
    }
  };




  const handleShellProcess = async () => {
    try {
      const shellUrls = results
        .filter((r) => r.type === "Shell") // Filter URLs of type "Shell"
        .map((r) => r.originalUrl); // Extract cleaned URLs

      if (shellUrls.length === 0) {
        alert("No Shell URLs to process.");
        return;
      }

      setProcessing(true);
      setProgress(0); // Reset progress
      setShowShellPopup(true); // Show initial processing popup

      // Simulate progress increment
      const simulateProgress = setInterval(() => {
        setProgress((prev) => {
          const nextValue = prev + 1;
          return nextValue >= 90 ? 90 : nextValue; // Cap progress at 90% until response
        });
      }, 500); // Increment progress every 500ms

      const response = await fetch(
        "https://amazing-tommie-ott-6b7f20ee.koyeb.app/shell-process/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ shellUrls }), // Send shellUrls in the body
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        throw new Error(errorData.detail || "Failed to process Shell URLs.");
      }

      clearInterval(simulateProgress);

      setProgress(100);

      const data = await response.json();
      console.log("Backend response:", data);

      setResults(data.results);
      setProcessing(false);

      setTimeout(() => {
        setShowShellPopup(false);
        setTimeout(() => {
          setShowShellSuccessPopup(true);
          setTimeout(() => {
            setShowShellSuccessPopup(false);
          }, 5000);
        }, 500);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing Shell URLs.");
      setProcessing(false);
    }
  };


  const removeResult = (indexToRemove: number) => {
    setResults((prevResults) => prevResults.filter((_, index) => index !== indexToRemove));
  };


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogout = () => {
    setIsAuthenticated(false);

    // Clear credentials from Local Storage
    localStorage.removeItem("username");
    localStorage.removeItem("password");
  };


  return (
    <div className="min-h-screen bg-gray-100 flex">
      <LeftNavbar />
      <div className="flex flex-col w-full">
        <Header handleLogout={handleLogout} />
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

          <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Searching...
              </>
            ) : (
              "Search"
            )}
          </button>

          <button
            onClick={exportToCSV}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={results?.length === 0}
          >
            Export to CSV
          </button>

          <button
            onClick={() => setShowPopup(true)}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add WordPress To DB
          </button>

          <button
            onClick={() => setShowShellPopup(true)}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={results?.length === 0}
          >
            Add Shell To DB
          </button>
          <button
            onClick={() => setShowJoomlaPoup(true)}
            className="ml-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-green-700"
            disabled={results?.length === 0}
          >
            Add Joomla To DB
          </button>
          <button
            onClick={() => setShowPleskPopup(true)}
            className="ml-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-green-700"
            disabled={results?.length === 0}
          >
            Add Plesk To DB
          </button>

          <button
            onClick={() => setShowDirectAdminPopup(true)}
            className="ml-4 px-4 py-2 bg-yellow-500 text-dark rounded hover:bg-green-700"
            disabled={results?.length === 0}
          >
            Add DirectAdmin To DB
          </button>

          <button
            onClick={() => setShowRdWebPopup(true)}
            className="ml-4 px-4 py-2 bg-yellow-500 text-dark rounded hover:bg-green-700"
            disabled={results?.length === 0}
          >
            Add RdWeb To DB
          </button>

          <div className="mb-4 pt-3 flex items-center space-x-4">
            <input
              type="text"
              placeholder="Enter extensions to remove (e.g., com, net)"
              value={extensionInput} // Bind this to state
              onChange={(e) => setExtensionInput(e.target.value)} // Update state on input
              className="px-4 py-2 border border-gray-300 rounded w-1/2"
            />
            <button
              onClick={() => removeByExtension(extensionInput)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove Extensions
            </button>
          </div>



          <div className="mt-6 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Search Statistics</h2>

            <div className="space-y-4">
              {/* Number of Searched URLs */}
              <StatItem
                icon={<FaSearch className="text-blue-500 text-2xl" />}
                label="Searched URLs"
                count={results?.length || 0}
              />

              {/* Number of Duplicated URLs */}
              <StatItem
                icon={<FaCopy className="text-red-500 text-2xl" />}
                label="Duplicated URLs"
                count={results?.length - filteredResults.length || 0}
              />

              {/* Number of WordPress URLs */}
              <StatItem
                icon={<FaWordpress className="text-indigo-500 text-2xl" />}
                label="WordPress URLs"
                count={results?.filter((r) => r.type === "WordPress").length || 0}
              />

              {/* Number of Shell URLs */}
              <StatItem
                icon={<FaTerminal className="text-gray-700 text-2xl" />}
                label="Shell URLs"
                count={results?.filter((r) => r.type === "Shell").length || 0}
              />

              {/* Number of Normal Website URLs */}
              <StatItem
                icon={<FaGlobe className="text-green-500 text-2xl" />}
                label="Normal Website URLs"
                count={results?.filter((r) => r.type === "Normal Website").length || 0}
              />
            </div>
          </div>


          {loading && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
              <div className="flex flex-col items-center">
                <FaSpinner className="text-white text-6xl animate-spin mb-4" />
                <p className="text-white text-lg font-semibold">Loading, please wait...</p>
              </div>
            </div>
          )}

          {showPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Process WordPress Files</h2>
                {processing ? (
                  <div>
                    <p>Processing... {progress}%</p>
                    <div className="w-full bg-gray-200 rounded h-4">
                      <div
                        className="bg-blue-600 h-4 rounded"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleProcessWordPress}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
                  >
                    Process WordPress Files
                  </button>
                )}

                <button
                  onClick={() => setShowPopup(false)}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  style={{ marginLeft: "5px" }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showRdWebPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Process RdWeb Files</h2>
                {processing ? (
                  <div>
                    <p>Processing... {progress}%</p>
                    <div className="w-full bg-gray-200 rounded h-4">
                      <div
                        className="bg-blue-600 h-4 rounded"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleRdWebProcess}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
                  >
                    Process RdWeb Files
                  </button>
                )}

                <button
                  onClick={() => setShowRdWebPopup(false)}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  style={{ marginLeft: "5px" }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showShellPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Process Shell Files</h2>
                {processing ? (
                  <div>
                    <p>Processing... {progress}%</p>
                    <div className="w-full bg-gray-200 rounded h-4">
                      <div
                        className="bg-blue-600 h-4 rounded"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleShellProcess}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
                  >
                    Process Shell Files
                  </button>
                )}

                <button
                  onClick={() => setShowShellPopup(false)}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  style={{ marginLeft: "5px" }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showJoomlaPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Process Joomla Files</h2>
                {processing ? (
                  <div>
                    <p>Processing... {progress}%</p>
                    <div className="w-full bg-gray-200 rounded h-4">
                      <div
                        className="bg-blue-600 h-4 rounded"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleJoomlaProcess}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
                  >
                    Process Joomla Files
                  </button>
                )}

                <button
                  onClick={() => setShowJoomlaPoup(false)}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  style={{ marginLeft: "5px" }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showPleskPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Process Plesk Files</h2>
                {processing ? (
                  <div>
                    <p>Processing... {progress}%</p>
                    <div className="w-full bg-gray-200 rounded h-4">
                      <div
                        className="bg-blue-600 h-4 rounded"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handlePleskProcess}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
                  >
                    Process Plesk Files
                  </button>
                )}

                <button
                  onClick={() => setShowPleskPopup(false)}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  style={{ marginLeft: "5px" }}
                >
                  Close
                </button>
              </div>
            </div>
          )}


          {showDirectAdminPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Process DirectAdmin Files</h2>
                {processing ? (
                  <div>
                    <p>Processing... {progress}%</p>
                    <div className="w-full bg-gray-200 rounded h-4">
                      <div
                        className="bg-blue-600 h-4 rounded"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleDirectAdminProcess}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
                  >
                    Process DirectAdmin Files
                  </button>
                )}

                <button
                  onClick={() => setShowDirectAdminPopup(false)}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  style={{ marginLeft: "5px" }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showSuccessPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Added Successfully</h2>
                <p>Your WordPress files have been added to the database successfully.</p>
              </div>
            </div>
          )}

          {showShellSuccessPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Added Successfully</h2>
                <p>Your Shell files have been added to the database successfully.</p>
              </div>
            </div>
          )}

          {showJoomlaSuccessPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Added Successfully</h2>
                <p>Your Joomla files have been added to the database successfully.</p>
              </div>
            </div>
          )}

          {showPleskSuccessPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Added Successfully</h2>
                <p>Your Plesk files have been added to the database successfully.</p>
              </div>
            </div>
          )}

          {showDirectAdminSuccessPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Added Successfully</h2>
                <p>Your DirectAdmin files have been added to the database successfully.</p>
              </div>
            </div>
          )}

          {showRdWebSuccessPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">Added Successfully</h2>
                <p>Your RdWeb files have been added to the database successfully.</p>
              </div>
            </div>
          )}


          {error && <p className="mt-4 text-red-600">{error}</p>}

          {results?.length > 0 && (
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
                    <th className="border border-gray-300 p-2">Username</th>
                    <th className="border border-gray-300 p-2">Password</th>
                    <th className="border border-gray-300 p-2">Access</th>
                    <th className="border border-gray-300 p-2">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {results?.map((r, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{r.originalUrl}</td>
                      <td className="border border-gray-300 p-2">{r.cleanedUrl}</td>
                      <td className="border border-gray-300 p-2">{r.pageAuthority}</td>
                      <td className="border border-gray-300 p-2">{r.domainAuthority}</td>
                      <td className="border border-gray-300 p-2">{r.spamScore}</td>
                      <td className="border border-gray-300 p-2">{r.type}</td>
                      <td className="border border-gray-300 p-2">{r.username || "N/A"}</td>
                      <td className="border border-gray-300 p-2">{r.password || "N/A"}</td>
                      <td className="border border-gray-300 p-2">
                        {r.type === "WordPress" ? (
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => handleAccess(r.cleanedUrl, r.username || '', r.password || '')}
                          >
                            Access
                          </button>
                        ) : (
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => window.open(r.originalUrl, "_blank")}
                          >
                            Access
                          </button>
                        )}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          onClick={() => removeResult(index)}
                        >
                          Remove
                        </button>
                      </td>
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


const StatItem: React.FC<StatItemProps> = ({ icon, label, count }) => (
  <div className="flex items-center bg-gray-100 px-4 py-3 rounded-lg shadow-sm">
    <div className="mr-4">{icon}</div>
    <p className="text-gray-800 font-medium flex-grow">{label}</p>
    <span className="text-lg font-bold text-gray-900">{count}</span>
  </div>
);

export default IndividualScore;

