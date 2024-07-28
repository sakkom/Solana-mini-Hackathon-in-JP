"use client";

import * as web3 from "@solana/web3.js";
import { useEffect, useState } from "react";

const connection = new web3.Connection(
  "https://devnet-rpc.shyft.to?api_key=aEoNRy0ZFiWQX_Lv",
);
const nodeWallet = new web3.PublicKey(
  "HC7xyZvuwMyA6CduUMbAWXmvp4vTmNLUGoPi5xVc3t7P",
);

export default function Page() {
  const [balance, setBalace] = useState<any>();
  const [irysBalance, setIrysBalance] = useState<any>();

  useEffect(() => {
    (async () => {
      let balance = await connection.getBalance(nodeWallet);
      balance = balance / web3.LAMPORTS_PER_SOL;
      setBalace(balance);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:3000/api/irys/balance", {
        method: "GET",
      });

      if (res.ok) {
        const data = await res.json();
        setIrysBalance(data);
      }
    })();
  }, []);

  return (
    <div>
      {balance && (
        <div>
          {balance},,,{irysBalance}
        </div>
      )}
    </div>
  );
}
