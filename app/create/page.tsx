"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

export default function CreatePocket() {
  const router = useRouter();

  const [pocketId, setPocketId] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [expiresIn, setExpiresIn] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function reservePocket() {
      const res = await fetch("/api/pocket/reserve", {
        method: "POST",
      });
      const data = await res.json();
      setPocketId(data.pocketId);
      setLoading(false);
    }

    reservePocket();
  }, []);

  async function finalizePocket() {
    if (!pocketId || passcode.length !== 6) return;

    const res = await fetch("/api/pocket/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pocketId,
        passcode,
        expiresInMinutes: expiresIn,
      }),
    });

    if (!res.ok) return; // optional error handling

    const { instanceHash } = await res.json();

    // redirect to upload page for this pocket
    router.push(`/pocket/${instanceHash}`);
  }

  if (loading) {
    return <div className="p-6">Creating pocket…</div>;
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create Pocket</h1>

      <div className="rounded-lg border p-4">
        <p className="text-sm text-gray-500">Pocket ID</p>
        <p className="text-xl font-mono">{pocketId}</p>
      </div>

      <div>
        <label className="block text-sm mb-1">6-digit passcode</label>
        <input
          // type="password"
          maxLength={6}
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Expiration</label>
        <select
          value={expiresIn}
          onChange={(e) => setExpiresIn(Number(e.target.value))}
          className="w-full rounded border px-3 py-2"
        >
          <option value={15}>15 mins</option>
          <option value={30}>30 mins</option>
          <option value={60}>1 hour</option>
          <option value={180}>3 hours</option>
          <option value={360}>6 hours</option>
          <option value={720}>12 hours</option>
          <option value={1440}>1 day</option>
          <option value={4320}>3 days</option>
        </select>
      </div>

      <button
        onClick={finalizePocket}
        disabled={passcode.length !== 6}
        className="w-full rounded bg-black py-3 text-white disabled:opacity-50"
      >
        Create Pocket
      </button>
    </div>
  );
}
