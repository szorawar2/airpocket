import { pool } from "../../lib/db";
import fs from "fs/promises";
import path from "path";

const baseDir = path.join(process.cwd(), "pocket_files");

export async function POST(req: Request) {
  const formData = await req.formData();

  var text = formData.get("text");

  const instance_hash = formData.get("instanceHash") as string;
  if (typeof instance_hash !== "string") {
    return Response.json({ error: "Invalid instance" }, { status: 400 });
  }

  const pocketDir = path.join(baseDir, instance_hash);
  await fs.mkdir(pocketDir, { recursive: true });

  var result = null;

  const textValue =
    typeof text === "string" && text.trim().length > 0 ? text : null;

  try {
    result = await pool.query(
      `INSERT INTO pocket_items (instance_hash, text) VALUES ($1, $2) RETURNING *`,
      [instance_hash, textValue]
    );
  } catch (error: any) {
    return Response.json({ error: "Database Error, Please upload again" });
  }

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File);

  if (files.length === 0)
    return Response.json({ message: "Upload succesful", status: 200 });

  if (result == null)
    return Response.json({ error: "Database Error, Please upload again" });

  const batch_id = result.rows[0].batch_id;

  for (const file of files) {
    await uploadFile(file);
  }

  return Response.json({ message: "Upload succesful", status: 200 });

  async function uploadFile(file: File) {
    var file_result;

    file_result = await pool.query(
      `INSERT INTO pocket_items (instance_hash, original_file_name, batch_id) VALUES ($1, $2, $3) RETURNING *`,
      [instance_hash, file.name, batch_id]
    );

    const file_name =
      file_result.rows.length > 0 ? file_result.rows[0].file_name : null;

    if (!file_name) throw new Error("File upload error");
    if (!(file instanceof File)) throw new Error("File upload error");

    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(path.join(pocketDir, file_name), buffer);
  }
}
