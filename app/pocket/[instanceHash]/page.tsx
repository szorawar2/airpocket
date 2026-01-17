import { notFound } from "next/navigation";
import { getPocket } from "@/app/api/lib/pocket";
import ClientPage from "./ClientPage";

export default async function PocketPage({
  params,
}: {
  params: { instanceHash: string } | Promise<{ instanceHash: string }>;
}) {
  const { instanceHash } = await params;

  const pocket = await getPocket(instanceHash);
  if (!pocket) notFound();

  if (new Date(pocket.expires_at) < new Date()) {
    return <div>Pocket expired</div>;
  }

  return <ClientPage instanceHash={instanceHash} pocketId={pocket.pocket_id} />;
}
