import { pool } from "@/app/api/lib/db";
import { generateInstanceHash, generateSalt } from "../../lib/hash";
import { hashPasscodeAgain } from "../../lib/hashServer";
import fs from "fs/promises";
import path from "path";
import { stat } from "fs";

const baseDir = path.join(process.cwd(), "pocket_files");

export async function POST(req: Request) {
  const { pocketId, passcodeHash, expiresInMinutes } = await req.json();

  const instanceHash = await generateInstanceHash();
  const hashedAgain = await hashPasscodeAgain(passcodeHash);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);

  const pocketDir = path.join(baseDir, instanceHash);

  const pocket_salt = generateSalt();

  const res = await pool.query(
    `
    UPDATE pockets
    SET
      status = 'active',
      instance_hash = $1,
      passcode_hash = $2,
      expires_at = $3,
      salt = $4
    WHERE pocket_id = $5
      AND status = 'reserved'
    RETURNING pocket_id
    `,
    [instanceHash, hashedAgain, expiresAt, pocket_salt, pocketId],
  );

  if (res.rowCount === 0) {
    return Response.json(
      { error: "Invalid session, Please reload page" },
      { status: 400 },
    );
  }

  try {
    await fs.mkdir(pocketDir, { recursive: true });
  } catch (error: any) {
    return Response.json(
      { error: "Something went wrong. Please refresh and try again" },
      { status: 400 },
    );
  }

  return Response.json({ instanceHash, pocket_salt }, { status: 200 });
}
