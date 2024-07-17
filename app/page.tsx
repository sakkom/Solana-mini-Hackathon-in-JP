"use client";

import { useEffect, useState } from "react";
import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import { fetchUser } from "@/anchorClient";
import { InitialCard } from "@/components/InitialCard";

export default function Home() {
  const { publicKey, connected } = useWallet();
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
    <div className="flex justify-center items-center h-screen">
      {connected ? (
        <div className="w-1/3">
          {user ? (
            <div>{user?.name}</div>
          ) : (
            <div>
              <h3>profileを作成してください</h3>
              {publicKey && (
                <div>
                  <InitialCard
                    wallet={wallet}
                    connection={connection}
                    publicKey={publicKey}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>wallet が接続されていません。</div>
      )}
    </div>
  );
}
