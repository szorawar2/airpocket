import { pool } from "../app/api/lib/db.node";
import fs from "fs/promises";
import path from "path";

const baseDir = path.join(process.cwd(), "pocket_files");

async function cleanup() {
  // Delete expired pocket directories and related files
  const expired_pockets = await pool.query(`
    SELECT instance_hash FROM pockets
    WHERE status = 'active' AND expires_at < NOW()
    `);

  for (const pocket of expired_pockets.rows) {
    console.log(pocket.instance_hash);
    const pocketDir = path.join(baseDir, pocket.instance_hash);
    try {
      await fs.rm(pocketDir, { recursive: true, force: true });
    } catch (error: any) {
      console.error(error.message);
    }
  }

  // Remove expired pockets from db
  await pool.query(`
    DELETE FROM pockets
    WHERE (status = 'reserved' AND expires_at < NOW())
       OR (status = 'active' AND expires_at < NOW())
  `);

  await pool.query(`
    DELETE FROM pocket_qr_codes
    WHERE expires_at < NOW()
  `);
}

setInterval(async () => {
  try {
    await cleanup();
    console.log(`cleanup ran at ${new Date().toLocaleString()}`);
  } catch (e) {
    console.error("cleanup error", e);
  }
}, 60_000); // every minute
