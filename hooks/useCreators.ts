"use client";
import { useState, useEffect } from "react";

import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { setProgram } from "@/anchorClient";
import { genreNumberToObject } from "@/utils/util";

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

      const program = setProgram(anchorWallet, connection);

      const [harigamiPda] = web3.PublicKey.findProgramAddressSync(
        [candyPubkey.toBuffer()],
        program.programId,
      );

      const harigami: any = await program.account.harigami.fetch(harigamiPda);
      const creators = harigami.creators;

      const creatorsDataPromises = creators.map(
        async (creator: web3.PublicKey) => {
          const [userPrfilePda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("user-profile-2"), creator.toBuffer()],
            program.programId,
          );
          const userProfile: any =
            await program.account.userProfile.fetch(userPrfilePda);
          const icon = genreNumberToObject(userProfile.genre);

          return {
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
