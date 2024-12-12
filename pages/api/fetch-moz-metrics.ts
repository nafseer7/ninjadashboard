import { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.body;

  const mozToken = process.env.MOZ_API_TOKEN;
  if (!mozToken) {
    return res.status(500).json({ error: "Moz API token is missing in environment variables" });
  }

  // Validate that `url` is a string
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required and must be a string" });
  }

  const mozApiPayload = {
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
  };

  try {
    const response = await axios.post("https://api.moz.com/jsonrpc", mozApiPayload, {
      headers: {
        "x-moz-token": mozToken, // Replace with your actual Moz token
        "Content-Type": "application/json",
      },
    });

    const metrics = response.data?.result?.results_by_site[0]?.site_metrics || {};
    res.status(200).json({
      domainAuthority: metrics.domain_authority || "N/A",
      pageAuthority: metrics.page_authority || "N/A",
      spamScore: metrics.spam_score || "N/A",
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("Error fetching Moz metrics:", axiosError.response?.data || axiosError.message);

    res.status(500).json({
      error: "Failed to fetch Moz metrics",
      details: axiosError.response?.data || axiosError.message,
    });
  }
}
