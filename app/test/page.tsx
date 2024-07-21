"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState<string>();
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        "https://gateway.irys.xyz/sGVv037i4Lf8rFvUXf2LQZ1qduK9yzYW4NCzbtxO0kY",
      );
      const videoArrayBuffer = await res.arrayBuffer();
      const blob = new Blob([videoArrayBuffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* {imageUrl ? <img src={imageUrl} alt="decrypted" /> : <p>loading</p>} */}
      {imageUrl ? <video src={imageUrl} controls /> : <p>loading</p>}
    </div>
  );
}
