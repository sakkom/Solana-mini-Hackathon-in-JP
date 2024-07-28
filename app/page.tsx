"use client";

import { useEffect, useState } from "react";
import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import { fetchUser } from "@/anchorClient";
import { InitialCard } from "@/components/InitialCard";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const { publicKey, connected } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [user, setUser] = useState<any>();
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    if (!wallet || !connection) return;

    const fetchUserPda = async () => {
      try {
        const user = await fetchUser(wallet);
        setUser(user);
        router.push("/profile");
      } catch (err) {
        console.log("pdaが存在していません");
        setShow(true);
      }
    };

    fetchUserPda();
  }, [wallet, connection]);

  return (
    <div className="flex justify-center items-center h-screen">
      {connected ? (
        <div className="w-1/3">
          {!user && (
            <div>
              {publicKey && show && (
                <div>
                  <InitialCard wallet={wallet} publicKey={publicKey} />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
}
