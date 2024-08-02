"use client";

import * as web3 from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { fetchHarigamiCollection } from "@/anchorClient";
import { JacketCard } from "@/components/CollectiveCard";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [harigamies, setHarigamies] = useState<web3.PublicKey[]>();

  useEffect(() => {
    if (!wallet) return;

    const fetchHarigamies = async () => {
      const res = await fetchHarigamiCollection(wallet);
      setHarigamies(res);
    };

    fetchHarigamies();
  }, [wallet, connection]);

  return (
    <div className="flex flex-col items-center">
      {harigamies && (
        <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
          <Card className="">
            <CardContent>
              {harigamies.map((harigami, index) => (
                <div key={index}>
                  <JacketCard candy={harigami.toString()} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
