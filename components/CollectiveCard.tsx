"use client";

import * as web3 from "@solana/web3.js";
import { FC } from "react";
import { Card } from "./ui/card";
import { fetchJacket } from "@/utils/util";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { JacketCube } from "./JacketCube";

interface CollectiveCartProps {
  collective: web3.PublicKey[];
}

export const CollectiveCard: FC<CollectiveCartProps> = ({ collective }) => {
  return (
    <div className="flex flex-wrap">
      {collective?.map((item, index) => (
        <div key={index} className="w-1/2">
          <JacketCard candy={item.toString()} />
        </div>
      ))}
    </div>
  );
};

interface JacketCardProps {
  candy: string;
}

export const JacketCard: FC<JacketCardProps> = ({ candy }) => {
  const { data: imgUrls, status } = useQuery({
    queryKey: ["jacket", candy],
    queryFn: () => fetchJacket(candy),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });

  return (
    <div>
      {status === "success" ? (
        <div>
          {" "}
          <Link href={`/view/${candy.toString()}`}>
            <Card className="bg-transparent p-3 bg-black">
              {imgUrls && <JacketCube urls={imgUrls} />}
            </Card>
          </Link>
        </div>
      ) : (
        <div>
          <Card className="bg-transparent aspect-square flex justify-center items-center">
            loading...
          </Card>
        </div>
      )}
    </div>
  );
};
