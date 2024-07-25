"use client";

import { Button } from "@/components/ui/button";
import { canAddMedia } from "@/utils/util";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addMedia } from "@/anchorClient";

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
  const candy = params.candy;
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [authority, setAuthority] = useState<boolean>(false);
  const [preview, setPreview] = useState<string>();
  const form = useForm<z.infer<typeof harigamiFormSchema>>({
    resolver: zodResolver(harigamiFormSchema),
  });

  useEffect(() => {
    if (!anchorWallet) return;

    const checkAuthority = async () => {
      const res = await canAddMedia(anchorWallet, connection, candy);
      setAuthority(res);
      if (res === false) {
        router.push("/");
      }
    };

    checkAuthority();
  }, []);

  const handleFilePreview = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (file instanceof File) {
        const url = URL.createObjectURL(file);
        setPreview(url);
      }
    }
  };

  const handleUploadIrys = async (
    values: z.infer<typeof harigamiFormSchema>,
  ) => {
    if (!anchorWallet) return;

    const formData = new FormData();
    formData.append("content", values.content);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/irys/upload`,
        { method: "POST", body: formData },
      );

      if (res.ok) {
        const arweaveId = await res.json();
        await addMedia(anchorWallet, connection, candy, arweaveId);
        router.push(`/view/${candy}/media`);
      }
    } catch (err) {
      console.error("not working handleUploadIrys");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {authority && (
        <div className="w-1/3 space-y-10">
          {preview && (
            <div>
              <video
                src={preview}
                controls
                width={"100%"}
                className="rounded-sm"
              />
            </div>
          )}
          <Form {...form}>
            <Card>
              <CardContent className="pt-5">
                <form onSubmit={form.handleSubmit(handleUploadIrys)}>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field: { value, onChange, ...filedProps } }) => (
                      <FormItem>
                        <FormLabel className="border-2 border-black rounded-sm text-lg">
                          Upload File
                        </FormLabel>
                        <FormDescription>
                          mp4を一つ選択してください
                        </FormDescription>
                        <FormControl>
                          <Input
                            {...filedProps}
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files && e.target.files[0];
                              onChange(file);
                              handleFilePreview(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end mt-5">
                    <Button type="submit" size={"sm"}>
                      Submit
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </Form>
        </div>
      )}
    </div>
  );
}
