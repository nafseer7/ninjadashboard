import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";


const MONGO_URI = process.env.MONGO_URI_ONLY || "mongodb+srv://nafseerck:7gbNMNAc5s236F5K@overthetop.isxuv3s.mongodb.net";
const DATABASE_NAME = "ninjadb"; // Replace with your database name
const COLLECTION_NAME = "joomlaUrls"; // Replace with your collection name

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

  const { fileId } = req.query;

  if (!fileId || typeof fileId !== "string") {
    return res.status(400).json({ error: "Invalid file ID" });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Fetch the specific file by `_id`
    const file = await collection.findOne({ _id: new ObjectId(fileId) });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(200).json({ file });
  } catch (error) {
    console.error("Error fetching file details:", error);
    res.status(500).json({ error: "Failed to fetch file details" });
  }
}
