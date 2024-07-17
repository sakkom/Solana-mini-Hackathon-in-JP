import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";

import idl from "@/idl.json";
import { Program } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";

const programId = new anchor.web3.PublicKey(
  "H6nb14ncRqiv25UMFk8N9r1bsQEUhkHjjtau9oYdWWaG",
);

function createProvider(wallet: AnchorWallet, connection: Connection) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);
  return provider;
}

export async function createUser(
  wallet: AnchorWallet,
  connection: Connection,
  name: string,
  genre: number,
) {
  try {
    const provider = createProvider(wallet, connection);
    if (!provider) return;

    const program = new Program(idl as anchor.Idl, programId, provider);

    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile"), wallet.publicKey.toBytes()],
      program.programId,
    );
    console.log("user pda", userPda.toString());

    return await program.methods
      .initialize(name, genre)
      .accounts({
        user: wallet.publicKey,
        userProfile: userPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  } catch (err) {
    console.error(err);
  }
}

export async function changeUserProfile(
  wallet: AnchorWallet,
  connection: Connection,
  name: string,
  genre: any, //number, u8
) {
  const provider = createProvider(wallet, connection);
  if (!provider) return;

  const program = new Program(idl as anchor.Idl, programId, provider);

  const [userPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-profile"), wallet.publicKey.toBytes()],
    program.programId,
  );
  console.log("user pda", userPda.toString());

  try {
    return await program.methods
      .changeUserProfile(name, genre)
      .accounts({
        user: wallet.publicKey,
        userProfile: userPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  } catch (err) {
    console.error(err);
  }
}

export async function fetchUser(wallet: AnchorWallet, connection: Connection) {
  const provider = createProvider(wallet, connection);
  const program = new Program(idl as anchor.Idl, programId, provider);

  const [userPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-profile"), wallet.publicKey.toBytes()],
    program.programId,
  );

  // console.log("user pda", userPda.toString());

  const userAccount = await program.account.userProfile.fetch(userPda);
  // console.log("user profile account data:", (userAccount as any).name);

  return userAccount as any;
}
