"use client";

import Script from "next/script";
import { useVanta } from "@/hooks/useVanta";

export const BackGround = () => {
  const vantaRef = useVanta();

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10" ref={vantaRef}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="beforeInteractive"
      ></Script>
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js"
        strategy="beforeInteractive"
      ></Script>
    </div>
  );
};
