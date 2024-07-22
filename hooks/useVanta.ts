"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    VANTA: any;
  }
}

export const useVanta = () => {
  const bodyRef = useRef<HTMLDivElement>(null);
  let vantaEffect: any = null;

  useEffect(() => {
    const handleLoad = () => {
      if (window.VANTA) {
        vantaEffect = window.VANTA.FOG({
          el: bodyRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          highlightColor: 0xff8585,
          midtoneColor: 0x9945ff,
          lowlightColor: 0xfff000,
          baseColor: 0x14f195,
          blurFactor: 1.1,
          speed: 1.5,
          zoom: 0.5,
        });
      }
    };

    if (typeof window !== "undefined") {
      if (window.VANTA) {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
        return () => {
          window.removeEventListener("load", handleLoad);
          if (vantaEffect) vantaEffect.destroy();
        };
      }
    }
  }, []);

  return bodyRef;
};
