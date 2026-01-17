import "server-only";
import archiver from "archiver";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { pool } from "@/app/api/lib/db";

const baseDir = path.join(process.cwd(), "pocket_files");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const instanceHash = searchParams.get("instance_hash");
  const batchId = searchParams.get("batch_id");

  if (!instanceHash || !batchId) {
    return new NextResponse("Missing params", { status: 400 });
  }

  // get files for this batch from DB
  const { rows } = await pool.query(
    `
    SELECT file_name, original_file_name
    FROM pocket_items
    WHERE instance_hash = $1 AND batch_id = $2
    `,
    [instanceHash, batchId]
  );

  if (rows.length === 0) {
    return new NextResponse("No files", { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("data", (chunk: any) => controller.enqueue(chunk));
      archive.on("end", () => controller.close());
      archive.on("error", (err: Error) => controller.error(err));

      const pocketDir = path.join(baseDir, instanceHash);

      for (const file of rows) {
        archive.file(path.join(pocketDir, file.file_name), {
          name: file.original_file_name,
        });
      }

      archive.finalize();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="message_${batchId}.zip"`,
    },
  });
}
