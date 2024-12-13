import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Fetch the external URL
    const response = await fetch(url);

    // If the status is not 200, return a 403 Forbidden response
    if (response.status !== 200) {
      console.error(`Error fetching URL: ${url}, Status: ${response.status}`);
      return res.status(403).json({ error: `URL is not accessible. HTTP Status: ${response.status}` });
    }

    // Parse the response as text (HTML)
    const data = await response.text();
    res.status(200).send(data); // Send the response back
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to fetch the URL" });
  }
}
