"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCandy } from "@/lib/candyMachine";
import { base64ToBlob, canAddMedia, fetchHarigamiContent } from "@/utils/util";
import { PlusIcon } from "@radix-ui/react-icons";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

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
  const [loading, setLoading] = useState<string | null>(null);

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
      const res = await fetchCandy(candy);
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

    setLoading(arweaveId);

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
      setLoading(null);
    } else {
      throw new Error("server error");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Card className="w-1/3 ">
        {authority && (
          <div className="p-5">
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
              <Card key={index} className="m-3">
                <CardHeader>
                  <div className="flex  items-center gap-5 ">
                    <Image
                      src={"/icons/music-album.png"}
                      alt=""
                      width={32}
                      height={32}
                    />
                    <a
                      href={`https://devnet.irys.xyz/${id}`}
                      className="truncate"
                    >
                      https://devnet.irys.xyz/{id}
                    </a>
                    <Button
                      size={"sm"}
                      onClick={() => handleDecrypt(id)}
                      className={` ${decryptUrl[id] ? "bg-pink-400" : ""} `}
                    >
                      再生
                    </Button>
                  </div>
                </CardHeader>
                {loading === id && (
                  <CardContent>
                    <div className="flex justify-center items-center">
                      loading...
                    </div>
                  </CardContent>
                )}
                {active === id && decryptUrl[id] && (
                  <CardContent>
                    <video
                      src={decryptUrl[id]}
                      controls
                      width={"100%"}
                      className="rounded-md"
                    />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
