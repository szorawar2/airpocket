import "server-only";
import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import fs from "fs/promises";
import path from "path";

const baseDir = path.join(process.cwd(), "pocket_files");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const instance_hash = searchParams.get("instance_hash");
  const batch_id = searchParams.get("batch_id");
  const file_id = searchParams.get("file_id");

  if (!instance_hash || !batch_id || !file_id) {
    return new NextResponse("Missing required params", { status: 400 });
  }

  if (
    typeof instance_hash !== "string" ||
    typeof batch_id !== "string" ||
    typeof file_id !== "string"
  ) {
    return new NextResponse("Invalid params", { status: 400 });
  }

  // Fetch file info from DB

  const pocketStatus = await pool.query(
    "SELECT status FROM pockets WHERE instance_hash = $1",
    [instance_hash],
  );

  if (pocketStatus.rowCount === 0 || pocketStatus.rows[0].status !== "active") {
    return new NextResponse("Pocket expired", {
      status: 404,
    });
  }

  const result = await pool.query(
    `SELECT file_name, original_file_name, burn, iv
     FROM pocket_items
     WHERE instance_hash = $1 AND batch_id = $2 AND file_id = $3`,
    [instance_hash, batch_id, file_id],
  );

  if (result.rowCount === 0) {
    return new NextResponse("File not found", {
      status: 404,
    });
  }

  const file = result.rows[0];

  // Construct safe file path
  const pocketDir = path.join(baseDir, instance_hash);
  const safeFileName = path.basename(file.file_name); // sanitize
  const filePath = path.join(pocketDir, safeFileName);

  // Optional extra safety
  if (!filePath.startsWith(pocketDir)) {
    return new NextResponse("Invalid file path", { status: 400 });
  }

  // Read the file from disk
  let buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch {
    return new NextResponse("File missing on server", { status: 404 });
  }

  // Burn-on-download if needed
  if (file.burn) {
    await pool.query(
      `DELETE FROM pocket_items WHERE instance_hash = $1 AND batch_id = $2 AND file_id = $3`,
      [instance_hash, batch_id, file_id],
    );
    await fs.unlink(filePath).catch(() => {});
  }

  // Send the file
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "x-iv": Buffer.from(file.iv).toString("base64"),
    },
  });
}
