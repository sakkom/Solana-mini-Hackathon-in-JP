import { getIrys } from "@/lib/irys";
import CryptoJS from "crypto-js";
import { del } from "@vercel/blob";

export async function POST(request: Request) {
  const { uri, type } = await request.json();
  const irys = await getIrys();

  let tags;
  if (type === "video/mp4" || type === "image/gif") {
    tags = [{ name: "Content-Type", value: type }];
  }

  const res = await fetch(uri);
  const blob = await res.blob();
  const blobArrayBuffer = await blob.arrayBuffer();

  const wordArray = CryptoJS.lib.WordArray.create(blobArrayBuffer);

  const secret_key = process.env.AES_KEY;
  if (!secret_key) {
    throw new Error("aes key is not found");
  }

  const encrypted = CryptoJS.AES.encrypt(wordArray, secret_key).toString();

  const receipt = await irys.upload(encrypted, { tags: tags });
  console.log(`File uploaded ===> https://gateway.irys.xyz/${receipt.id}`);

  await del(uri);
  return Response.json(receipt.id);
}
