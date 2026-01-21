import { NextResponse } from "next/server";
import { pool } from "@/app/api/lib/db";
import fs from "fs/promises";
import path from "path";

const baseDir = path.join(process.cwd(), "pocket_files");

export async function POST(req: Request) {
  try {
    const { instanceHash, batch_id } = await req.json();

    console.log(instanceHash, batch_id);

    if (!instanceHash || !batch_id || typeof batch_id !== "number") {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    //Delete files if available

    const result = await pool.query(
      `
    SELECT file_name
    FROM pocket_items
    WHERE batch_id = $1 AND 
    instance_hash = $2 AND 
    original_file_name IS NOT NULL
    `,
      [batch_id, instanceHash],
    );

    var files: string[] = [];

    if (result.rowCount !== 0) {
      for (const row of result.rows) {
        files.push(row.file_name);
      }

      const pocketDir = path.join(baseDir, instanceHash);

      for (const file of files) {
        try {
          await fs.rm(path.join(pocketDir, file), { force: true });
        } catch (e) {
          console.warn("Failed to delete file:", file);
        }
      }
    }

    // delete batch from database
    const res = await pool.query(
      `
      DELETE FROM pocket_items
      WHERE batch_id = $1
        AND instance_hash = $2
      RETURNING batch_id
      `,
      [batch_id, instanceHash],
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete-batch error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
