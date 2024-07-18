"use client";

import * as web3 from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { fetchUser } from "@/anchorClient";
import { ProfileCard } from "@/components/ProfileCard";
import { InitialCard } from "@/components/InitialCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function Page() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [user, setUser] = useState<any>();

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
                  <a href={"/create"}>create harigami</a>
                </Card>
                <Card>
                  <CardTitle>candies</CardTitle>
                  <CardContent>
                    {user.candies.map((candy: web3.PublicKey) => (
                      <div>{candy.toString()}</div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="assets">foo</TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div>
          <InitialCard
            wallet={wallet}
            connection={connection}
            publicKey={wallet?.publicKey}
          />
        </div>
      )}
    </div>
  );
}
