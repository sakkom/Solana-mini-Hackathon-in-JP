"use client";

import { useEffect, useState } from "react";

import { JacketCard } from "@/components/CollectiveCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCandyInfo } from "@/hooks/useCandyInfo";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useCreators } from "@/hooks/useCreators";
import Image from "next/image";

export default function Page({ params }: { params: { candy: string } }) {
  const candy = params.candy;
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const creators = useCreators(anchorWallet, connection, candy);

  return (
    <div className="flex justify-center">
      <div className="w-1/3">
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

        <div>
          <h3 className="text-center">creator</h3>
          {creators && (
            <div>
              {creators.map((creator: any, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Image src={creator.icon} alt="" width={32} height={32} />
                  <p key={index}>{creator.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
