import {
  getMetadataUri,
  createCoreCollection,
  createCandyMachine,
  addItems,
} from "@/lib/candyMachine";
import * as metaplex from "@metaplex-foundation/umi";

type harigamiData = {
  coverImage: File;
  title: string;
};

export const createHarigami = async (
  wallet: any,
  data: harigamiData,
  // creator: web3.PublicKey,
): Promise<metaplex.PublicKey> => {
  const coverImage: File = data.coverImage;
  const title = data.title;

  const metaDataUri = await getMetadataUri(wallet, coverImage, title);

  const collectionSigner = await createCoreCollection(
    wallet,
    metaDataUri,
    title,
  );

  const candyMachineSigner = await createCandyMachine(
    wallet,
    collectionSigner,
    metaDataUri,
  );

  await addItems(wallet, candyMachineSigner); //test 10

  console.log(
    `
      Important Account \n
      Core Collection: ${collectionSigner?.publicKey} \n
      Candy Machine: ${candyMachineSigner?.publicKey} \n
    `,
  );

  return candyMachineSigner.publicKey;
};
