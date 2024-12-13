import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongo"; // Import the database connection function
import URL from "@/models/URL";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectToDatabase();

      // Fetch documents from the 'urls' collection, including urlMappings
      const files = await URL.find({}, { _id: 1, filename: 1, status: 1, urlMappings: 1 }).lean();

      // Return the files data as JSON
      res.status(200).json(files);
    } catch (error) {
      console.error("Error fetching files data:", error);
      res.status(500).json({ error: "Error fetching data from MongoDB" });
    }
  } else {
    // If the request method is not GET, respond with Method Not Allowed
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
