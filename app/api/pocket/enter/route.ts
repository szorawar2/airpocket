import "server-only";

import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { pocketId, passcodeHash } = await req.json();

  if (!pocketId || !passcodeHash) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const result = await pool.query(
    `
    SELECT instance_hash, passcode_hash, expires_at, status
    FROM pockets
    WHERE pocket_id = $1
    `,
    [pocketId],
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Invalid pocket" }, { status: 404 });
  }

  const pocket = result.rows[0];

  // status check
  if (pocket.status !== "active") {
    return NextResponse.json({ error: "Pocket not active" }, { status: 403 });
  }

  // expiry check
  if (new Date(pocket.expires_at) < new Date()) {
    return NextResponse.json({ error: "Pocket expired" }, { status: 403 });
  }

  // passcode check
  const ok = await bcrypt.compare(passcodeHash, pocket.passcode_hash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    instanceHash: pocket.instance_hash,
  });
}
