import { fetchCandy } from "@/lib/candyMachine";
import { useEffect, useState } from "react";
import { CandyMachine } from "@metaplex-foundation/mpl-core-candy-machine";

export const useCandyInfo = (wallet: any, candyParams: string) => {
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  useEffect(() => {
    if (!wallet) return;

    const fetchCandyInfo = async () => {
      const res = await fetchCandy(candyParams);
      setCandyMachine(res);
    };

    fetchCandyInfo();
  }, [wallet, candyParams]);

  return candyMachine;
};
