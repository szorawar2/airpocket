import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { instanceHash, passcode } = await req.json();

    if (!instanceHash || typeof passcode !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await pool.query(
      `
      SELECT passcode_hash, expires_at
      FROM pockets
      WHERE instance_hash = $1
        AND status = 'active'
      `,
      [instanceHash],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Pocket not found" }, { status: 404 });
    }

    const pocket = result.rows[0];

    if (new Date(pocket.expires_at) < new Date()) {
      return NextResponse.json({ error: "Pocket expired" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(passcode, pocket.passcode_hash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
