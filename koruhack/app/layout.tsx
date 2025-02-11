import type { Metadata } from "next";
import { Cherry_Bomb_One, Poppins } from "next/font/google";
import "./globals.css";
import Topbar from "@/components/block/Topbar";
import { BottomBar } from "@/components/block/BottomBar";

// If loading a variable font, you don't need to specify the font weight
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
})

const cherryBomb = Cherry_Bomb_One({
  weight: ["400"],
  subsets: ["latin"],
  variable: '--font-cherry-bomb',
})

export const metadata: Metadata = {
  title: "KoruHack",
  description: "KoruHack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${cherryBomb.variable}`}>
      <body
        className={`antialiased w-screen h-screen min-h-screen min-w-screen max-h-[100vh] max-w-[100vw] overflow-hidden`}
      >
        <Topbar />
        {children}
        <BottomBar />
      </body>
    </html>
  );
}
