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

// Helper function to fetch Moz metrics for a URL using the Moz API
const fetchMozMetrics = async (url: string) => {
  const mozApiPayload = {
    jsonrpc: '2.0',
    id: '614522f4-29c8-4a75-94c6-8f03bf107903',
    method: 'data.site.metrics.fetch.multiple',
    params: {
      data: {
        site_queries: [
          {
            query: url,
            scope: 'url',
          },
        ],
      },
    },
  };

  try {
    const response = await axios.post('https://api.moz.com/jsonrpc', mozApiPayload, {
      headers: {
        'x-moz-token': 'bW96c2NhcGUtb0xTSllzbTlYMDpaN2NGeERNaDhodFllc0JLSEFsTzc0TWtHczRrTFhXWQ==', // Replace with your actual Moz token
        'Content-Type': 'application/json',
      },
    });

    const metrics = response.data.result.results_by_site[0]?.site_metrics || {};
    return metrics;
  } catch (err) {
    console.error('Error fetching Moz metrics:', err);
    return {
      domainAuthority: 'N/A',
      pageAuthority: 'N/A',
      spamScore: 'N/A',
    };
  }
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
    const cleanedUrls = urlMappings.map((item: any) => item.cleaned);

    // Fetch Moz metrics for each cleaned URL dynamically
    const enrichedUrls = await Promise.all(
      cleanedUrls.map(async (url: string) => {
        const metrics = await fetchMozMetrics(url);
        return {
          website: url,
          domainAuthority: metrics.domainAuthority,
          pageAuthority: metrics.pageAuthority,
          spamScore: metrics.spamScore,
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
