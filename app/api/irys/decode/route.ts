import CryptoJS from "crypto-js";
import { hasCollectiveNFT } from "@/utils/util";

export async function POST(request: Request) {
  const formData = await request.formData();
  const arweaveId = formData.get("arweaveId") as string;
  const collective = formData.get("collective") as string;
  const user = formData.get("user") as string;

  if (!(await hasCollectiveNFT(user, collective))) {
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
    if (!res.ok) {
      throw new Error("error: fetch irys data");
    }

    const encryptedData = await res.text();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, secret_key);
    const base64Image = decrypted.toString(CryptoJS.enc.Base64);

    return Response.json(base64Image);
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
