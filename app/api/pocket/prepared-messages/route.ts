import { pool } from "@/app/api/lib/db";
import type { MessageDTO } from "@/types/messageType";
import { toBase64 } from "../../lib/hash";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const instance_hash = searchParams.get("instance_hash");
  const result = await pool.query(
    `
    SELECT *
    FROM pocket_items
    WHERE instance_hash = $1
    ORDER BY created_at ASC
    `,
    [instance_hash],
  );

  const preparedMessages: MessageDTO[] = [];

  for (const row of result.rows) {
    // try to find existing message with same batch_id
    let message = preparedMessages.find((m) => m.batch_id === row.batch_id);

    // if it doesn't exist, create it
    if (!message) {
      message = {
        batch_id: row.batch_id,
        ciphertext: null,
        iv: null,
        files: [],
      };
      preparedMessages.push(message);
    }

    // add ciphertext and iv if present
    if (row.ciphertext) {
      const ciphertextBase64 = await toBase64(row.ciphertext);
      const ivBase64 = await toBase64(row.iv);

      message.ciphertext = ciphertextBase64;
      message.iv = ivBase64;
    }

    // add file if present
    if (row.original_file_name) {
      message.files.push({
        file_id: row.file_id,
        file_name: row.file_name,
        original_file_name: row.original_file_name,
        burn: row.burn ?? false,
      });
    }
  }

  return Response.json(preparedMessages);
}
