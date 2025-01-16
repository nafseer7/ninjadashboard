import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const MONGO_URI = "mongodb+srv://nafseerck:7gbNMNAc5s236F5K@overthetop.isxuv3s.mongodb.net";
const DATABASE_NAME = "ninjadb";
const COLLECTION_NAME = "wordpressUrls";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { filename, wordpressUrls, createdAt } = req.body;

  if (!filename || !wordpressUrls || !createdAt) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Insert the data into the MongoDB collection
    const result = await collection.insertOne({
      filename,
      wordpressUrls,
      createdAt,
    });

    await client.close();

    res.status(200).json({ message: "Data successfully saved to the database.", result });
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    res.status(500).json({ message: "Failed to save data to the database." });
  }
}
