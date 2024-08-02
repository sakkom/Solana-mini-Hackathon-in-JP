"use client";

import * as web3 from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { fetchUser } from "@/anchorClient";
import { ProfileCard } from "@/components/ProfileCard";
import { AssetWithHarigami, fetchAssetsByYou } from "@/utils/util";
import { useRouter } from "next/navigation";
import { ProfileTab } from "@/components/ProfileTab";

export default function Page() {
  const router = useRouter();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [user, setUser] = useState<any>();
  const [collective, setCollective] = useState<web3.PublicKey[]>();
  const [assets, setAssets] = useState<AssetWithHarigami[]>();

  useEffect(() => {
    if (!wallet || !connection) return;

    const fetchUserPda = async () => {
      try {
        const user = await fetchUser(wallet);
        setUser(user);
      } catch (err) {
        // console.log("pdaが存在していません");
        router.push("/");
      }
    };

    fetchUserPda();
  }, [wallet, connection]);

  useEffect(() => {
    if (!user) return;

    const collective = user.candies.reverse();
    setCollective(collective);
  }, [user]);

  useEffect(() => {
    if (!wallet) return;

    const fetchAssets = async () => {
      const res = await fetchAssetsByYou(wallet, wallet.publicKey);
      setAssets(res);
    };

    fetchAssets();
  }, [wallet, connection]);

  return (
    <div className="flex justify-center ">
      {user ? (
        <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 ">
          <ProfileCard user={user} wallet={wallet} />

          <ProfileTab collective={collective} assets={assets} />
        </div>
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
}
