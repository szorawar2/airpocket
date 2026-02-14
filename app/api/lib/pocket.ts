import { pool } from "./db";
// import type { Message } from "@/types/messageType";

export async function getPocket(instanceHash: string) {
  const res = await pool.query(
    `SELECT * FROM pockets WHERE instance_hash = $1`,
    [instanceHash],
  );
  return res.rows[0] ?? null;
}

// export async function getPreparedMessages(
//   instanceHash: string
// ): Promise<Message[]> {
//   const result = await pool.query(
//     `
//     SELECT *
//     FROM pocket_items
//     WHERE instance_hash = $1
//     ORDER BY created_at ASC
//     `,
//     [instanceHash]
//   );

//   const preparedMessages: Message[] = [];

//   for (const row of result.rows) {
//     // try to find existing message with same batch_id
//     let message = preparedMessages.find((m) => m.batch_id === row.batch_id);

//     // if it doesn't exist, create it
//     if (!message) {
//       message = {
//         batch_id: row.batch_id,
//         text: null,
//         files: [],
//       };
//       preparedMessages.push(message);
//     }

//     // add text if present
//     if (row.text) {
//       message.text = row.text;
//     }

//     // add file if present
//     if (row.original_file_name) {
//       message.files.push({
//         file_id: row.file_id,
//         file_name: row.file_name,
//         original_file_name: row.original_file_name,
//         burn: row.burn ?? false,
//       });
//     }
//   }

//   return preparedMessages;
// }

export async function validatePocket(instanceHash: string) {
  const res = await pool.query(
    "SELECT * FROM pockets WHERE instance_hash = $1",
    [instanceHash],
  );

  if (res.rows.length === 0) {
    throw new Error("Pocket not found");
  }
}
