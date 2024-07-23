import * as web3 from "@solana/web3.js";
import * as metaplex from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  KeypairSigner,
  some,
  sol,
  TransactionBuilderSendAndConfirmOptions,
  transactionBuilder,
  PublicKey,
  createGenericFileFromBrowserFile,
  publicKey,
  Umi,
} from "@metaplex-foundation/umi";
import {
  mplCore,
  createCollectionV1,
  fetchAssetsByOwner,
} from "@metaplex-foundation/mpl-core";
import {
  create,
  addConfigLines,
  mplCandyMachine as mplCoreCandyMachine,
  mintV1,
  CandyMachine,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

interface Attributes {
  trait_type?: string;
  value?: string;
}

interface Properties {
  files?: AttachedFile[];
  category: string;
}

interface AttachedFile {
  uri?: string;
  type?: string;
  cdn?: boolean;
}

export interface MetaData {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  attributes: Attributes[];
  properties?: Properties;
}
//change for a production environment.
const options: TransactionBuilderSendAndConfirmOptions = {
  send: { skipPreflight: true },
  confirm: { commitment: "processed" },
};

function umiIdentityProvider(wallet: any) {
  const umi = createUmi(web3.clusterApiUrl("devnet")).use(
    walletAdapterIdentity(wallet),
  );
  return umi;
}

export function umiHarigami(wallet: any) {
  const umi = createUmi(web3.clusterApiUrl("devnet"))
    .use(walletAdapterIdentity(wallet))
    .use(irysUploader())
    .use(mplCore())
    .use(mplCoreCandyMachine());
  return umi;
}

export async function getMetadataUri(
  umi: Umi,
  coverImage: File,
  title: string,
) {
  const genericFile = await createGenericFileFromBrowserFile(coverImage);
  //content type

  const [imageUri] = await umi.uploader.upload([genericFile]);
  // console.log("署名: imageUri");
  const uri = await umi.uploader.uploadJson({
    name: title,
    description: "Generative art on Solana.",
    image: imageUri,
    animation_url: "",
    external_url: "https://example.com",
    attributes: [
      {
        trait_type: "Genre",
        value: "no genre",
      },
    ],
  });
  // console.log("署名: uri");

  return uri;
}

export async function createCollectionIx(
  umi: Umi,
  collectionSigner: KeypairSigner,
  uri: string,
  title: string,
) {
  return createCollectionV1(umi, {
    collection: collectionSigner,
    name: title, //nameをuri.nameと同一にする　これがCandy Machineの名前となるから。
    uri: uri,
  });
}

export async function createCandyIx(
  umi: Umi,
  candyMachineSigner: KeypairSigner,
  collectionSigner: KeypairSigner,
  uri: string,
) {
  return create(umi, {
    candyMachine: candyMachineSigner,
    collection: collectionSigner.publicKey,
    collectionUpdateAuthority: umi.identity,
    itemsAvailable: 10,
    authority: umi.identity.publicKey,
    isMutable: true,
    configLineSettings: some({
      prefixName: "harigami #",
      nameLength: 20,
      prefixUri: uri,
      uriLength: 30,
      isSequential: false,
    }),
    guards: {
      botTax: some({ lamports: sol(0.001), lastInstruction: true }),
    },
  });
}

export async function createAddConfigIx(
  umi: Umi,
  candyMachineSigner: KeypairSigner,
) {
  return addConfigLines(umi, {
    candyMachine: candyMachineSigner.publicKey,
    index: 0,
    configLines: [
      { name: "", uri: "" },
      { name: "", uri: "" },
      { name: "", uri: "" },
      { name: "", uri: "" },
      { name: "", uri: "" },
      { name: "", uri: "" },
      { name: "", uri: "" },
      { name: "", uri: "" },
      { name: "", uri: "" },
      { name: "", uri: "" },
    ],
  });
}

export async function createCoreCandyMachine(
  umi: Umi,
  uri: string,
  title: string,
) {
  const collectionSigner = generateSigner(umi);
  const candyMachineSigner = generateSigner(umi);

  const collectionIx = await createCollectionIx(
    umi,
    collectionSigner,
    uri,
    title,
  );
  const candyIx = await createCandyIx(
    umi,
    candyMachineSigner,
    collectionSigner,
    uri,
  );
  const addConfigTx = await createAddConfigIx(umi, candyMachineSigner);

  let builder = transactionBuilder()
    .add(collectionIx)
    .add(candyIx)
    .add(addConfigTx);

  const { signature } = await builder.sendAndConfirm(umi);
  console.log(`corecandy tx: ${base58.deserialize(signature)[0]}`);
  // console.log(
  //   `
  //     Important Account \n
  //     Core Collection: ${collectionSigner?.publicKey} \n
  //     Candy Machine: ${candyMachineSigner?.publicKey} \n
  //   `,
  // );
  return candyMachineSigner;
}

export async function mintFromCandyGuard(
  wallet: any,
  candyMachineId: PublicKey,
  collectionId: PublicKey,
): Promise<any> {
  const umi = umiIdentityProvider(wallet);
  umi.use(mplCoreCandyMachine());

  const assetSigner = generateSigner(umi);

  const { signature } = await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 800_000 }))
    .add(
      mintV1(umi, {
        candyMachine: candyMachineId,
        asset: assetSigner,
        collection: collectionId,
      }),
    )
    .sendAndConfirm(umi, options);

  console.log(
    `OK! signature: ${base58.deserialize(signature)[0]}\ Asset Id: ${assetSigner.publicKey}`,
  );

  return assetSigner;
}

export async function fetchCandy(
  wallet: any,
  candy_str: string,
): Promise<CandyMachine> {
  const umi = umiIdentityProvider(wallet);
  umi.use(mplCoreCandyMachine());

  console.log("Fol");
  const CM = await fetchCandyMachine(umi, publicKey(candy_str));

  return CM;
}

export async function fetchAssetsByYou(owner: web3.PublicKey | string) {
  const umi = createUmi(web3.clusterApiUrl("devnet"));
  const assets = await fetchAssetsByOwner(umi, publicKey(owner), {
    skipDerivePlugins: false,
  });

  return assets;
}
