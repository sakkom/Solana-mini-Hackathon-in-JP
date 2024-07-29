"use client";

import { JacketCard } from "@/components/CollectiveCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCandyInfo } from "@/hooks/useCandyInfo";
import { useUser } from "@/hooks/useUser";
import { mintFromCandyGuard } from "@/lib/candyMachine";
import * as metaplex from "@metaplex-foundation/umi";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { candy: string } }) {
  const router = useRouter();
  const candyPrams = params.candy;
  const wallet = useWallet();
  const candyMachine = useCandyInfo(wallet, candyPrams);
  const [collectionMint, setCollectionMint] = useState<metaplex.PublicKey>();
  const [status, setStatus] = useState<string>("");
  const [availe, setAvaile] = useState<number>();

  useEffect(() => {
    setCollectionMint(candyMachine?.collectionMint);
  }, [candyMachine]);

  useEffect(() => {
    if (!candyMachine) return;

    const result =
      candyMachine?.itemsLoaded - Number(candyMachine?.itemsRedeemed);

    console.log(result);
    setAvaile(result);
  }, [candyMachine]);

  const handleMint = async () => {
    if (!collectionMint) return;

    setStatus("waiting...");

    await mintFromCandyGuard(
      wallet,
      metaplex.publicKey(params.candy),
      collectionMint,
    );

    setStatus("complite!");

    setTimeout(() => {
      router.push(`/profile`);
    }, 10000);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {collectionMint ? (
        <div className="w-1/3">
          <div className="flex justify-center m-5">
            {status === "waiting..." && <p>{status}</p>}
            {status === "complite!" && (
              <p>profileに移動します。アセットを確認してください</p>
            )}
          </div>

          <div className="flex justify-end gap-1 m-1">
            <p>残り</p>
            <p>{availe}</p>
          </div>
          <Card>
            <CardHeader></CardHeader>
            <CardContent className="space-y-5">
              {candyPrams && <JacketCard candy={candyPrams} />}

              <div>
                {availe === 0 ? (
                  <Button onClick={handleMint} className="w-full" disabled>
                    SOLD OUT
                  </Button>
                ) : (
                  <Button onClick={handleMint} className="w-full">
                    MINT
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
}
