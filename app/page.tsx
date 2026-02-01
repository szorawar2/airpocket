"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col relative bottom-0">
      <main className="flex flex-1 items-center justify-center px-6  font-[Open_Sans]">
        <div
          className="w-full p-12 h-120 max-w-md text-center space-y-6 bg-background rounded-2xl flex flex-col items-center justify-center
"
        >
          <h2 className="text-4xl text-col4 font-bold font-[Raleway] pb-4">
            Drop files. Pick them up anywhere.
          </h2>

          <p className=" text-col3 font-[Open_Sans]">
            Enter an existing pocket or create a new one.
          </p>

          <div className="flex flex-col gap-3 justify-center items-center pt-4">
            <button
              className="w-80 max-w-4/5 bg-col3 rounded-xl bg-black px-6 py-3 text-white hover:bg-col4 transition cursor-pointer"
              onClick={() => router.push("/create")}
            >
              Create Pocket
            </button>

            <button
              className="w-80 max-w-4/5 rounded-xl border border-gray-300 px-6 py-3 hover:bg-background2 transition cursor-pointer"
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
