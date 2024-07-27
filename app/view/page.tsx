"use client";

import * as web3 from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { fetchHarigamiCollection } from "@/anchorClient";
import { JacketCard } from "@/components/CollectiveCard";
import { publicKey } from "@metaplex-foundation/umi";

export default function Page() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [harigamies, setHarigamies] = useState<web3.PublicKey[]>();

  useEffect(() => {
    if (!wallet) return;

    const fetchHarigamies = async () => {
      const res = await fetchHarigamiCollection(wallet, connection);
      setHarigamies(res);
    };

    fetchHarigamies();
  }, [wallet, connection]);

  return (
    <div className="flex flex-col items-center">
      {harigamies && (
        <div className="w-1/3">
          {harigamies.map((harigami, index) => (
            <div key={index}>
              <JacketCard candy={harigami.toString()} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
