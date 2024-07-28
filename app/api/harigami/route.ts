import { setProgram } from "@/anchorClient";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import * as web3 from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

export async function POST(reqest: Request) {
  try {
    const formData = await reqest.formData();
    const candy = formData.get("candy");
    if (!candy) throw new Error("not a candy");

    const private_key = process.env.PRIVATE_KEY || "";
    if (!private_key) throw new Error("not a private key");

    const keypair = web3.Keypair.fromSecretKey(bs58.decode(private_key));
    const wallet = new NodeWallet(keypair);
    const program = setProgram(wallet);

    const harigamiCollectionStr = process.env.NEXT_PUBLIC_HARIGAMICOLLECTION;
    if (!harigamiCollectionStr)
      throw new Error("not harigami collection in process.env");

    const harigamiCollection = new web3.PublicKey(harigamiCollectionStr);
    const _candy = new web3.PublicKey(candy);

    const tx = await program.methods
      .addHarigamiCollection(_candy)
      .accounts({ harigamiCollection: harigamiCollection })
      .rpc();

    console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    return Response.json(tx);
  } catch (err) {
    console.error("not working add harigami collection");
    return new Response("", { status: 400 });
  }
}
