"use client";
import { useState, useEffect } from "react";

import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { setProgram } from "@/anchorClient";
import { genreNumberToObject } from "@/utils/util";

const USERSEED = process.env.NEXT_PUBLIC_USER_SEED;
if (!USERSEED) {
  throw new Error("User seed is not defined in environment variables");
}

export const useCreators = (
  anchorWallet: AnchorWallet | undefined,
  connection: web3.Connection,
  candyParams: string,
) => {
  const [creators, setCreators] = useState<{ name: string; icon: string }[]>();

  useEffect(() => {
    if (!anchorWallet) {
      return;
    }

    const fetchCreators = async () => {
      const candyPubkey = new web3.PublicKey(candyParams);

      const program = setProgram(anchorWallet);

      const [harigamiPda] = web3.PublicKey.findProgramAddressSync(
        [candyPubkey.toBuffer()],
        program.programId,
      );

      const harigami: any = await program.account.harigami.fetch(harigamiPda);
      const creators = harigami.creators;

      const creatorsDataPromises = creators.map(
        async (creator: web3.PublicKey) => {
          const [userPrfilePda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from(USERSEED), creator.toBuffer()],
            program.programId,
          );
          const userProfile: any =
            await program.account.userProfile.fetch(userPrfilePda);
          const icon = genreNumberToObject(userProfile.genre);

          return {
            user: userPrfilePda,
            name: userProfile.name,
            icon: icon,
          };
        },
      );

      const resolvedCreatorsData = await Promise.all(creatorsDataPromises);
      setCreators(resolvedCreatorsData);
    };

    fetchCreators();
  }, [anchorWallet, connection, candyParams]);

  return creators;
};
