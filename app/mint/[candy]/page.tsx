"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCandyInfo } from "@/hooks/useCandyInfo";
import { mintFromCandyGuard } from "@/lib/candyMachine";
import * as metaplex from "@metaplex-foundation/umi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { candy: string } }) {
  const candyPrams = params.candy;
  const wallet = useWallet();
  const candyMachine = useCandyInfo(wallet, candyPrams);
  const [collectionMint, setCollectionMint] = useState<metaplex.PublicKey>();

  useEffect(() => {
    setCollectionMint(candyMachine?.collectionMint);
  }, [candyMachine]);

  const handleMint = async () => {
    if (!collectionMint) return;

    await mintFromCandyGuard(
      wallet,
      metaplex.publicKey(params.candy),
      collectionMint,
    );
  };

  return (
    <div>
      {collectionMint && (
        <Card>
          <Button onClick={handleMint}>Mint</Button>
        </Card>
      )}
    </div>
  );
}
