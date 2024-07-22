"use client";

import * as web3 from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { fetchUser } from "@/anchorClient";
import { ProfileCard } from "@/components/ProfileCard";
import { InitialCard } from "@/components/InitialCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAssetsByYou } from "@/lib/candyMachine";
import { AssetV1 } from "@metaplex-foundation/mpl-core";
import { CollectiveCard } from "@/components/CollectiveCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function Page() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [user, setUser] = useState<any>();
  const [collective, setCollective] = useState<web3.PublicKey[]>();
  const [assets, setAssets] = useState<AssetV1[]>();

  useEffect(() => {
    if (!wallet || !connection) return;

    const fetchUserPda = async () => {
      try {
        const user = await fetchUser(wallet, connection);
        setUser(user);
      } catch (err) {
        console.log("pdaが存在していません");
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
      const res = await fetchAssetsByYou(wallet.publicKey);
      setAssets(res);
    };

    fetchAssets();
  }, [wallet, connection]);

  return (
    <div className="flex justify-center ">
      {connection && user ? (
        <div className="w-1/3 ">
          <ProfileCard user={user} wallet={wallet} connection={connection} />

          <div className="w-full">
            <Tabs defaultValue="collective">
              <TabsList className="w-full gap-10">
                <TabsTrigger value="collective">Collective</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
              </TabsList>
              <TabsContent value="collective">
                <Card>
                  <CardHeader>
                    <Link href={`/create`} className="flex justify-end">
                      <Button size={"sm"}>
                        <PlusIcon />
                        create
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {collective && collective.length > 0 ? (
                      <CollectiveCard collective={collective} />
                    ) : (
                      <div>loading...</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="assets">
                {assets && (
                  <div>
                    {assets.map((asset: AssetV1, index: any) => (
                      <div key={index}>
                        <div>{asset.publicKey}</div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div>
          loading...
          {/* <InitialCard
            wallet={wallet}
            connection={connection}
            publicKey={wallet?.publicKey}
          /> */}
        </div>
      )}
    </div>
  );
}
