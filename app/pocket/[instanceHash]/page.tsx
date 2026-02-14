import { use } from "react";
import { notFound } from "next/navigation";
import { getPocket } from "@/app/api/lib/pocket";
import ClientPage from "./ClientPage";
import { AuthProvider } from "@/context/PocketContext";

type tParams = Promise<{ instanceHash: string }>;

export default async function PocketPage(props: { params: tParams }) {
  const { instanceHash } = await props.params;

  const pocket = await getPocket(instanceHash);
  if (!pocket) notFound();

  if (new Date(pocket.expires_at) < new Date()) {
    return <div>Pocket expired</div>;
  }

  return (
    <AuthProvider>
      <ClientPage
        instanceHash={instanceHash}
        pocketId={pocket.pocket_id}
        expiresAt={pocket.expires_at}
      />
    </AuthProvider>
  );
}
