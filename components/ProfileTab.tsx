import * as web3 from "@solana/web3.js";
import { FC } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AssetWithHarigami } from "@/utils/util";
import { CollectiveCard } from "@/components/CollectiveCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { UserAsset } from "@/components/UserAssets";

interface ProfileTabProps {
  collective: web3.PublicKey[] | undefined;
  assets: AssetWithHarigami[] | undefined;
}

export const ProfileTab: FC<ProfileTabProps> = ({ collective, assets }) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="collective">
        <TabsList className="w-full gap-10 bg-black ">
          <TabsTrigger value="collective" className="text-white">
            Collective
          </TabsTrigger>
          <TabsTrigger value="assets" className="text-white">
            Assets
          </TabsTrigger>
        </TabsList>
        <TabsContent value="collective">
          <Card>
            <CardHeader>
              <Link href={`/create`} className="flex justify-end gap-1">
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
                ""
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assets">
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              {assets && (
                <div>
                  {assets.map((harigami: AssetWithHarigami, index: any) => (
                    <UserAsset key={index} harigami={harigami} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
