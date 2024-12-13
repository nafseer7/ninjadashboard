import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";

const MONGO_URI = process.env.MONGO_URI_ONLY!;
const DB_NAME = "ninjadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { fileId } = req.body;
      const { urlMappings, status } = req.body;

      if (!fileId || !ObjectId.isValid(fileId)) {
        return res.status(400).json({ error: "Invalid fileId" });
      }

      const client = new MongoClient(MONGO_URI);
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection("urls");

      // Update the file in the database
      const result = await collection.updateOne(
        { _id: new ObjectId(fileId) },
        {
          $set: {
            urlMappings,
            status,
          },
        }
      );

      client.close();

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "File not found or no changes made" });
      }

      res.status(200).json({ message: "File updated successfully" });
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
