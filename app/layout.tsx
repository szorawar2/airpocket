import type { Metadata } from "next";
import { Raleway, Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AirPocket",
  description: "Park your files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${raleway.variable} ${openSans.variable} font-[var(--font-raleway)] antialiased bg-background2 min-h-screen `}
      >
        <Navbar></Navbar>
        <div className="min-h-[80vh] flex justify-center align-center">
          {children}
        </div>
        <Footer></Footer>
      </body>
    </html>
  );
}
