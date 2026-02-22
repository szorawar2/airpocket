"use client";

import { useState, useRef } from "react";
import CloseIcon from "@/components/misc/CloseIcon";
import { useAuth } from "@/context/PocketContext";
import { encryptMessage, toBase64, encryptFile } from "@/app/api/lib/hash";

type UploadFile = {
  file: File;
  burn: boolean;
  iv: Uint8Array;
};

const MAX_FILES = 15;
const MAX_SIZE = 200 * 1024 * 1024; // 200MB

export default function InputBar({
  instanceHash,
  setRefreshKey,
  setGeneralError,
}: {
  instanceHash: string;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  setGeneralError: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { encryptionKey } = useAuth();

  const [text, setText] = useState<string>("");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const formDataRef = useRef<FormData | null>(null);

  const [showInputBar, setShowInputBar] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputFiles = Array.from(e.target.files ?? []);

    if (inputFiles.length > MAX_FILES) {
      alert("Max 15 files per message");
      e.target.value = "";
      return;
    }

    let totalSize = 0;

    for (const file of inputFiles) {
      if (file.size > MAX_SIZE) {
        alert(`${file.name} exceeds 200MB limit`);
        e.target.value = "";
        return;
      }

      totalSize += file.size;
    }

    if (totalSize > 500 * 1024 * 1024) {
      alert("Total upload size cannot exceed 500MB");
      e.target.value = "";
      return;
    }

    setFiles([]);

    for (const f of inputFiles) {
      const { encryptedBlob, iv } = await encryptFile(
        f,
        encryptionKey as CryptoKey,
      );

      const encryptedFile = new File([encryptedBlob], f.name, {
        type: "application/octet-stream",
      });

      setFiles((prev) => [
        ...prev,
        {
          file: encryptedFile,
          burn: false,
          iv,
        },
      ]);
    }

    e.target.value = "";
  }

  async function submit() {
    if (!encryptionKey) return;

    let batchId = null;

    const { ciphertext, iv } = await encryptMessage(encryptionKey, text);

    const res = await fetch("/api/pocket/upload-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instanceHash,
        ciphertext: text?.trim() ? await toBase64(ciphertext) : "",
        iv: text?.trim() ? await toBase64(iv) : "",
      }),
    });

    const data = await res.json();
    batchId = data.batchId;

    for (const file of files) {
      await uploadFileChunked(file, instanceHash, batchId);
    }

    setText("");
    setFiles([]);
    setRefreshKey((key) => (key += 1));
  }

  // async function submit(e: React.FormEvent) {
  //   e.preventDefault();

  //   if (!encryptionKey || !(encryptionKey instanceof CryptoKey)) {
  //     setGeneralError("Encryption key not available");
  //     return;
  //   }

  //   const { ciphertext, iv } = await encryptMessage(
  //     encryptionKey as CryptoKey,
  //     text,
  //   );

  //   const fd = new FormData();
  //   fd.set("instanceHash", instanceHash);
  //   fd.set("ciphertext", await toBase64(ciphertext));
  //   fd.set("iv", await toBase64(iv));
  //   files.forEach(async (f) => {
  //     fd.append("files", f.file);
  //     fd.append("burns", String(f.burn));
  //     fd.append("ivs", await toBase64(f.iv));
  //   });

  //   formDataRef.current = fd;

  //   const res = await fetch("/api/pocket/upload", {
  //     method: "POST",
  //     body: fd,
  //   });

  //   if (!res.ok) {
  //     setGeneralError("Upload failed. Please try again.");
  //     return;
  //   }

  //   setText("");
  //   setFiles([]);
  //   setShowInputBar(false);

  //   setRefreshKey((key) => (key += 1));
  // }

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
        <div className="flex flex-col gap-4">
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
              // type="submit"
              onClick={submit}
              className="rounded-lg bg-col3 px-6 py-3 text-white hover:bg-col2 transition font-semibold cursor-pointer"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

async function uploadFileChunked(
  file: UploadFile,
  instanceHash: string,
  batchId: string,
) {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  const encryptedFile = file.file;

  const totalChunks = Math.ceil(encryptedFile.size / CHUNK_SIZE);

  let generatedFileName: string | null = null;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, encryptedFile.size);

    const chunk = encryptedFile.slice(start, end);

    const res: any = await fetch("/api/pocket/upload-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-instance-hash": instanceHash,
        "x-batch-id": batchId,
        "x-chunk-index": chunkIndex.toString(),
        "x-total-chunks": totalChunks.toString(),
        "x-iv": await toBase64(file.iv),
        "x-burn": String(file.burn),
        "x-filename": encryptedFile.name,
        "x-generated-filename": generatedFileName ?? "",
      },
      body: chunk,
    });

    generatedFileName = await res.json().generatedFileName;
  }
}
