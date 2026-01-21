import { redirect, notFound } from "next/navigation";
import { pool } from "@/app/api/lib/db";

export default async function QrRedirectPage({
  params,
}: {
  params: { qrId: string };
}) {
  const { qrId } = await params;

  const { rows } = await pool.query(
    `
    SELECT instance_hash
    FROM pocket_qr_codes
    WHERE qr_id = $1
      AND expires_at > NOW()
    `,
    [qrId],
  );

  if (rows.length === 0) notFound();

  redirect(`/pocket/${rows[0].instance_hash}`);
}
