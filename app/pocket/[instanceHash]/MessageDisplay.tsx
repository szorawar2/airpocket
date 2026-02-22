"use client";
import { useState, useEffect } from "react";
import type { Message, MessageDTO, FileItem } from "@/types/messageType";
import { fromBase64, decryptMessage } from "@/app/api/lib/hash";
import { useAuth } from "@/context/PocketContext";

export default function MessageDisplay({
  instanceHash,
  refreshKey,
  setRefreshKey,
  setGeneralError,
}: {
  instanceHash: string;
  refreshKey: number;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  setGeneralError: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [content, setContent] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [decryptedContent, setDecryptedContent] = useState<Message[]>([]);
  const { encryptionKey } = useAuth();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(
        `/api/pocket/prepared-messages?instance_hash=${instanceHash}`,
      );

      if (!res.ok) {
        setGeneralError("Failed to load messages. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();

      setContent(data);
      setLoading(false);
    }

    load();
  }, [instanceHash, refreshKey]);

  useEffect(() => {
    if (!encryptionKey || !content) return;

    async function decryptAll() {
      const updated = await Promise.all(
        content.map(async (m) => {
          if (!m.ciphertext || !m.iv || encryptionKey == null) {
            return {
              batch_id: m.batch_id,
              text: null,
              files: m.files,
            };
          }

          const text = await decryptMessage(encryptionKey, m.ciphertext, m.iv);

          return {
            batch_id: m.batch_id,
            text,
            files: m.files,
          };
        }),
      );

      setDecryptedContent(updated);
    }

    decryptAll();
  }, [content, encryptionKey]);

  if (loading) return <div>Loading…</div>;

  return (
    <div className=" bg-background2 rounded-xl p-4 pt-8 space-y-2 md:mx-12 flex flex-col ">
      {decryptedContent.length === 0 && (
        <div className="text-col3 px-6">No notes yet</div>
      )}
      {decryptedContent.map((m, i) => (
        <div
          key={m.batch_id}
          className=" bg-background rounded-xl p-4 mb-6 md:mx-6"
        >
          {/* prevent rendering of null batches */}
          {(m.text != null || m.files.length > 0) && (
            <>
              <div>
                <div className="w-full border-b border-col1 pb-1 mb-1 flex justify-between items-center">
                  <div className="font-[Open_sans]">{m.text}</div>{" "}
                  <DropDown
                    instanceHash={instanceHash}
                    batch_id={m.batch_id}
                    setRefreshKey={setRefreshKey}
                  />
                </div>

                <div>
                  {m.files.map((file) => (
                    <DownloadLink
                      key={file.file_id}
                      instanceHash={instanceHash}
                      m={m}
                      file={file}
                    />
                  ))}
                  {m.files.length > 1 && (
                    <a
                      href={`/api/pocket/download-batch?instance_hash=${instanceHash}&batch_id=${m.batch_id}`}
                      className="bg-col0 p-1 px-4 rounded-lg text-col4 font-semibold mt-2 inline-block cursor-pointer"
                    >
                      Download all
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function DownloadLink({
  instanceHash,
  m,
  file,
}: {
  instanceHash: string;
  m: Message;
  file: FileItem;
}) {
  const [deleted, setDeleted] = useState(false);

  return (
    <div className="flex space-4">
      <a
        href={`/api/pocket/download?instance_hash=${instanceHash}&file_id=${file.file_id}&batch_id=${m.batch_id}`}
        className="text-col2 underline pb-1 "
        onClick={() => setDeleted((d) => (d == false ? true : true))}
      >
        {file.original_file_name}
      </a>

      {file.burn && deleted && <p>deleted after download</p>}
    </div>
  );
}

function DropDown({
  instanceHash,
  batch_id,
  setRefreshKey,
}: {
  instanceHash: string;
  batch_id: number;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const dropDownId = `dropDown-${batch_id}`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (!event.target.closest(`#${dropDownId}`)) {
        setOpen(false);
        setConfirm(false);
      }
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function deleteBatch() {
    const response = await fetch("/api/pocket/delete-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instanceHash, batch_id }),
    });

    const status = await response.json();

    if (status.success) {
      setRefreshKey((a) => a + 1);
    }

    setOpen(false);
    setConfirm(false);
  }

  return (
    <div className="relative" id={dropDownId}>
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 100 100" height="20" width="20">
          <circle cx="50" cy="15" r="10" />
          <circle cx="50" cy="50" r="10" />
          <circle cx="50" cy="85" r="10" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-28 rounded border bg-white shadow z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {!confirm ? (
            <button
              className="w-full px-3 py-2 text-left hover:bg-gray-100"
              onClick={() => setConfirm(true)}
            >
              Delete
            </button>
          ) : (
            <div className="px-3 py-2 space-y-2">
              <div className="text-sm text-gray-600">Confirm?</div>
              <div className="flex justify-between">
                <button className="text-red-600 text-sm" onClick={deleteBatch}>
                  Yes
                </button>
                <button className="text-sm" onClick={() => setConfirm(false)}>
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
