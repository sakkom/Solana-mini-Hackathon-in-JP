import {
  getMetadataUri,
  umiHarigami,
  createCoreCandyMachine,
} from "@/lib/candyMachine";
import * as metaplex from "@metaplex-foundation/umi";

type harigamiData = {
  coverImage: File[];
};

export const createHarigami = async (
  wallet: any,
  data: harigamiData,
  updateProgress: (progress: number) => void,
  // creator: web3.PublicKey,
): Promise<metaplex.PublicKey | any> => {
  const coverImage = data.coverImage;
  const title = "title in image";

  const umi = umiHarigami(wallet);

  const metaDataUri = await getMetadataUri(umi, coverImage, title);
  updateProgress(1);

  const candyMachineSigner = await createCoreCandyMachine(
    umi,
    metaDataUri,
    title,
  );
  updateProgress(2);

  return candyMachineSigner.publicKey;
};
