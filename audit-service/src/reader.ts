import {MongoClient} from "mongodb";
import {ReaderEvent} from "./types";

let cachedClient: MongoClient | null = null;

async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  cachedClient = client;
  return client;
}

export const handler = async (event: ReaderEvent) => {
  try {
    const client = await connectToDatabase();
    const db = client.db("campus-control-db");

    const query: any = {};
    const filters = ["userId", "role", "entityId"];

    filters.forEach(field => {
      if (event[field as keyof ReaderEvent]) {
        query[field] = event[field as keyof ReaderEvent];
      }
    });
    if (event.startDate || event.endDate) {
      query.timestamp = {};
      if (event.startDate) query.timestamp.$gte = new Date(event.startDate);
      if (event.endDate) query.timestamp.$lte = new Date(event.endDate);
    }

    const lim = process.env.LIMIT ? parseInt(process.env.LIMIT) : 10;
    const skipNum = event.page ? (Number(event.page) - 1) * lim : 0;

    const totalCount = await db.collection("audit").countDocuments(query);

    const currentPageItems = await db.collection("audit")
      .find(query)
      .sort({timestamp: -1})
      .skip(skipNum)
      .limit(lim)
      .toArray();

    console.log(`Log was read successfully. Found ${currentPageItems.length} entries`);
    return {
      currentPageItems,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / lim),
        limit: lim,
        page: Number(event.page) || 1,
      }
    };
  } catch (error) {
    console.error("Reader Error:", error);
    throw new Error("Internal Server Error");
  }
}