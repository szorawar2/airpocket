import { notFound } from "next/navigation";
import { getPocket, getMessages } from "@/app/api/lib/pocket";
import InputBar from "./InputBar";

export default async function PocketPage({
  params,
}: {
  params: { instanceHash: string } | Promise<{ instanceHash: string }>;
}) {
  const { instanceHash } = await params; // unwrap if it's a Promise

  const pocket = await getPocket(instanceHash);
  if (!pocket) notFound();

  if (new Date(pocket.expires_at) < new Date()) {
    return <div>Pocket expired</div>;
  }

  const messages = await getMessages(instanceHash);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Pocket {pocket.pocket_id}</h1>

      {/* action buttons (non-functional) */}
      <div className="flex gap-2">
        <button>Delete pocket</button>
        <button>Extend pocket</button>
        <button>Burn files on download</button>
        <button>Create QR</button>
      </div>

      {/* messages */}
      <div className="border rounded p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-gray-500">No messages yet</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="border-b pb-2">
            {m.text}
          </div>
        ))}
      </div>

      <InputBar instanceHash={instanceHash}></InputBar>
    </div>
  );
}
