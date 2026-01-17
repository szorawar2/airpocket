"use client";

import { useState } from "react";
import MessageDisplay from "./MessageDisplay";
import InputBar from "./InputBar";

export default function ClientPage({
  instanceHash,
  pocketId,
}: {
  instanceHash: string;
  pocketId: string;
}) {
  //Delete Pocket
  const [showDelete, setShowDelete] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);

  //Message Display refresh
  const [refreshKey, setRefreshKey] = useState<number>(0);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Pocket {pocketId}</h1>

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
              await fetch("/api/pocket/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instanceHash, passcode }),
              });
              window.location.href = "/";
            }}
          />
        )}

        <button>Extend pocket</button>
        <button>Burn files on download</button>
        <button>Create QR</button>
      </div>

      <MessageDisplay instanceHash={instanceHash} refreshKey={refreshKey} />

      <InputBar instanceHash={instanceHash} setRefreshKey={setRefreshKey} />
    </div>
  );

  // function DeletePopup() {
  //   return (
  //     <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
  //       <div className="bg-white p-6 rounded space-y-4">
  //         <h2 className="font-semibold">Delete pocket</h2>

  //         <input
  //           maxLength={6}
  //           value={passcode}
  //           onChange={(e) => setPasscode(e.target.value)}
  //           className="border px-3 py-2 w-full"
  //           placeholder="Enter passcode"
  //         />

  //         <div className="flex gap-2">
  //           <button
  //             onClick={() => setShowDelete(false)}
  //             className="px-4 py-2 border"
  //           >
  //             Cancel
  //           </button>

  //           <button
  //             disabled={passcode.length !== 6 || loading}
  //             onClick={async () => {
  //               setLoading(true);
  //               await fetch("/api/pocket/delete", {
  //                 method: "POST",
  //                 headers: { "Content-Type": "application/json" },
  //                 body: JSON.stringify({ instanceHash, passcode }),
  //               });
  //               window.location.href = "/";
  //             }}
  //             className="px-4 py-2 bg-red-600 text-white"
  //           >
  //             Delete
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
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
