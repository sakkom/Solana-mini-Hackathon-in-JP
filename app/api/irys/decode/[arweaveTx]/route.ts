import CryptoJS from "crypto-js";

export async function GET(
  request: Request,
  { params }: { params: { arweaveTx: string } },
) {
  const irysUrl = "https://gateway.irys.xyz";
  const { arweaveTx } = params;

  const res = await fetch(`${irysUrl}/${arweaveTx}`);
  const data = await res.text();

  const secret_key = process.env.AES_KEY;
  if (!secret_key) {
    throw new Error("aes key is not found");
  }

  const decrypted = CryptoJS.AES.decrypt(data, secret_key);
  const base64Image = decrypted.toString(CryptoJS.enc.Base64);

  return Response.json(base64Image);
}
