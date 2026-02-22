import { pool } from "@/app/api/lib/db";
import { validatePocket } from "../../lib/pocket";

export async function POST(req: Request) {
  const { instanceHash, ciphertext, iv } = await req.json();

  try {
    validatePocket(instanceHash);
  } catch (error) {
    return Response.json({ message: "Pocket does not exist", error: error });
  }

  if (typeof instanceHash !== "string") {
    return Response.json({ error: "Invalid instance" }, { status: 400 });
  }

  let cipherTextValue: Buffer | null = null;

  if (typeof ciphertext === "string" && ciphertext.length > 0) {
    cipherTextValue = Buffer.from(ciphertext, "base64");
  }

  let ivValue: Buffer | null = null;

  if (typeof iv === "string" && iv.length > 0) {
    ivValue = Buffer.from(iv, "base64");
  }

  let result = null;

  try {
    result = await pool.query(
      `INSERT INTO pocket_items (instance_hash, ciphertext, iv) VALUES ($1, $2, $3) RETURNING batch_id`,
      [instanceHash, cipherTextValue, ivValue],
    );
  } catch (error: any) {
    return Response.json({ error: "Database Error, Please upload again" });
  }

  return Response.json(
    { success: true, batchId: result.rows[0].batch_id },
    { status: 200 },
  );
}
