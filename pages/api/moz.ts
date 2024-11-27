// pages/api/mozProxy.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const response = await fetch("https://api.moz.com/jsonrpc", {
        method: "POST",
        headers: {
          "x-moz-token":
            "bW96c2NhcGUtb0xTSllzbTlYMDpaN2NGeERNaDhodFllc0JLSEFsTzc0TWtHczRrTFhXWQ==",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();

      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching data from Moz API:", error);
      res.status(500).json({ error: "Failed to fetch data from Moz API" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
