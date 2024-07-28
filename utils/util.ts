import * as web3 from "@solana/web3.js";
import {
  AssetV1,
  fetchAssetsByOwner,
  fetchCollectionV1,
} from "@metaplex-foundation/mpl-core";
import { PublicKey, publicKey } from "@metaplex-foundation/umi";
import {
  CandyMachine,
  fetchCandyMachine,
  mplCandyMachine as mplCoreCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { fetchHarigamiCollection, setProgram } from "@/anchorClient";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { fetchCandy } from "@/lib/candyMachine";

export const iconOptions = [
  { value: "0", src: "/icons/guest.png", label: "guest" },
  { value: "1", src: "/icons/skateboard.png", label: "skater" },
  { value: "2", src: "/icons/hip-hop.png", label: "dancer" },
  { value: "3", src: "/icons/bmx.png", label: "rider" },
  { value: "4", src: "/icons/wall.png", label: "parkour-traceur" },
  { value: "5", src: "/icons/kendama.png", label: "kendama-player" },
  { value: "6", src: "/icons/paint-roller.png", label: "painter" },
  { value: "7", src: "/icons/user-avatar.png", label: "writer" },
  { value: "8", src: "/icons/video-camera.png", label: "filmer" },
  { value: "9", src: "/icons/binary-code.png", label: "editor" },
  { value: "10", src: "/icons/wave-sound.png", label: "musician" },
  { value: "11", src: "/icons/tank-top.png", label: "fashion-designer" },
  { value: "12", src: "/icons/man.png", label: "organizer" },
];

export function genreNumberToObject(genre: number) {
  const genre_str = genre.toString();

  try {
    const icon = iconOptions.find((option) => option.value === genre_str);

    return icon?.src;
  } catch (err) {
    console.error("genre icon not get", err);
    return null;
  }
}

export function base64ToBlob(base64: any, mimeType: any) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: mimeType });
}

export async function hasCollectiveNFT(
  wallet: AnchorWallet | NodeWallet,
  user: string,
  collective: string,
) {
  const assets = await fetchAssetsByYou(wallet, user);
  if (!assets) throw new Error("not user assets");
  try {
    const hasCollection = assets.some(
      ({ asset }) => asset.updateAuthority.address === publicKey(collective),
    );
    return hasCollection;
  } catch (err) {
    return null;
  }
}

export async function fetchJacket(candy: string) {
  const umi = createUmi(
    "https://devnet-rpc.shyft.to?api_key=aEoNRy0ZFiWQX_Lv",
  ).use(mplCoreCandyMachine()); //shftにするとはやくなる

  try {
    const collectionMint = (await fetchCandyMachine(umi, publicKey(candy)))
      .collectionMint;
    const col = await fetchCollectionV1(umi, collectionMint);

    const res = await fetch(col.uri);

    const metaData = await res.json();

    // const image = metaData.image;
    const properties = metaData.properties;
    const images = properties.file.map((item: any) => item.uri);
    // console.log(images);

    return images;
  } catch (err) {
    console.error("not found collection image url from candy");
    return "/404.jpeg";
  }
}

export async function fetchJacketFromAsset(uri: string) {
  try {
    const res = await fetch(uri);

    const metaData = await res.json();

    // const image = metaData.image;
    const properties = metaData.properties;
    const images = properties.file.map((item: any) => item.uri);
    // console.log(images);

    return images;
  } catch (err) {
    console.error("not found collection image url from candy");
    return "/404.jpeg";
  }
}

export async function canAddMedia(wallet: AnchorWallet, candyPrams: string) {
  try {
    const candyPubkey = new web3.PublicKey(candyPrams);

    const program = setProgram(wallet);

    const [harigamiPda] = web3.PublicKey.findProgramAddressSync(
      [candyPubkey.toBuffer()],
      program.programId,
    );

    const harigami: any = await program.account.harigami.fetch(harigamiPda);
    const creators = harigami.creators;

    const isAuthority = creators.some(
      (creator: web3.PublicKey) =>
        creator.toString() === wallet.publicKey.toString(),
    );

    return isAuthority;
  } catch (err) {
    console.error("not canAddMedia method");
  }
}

export async function fetchHarigamiContent(
  wallet: AnchorWallet,
  candyPrams: string,
) {
  try {
    const candyPubkey = new web3.PublicKey(candyPrams);

    const program = setProgram(wallet);

    const [harigamiPda] = web3.PublicKey.findProgramAddressSync(
      [candyPubkey.toBuffer()],
      program.programId,
    );

    const harigami: any = await program.account.harigami.fetch(harigamiPda);
    const contents = harigami.contents;
    // console.log(contents);

    return contents;
  } catch (err) {
    console.error("not canAddMedia method");
  }
}

export interface AssetWithHarigami {
  asset: AssetV1;
  candy: PublicKey; // Candy Machine の公開鍵
}

export async function fetchAssetsByYou(
  wallet: AnchorWallet | NodeWallet,
  owner: web3.PublicKey | string,
) {
  try {
    const umi = createUmi(
      "https://devnet-rpc.shyft.to?api_key=aEoNRy0ZFiWQX_Lv",
    );
    const assets = await fetchAssetsByOwner(umi, publicKey(owner), {
      skipDerivePlugins: false,
    });

    const harigamies = await fetchHarigamiCollection(wallet);

    const harigamiCollection = await Promise.all(
      harigamies.map(async (harigami: web3.PublicKey) => {
        const harigamiObj: CandyMachine = await fetchCandy(harigami.toString());
        const collectionMint = harigamiObj.collectionMint;
        return { harigami, collectionMint };
      }),
    );

    // console.log(harigamiCollection);

    const assetsWithHarigami: AssetWithHarigami[] = assets
      .map((asset) => {
        const foundHarigami = harigamiCollection.find(
          ({ collectionMint }) =>
            collectionMint.toString() === asset.updateAuthority.address,
        );
        return {
          asset,
          candy: foundHarigami ? foundHarigami.harigami : null,
        };
      })
      .filter((item) => item.candy !== null);

    // console.log(assetsWithHarigami);
    return assetsWithHarigami;
  } catch (err) {
    console.error("not working fetchAssetsByYou");
  }
}
