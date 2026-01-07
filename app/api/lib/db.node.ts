import dotenv from "dotenv";

dotenv.config();

import { Pool } from "pg";

const globalForPg = global as unknown as {
  pgPool?: Pool;
};

export const pool =
  globalForPg.pgPool ??
  new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: false, // local dev
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
