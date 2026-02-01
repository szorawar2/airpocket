export default function Footer() {
  return (
    <footer className="w-full flex justify-center">
      <div className="w-full max-w-[1420px] border-t border-gray-200 mt-10">
        <div className=" max-w-6xl h-20 px-6 py-4 text-sm text-gray-500">
          © {new Date().getFullYear()} AirPocket | By ZS
        </div>
      </div>
    </footer>
  );
}
