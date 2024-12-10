import { MongoClient } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

// Connection URI and DB name (update with your credentials)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nafseerck:7gbNMNAc5s236F5K@overthetop.isxuv3s.mongodb.net";
const DB_NAME = "ninjadb";

const client = new MongoClient(MONGO_URI);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { filename, urlMappings, status } = req.body;

        // Log incoming request body for debugging
        console.log("Incoming request body:", req.body);

        // Validate request data
        if (!filename || typeof filename !== "string") {
            return res.status(400).json({ error: "Invalid or missing 'filename'" });
        }
        if (!urlMappings || !Array.isArray(urlMappings) || urlMappings.length === 0) {
            return res.status(400).json({ error: "Invalid or missing 'urlMappings'" });
        }
        if (!status || (status !== "processed" && status !== "unprocessed")) {
            return res.status(400).json({ error: "Invalid or missing 'status'" });
        }

        try {
            await client.connect();
            const db = client.db(DB_NAME);
            const collection = db.collection("urls");

            // Prepare data to insert
            const data = {
                filename,
                urlMappings,
                status,
                createdAt: new Date(),
            };

            // Insert data into the collection
            const result = await collection.insertOne(data);
            res.status(200).json({ message: "Data added successfully", result });
        } catch (error) {
            console.error("Error adding data:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

