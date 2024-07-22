"use client";

import * as web3 from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import { Card } from "./ui/card";
import { fetchJacket } from "@/utils/util";
import Link from "next/link";
import { publicKey } from "@metaplex-foundation/umi";

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
  const [imgUrl, setImgUrl] = useState<string>();
  const [status, setStatus] = useState<string>("loading");

  useEffect(() => {
    const fetchJacketImage = async () => {
      const res = await fetchJacket(candy);
      setImgUrl(res);
      setStatus("loaded");
    };

    fetchJacketImage();
  }, [candy]);

  return (
    <div>
      {status === "loaded" ? (
        <div>
          {" "}
          <Link href={`/view/${candy.toString()}`}>
            <Card className="bg-transparent p-3 ">
              {imgUrl && (
                <img src={imgUrl} className="aspect-square object-cover" />
              )}
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
