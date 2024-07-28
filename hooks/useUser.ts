import { fetchUser } from "@/anchorClient";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const useUser = (wallet: AnchorWallet) => {
  const router = useRouter();
  const [user, setUser] = useState<any>();

  useEffect(() => {
    (async () => {
      try {
        const result = await fetchUser(wallet);
        setUser(result);
      } catch (err) {
        console.error("not fetchUser", err);
        router.push("/");
      }
    })();
  }, [wallet]);

  return user;
};
