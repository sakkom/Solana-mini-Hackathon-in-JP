"use client";
import { Button } from "@/components/ui/button";
import { canAddMedia } from "@/utils/util";
import { PlusIcon } from "@radix-ui/react-icons";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Page({ params }: { params: { candy: string } }) {
  const candy = params.candy;
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [authority, setAuthority] = useState<boolean>(false);

  useEffect(() => {
    if (!anchorWallet) return;

    const checkAuthority = async () => {
      const res = await canAddMedia(anchorWallet, connection, candy);
      setAuthority(res);
    };

    checkAuthority();
  }, [anchorWallet, candy, connection]);

  return (
    <div>
      {authority && (
        <div>
          <Link href={`/create/${candy}`}>
            <Button size={"sm"}>
              <PlusIcon />
              create
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
