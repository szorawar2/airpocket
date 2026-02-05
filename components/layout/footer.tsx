import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 mt-10">
      <div className="mx-auto max-w-[1420px] px-6 h-20 flex items-center justify-between text-sm text-gray-500">
        {/* Left */}
        <div>© {new Date().getFullYear()} AirPocket · By ZS</div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <a
            href="mailto:support@airpocket.app"
            className="hover:text-col2 hover:underline"
          >
            support@airpocket.app
          </a>

          <Link href="/policy" className="hover:text-col2 hover:underline">
            Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
