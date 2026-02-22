"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import MessageDisplay from "./MessageDisplay";
import InputBar from "./InputBar";
import PasscodePrompt from "./PasscodePrompt";
import { useAuth } from "@/context/PocketContext";
import { hashPasscode, deriveKey, fromBase64 } from "@/app/api/lib/hash";
import { verify } from "crypto";

export default function ClientPage({
  instanceHash,
  pocketId,
  expiresAt,
}: {
  instanceHash: string;
  pocketId: string;
  expiresAt: string;
}) {
  const { contextPasscode, setContextPasscode, setEncryptionKey } = useAuth();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!contextPasscode || typeof contextPasscode != "string") return;

    async function verify() {
      try {
        const passcodeHash = await hashPasscode(contextPasscode as string);

        const res = await fetch("/api/pocket/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instanceHash,
            passcodeHash: passcodeHash,
          }),
        });

        if (!res.ok) {
          setGeneralError("Invalid passcode");
          setContextPasscode(null);
          setVerified(false);
          return;
        }

        const data = await res.json();
        const pocket_salt = await fromBase64(data.pocket_salt);

        const key = await deriveKey(contextPasscode as string, pocket_salt);

        setEncryptionKey(key);
        setVerified(true);
      } catch (error) {}
    }

    verify();
  }, [contextPasscode, instanceHash]);

  //Delete Pocket
  const [showDelete, setShowDelete] = useState(false);
  const [deletePasscode, setDeletePasscode] = useState("");

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
        `${String(hours).padStart(2, "0")} hrs ${String(minutes).padStart(2, "0")} min`,
      );
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!contextPasscode || typeof contextPasscode != "string") {
    return <PasscodePrompt instanceHash={instanceHash} pocketId={pocketId} />;
  }

  return (
    <div
      className="
      relative overflow-hidden space-y-6
      flex flex-col
      w-[100vw]
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
            instanceHash={instanceHash}
            deletePasscode={deletePasscode}
            setDeletePasscode={setDeletePasscode}
            setShowDelete={setShowDelete}
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

      {generalError && (
        <p className="p-4 text-col2 rounded-lg font-mono">{generalError}</p>
      )}

      <div className="flex-1  min-h-0 max-h-[40vh] md:max-h-[80vh] overflow-y-auto py-6 pb-12 mb-22">
        <MessageDisplay
          instanceHash={instanceHash}
          refreshKey={refreshKey}
          setRefreshKey={setRefreshKey}
          setGeneralError={setGeneralError}
        />
      </div>

      <InputBar
        instanceHash={instanceHash}
        setRefreshKey={setRefreshKey}
        setGeneralError={setGeneralError}
      />
    </div>
  );
}

function DeletePopup({
  instanceHash,
  deletePasscode,
  setDeletePasscode,
  setShowDelete,
}: {
  instanceHash: string;
  deletePasscode: string;
  setDeletePasscode: (v: string) => void;
  setShowDelete: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function deletePocket() {
    setLoading(true);

    const passcodeHash: string = await hashPasscode(deletePasscode);

    const res = await fetch("/api/pocket/delete-pocket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instanceHash, passcodeHash }),
    });

    const data = await res.json();

    if (!res.ok) {
      setDeleteError(data.error || "Failed to delete pocket");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="fixed z-2 inset-0 bg-black/50 flex items-center justify-center ">
      <div className="bg-white p-6 rounded space-y-4 rounded-xl w-80">
        <h2 className="text-xl font-semibold pb-2 text-col4">Delete pocket</h2>

        <div>
          {deleteError && (
            <p className="text-col4 font-mono pb-1">{deleteError}</p>
          )}
          <input
            maxLength={6}
            value={deletePasscode}
            onChange={(e) =>
              setDeletePasscode(e.target.value.replace(/\D/g, ""))
            }
            className="border px-3 py-2 w-full mb-6 rounded-lg outline-col2"
            placeholder="Enter deletePasscode"
          />
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setShowDelete(false)}
            className="px-4 py-2 border rounded-lg cursor-pointer hover:text-col2"
          >
            Cancel
          </button>

          <button
            disabled={deletePasscode.length !== 6 || loading}
            onClick={deletePocket}
            className="px-4 py-2 bg-col3 text-white rounded-lg cursor-pointer hover:bg-col4  disabled:opacity-50"
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

  const [error, setError] = useState<string | null>(null);

  async function extendPocket() {
    setLoading(true);

    const res = await fetch("/api/pocket/extend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instanceHash,
        expiresIn: expiresIn,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to extend pocket");
      setLoading(false);
      return;
    }

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

        <div>
          {error && <p className="text-col4 font-mono pb-1">{error}</p>}
          <select
            value={expiresIn}
            onChange={(e) => setExpiresIn(Number(e.target.value))}
            className="w-full border px-3 p-2 mb-6 rounded cursor-pointer font-[Raleway] "
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
