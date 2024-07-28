"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FC } from "react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const AppBar: FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex px-5 gap-5">
        <Link href={`/view`}>
          <p className="cursor-pointer">top</p>
        </Link>
        <Separator orientation="vertical" className="h-5" />
        <Link href={`/profile`}>
          <p className="cursor-pointer">profile</p>
        </Link>
      </div>

      <WalletMultiButton style={{}} />
    </div>
  );
};
