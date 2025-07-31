import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || "reachonexpress",
  host: process.env.DB_HOST || "192.168.1.112",
  database: process.env.DB_NAME || "reachonexpress_db",
  password: process.env.DB_PASSWORD || "reachoneadmin@2025",
  port: Number(process.env.DB_PORT) || 5436,
});

// const pool = new Pool({
//   user: process.env.DB_USER || "postgres",
//   host: process.env.DB_HOST || "localhost",
//   database: process.env.DB_NAME || "reach_on_express",
//   password: process.env.DB_PASSWORD || "1234",
//   port: Number(process.env.DB_PORT) || 5432,
// });

export const executeQuery = async (
  query: string,
  params: any[] = []
): Promise<any[]> => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    return result.rows;
  } catch (error: any) {
    throw new Error(`Database query failed : ${error.message}`);
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  return client;
};

export const closePool = async () => {
  try {
    await pool.end();
    console.log("Database pool - status closed");
  } catch (error: any) {
    console.error("Error in closing pool - status failed ", error.message);
  }
};
