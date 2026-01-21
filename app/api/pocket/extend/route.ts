import "server-only";

import { pool } from "@/app/api/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { instanceHash, expiresIn } = await req.json();

  if (!instanceHash || !expiresIn) {
    return NextResponse.json(
      { error: "Missing pocket information" },
      { status: 400 },
    );
  }

  if (typeof expiresIn !== "number" || expiresIn <= 0) {
    return NextResponse.json({ error: "Invalid time" }, { status: 400 });
  }

  const result = await pool.query(
    `
    UPDATE pockets
    SET expires_at =
      LEAST(
        expires_at + ($1 * INTERVAL '1 minute'),
        created_at + INTERVAL '3 days'
      )
    WHERE instance_hash = $2
      AND expires_at > NOW()
    RETURNING expires_at
    `,
    [expiresIn, instanceHash],
  );

  if (result.rowCount === 0) {
    return NextResponse.json(
      { error: "Pocket expired or not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    expiresAt: result.rows[0].expires_at,
  });
}
