"use client";

import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AppWalletProvider } from "@/context/AppWalletProvider";
import { AppBar } from "@/components/AppBar";
import { useVanta } from "@/hooks/useVanta";

const poppins = Poppins({ weight: "600", subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyRef = useVanta();

  return (
    <html lang="en">
      <AppWalletProvider>
        <body
          ref={bodyRef}
          className={poppins.className}
          style={{ margin: 0, padding: 0 }}
        >
          <AppBar />
          <Script
            src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
            strategy="beforeInteractive"
          ></Script>
          <Script
            src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js"
            strategy="beforeInteractive"
          ></Script>
          {children}
        </body>
      </AppWalletProvider>
    </html>
  );
}
