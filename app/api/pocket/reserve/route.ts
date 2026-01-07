import { pool } from "../../lib/db";

function generatePocketId() {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A–Z
  const n = Math.floor(Math.random() * 10000);
  return `${letter}-${n.toString().padStart(4, "0")}`;
}

export async function POST() {
  for (let i = 0; i < 5; i++) {
    const pocketId = generatePocketId();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    try {
      await pool.query(
        `INSERT INTO pockets (pocket_id, expires_at) VALUES ($1, $2)`,
        [pocketId, expiresAt]
      );

      return Response.json({ pocketId });
    } catch (e: any) {
      if (e.code !== "23505") throw e;
    }
  }

  return Response.json({ error: "Could not reserve pocket" }, { status: 500 });
}
