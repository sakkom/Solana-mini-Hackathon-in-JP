import CryptoJS from "crypto-js";
import { hasCollectiveNFT } from "@/utils/util";
import * as web3 from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

export async function POST(request: Request) {
  const formData = await request.formData();
  const arweaveId = formData.get("arweaveId") as string;
  const collective = formData.get("collective") as string;
  const user = formData.get("user") as string;

  const private_key = process.env.PRIVATE_KEY || "";
  if (!private_key) throw new Error("not a private key");
  const keypair = web3.Keypair.fromSecretKey(bs58.decode(private_key));
  const wallet = new NodeWallet(keypair);

  if (!(await hasCollectiveNFT(wallet, user, collective))) {
    return new Response("Let's mint harigami", { status: 401 });
  }

  const secret_key = process.env.AES_KEY;
  if (!secret_key) {
    return new Response("AES key is not found", {
      status: 500,
    });
  }

  const irysUrl = `https://gateway.irys.xyz/${arweaveId}`;

  try {
    const res = await fetch(irysUrl);
    const type = res.headers.get("Content-Type");
    if (!res.ok) {
      throw new Error("error: fetch irys data");
    }

    const encryptedData = await res.text();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, secret_key);
    const base64data = decrypted.toString(CryptoJS.enc.Base64);

    return Response.json({ base64data, type });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
