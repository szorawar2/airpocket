export default function Navbar() {
  return (
    <nav className="w-100% bg-none flex justify-center align-center ">
      <div className="w-100% max-w-[1420px] grow rounded-lg mx-3 my-4 bg-background ">
        <div className="mx-4 max-w-6xl px py-2 md:py-4 flex flex-col items-center justify-center md:block md:items-stretch md:justify-start">
          <div className="w-40 rounded-lg justify-center items-center flex px-4 py-2">
            <h1 className="text-2xl font-extrabold py-2 text-col4 ">
              AirPocket
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
}
