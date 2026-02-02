"use client";

import { useState, useRef } from "react";
import CloseIcon from "@/components/misc/CloseIcon";

type UploadFile = {
  file: File;
  burn: boolean;
};

const MAX_FILES = 15;
const MAX_SIZE = 1024 * 1024 * 1024; // 1GB

export default function InputBar({
  instanceHash,
  setRefreshKey,
  setGeneralError,
}: {
  instanceHash: string;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  setGeneralError: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const formDataRef = useRef<FormData | null>(null);

  const [showInputBar, setShowInputBar] = useState(false);

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
      setGeneralError("Upload failed. Please try again.");
      return;
    }

    setText("");
    setFiles([]);
    setShowInputBar(false);

    setRefreshKey((key) => (key += 1));
  }

  return (
    <>
      <div
        className={`w-full flex space- justify-center gap-6 
        absolute left-0 right-0 bottom-0
        p-4
        bg-background
        border-t border-gray-200
        transition-all duration-500 ease-out
        transform
        ${!showInputBar ? " opacity-100" : " opacity-0"}`}
      >
        <button
          className="w-3/10 min-w-30 border-2 rounded-lg border-col2 text-col2 p-2 hover:bg-col2 hover:text-white cursor-pointer"
          onClick={() => setShowInputBar(true)}
        >
          Add Note
        </button>
        <button
          className="w-3/10 min-w-30 bg-col1 rounded-lg text-white hover:bg-col3 p-2 cursor-pointer"
          onClick={() => setShowInputBar(true)}
        >
          Upload Files
        </button>
      </div>

      <div
        className={`
        absolute left-0 right-0 bottom-0
        p-4
        bg-background
        border-t border-gray-200
        transition-all duration-500 ease-out
        transform
        ${showInputBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
        `}
      >
        <button
          className="border-2 border-col2 w-fit p-1 mb-4 rounded-lg text-white font-semibold cursor-pointer"
          onClick={() => setShowInputBar(false)}
        >
          <CloseIcon className={"var(--color-col2)"}></CloseIcon>
        </button>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* text input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border border-col2 rounded-lg font-[Open_sans] outline-col2 focus:outline focus:outline-2 focus:outline-col1"
            placeholder="Write a Note..."
          />

          {/* file input */}
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={onFileChange}
            className="hidden"
          />

          <label
            htmlFor="file-upload"
            className=" cursor-pointer font-semibold rounded-xl pr-4 py-2 text-col4 max-w-40 underline"
          >
            Select files
          </label>

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
              className="rounded-lg bg-col3 px-6 py-3 text-white hover:bg-col2 transition font-semibold cursor-pointer"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
