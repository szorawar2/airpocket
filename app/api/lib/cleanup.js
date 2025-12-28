import { pool } from "./db.ts";

async function cleanup() {
  try {
    await pool.query(`
      DELETE FROM pockets
      WHERE (status = 'reserved' AND expires_at < NOW())
         OR (status = 'active' AND expires_at < NOW())
    `);
    console.log("Cleanup done!");
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    await pool.end();
  }
}

cleanup();
