"use client";

import { useState, useRef } from "react";

export default function InputBar({
  instanceHash,
  setRefreshKey,
}: {
  instanceHash: string;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const formDataRef = useRef<FormData | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("instanceHash", instanceHash);
    fd.set("text", text);
    files.forEach((f) => fd.append("files", f));

    formDataRef.current = fd;

    const res = await fetch("/api/pocket/upload", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      console.error("Upload failed");
      return;
    }
    setRefreshKey((key) => (key += 1));
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 border-2 rounded-xl border-sky-500">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {/* text input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Write a message"
        />

        {/* file input */}
        <input type="file" multiple onChange={onFileChange} />

        {/* preview */}
        {files.length > 0 && (
          <ul className="text-sm">
            {files.map((f, i) => (
              <li
                key={i}
                className="cursor-pointer text-blue-600 hover:underline"
                onClick={() => {
                  const url = URL.createObjectURL(f);
                  window.open(url);
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                {f.name}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 transition"
          >
            Upload
          </button>
        </div>
      </form>
    </div>
  );
}
