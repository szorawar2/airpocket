import { pool } from "@/app/api/lib/db";
import { validatePocket } from "../../lib/pocket";
import fs from "fs/promises";
import path from "path";

// export const runtime = "nodejs";

const baseDir = path.join(process.cwd(), "pocket_files");
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(req: Request) {
  try {
    const instance_hash = req.headers.get("x-instance-hash") as string;
    const fileName = req.headers.get("x-filename");
    const chunkIndex = Number(req.headers.get("x-chunk-index"));
    const totalChunks = Number(req.headers.get("x-total-chunks"));
    const generatedFileNameHeader = req.headers.get("x-generated-filename");
    const burn = req.headers.get("x-burn") === "true";
    const batch_id = req.headers.get("x-batch-id") as string;
    const ivHeader = req.headers.get("x-iv"); // base64

    console.log(chunkIndex);

    if (!instance_hash) {
      return Response.json({ error: "Invalid instance" }, { status: 400 });
    }

    // try {
    //   validatePocket(instance_hash);
    // } catch (error) {
    //   return Response.json({ error: "Pocket does not exist" }, { status: 400 });
    // }

    const chunkBuffer = Buffer.from(await req.arrayBuffer());

    if (chunkBuffer.length > MAX_SIZE) {
      return Response.json(
        { error: "Chunk exceeds size limit" },
        { status: 400 },
      );
    }

    const pocketDir = path.join(baseDir, instance_hash);
    await fs.mkdir(pocketDir, { recursive: true });

    let generatedFileName: string | null =
      generatedFileNameHeader === "" ? null : generatedFileNameHeader;

    // FIRST CHUNK
    if (chunkIndex === 0) {
      const ivValue =
        typeof ivHeader === "string" && ivHeader.length > 0
          ? Buffer.from(ivHeader, "base64")
          : null;

      const result = await pool.query(
        `INSERT INTO pocket_items 
         (instance_hash, original_file_name, batch_id, burn, iv)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING file_name`,
        [instance_hash, fileName, batch_id, burn, ivValue],
      );

      generatedFileName = result.rows[0]?.file_name;

      if (!generatedFileName) {
        return Response.json(
          { error: "File DB insert failed" },
          { status: 500 },
        );
      }

      await fs.writeFile(path.join(pocketDir, generatedFileName), chunkBuffer);

      // LAST CHUNK
      const isLastChunk = chunkIndex === totalChunks - 1;
      if (isLastChunk) {
        console.log("File fully uploaded:", fileName);

        return Response.json({
          ok: true,
          message: "file uploaded",
        });
      }

      return Response.json({
        ok: true,
        generatedFileName: generatedFileName,
      });
    }

    // OTHER CHUNKS
    if (generatedFileName === null) {
      return Response.json({ error: "Missing file name" }, { status: 400 });
    }

    await fs.appendFile(path.join(pocketDir, generatedFileName), chunkBuffer);

    //LAST CHUNK
    const isLastChunk = chunkIndex === totalChunks - 1;

    if (isLastChunk) {
      console.log("File fully uploaded:", fileName);

      return Response.json({
        ok: true,
        message: "file uploaded",
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
