import { pool } from "../../lib/db";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";

const baseDir = path.join(process.cwd(), "pocket_files");

export async function POST(req: Request) {
  const { instanceHash, passcode } = await req.json();

  if (!instanceHash || !passcode) {
    return new Response("Missing fields", { status: 400 });
  }

  // fetch stored hash
  const { rows } = await pool.query(
    `SELECT passcode_hash FROM pockets WHERE instance_hash = $1`,
    [instanceHash]
  );

  if (rows.length === 0) {
    return new Response("Pocket not found", { status: 404 });
  }

  const valid = await bcrypt.compare(passcode, rows[0].passcode_hash);

  if (!valid) {
    return new Response("Invalid passcode", { status: 401 });
  }

  // Cascade delete
  await pool.query(`DELETE FROM pockets WHERE instance_hash = $1`, [
    instanceHash,
  ]);

  // delete files from disk
  try {
    const pocketDir = path.join(baseDir, instanceHash);
    await fs.rm(pocketDir, { recursive: true, force: true });
  } catch (err) {
    console.error("Failed to delete pocket files:", err);
  }

  return Response.json({ success: true });
}
