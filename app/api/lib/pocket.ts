import { pool } from "./db";

export async function getPocket(instanceHash: string) {
  const res = await pool.query(
    `SELECT * FROM pockets WHERE instance_hash = $1`,
    [instanceHash]
  );
  return res.rows[0] ?? null;
}

export async function getMessages(instanceHash: string) {
  const res = await pool.query(
    `
    SELECT text, created_at
    FROM pocket_items
    WHERE instance_hash = $1
    ORDER BY created_at ASC
    `,
    [instanceHash]
  );
  return res.rows;
}
