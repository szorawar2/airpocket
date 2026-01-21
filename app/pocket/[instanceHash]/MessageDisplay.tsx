"use client";
import { useState, useEffect } from "react";
import type { Message, FileItem } from "@/types/messageType";

export default function MessageDisplay({
  instanceHash,
  refreshKey,
  setRefreshKey,
}: {
  instanceHash: string;
  refreshKey: number;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}) {
  // const content: Message[] = await getPreparedMessages(instanceHash);

  const [content, setContent] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(
        `/api/pocket/prepared-messages?instance_hash=${instanceHash}`,
      );
      const data = await res.json();

      setContent(data);
      setLoading(false);
    }

    load();
  }, [instanceHash, refreshKey]);

  if (loading) return <div>Loading…</div>;

  return (
    <div className="border rounded p-4 space-y-2">
      {content.length === 0 && (
        <div className="text-gray-500">No messages yet</div>
      )}
      {content.map((m, i) => (
        <div key={m.batch_id}>
          {/* prevent rendering of null batches */}
          {(m.text != null || m.files.length > 0) && (
            <>
              <div>
                <div className="w-full border-b pb-2 flex justify-between items-center">
                  <div>{m.text}</div>{" "}
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
                  {m.files.length > 0 && (
                    <a
                      href={`/api/pocket/download-batch?instance_hash=${instanceHash}&batch_id=${m.batch_id}`}
                      className="text-blue-600 "
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
        className="text-blue-600 "
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
