import { pool } from "../../lib/db";
import { hashPasscode, generateInstanceHash } from "../../lib/hash";
import fs from "fs/promises";
import path from "path";

const baseDir = path.join(process.cwd(), "pocket_files");

export async function POST(req: Request) {
  const { pocketId, passcode, expiresInMinutes } = await req.json();

  const instanceHash = generateInstanceHash();
  const passcodeHash = await hashPasscode(passcode);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);

  const pocketDir = path.join(baseDir, instanceHash);

  try {
    await fs.mkdir(pocketDir, { recursive: true });
  } catch (error: any) {
    return Response.json(`Error creating directory: ${error.message}`);
  }

  const res = await pool.query(
    `
    UPDATE pockets
    SET
      status = 'active',
      instance_hash = $1,
      passcode_hash = $2,
      expires_at = $3
    WHERE pocket_id = $4
      AND status = 'reserved'
    RETURNING pocket_id
    `,
    [instanceHash, passcodeHash, expiresAt, pocketId]
  );

  if (res.rowCount === 0) {
    return Response.json({ error: "Invalid pocket" }, { status: 400 });
  }

  return Response.json({ instanceHash });
}
