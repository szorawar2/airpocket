"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import MessageDisplay from "./MessageDisplay";
import InputBar from "./InputBar";

export default function ClientPage({
  instanceHash,
  pocketId,
  expiresAt,
}: {
  instanceHash: string;
  pocketId: string;
  expiresAt: string;
}) {
  //Delete Pocket
  const [showDelete, setShowDelete] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);

  //Extend Pocket
  const [showExtend, setShowExtend] = useState(false);

  //QR display
  const [showQr, setShowQr] = useState(false);

  //Message Display refresh
  const [refreshKey, setRefreshKey] = useState<number>(0);

  //Time display
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const totalMinutes = Math.floor(diff / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
      );
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="">
        <h1 className="text-xl font-semibold">Pocket {pocketId}</h1>
        <p className="font-mono text-sm">Expires in {timeLeft}</p>
      </div>

      {/* action buttons*/}
      <div className="flex gap-2">
        <button onClick={() => setShowDelete(true)}>Delete pocket</button>
        {showDelete && (
          <DeletePopup
            passcode={passcode}
            setPasscode={setPasscode}
            loading={loading}
            onCancel={() => setShowDelete(false)}
            onDelete={async () => {
              setLoading(true);
              await fetch("/api/pocket/delete-pocket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instanceHash, passcode }),
              });
              window.location.href = "/";
            }}
          />
        )}

        <button onClick={() => setShowExtend(true)}>Extend pocket</button>
        {showExtend && (
          <ExtendPocketPopup
            instanceHash={instanceHash}
            onClose={() => setShowExtend(false)}
          />
        )}

        <button onClick={() => setShowQr(true)}>Create QR</button>
        {showQr && (
          <QrPopup
            instanceHash={instanceHash}
            onClose={() => setShowQr(false)}
          />
        )}
      </div>

      <MessageDisplay
        instanceHash={instanceHash}
        refreshKey={refreshKey}
        setRefreshKey={setRefreshKey}
      />

      <InputBar instanceHash={instanceHash} setRefreshKey={setRefreshKey} />
    </div>
  );
}

function DeletePopup({
  passcode,
  setPasscode,
  loading,
  onCancel,
  onDelete,
}: {
  passcode: string;
  setPasscode: (v: string) => void;
  loading: boolean;
  onCancel: () => void;
  onDelete: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded space-y-4">
        <h2 className="font-semibold">Delete pocket</h2>

        <input
          maxLength={6}
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="border px-3 py-2 w-full"
          placeholder="Enter passcode"
        />

        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 border">
            Cancel
          </button>

          <button
            disabled={passcode.length !== 6 || loading}
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ExtendPocketPopup({
  instanceHash,
  onClose,
}: {
  instanceHash: string;
  onClose: () => void;
}) {
  const [expiresIn, setExpiresIn] = useState<number>(30);
  const [loading, setLoading] = useState(false);

  async function extendPocket() {
    setLoading(true);

    await fetch("/api/pocket/extend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instanceHash,
        expiresIn: expiresIn,
      }),
    });

    setLoading(false);
    onClose();
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-80">
        <h2 className="font-semibold text-lg">Extend pocket</h2>
        <p className="italic pb-4 ">max pocket duration is 3 days</p>

        <select
          value={expiresIn}
          onChange={(e) => setExpiresIn(Number(e.target.value))}
          className="w-full border px-3 p-2 mb-6 rounded"
        >
          <option value={15}>15 mins</option>
          <option value={30}>30 mins</option>
          <option value={60}>1 hour</option>
          <option value={180}>3 hours</option>
          <option value={360}>6 hours</option>
          <option value={720}>12 hours</option>
          <option value={1440}>1 day</option>
          <option value={4320}>3 days</option>
        </select>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={extendPocket}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            Extend
          </button>
        </div>
      </div>
    </div>
  );
}

function QrPopup({
  instanceHash,
  onClose,
}: {
  instanceHash: string;
  onClose: () => void;
}) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  // generate QR when popup appears (mount)
  useEffect(() => {
    async function generateQr() {
      const res = await fetch("/api/pocket/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceHash }),
      });

      const data = await res.json();
      setQrUrl(data.url);
      setExpiresAt(data.expiresAt);
    }

    generateQr();
  }, [instanceHash]);

  // countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    function update() {
      const diff = new Date(expiresAt).getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const minutes = Math.floor(diff / 60000);

      setTimeLeft(`${String(minutes).padStart(2, "0")} minutes`);
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded space-y-4 text-center w-80 flex flex-col items-center">
        <div>
          <h2 className="font-semibold">Pocket QR</h2>
          <p className="text-sm text-gray-500">
            {timeLeft ? `Expires in ${timeLeft}` : "Generating…"}
          </p>
        </div>

        {qrUrl ? (
          <QRCodeSVG value={qrUrl} size={200} />
        ) : (
          <p className="text-sm text-gray-400">Generating…</p>
        )}

        <button onClick={onClose} className="border px-4 py-2 mt-4 mx-auto">
          Close
        </button>
      </div>
    </div>
  );
}
