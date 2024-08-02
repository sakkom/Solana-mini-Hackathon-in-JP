"use client";

import * as web3 from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { setProgram } from "@/anchorClient";
import { ProfileCard } from "@/components/ProfileCard";
import { AssetWithHarigami, fetchAssetsByYou } from "@/utils/util";
import { ProfileTab } from "@/components/ProfileTab";

export default function Page({ params }: { params: { userPda: string } }) {
  const userPda = params.userPda;
  const wallet = useAnchorWallet();
  const [user, setUser] = useState<any>();
  const [collective, setCollective] = useState<web3.PublicKey[]>();
  const [assets, setAssets] = useState<AssetWithHarigami[]>();

  useEffect(() => {
    if (!wallet) return;

    (async () => {
      const program = setProgram(wallet);

      const userProfile = await program.account.userProfile.fetch(userPda);

      setUser(userProfile);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;

    const collective = user.candies.reverse();
    setCollective(collective);
  }, [user]);

  useEffect(() => {
    if (!wallet || !user) return;

    const owner = user.authority.toString();

    const fetchAssets = async () => {
      const res = await fetchAssetsByYou(wallet, owner);
      setAssets(res);
    };

    fetchAssets();
  }, [wallet, user]);

  return (
    <div className="flex justify-center ">
      {user ? (
        <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
          <ProfileCard user={user} wallet={wallet} />

          <ProfileTab collective={collective} assets={assets} />
        </div>
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
}
