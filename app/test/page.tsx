"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    VANTA: any;
  }
}

export default function Page() {
  useEffect(() => {
    const handleLoad = () => {
      if (window.VANTA) {
        window.VANTA.FOG({
          el: "#your-element-selector",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          highlightColor: 0xff8585,
          midtoneColor: 0x9945ff,
          lowlightColor: 0xfff000,
          baseColor: 0x14f195,
          blurFactor: 0.77,
          speed: 3.9,
          zoom: 0.8,
        });
      }
    };

    if (typeof window !== "undefined") {
      if (window.VANTA) {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
        return () => window.removeEventListener("load", handleLoad);
      }
    }
  }, []);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="beforeInteractive"
      ></Script>
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js"
        strategy="beforeInteractive"
      ></Script>
      <div
        id="your-element-selector"
        style={{ width: "100vw", height: "100vh" }}
      ></div>
    </>
  );
}
