import { MongoClient } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

// Connection URI and DB name (update with your credentials)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nafseerck:7gbNMNAc5s236F5K@overthetop.isxuv3s.mongodb.net";
const DB_NAME = "ninjadb";

const client = new MongoClient(MONGO_URI);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { filename, all_urls, filtered_urls, status } = req.body;

        // Validate request data
        if (!filename || !all_urls || !filtered_urls || !status) {
            return res.status(400).json({ error: "Invalid request data" });
        }

        // Validate status value
        if (status !== "processed" && status !== "unprocessed") {
            return res.status(400).json({ error: "Invalid status value. Must be 'processed' or 'unprocessed'." });
        }

        try {
            await client.connect();
            const db = client.db(DB_NAME);
            const collection = db.collection("urls");

            // Prepare data to insert
            const data = {
                filename,
                all_urls,
                filtered_urls,
                status, // Add status flag
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
