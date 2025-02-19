"use client";

import { useEffect, useState } from "react";
import LeftNavbar from "./LeftNavbar";
import Header from "./header";

interface WordPressUrl {
    url: string;
    username: string;
    password: string;
    pageAuthority?: number;
    domainAuthority?: number;
    spamScore?: number;
}

interface FileDetails {
    filename: string;
    pleskUrls: WordPressUrl[];
}

const PleskDetailsPage = ({ fileId }: { fileId: string }) => {
    const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortField, setSortField] = useState<keyof WordPressUrl | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        const fetchFileDetails = async () => {
            try {
                const response = await fetch(`/api/pleskfiles/${fileId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch file details");
                }

                const data = await response.json();
                const pleskUrls = data.file.pleskUrls;

                // Fetch Moz API data for each URL
                const enrichedUrls = await Promise.all(
                    pleskUrls.map(async (urlDetails: WordPressUrl) => {
                        const query = urlDetails.url;
                        const mozResponse = await fetch("/api/moz", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                jsonrpc: "2.0",
                                id: "614522f4-29c8-4a75-94c6-8f03bf107903",
                                method: "data.site.metrics.fetch.multiple",
                                params: {
                                    data: {
                                        site_queries: [{ query, scope: "url" }],
                                    },
                                },
                            }),
                        });

                        if (!mozResponse.ok) {
                            console.error(`Failed to fetch Moz data for ${query}`);
                            return urlDetails;
                        }

                        const mozData = await mozResponse.json();

                        if (
                            mozData.result &&
                            mozData.result.results_by_site &&
                            mozData.result.results_by_site[0]
                        ) {
                            const siteMetrics = mozData.result.results_by_site[0].site_metrics;
                            return {
                                ...urlDetails,
                                pageAuthority: siteMetrics.page_authority || 0,
                                domainAuthority: siteMetrics.domain_authority || 0,
                                spamScore: siteMetrics.spam_score || 0,
                            };
                        }

                        return urlDetails; // Return original details if no Moz data
                    })
                );
                setFileDetails({ ...data.file, pleskUrls: enrichedUrls });
            } catch (err) {
                console.error("Error fetching file details:", err);
                setError("Failed to load file details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchFileDetails();
    }, [fileId]);

    const handleAccess = async (siteUrl: string, username: string, password: string) => {
        try {
            const response = await fetch("/api/login-plesk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ siteUrl, username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                window.open(data.loginUrl, "_blank");
            } else {
                console.error("Failed to generate login URL:", data.message);
                alert("Failed to generate login URL. Check the credentials or site URL.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An unexpected error occurred.");
        }
    };

    const handleExportToCSV = () => {
        if (!fileDetails) return;

        const csvHeader = ["URL", "Username", "Password", "Page Authority", "Domain Authority", "Spam Score"];
        const csvRows = fileDetails.pleskUrls.map((urlDetails) =>
            [
                urlDetails.url,
                urlDetails.username || "N/A",
                urlDetails.password || "N/A",
                urlDetails.pageAuthority ?? "N/A",
                urlDetails.domainAuthority ?? "N/A",
                urlDetails.spamScore ?? "N/A",
            ].join(",")
        );

        const csvContent = [csvHeader.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileDetails.filename}.csv`;
        link.click();
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query.toLowerCase());
    };

    const handleSort = (field: keyof WordPressUrl) => {
        if (!fileDetails) return;

        const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";

        const sortedUrls = [...fileDetails.pleskUrls].sort((a, b) => {
            const aValue = a[field] || 0;
            const bValue = b[field] || 0;

            if (typeof aValue === "string" && typeof bValue === "string") {
                return order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return order === "asc" ? +aValue - +bValue : +bValue - +aValue;
        });

        setFileDetails({ ...fileDetails, pleskUrls: sortedUrls });
        setSortField(field);
        setSortOrder(order);
    };

    const filteredUrls = fileDetails?.pleskUrls.filter((urlDetails) =>
        urlDetails.url.toLowerCase().includes(searchQuery) ||
        (urlDetails.username?.toLowerCase().includes(searchQuery) || false) ||
        (urlDetails.password?.toLowerCase().includes(searchQuery) || false)
    );

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500" > {error} </p>;
    }

    if (!fileDetails) {
        return <p>No file details found.</p>;
    }

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const handleLogout = () => {
        setIsAuthenticated(false);

        // Clear credentials from Local Storage
        localStorage.removeItem("username");
        localStorage.removeItem("password");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex" >
            <LeftNavbar />
            < div className="flex flex-col w-full" >
                <Header handleLogout={handleLogout}/>
                < div className="container mx-auto p-4" >
                    <h1 className="text-2xl font-bold mb-4" > File Details </h1>
                    < h2 className="text-xl font-semibold mb-4" > File Name: {fileDetails.filename} </h2>

                    < div className="mb-4 flex items-center space-x-4" >
                        <input
                            type="text"
                            placeholder="Search..."
                            className="p-2 border border-gray-300 rounded"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        < button
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={handleExportToCSV}
                        >
                            Export to CSV
                        </button>
                    </div>

                    < table className="table-auto w-full border-collapse border border-gray-300" >
                        <thead>
                            <tr>
                                <th
                                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort("url")}
                                >
                                    URL
                                </th>
                                < th
                                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort("username")}
                                >
                                    Username
                                </th>
                                < th
                                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort("password")}
                                >
                                    Password
                                </th>
                                < th
                                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort("pageAuthority")}
                                >
                                    Page Authority
                                </th>
                                < th
                                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort("domainAuthority")}
                                >
                                    Domain Authority
                                </th>
                                < th
                                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort("spamScore")}
                                >
                                    Spam Score
                                </th>
                                < th className="border border-gray-300 px-4 py-2" > Actions </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredUrls?.map((urlDetails, index) => (
                                    <tr key={index} >
                                        <td className="border border-gray-300 px-4 py-2" > {urlDetails.url} </td>
                                        < td className="border border-gray-300 px-4 py-2" > {urlDetails.username} </td>
                                        < td className="border border-gray-300 px-4 py-2" > {urlDetails.password} </td>
                                        < td className="border border-gray-300 px-4 py-2" > {urlDetails.pageAuthority ?? "N/A"} </td>
                                        < td className="border border-gray-300 px-4 py-2" > {urlDetails.domainAuthority ?? "N/A"} </td>
                                        < td className="border border-gray-300 px-4 py-2" > {urlDetails.spamScore ?? "N/A"} </td>
                                        < td className="border border-gray-300 px-4 py-2 text-center" >
                                            <button
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                onClick={() =>
                                                    handleAccess(urlDetails.url, urlDetails.username, urlDetails.password)
                                                }
                                            >
                                                Access
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PleskDetailsPage;
