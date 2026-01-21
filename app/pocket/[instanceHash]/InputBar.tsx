"use client";

import { useState, useRef } from "react";

type UploadFile = {
  file: File;
  burn: boolean;
};

const MAX_FILES = 15;
const MAX_SIZE = 1024 * 1024 * 1024; // 1GB

export default function InputBar({
  instanceHash,
  setRefreshKey,
}: {
  instanceHash: string;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const formDataRef = useRef<FormData | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputFiles = Array.from(e.target.files ?? []);

    if (inputFiles.length > MAX_FILES) {
      alert("Max 15 files per message");
      return;
    }

    for (const file of inputFiles) {
      if (file.size > MAX_SIZE) {
        alert(`${file.name} exceeds 1GB limit`);
        return;
      }
    }

    const selected: UploadFile[] = [];

    for (const f of inputFiles) {
      selected.push({
        file: f,
        burn: false,
      });
    }

    setFiles(selected);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("instanceHash", instanceHash);
    fd.set("text", text);
    files.forEach((f) => {
      fd.append("files", f.file);
      fd.append("burn", String(f.burn));
    });

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
            {files.map((thisFile, i) => (
              <li className="flex space-4" key={i}>
                <div
                  className="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => {
                    const url = URL.createObjectURL(thisFile.file);
                    window.open(url);
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  {thisFile.file.name}
                </div>
                <label className="flex items-center gap-1 text-gray-600">
                  <input
                    type="checkbox"
                    checked={thisFile.burn}
                    onChange={(e) => {
                      const copy = [...files];
                      copy[i] = { ...copy[i], burn: e.target.checked };
                      setFiles(copy);
                    }}
                  />
                  burn
                </label>
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
