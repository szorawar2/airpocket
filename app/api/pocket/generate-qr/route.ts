import "server-only";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/app/api/lib/db";

export async function POST(req: Request) {
  const { instanceHash } = await req.json();

  if (!instanceHash) {
    return NextResponse.json(
      { error: "Missing instanceHash" },
      { status: 400 },
    );
  }

  // check for existing, non-expired QR
  const existing = await pool.query(
    `
    SELECT qr_id, expires_at
    FROM pocket_qr_codes
    WHERE instance_hash = $1
      AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [instanceHash],
  );

  if (existing.rows.length > 0) {
    return NextResponse.json({
      qrId: existing.rows[0].qr_id,
      expiresAt: existing.rows[0].expires_at,
      url: `${process.env.SITE_URL}/q/${existing.rows[0].qr_id}`,
      reused: true,
    });
  }

  function generateQrId(instanceHash: string) {
    const raw = `${instanceHash}:${Date.now()}:${crypto.randomUUID()}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  // generate new QR
  const qrId = generateQrId(instanceHash);

  const inserted = await pool.query(
    `
    INSERT INTO pocket_qr_codes (instance_hash, qr_id)
    VALUES ($1, $2)
    RETURNING qr_id, expires_at
    `,
    [instanceHash, qrId],
  );

  return NextResponse.json({
    qrId: inserted.rows[0].qr_id,
    url: `${process.env.SITE_URL}/q/${qrId}`,
    expiresAt: inserted.rows[0].expires_at,
    reused: false,
  });
}
