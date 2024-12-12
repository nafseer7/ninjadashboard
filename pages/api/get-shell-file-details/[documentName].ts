import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import axios from 'axios';

// MongoDB connection URI
const MONGODB_URI = 'mongodb+srv://nafseerck:7gbNMNAc5s236F5K@overthetop.isxuv3s.mongodb.net';
const DB_NAME = 'ninjadb'; // Replace with your database name
const COLLECTION_NAME = 'urls'; // Replace with your collection name

// Creating a MongoDB client instance once
let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

// Function to get MongoDB connection and reuse it
const getMongoClient = async () => {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  cachedClient = client;
  cachedDb = db;

  return { client, db };
};


// API route handler to fetch file details and Moz metrics
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { documentName } = req.query; // Get the document name from the request parameter

  if (!documentName) {
    return res.status(400).json({ error: 'Document name is required' });
  }

  try {
    // Ensure the documentName is a valid ObjectId
    const objectId = new ObjectId(documentName as string);

    // Get the MongoDB client and database connection
    const { db } = await getMongoClient();

    // Fetch the document by documentName (ObjectId)
    const document = await db.collection(COLLECTION_NAME).findOne({ _id: objectId });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Fetch cleaned URLs from urlMappings
    const urlMappings = document.urlMappings || [];
    const cleanedUrls = urlMappings.map((item: any) => item.original);

    const enrichedUrls = await Promise.all(
      cleanedUrls.map(async (url: string) => {
        
        return {
          website: url,
          
        };
      })
    );

    // Send the enriched data as response
    res.status(200).json({ urlMappings: enrichedUrls });
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ error: 'Failed to fetch file details and Moz metrics' });
  }
}
