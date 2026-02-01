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
    <div
      className="
      relative overflow-hidden space-y-6
      flex flex-col
      max-w-[1420px] mx-auto
      p-6 bg-background rounded-2xl mt-2 xl:mt-10
      h-full md:h-[80vh] max-h-[1000px]
      "
    >
      <div className="">
        <h1 className="text-2xl font-semibold text-col4 ">Pocket {pocketId}</h1>
        <p className="font-mono text-sm">Expires in {timeLeft}</p>
      </div>

      {/* action buttons*/}
      <div className="flex font-[Open_Sans] divide-x-2 divide-col1">
        <button
          className="font-semibold underline decoration-1 underline-offset-2 cursor-pointer hover:text-col2 hover:underline pr-2 text-sm text-col4 md:text-base"
          onClick={() => setShowDelete(true)}
        >
          Delete pocket
        </button>
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

        <button
          className="font-semibold underline decoration-1 underline-offset-2 cursor-pointer hover:text-col2 hover:underline px-2 text-sm text-col4 md:text-base"
          onClick={() => setShowExtend(true)}
        >
          Extend pocket
        </button>
        {showExtend && (
          <ExtendPocketPopup
            instanceHash={instanceHash}
            onClose={() => setShowExtend(false)}
          />
        )}

        <button
          className="font-semibold underline decoration-1 underline-offset-2 cursor-pointer hover:text-col2 hover:underline pl-2 text-sm text-col4 md:text-base"
          onClick={() => setShowQr(true)}
        >
          Create QR
        </button>
        {showQr && (
          <QrPopup
            instanceHash={instanceHash}
            onClose={() => setShowQr(false)}
          />
        )}
      </div>

      <div className="flex-1 min-h-0 max-h-[40vh] md:max-h-[80vh] overflow-y-auto py-6 pb-12 mb-22">
        <MessageDisplay
          instanceHash={instanceHash}
          refreshKey={refreshKey}
          setRefreshKey={setRefreshKey}
        />
      </div>

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
    <div className="fixed z-2 inset-0 bg-black/50 flex items-center justify-center ">
      <div className="bg-white p-6 rounded space-y-4 rounded-xl w-80">
        <h2 className="text-xl font-semibold pb-2 text-col4">Delete pocket</h2>

        <input
          maxLength={6}
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="border px-3 py-2 w-full mb-6 rounded-lg outline-col2"
          placeholder="Enter passcode"
        />

        <div className="flex gap-2 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg cursor-pointer hover:text-col2"
          >
            Cancel
          </button>

          <button
            disabled={passcode.length !== 6 || loading}
            onClick={onDelete}
            className="px-4 py-2 bg-col3 text-white rounded-lg cursor-pointer hover:bg-col4"
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
    <div className="fixed z-2 inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded rounded-xl w-80">
        <h2 className="font-semibold text-lg text-col4">Extend pocket</h2>
        <p className="italic pb-4 text-col3 font-[Open_sans]">
          max pocket duration is 3 days
        </p>

        <div className="font-[Raleway]">
          <select
            value={expiresIn}
            onChange={(e) => setExpiresIn(Number(e.target.value))}
            className="w-full border px-3 p-2 mb-6 rounded cursor-pointer "
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
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg cursor-pointer hover:text-col2"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={extendPocket}
            className="px-4 py-2 bg-col3 text-white rounded disabled:opacity-50 rounded-lg cursor-pointer hover:bg-col4"
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
  const [expiresAt, setExpiresAt] = useState<string | Number | null>(null);
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
      const time = new Date(expiresAt as string | number).getTime();
      const diff = time - Date.now();

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
    <div className="fixed z-2 inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded space-y-4 text-center w-80 flex flex-col items-center rounded-lg">
        <div>
          <h2 className="font-semibold text-lg text-col4">Pocket QR</h2>
          <p className="text-sm text-col2">
            {timeLeft ? `Expires in ${timeLeft}` : "Generating…"}
          </p>
        </div>

        {qrUrl ? (
          <QRCodeSVG value={qrUrl} size={200} />
        ) : (
          <p className="text-sm text-gray-400">Generating…</p>
        )}

        <button
          onClick={onClose}
          className="border px-4 py-2 mt-4 mx-auto rounded-lg cursor-pointer hover:text-col2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
