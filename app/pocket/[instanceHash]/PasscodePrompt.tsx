"use client";

import { useState } from "react";
import { useAuth } from "@/context/PocketContext";
import { hashPasscode } from "@/app/api/lib/hash";

export default function PasscodePrompt({
  instanceHash,
  pocketId,
}: {
  instanceHash: string;
  pocketId: string;
}) {
  const { setContextPasscode } = useAuth();

  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (passcode.length !== 6) return;

    setLoading(true);
    setError(null);

    const passcodeHash = await hashPasscode(passcode);

    const res = await fetch("/api/pocket/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instanceHash,
        passcodeHash,
      }),
    });

    if (!res.ok) {
      setError("Invalid passcode");
      setLoading(false);
      return;
    }

    setContextPasscode(passcode);

    window.location.reload();
  }

  return (
    <div className="mx-auto w-120 max-w-9/10 max-h-150 p-6 space-y-6 bg-background rounded-2xl mt-10 p-12 ">
      <h1 className="text-2xl font-bold text-col4">
        {" "}
        Please Enter the correct passcode for {pocketId}
      </h1>

      <div>
        {error && <p className="text-col4 font-mono pb-1">{error}</p>}

        <label className="block text-sm mb-1 text-col2 font-[Open_Sans]">
          6-digit passcode
        </label>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={passcode}
          onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-xl border border-col4 px-3 py-2 focus:border-2 focus:outline-none focus:border-col2"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={passcode.length !== 6 || loading}
        className="w-full rounded-xl bg-col3 py-3 text-white disabled:opacity-50 hover:bg-col4 disabled:hover:bg-col3 cursor-pointer"
      >
        {loading ? "Verifying…" : "Enter Pocket"}
      </button>
    </div>
  );
}
