"use client";

import { JacketCard } from "@/components/CollectiveCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCandyInfo } from "@/hooks/useCandyInfo";
import { mintFromCandyGuard } from "@/lib/candyMachine";
import * as metaplex from "@metaplex-foundation/umi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { candy: string } }) {
  const router = useRouter();
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

    router.push(`/view/${candyPrams}`);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {collectionMint ? (
        <Card className="w-1/3">
          <CardHeader></CardHeader>
          <CardContent className="space-y-5">
            {candyPrams && <JacketCard candy={candyPrams} />}

            <div>
              <Button onClick={handleMint} className="w-full">
                Mint
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
}
