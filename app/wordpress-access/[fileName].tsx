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
    const [modalData, setModalData] = useState<any | null>(null); // Data for modal
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

    useEffect(() => {
        if (fileName) {
            fetchFileData(fileName as string); // Use the filename directly
        }
    }, [fileName]);

    const fetchFileData = async (cleanedFileName: string) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://127.0.0.1:8080/view-content/?file_name=${cleanedFileName}.txt` // Add `.txt` during API call
            );
            const enrichedData = await enrichWithMetrics(response.data); // Enrich data with metrics
            setFileData(enrichedData);
        } catch (err) {
            setError("Failed to fetch file data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const enrichWithMetrics = async (data: any[]) => {
        try {
            const siteQueries = data.map((item) => ({
                query: item.website,
                scope: "url",
            }));

            const metricsResponse = await axios.post("https://api.moz.com/jsonrpc", {
                jsonrpc: "2.0",
                id: "metrics-fetch",
                method: "data.site.metrics.fetch.multiple",
                params: {
                    data: {
                        site_queries: siteQueries,
                    },
                },
            });

            const metricsData = metricsResponse.data.result.results_by_site;

            return data.map((item, index) => {
                const metrics = metricsData[index]?.site_metrics || {};
                return {
                    ...item,
                    domainAuthority: metrics.domain_authority || "N/A",
                    pageAuthority: metrics.page_authority || "N/A",
                    spamScore: metrics.spam_score || "N/A",
                };
            });
        } catch (error) {
            console.error("Failed to fetch site metrics:", error);
            return data;
        }
    };

    const handleAccessButtonClick = (website: string) => {
        // Placeholder for Access button action
        setModalData({ website }); // Set modal data
        setIsModalOpen(true); // Open the modal
    };

    const closeModal = () => {
        setModalData(null);
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4">WordPress Access</h1>
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
                                    <th className="p-3 text-gray-700 font-semibold">Website</th>
                                    <th className="p-3 text-gray-700 font-semibold">Username</th>
                                    <th className="p-3 text-gray-700 font-semibold">Password</th>
                                    <th className="p-3 text-gray-700 font-semibold">
                                        Domain Authority
                                    </th>
                                    <th className="p-3 text-gray-700 font-semibold">
                                        Page Authority
                                    </th>
                                    <th className="p-3 text-gray-700 font-semibold">Spam Score</th>
                                    <th className="p-3 text-gray-700 font-semibold">Access</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fileData.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-3">{item.website}</td>
                                        <td className="p-3">{item.username}</td>
                                        <td className="p-3">{item.password}</td>
                                        <td className="p-3">{item.domainAuthority}</td>
                                        <td className="p-3">{item.pageAuthority}</td>
                                        <td className="p-3">{item.spamScore}</td>
                                        <td className="p-3">
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() => handleAccessButtonClick(item.website)}
                                            >
                                                View Details
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
                    <button className="btn btn-secondary" onClick={() => history.back()}>
                        Back
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && modalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">
                            Details for {modalData.website}
                        </h2>
                        {/* Placeholder for modal content */}
                        <p>Additional details can be fetched or displayed here.</p>
                        <div className="flex justify-end gap-4 mt-4">
                            <button className="btn btn-secondary" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileDetails;
