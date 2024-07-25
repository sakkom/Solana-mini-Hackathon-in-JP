import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import * as metaplex from "@metaplex-foundation/umi";
import { Connection } from "@solana/web3.js";

import idl from "@/idl.json";
import { Program } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";

export const programId = new anchor.web3.PublicKey(
  "H6nb14ncRqiv25UMFk8N9r1bsQEUhkHjjtau9oYdWWaG",
);

export function setProgram(wallet: AnchorWallet, connection: Connection) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new Program(idl as anchor.Idl, programId, provider);

  return program;
}

export function createProvider(wallet: AnchorWallet, connection: Connection) {
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

    const [userPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile-2"), wallet.publicKey.toBytes()],
      program.programId,
    );
    console.log("user pda", userPda.toString());

    return await program.methods
      .createUserProfile(name, genre)
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

  const [userPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user-profile-2"), wallet.publicKey.toBytes()],
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

  const [userPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user-profile-2"), wallet.publicKey.toBytes()],
    program.programId,
  );

  // console.log("user pda", userPda.toString());

  const userAccount = await program.account.userProfile.fetch(userPda);
  // console.log("user profile account data:", (userAccount as any).name);
  return userAccount as any;
}

export async function addUserCollective(
  wallet: AnchorWallet,
  connection: Connection,
  candy: metaplex.PublicKey,
) {
  try {
    const provider = createProvider(wallet, connection);
    if (!provider) return;

    const program = new Program(idl as anchor.Idl, programId, provider);

    const [userPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile-2"), wallet.publicKey.toBytes()],
      program.programId,
    );
    // console.log("user pda", userPda.toString());

    const candy_web3 = new web3.PublicKey(candy);

    return await program.methods
      .addCollective(candy_web3)
      .accounts({
        user: wallet.publicKey,
        userProfile: userPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    // .rpc();
  } catch (err) {
    console.error(err);
  }
}

export async function createHarigamiPda(
  wallet: AnchorWallet,
  connection: Connection,
  creators: web3.PublicKey[],
  candy: metaplex.PublicKey,
) {
  try {
    console.log("harigami pdaを作成するよ");
    const provider = createProvider(wallet, connection);
    if (!provider) return;

    const program = new Program(idl as anchor.Idl, programId, provider);

    const _candy = new web3.PublicKey(candy);

    const [harigamiPda] = web3.PublicKey.findProgramAddressSync(
      [_candy.toBuffer()],
      program.programId,
    );
    console.log("harigami pda", harigamiPda.toString());

    return await program.methods
      .createHarigami(creators)
      .accounts({
        user: wallet.publicKey,
        candy: _candy,
        harigami: harigamiPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  } catch (err) {
    console.error(err);
  }
}

export async function addMedia(
  wallet: AnchorWallet,
  connection: Connection,
  candyParams: string,
  arweaveId: string,
) {
  try {
    const program = setProgram(wallet, connection);
    const candyPubkey = new web3.PublicKey(candyParams);

    const [harigamiPda] = web3.PublicKey.findProgramAddressSync(
      [candyPubkey.toBuffer()],
      program.programId,
    );

    return await program.methods
      .addMedia(arweaveId)
      .accounts({
        harigami: harigamiPda,
        candy: candyPubkey,
      })
      .rpc();
  } catch (err) {
    console.error("not working addMedia", err);
  }
}
