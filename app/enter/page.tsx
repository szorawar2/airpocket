"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EnterPocket() {
  const router = useRouter();

  const [pocketId, setPocketId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enterPocket() {
    if (!pocketId || passcode.length !== 6) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/pocket/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pocketId,
        passcode,
      }),
    });

    if (!res.ok) {
      setError("Invalid pocket ID or passcode");
      setLoading(false);
      return;
    }

    const { instanceHash } = await res.json();
    router.push(`/pocket/${instanceHash}`);
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Enter Pocket</h1>

      <div>
        <label className="block text-sm mb-1">Pocket ID</label>
        <input
          value={pocketId}
          onChange={(e) => setPocketId(e.target.value.toUpperCase())}
          placeholder="A-0421"
          className="w-full rounded border px-3 py-2 font-mono"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">6-digit passcode</label>
        <input
          maxLength={6}
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <button
        onClick={enterPocket}
        disabled={passcode.length !== 6 || loading}
        className="w-full rounded bg-black py-3 text-white disabled:opacity-50"
      >
        {loading ? "Entering…" : "Enter Pocket"}
      </button>
    </div>
  );
}
