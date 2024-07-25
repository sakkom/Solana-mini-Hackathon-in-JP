"use client";
import { Button } from "@/components/ui/button";
import { fetchCandy } from "@/lib/candyMachine";
import { base64ToBlob, canAddMedia, fetchHarigamiContent } from "@/utils/util";
import { PlusIcon } from "@radix-ui/react-icons";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Page({ params }: { params: { candy: string } }) {
  const router = useRouter();
  const candy = params.candy;
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [collectionMint, setCollectionMint] = useState<any>();
  const [authority, setAuthority] = useState<boolean>(false);
  const [contentIds, setContentIds] = useState<string[]>([]);
  const [decryptUrl, setDecryptUrl] = useState<{ [id: string]: string }>({});
  const [active, setActive] = useState<string>();

  useEffect(() => {
    if (!anchorWallet) return;

    const checkAuthority = async () => {
      const res = await canAddMedia(anchorWallet, connection, candy);
      setAuthority(res);
    };

    checkAuthority();
  }, [anchorWallet, candy, connection]);

  useEffect(() => {
    if (!anchorWallet) return;

    const getContent = async () => {
      const res = await fetchHarigamiContent(anchorWallet, connection, candy);
      setContentIds(res);
    };

    getContent();
  }, [anchorWallet, candy, connection]);

  useEffect(() => {
    if (!anchorWallet) return;

    const fetchCandyInfo = async () => {
      const res = await fetchCandy(anchorWallet, candy);
      setCollectionMint(res.collectionMint);
    };

    fetchCandyInfo();
  }, [anchorWallet, connection, candy]);

  const handleDecrypt = async (arweaveId: string) => {
    if (!anchorWallet || !anchorWallet.publicKey) return;

    if (decryptUrl[arweaveId]) {
      setActive(arweaveId);
      return;
    }

    const formData = new FormData();

    formData.append("arweaveId", arweaveId);
    formData.append("collective", collectionMint.toString());
    formData.append("user", anchorWallet.publicKey?.toString());

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/irys/decode`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push(`/mint/${candy}`);
      }
    }

    if (res.ok) {
      const decryptData = await res.json();
      const blob = base64ToBlob(decryptData, "video/mp4");
      const url = URL.createObjectURL(blob);
      setDecryptUrl((prev) => ({ ...prev, [arweaveId]: url }));
      setActive(arweaveId);
    } else {
      throw new Error("server error");
    }
  };

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
      {contentIds && (
        <div>
          {contentIds.map((id, index) => (
            <div key={index}>
              {active === id && decryptUrl[id] && (
                <video src={decryptUrl[id]} controls width={"100%"} />
              )}
              <a href={`https://devnet.irys.xyz/${id}`}>
                https://devnet.irys.xyz/{id}
              </a>
              <Button size={"sm"} onClick={() => handleDecrypt(id)}>
                再生
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
