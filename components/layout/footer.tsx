export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200">
      <div className="mx-auto max-w-6xl px-6 py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} AirPocket
      </div>
    </footer>
  );
}
