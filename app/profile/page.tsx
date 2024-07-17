"use client";

import { useEffect, useState } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { fetchUser } from "@/anchorClient";
import { ProfileCard } from "@/components/ProfileCard";
import { InitialCard } from "@/components/InitialCard";

export default function Page() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [user, setUser] = useState<any>();

  useEffect(() => {
    if (!wallet || !connection) return;

    const fetchUserPda = async () => {
      try {
        const user = await fetchUser(wallet, connection);
        const user_genre = user.genre;
        console.log(user_genre);
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
