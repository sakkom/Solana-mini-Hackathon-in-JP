import { getIrys } from "@/lib/irys";
import CryptoJS from "crypto-js";

export async function POST(request: Request) {
  const irys = await getIrys();
  const formData = await request.formData();
  const video = formData.get("content");
  const tags = [{ name: "Content-Type", value: "text/plain" }];

  if (video && video instanceof File) {
    const videoArrayBuffer = await video.arrayBuffer();

    const wordArray = CryptoJS.lib.WordArray.create(videoArrayBuffer);

    const secret_key = process.env.AES_KEY;
    if (!secret_key) {
      throw new Error("aes key is not found");
    }

    const encrypted = CryptoJS.AES.encrypt(wordArray, secret_key).toString();

    const receipt = await irys.upload(encrypted, { tags: tags });
    console.log(`File uploaded ===> https://gateway.irys.xyz/${receipt.id}`);
  }

  return Response.json("process video");
}
