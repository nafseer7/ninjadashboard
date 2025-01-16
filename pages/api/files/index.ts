import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI_ONLY || "mongodb+srv://nafseerck:7gbNMNAc5s236F5K@overthetop.isxuv3s.mongodb.net";
const DATABASE_NAME = "ninjadb"; // Replace with your database name
const COLLECTION_NAME = "wordpressUrls"; // Replace with your collection name

let cachedClient: MongoClient | null = null;

const connectToDatabase = async () => {
  if (!cachedClient) {
    cachedClient = await MongoClient.connect(MONGO_URI);
  }
  return cachedClient.db(DATABASE_NAME);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Fetch all files from the collection
    const files = await collection
      .find({}, { projection: { filename: 1 } }) // Fetch only `filename` and `_id`
      .toArray();

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
}
