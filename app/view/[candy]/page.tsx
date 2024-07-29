"use client";

import { useEffect, useState } from "react";

import { JacketCard } from "@/components/CollectiveCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCandyInfo } from "@/hooks/useCandyInfo";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useCreators } from "@/hooks/useCreators";
import Image from "next/image";

export default function Page({ params }: { params: { candy: string } }) {
  const candy = params.candy;
  const anchorWallet: any = useAnchorWallet();
  const { connection } = useConnection();
  const candyInfo = useCandyInfo(anchorWallet, candy);
  const creators = useCreators(anchorWallet, connection, candy);
  const [availe, setAvaile] = useState<number>();

  useEffect(() => {
    if (!candyInfo) return;

    const result = candyInfo?.itemsLoaded - Number(candyInfo?.itemsRedeemed);
    console.log(result);
    setAvaile(result);
  }, [candyInfo]);

  return (
    <div className="flex justify-center">
      <div className="w-1/3">
        <div className="flex justify-end gap-1 m-1">
          <p>残り</p>
          <p>{availe}</p>
        </div>

        <Card className="">
          <CardHeader></CardHeader>
          <CardContent className="space-y-5">
            {candy && <JacketCard candy={candy} />}

            <div>
              <Link href={`/view/${candy}/media`}>
                <Button
                  className="w-full bg-transparent"
                  size={"lg"}
                  variant={"outline"}
                >
                  閲覧
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-10">
          <h3 className="text-center">creator</h3>
          {creators && (
            <div>
              {creators.map((creator: any, index) => (
                <Link href={`/profile/${creator.user}`} key={index}>
                  <div className="flex items-center gap-3">
                    <Image src={creator.icon} alt="" width={32} height={32} />
                    <p key={index}>{creator.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
