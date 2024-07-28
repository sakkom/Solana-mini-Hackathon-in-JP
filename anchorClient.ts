import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import * as metaplex from "@metaplex-foundation/umi";

import idl from "@/idl.json";
import { Program } from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

const USERSEED = process.env.NEXT_PUBLIC_USER_SEED;

export const programId = new anchor.web3.PublicKey(
  "H6nb14ncRqiv25UMFk8N9r1bsQEUhkHjjtau9oYdWWaG",
);

const connection = new web3.Connection(
  "https://devnet-rpc.shyft.to?api_key=aEoNRy0ZFiWQX_Lv",
);

export function setProgram(
  wallet: AnchorWallet | NodeWallet,
  // connection: Connection,
) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new Program(idl as anchor.Idl, programId, provider);

  return program;
}

export function createProvider(
  wallet: AnchorWallet /*connection: Connection*/,
) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);
  return provider;
}

export async function createUser(
  wallet: AnchorWallet,
  name: string,
  genre: number,
) {
  try {
    const program = setProgram(wallet);
    if (!USERSEED) throw new Error("not USERSEED in env");

    const [userPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from(USERSEED), wallet.publicKey.toBytes()],
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
  name: string,
  genre: any, //number, u8
) {
  const program = setProgram(wallet);
  if (!USERSEED) throw new Error("not USERSEED in env");

  const [userPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(USERSEED), wallet.publicKey.toBytes()],
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

export async function fetchUser(wallet: AnchorWallet) {
  const program = setProgram(wallet);
  if (!USERSEED) throw new Error("not USERSEED in env");

  const [userPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(USERSEED), wallet.publicKey.toBytes()],
    program.programId,
  );

  console.log("user pda", userPda.toString());

  const userAccount = await program.account.userProfile.fetch(userPda);
  console.log(userAccount);
  console.log("user profile account data:", (userAccount as any).name);
  return userAccount as any;
}

export async function addUserCollective(
  wallet: AnchorWallet,
  candy: metaplex.PublicKey,
) {
  try {
    const program = setProgram(wallet);
    if (!USERSEED) throw new Error("not USERSEED in env");

    const [userPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from(USERSEED), wallet.publicKey.toBytes()],
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
  creators: web3.PublicKey[],
  candy: metaplex.PublicKey,
) {
  try {
    console.log("harigami pdaを作成するよ");
    const provider = createProvider(wallet);
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
  candyParams: string,
  arweaveId: string,
) {
  try {
    const program = setProgram(wallet);
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

export async function fetchHarigamiCollection(wallet: AnchorWallet) {
  try {
    const program = setProgram(wallet);

    const HARIGAMICOLLECTION = process.env.NEXT_PUBLIC_HARIGAMICOLLECTION;
    if (!HARIGAMICOLLECTION) throw new Error("harigami account env not found");

    const harigamiAccount = new web3.PublicKey(HARIGAMICOLLECTION);

    const data =
      await program.account.harigamiCollection.fetch(harigamiAccount);
    const harigamiCollection = data.collection;

    return harigamiCollection as any;
  } catch (err) {
    console.error("not working fetchHarigamiCollection", err);
  }
}
