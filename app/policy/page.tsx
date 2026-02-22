export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-8 text-col4 font-[Open_Sans] bg-background rounded-xl px-12">
      <h1 className="text-3xl font-semibold">Privacy Policy & Terms of Use</h1>
      <p className="text-sm text-gray-500">Last updated: 2026-02-01</p>

      <section className="space-y-4">
        <p>
          AirPocket is a temporary file and message sharing service designed for
          short-term, secure transfers. By using this service, you agree to the
          terms outlined below.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          1. Encryption & Security Model
        </h2>
        <p>
          Files and messages uploaded to AirPocket are encrypted before storage.
          Decryption requires the correct access credentials associated with the
          pocket.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Encryption is designed to prevent unauthorized access</li>
          <li>
            Access requires the pocket link and, where applicable, a passcode
          </li>
          <li>AirPocket cannot recover lost passcodes</li>
        </ul>
        <p className="font-bold">
          If you lose your passcode, your files cannot be decrypted or
          recovered. There is no reset mechanism.
        </p>
        <p>
          You are solely responsible for securely storing and remembering your
          passcode.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. What AirPocket Stores</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Encrypted files you upload</li>
          <li>Encrypted text notes you submit</li>
          <li>
            Technical metadata required to operate the service (pocket IDs,
            expiry timestamps, file size data)
          </li>
        </ul>
        <p>
          AirPocket does not require user accounts and does not collect personal
          profile information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. File Size Limits</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Files may be subject to maximum size limits</li>
          <li>Uploads exceeding the limit will be rejected</li>
          <li>Limits may change without prior notice</li>
        </ul>
        <p>
          AirPocket is intended for temporary transfers, not bulk storage or
          archival use.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Pocket Expiry & Retention</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Each pocket has a maximum lifetime of <strong>3 days</strong>
          </li>
          <li>All data is automatically deleted after expiry</li>
          <li>Deleted data is permanently removed</li>
        </ul>
        <p className="font-bold">
          Expired or deleted pockets cannot be restored.
        </p>
        <p>AirPocket is not intended for long-term storage.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Responsibility for Content</h2>
        <p>All content uploaded to AirPocket is user-generated.</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>You are solely responsible for uploaded content</li>
          <li>You must not upload illegal or infringing material</li>
          <li>AirPocket does not claim ownership of your content</li>
        </ul>
        <p>AirPocket does not actively monitor uploaded content.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          6. Illegal or Prohibited Content
        </h2>
        <p>
          If we receive a valid legal or abuse report, we may remove content,
          disable a pocket, or comply with lawful requests without notice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">7. Access Control</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access is controlled via unique pocket identifiers</li>
          <li>Anyone with the pocket link may access its contents</li>
          <li>Destructive actions may require a passcode</li>
        </ul>
        <p className="font-bold">
          You are responsible for keeping pocket links and passcodes private.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">8. Cookies & Tracking</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>No tracking cookies</li>
          <li>No personal analytics</li>
          <li>No user profiling</li>
        </ul>
        <p>Only minimal functional cookies may be used.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">9. Availability & Data Loss</h2>
        <p>
          The service is provided “as is”. We do not guarantee availability,
          uptime, or uninterrupted access.
        </p>
        <p>
          AirPocket is not responsible for lost, inaccessible, corrupted, or
          unrecoverable data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
        <p>
          This policy may be updated at any time. Continued use means acceptance
          of the latest version.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">11. Contact</h2>
        <p>
          Support:{" "}
          <a
            href="mailto:support@airpocket.app"
            className="text-col2 underline"
          >
            support@airpocket.app
          </a>
        </p>
      </section>
    </div>
  );
}
