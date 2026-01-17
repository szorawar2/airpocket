"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-6">
          <h2 className="text-3xl font-semibold">
            Drop files. Pick them up anywhere.
          </h2>

          <p className="text-gray-600">
            Enter an existing pocket or create a new one.
          </p>

          <div className="flex flex-col gap-3">
            <button
              className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 transition"
              onClick={() => router.push("/create")}
            >
              Create Pocket
            </button>

            <button
              className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50 transition"
              onClick={() => router.push("/enter")}
            >
              Enter Pocket
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
