import { pool } from "@/app/api/lib/db";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";

const baseDir = path.join(process.cwd(), "pocket_files");

export async function POST(req: Request) {
  const { instanceHash, passcode } = await req.json();

  if (!instanceHash || !passcode || passcode.length !== 6) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  // fetch stored hash
  const { rows } = await pool.query(
    `SELECT passcode_hash FROM pockets WHERE instance_hash = $1`,
    [instanceHash],
  );

  if (rows.length === 0) {
    return Response.json(
      { error: "Pocket not found or expired" },
      { status: 400 },
    );
  }

  const valid = await bcrypt.compare(passcode, rows[0].passcode_hash);

  if (!valid) {
    return Response.json({ error: "Invalid passcode" }, { status: 401 });
  }

  // Cascade delete
  try {
    await pool.query(`DELETE FROM pockets WHERE instance_hash = $1`, [
      instanceHash,
    ]);
  } catch (error) {
    return Response.json(
      { error: "Something went wrong. Please try again" },
      { status: 400 },
    );
  }

  // delete files from disk
  try {
    const pocketDir = path.join(baseDir, instanceHash);
    await fs.rm(pocketDir, { recursive: true, force: true });
  } catch (err) {
    console.error("Failed to delete pocket files:", err);
  }

  return Response.json({ success: true });
}
