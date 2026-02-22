"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/PocketContext";
import { hashPasscode } from "@/app/api/lib/hash";

export default function EnterClient() {
  const router = useRouter();

  const alphaRef = useRef<HTMLInputElement | null>(null);
  const numsRef = useRef<HTMLInputElement | null>(null);

  const { setContextPasscode } = useAuth();

  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [alpha, setAlpha] = useState("");
  const [nums, setNums] = useState("");

  async function enterPocket() {
    const pocketId = `${alpha}-${nums}`;

    if (alpha.length !== 1 || nums.length !== 4 || passcode.length !== 6)
      return;

    setLoading(true);
    setError(null);

    const passcodeHash = await hashPasscode(passcode);

    const res = await fetch("/api/pocket/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pocketId,
        passcodeHash,
      }),
    });

    if (!res.ok) {
      setError("Invalid pocket ID or passcode");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("ap_passcode", passcode);
    setContextPasscode(passcodeHash);

    const { instanceHash } = await res.json();
    router.push(`/pocket/${instanceHash}`);
  }

  useEffect(() => {
    if (alpha.length === 1) {
      numsRef.current?.focus();
    }
  }, [alpha]);

  function updateNums(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
    setNums(val);
  }

  function handleNumsKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && e.currentTarget.value === "") {
      alphaRef.current?.focus();
    }
  }

  return (
    <div className="mx-auto w-120 max-w-9/10 max-h-150 p-6 space-y-6 bg-background rounded-2xl mt-10 p-12 ">
      <h1 className="text-2xl font-bold text-col4">Enter Pocket</h1>

      <div>
        <label className="block text-sm mb-1 text-col2 font-[Open_Sans]">
          Pocket ID
        </label>
        <div className="flex items-center gap-2">
          {/* letter */}
          <input
            ref={alphaRef}
            value={alpha}
            onChange={(e) =>
              setAlpha(
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z]/g, "")
                  .slice(0, 1),
              )
            }
            placeholder="A"
            className="w-20 text-xl font-semibold text-center rounded-xl border border-col4 px-2 py-2 focus:border-2 focus:outline-none focus:border-col2"
          />

          <span className="select-none text-col2">-</span>

          {/* numbers */}
          <input
            ref={numsRef}
            value={nums}
            onChange={updateNums}
            onKeyDown={handleNumsKeyDown}
            placeholder="1234"
            className="w-40 text-xl font-semibold text-center rounded-xl border border-col4 px-2 py-2 focus:border-2 focus:outline-none focus:border-col2"
          />
        </div>
      </div>

      <div>
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

      {error && <div className="text-col2 font-mono">{error}</div>}

      <button
        onClick={enterPocket}
        disabled={
          alpha.length !== 1 ||
          nums.length !== 4 ||
          passcode.length !== 6 ||
          loading
        }
        className="w-full rounded-xl bg-col3 py-3 text-white disabled:opacity-50 hover:bg-col4 disabled:hover:bg-col3 cursor-pointer"
      >
        {loading ? "Entering…" : "Enter Pocket"}
      </button>
    </div>
  );
}
