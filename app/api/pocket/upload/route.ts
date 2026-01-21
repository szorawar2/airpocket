import { pool } from "@/app/api/lib/db";
import { validatePocket } from "../../lib/pocket";
import fs from "fs/promises";
import path from "path";

const baseDir = path.join(process.cwd(), "pocket_files");

const MAX_FILES = 15;
const MAX_SIZE = 1024 * 1024 * 1024; // 1GB

export async function POST(req: Request) {
  const formData = await req.formData();
  var text = formData.get("text");
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File);
  const burns = formData.getAll("burn");
  const instance_hash = formData.get("instanceHash") as string;

  //Check max files
  if (files.length > MAX_FILES) {
    return Response.json({ error: "Too many files (max 15)" }, { status: 400 });
  }

  //Check max size
  for (const file of files) {
    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: `File ${file.name} exceeds 1GB limit` },
        { status: 400 },
      );
    }
  }

  try {
    validatePocket(instance_hash);
  } catch (error) {
    return Response.json({ message: "Pocket does not exist", error: error });
  }

  if (typeof instance_hash !== "string") {
    return Response.json({ error: "Invalid instance" }, { status: 400 });
  }

  var result = null;

  const textValue =
    typeof text === "string" && text.trim().length > 0 ? text : null;

  try {
    result = await pool.query(
      `INSERT INTO pocket_items (instance_hash, text) VALUES ($1, $2) RETURNING *`,
      [instance_hash, textValue],
    );
  } catch (error: any) {
    return Response.json({ error: "Database Error, Please upload again" });
  }

  if (files.length === 0)
    return Response.json({ message: "Upload succesful", status: 200 });

  if (result == null)
    return Response.json({ error: "Database Error, Please upload again" });

  const batch_id = result.rows[0].batch_id;

  const pocketDir = path.join(baseDir, instance_hash);
  await fs.mkdir(pocketDir, { recursive: true });

  for (let i = 0; i < files.length; i++) {
    const file = files[i] as File;
    const burn = burns[i] === "true";

    await uploadFile(file, burn);
  }

  return Response.json({ message: "Upload succesful", status: 200 });

  /*
   **Functions
   */

  async function uploadFile(file: File, burn: Boolean) {
    var file_result;

    file_result = await pool.query(
      `INSERT INTO pocket_items (instance_hash, original_file_name, batch_id, burn) VALUES ($1, $2, $3, $4) RETURNING *`,
      [instance_hash, file.name, batch_id, burn],
    );

    const file_name =
      file_result.rows.length > 0 ? file_result.rows[0].file_name : null;

    if (!file_name) throw new Error("File upload error");
    if (!(file instanceof File)) throw new Error("File upload error");

    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(path.join(pocketDir, file_name), buffer);
  }
}
