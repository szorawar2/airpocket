// import "server-only";
// import { Pool, QueryResult, QueryResultRow } from "pg";

// //Env variable types
// declare global {
//     var pgPool: Pool | undefined;

//     namespace NodeJS {
//         interface ProcessEnv {
//             DB_HOST: string;
//             DB_NAME: string;
//             DB_USER: string;
//             DB_PASSWORD: string;
//             DB_PORT: string;
//             // DB_CA_CERTIFICATE?: string;
//         }

//         interface Global {
//             pgPool?: Pool;
//         }
//     }
// }

// //Env variabl;e interface
// interface Database {
//     query<T extends QueryResultRow = any> (
//         text: string,
//         params?: any[]
//     ): Promise<QueryResult<T>>;
//     getPool(): Pool;
//     end(): Promise<void>;
// }

// //Pool configuration
// const poolConfig = {
//     max: 20,
//     idleTimeoutmillis: 20000,
//     connectionTimeoutMillis: 4000,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,
//     // ssl: {
//     //     rejectUnauthorized: true,
//     //     ca: process.env.DB_CA_CERTIFICATE,
//     // },
// };

// //create or use existing pool
// const getPool = (): Pool => {
//     //Check if pool exists in global object
// }

import "server-only";
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
