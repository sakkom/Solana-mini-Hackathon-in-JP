"use client";

import { fetchUser } from "@/anchorClient";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base64ToBlob } from "@/utils/util";
import { fetchCandy, mintFromCandyGuard } from "@/lib/candyMachine";
import { publicKey } from "@metaplex-foundation/umi";
import axios from "axios";
import { useRouter } from "next/navigation";

const ACCEPTED_VIDEO_TYPES = ["video/mp4"];

const harigamiFormSchema = z.object({
  content: z
    .instanceof(File)
    .refine((file) => file !== null, {
      message: "ファイルをアップロードしてください",
    })
    .refine((file) => ACCEPTED_VIDEO_TYPES.includes(file.type), {
      message: "mp4のみ選択可能",
    }),
});

export default function Page({ params }: { params: { candy: string } }) {
  const router = useRouter();
  const [authority, setAuthority] = useState<boolean>(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [decryptURL, setDecryptURL] = useState<string | null>(null);
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const form = useForm<z.infer<typeof harigamiFormSchema>>({
    resolver: zodResolver(harigamiFormSchema),
  });

  useEffect(() => {
    if (!anchorWallet) return;

    const fetchUserProfile = async () => {
      const account = await fetchUser(anchorWallet, connection);
      const user_candies = account.candies;
      console.log(user_candies);
      const isAuthority = user_candies.some(
        (candy: any) => candy.toString() === params.candy,
      );
      console.log(isAuthority);
      setAuthority(isAuthority);
    };

    fetchUserProfile();
  }, [anchorWallet]);

  const handleUploadIrys = async (
    values: z.infer<typeof harigamiFormSchema>,
  ) => {
    console.log(values);
    const formData = new FormData();
    formData.append("content", values.content);

    try {
      const apiRoot = process.env.NEXT_PUBLIC_API_ROOT;

      const res = await fetch(`${apiRoot}/irys/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        console.log("server 200", result);
      } else {
        throw new Error("server error");
      }
    } catch (err) {
      console.error("upload error", err);
    }
  };

  const handleFilePreview = (file: File | null) => {
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  const handleDecrypt = async () => {
    if (!wallet.publicKey) return;
    console.log("foo");
    const formData = new FormData();

    formData.append("arweaveId", "q77tQHNVfQi_qbNCacGYyx7WV_ts4e3bWBkBT1pCPM0");
    formData.append(
      "collective",
      "5Udjsoum9iDzt3bTNnFjdXovTzExZSWiqeFE9BGSv3Bo",
    );
    formData.append("user", wallet.publicKey?.toString());

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/irys/decode`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push("/mint");
      }
    }

    if (res.ok) {
      const base64Image = await res.json();
      const blob = base64ToBlob(base64Image, "video/mp4");
      const url = URL.createObjectURL(blob);
      setDecryptURL(url);
      console.log(await res.json());
    } else {
      throw new Error("server error");
      setDecryptURL(null);
    }
  };

  const handleMint = async () => {
    const res = await fetchCandy(anchorWallet, params.candy); //walletでもanchorwalletでも動く
    const collectionMint = res.collectionMint;
    await mintFromCandyGuard(
      anchorWallet,
      publicKey(params.candy),
      collectionMint,
    );
  };

  return (
    <div>
      {authority ? (
        <div>
          {" "}
          <Form {...form}>
            <Card>
              <form onSubmit={form.handleSubmit(handleUploadIrys)}>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field: { value, onChange, ...filedProps } }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...filedProps}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0];
                            onChange(file);
                            handleFilePreview(file);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {videoPreview && (
                  <video src={videoPreview} controls width="100%" />
                )}

                <Button type="submit">Submit</Button>
              </form>
            </Card>
          </Form>
          <Card>
            <div>q77tQHNVfQi_qbNCacGYyx7WV_ts4e3bWBkBT1pCPM0</div>
            <Button onClick={handleDecrypt}>decode</Button>
            {decryptURL && <video src={decryptURL} controls width="100%" />}
          </Card>
          <Button onClick={handleMint}>Mint</Button>
        </div>
      ) : (
        <div>
          <Card>
            <div>q77tQHNVfQi_qbNCacGYyx7WV_ts4e3bWBkBT1pCPM0</div>
            <Button onClick={handleDecrypt}>decode</Button>
            {decryptURL && <video src={decryptURL} controls width="100%" />}
          </Card>
        </div>
      )}
    </div>
  );
}
