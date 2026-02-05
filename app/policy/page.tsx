export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-8 text-col4 font-[Open_Sans] bg-background rounded-xl px-12">
      <h1 className="text-3xl font-semibold">Privacy Policy & Terms of Use</h1>
      <p className="text-sm text-gray-500">
        Last updated: 2026-02-01
        {/* {new Date().toLocaleDateString()} */}
      </p>

      <section className="space-y-4">
        <p>
          AirPocket is a temporary file and message sharing service designed for
          short-term use. By using this service, you agree to the terms outlined
          below.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. What AirPocket Stores</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Files you upload</li>
          <li>Text notes you submit</li>
          <li>
            Technical metadata required to operate the service (pocket IDs,
            expiry timestamps)
          </li>
        </ul>
        <p>
          AirPocket does not require user accounts and does not collect personal
          profile information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Pocket Expiry & Retention</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Each pocket has a maximum lifetime of <strong>3 days</strong>
          </li>
          <li>All data is automatically deleted after expiry</li>
          <li>Deleted data is not recoverable</li>
        </ul>
        <p>AirPocket is not intended for long-term storage.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Responsibility for Content</h2>
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
          4. Illegal or Prohibited Content
        </h2>
        <p>
          If we receive a valid legal or abuse report, we may remove content,
          disable a pocket, or comply with lawful requests without notice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Security & Access</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access is controlled via pocket identifiers</li>
          <li>Destructive actions may require a passcode</li>
          <li>Anyone with the pocket link may access its contents</li>
        </ul>
        <p className="font-bold">
          You are responsible for keeping pocket links and passcodes private.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">6. Cookies & Tracking</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>No tracking cookies</li>
          <li>No personal analytics</li>
          <li>No user profiling</li>
        </ul>
        <p>Only minimal functional cookies may be used.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">7. Availability & Data Loss</h2>
        <p>
          The service is provided “as is”. We do not guarantee availability and
          are not responsible for lost or inaccessible data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
        <p>
          This policy may be updated at any time. Continued use means acceptance
          of the latest version.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">9. Contact</h2>
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
