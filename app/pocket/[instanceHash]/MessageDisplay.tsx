"use client";
import { useState, useEffect } from "react";
import type { Message } from "@/types/messageType";

export default function MessageDisplay({
  instanceHash,
  refreshKey,
}: {
  instanceHash: string;
  refreshKey: number;
}) {
  // const content: Message[] = await getPreparedMessages(instanceHash);

  const [content, setContent] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(
        `/api/pocket/prepared-messages?instance_hash=${instanceHash}`
      );
      const data = await res.json();

      setContent(data);
      setLoading(false);
    }

    load();
  }, [instanceHash, refreshKey]);

  if (loading) return <div>Loading…</div>;

  return (
    <div className="border rounded p-4 space-y-2">
      {content.length === 0 && (
        <div className="text-gray-500">No messages yet</div>
      )}
      {content.map((m, i) => (
        <div key={m.batch_id} className="border-b pb-2">
          <div>{m.text}</div>
          <div>
            {m.files.map((file) => (
              <a
                key={file.file_id}
                href={`/api/pocket/download?instance_hash=${instanceHash}&file_id=${file.file_id}&batch_id=${m.batch_id}`}
                className="text-blue-600 underline"
              >
                {file.original_file_name}
              </a>
            ))}
            {m.files.length > 0 && (
              <a
                href={`/api/pocket/download-batch?instance_hash=${instanceHash}&batch_id=${m.batch_id}`}
                className="text-blue-600 underline"
              >
                Download all
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
