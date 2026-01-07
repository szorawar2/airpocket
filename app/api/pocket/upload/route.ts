import { pool } from "../../lib/db";
import fs from "fs/promises";
import path from "path";

const baseDir = path.join(process.cwd(), "pocket_files");

export async function POST(req: Request) {
  const formData = await req.formData();

  const text = formData.get("text");
  const instance_hash = formData.get("instanceHash") as string;

  const pocketDir = path.join(baseDir, instance_hash);

  const files = formData.getAll("files");
  const firstFile = files[0] instanceof File ? files[0] : null;
  const firstFileName = firstFile?.name;
  var result = null;

  if (typeof text === "string" && text.trim().length > 0) {
    try {
      result = await pool.query(
        `INSERT INTO pocket_items (instance_hash, text) VALUES ($1, $2) RETURNING *`,
        [instance_hash, text]
      );
    } catch (error: any) {
      return Response.json({ error: "Database Error, Please upload again" });
    }
  } else {
    try {
      result = await pool.query(
        `INSERT INTO pocket_items (instance_hash, text, file_name) VALUES ($1, $2, $3) RETURNING *`,
        [instance_hash, "-", firstFileName]
      );
    } catch (error: any) {
      return Response.json({ error: "Database Error, Please upload again" });
    }

    const file_name = result.rows.length > 0 ? result.rows[0].file_name : null;

    if (file_name != null)
    // continue Upload file code----
  }

  //get batch id

  //upload other files if available

  return Response.json({ ok: true });
}
