"use client";

import { Button } from "@/components/ui/button";
import { canAddMedia } from "@/utils/util";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
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

const ACCEPTED_FILE_TYPES = ["video/mp4", "image/gif"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const harigamiFormSchema = z.object({
  content: z
    .instanceof(File)
    .refine((file) => file !== null, {
      message: "ファイルをアップロードしてください",
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "mp4, gif選択可能",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "ファイルは50MB以下である必要があります",
    }),
});

export default function Page({ params }: { params: { candy: string } }) {
  const router = useRouter();
  const candy = params.candy;
  const anchorWallet = useAnchorWallet();
  const [authority, setAuthority] = useState<boolean>(false);
  const [preview, setPreview] = useState<{ url: string; type: string }>();
  const [progress, setProgress] = useState<number>(0);
  const [show, setShow] = useState(true);
  const form = useForm<z.infer<typeof harigamiFormSchema>>({
    resolver: zodResolver(harigamiFormSchema),
  });

  useEffect(() => {
    if (!anchorWallet) return;

    const checkAuthority = async () => {
      const res = await canAddMedia(anchorWallet, candy);
      setAuthority(res);
      if (res === false) {
        router.push("/");
      }
    };

    checkAuthority();
  }, []);

  const handleFilePreview = (e: any) => {
    const file = e.target.files[0];
    console.log(file.size);
    if (file) {
      if (file instanceof File && ACCEPTED_FILE_TYPES.includes(file.type)) {
        const url = URL.createObjectURL(file);
        setPreview({ url, type: file.type });
      }
    }
  };

  const handleUploadIrys = async (
    values: z.infer<typeof harigamiFormSchema>,
  ) => {
    if (!anchorWallet) return;

    setShow(false);

    const formData = new FormData();
    formData.append("content", values.content);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/irys/upload`,
        { method: "POST", body: formData },
      );

      if (res.ok) {
        setProgress(1);
        const arweaveId = await res.json();
        await addMedia(anchorWallet, candy, arweaveId);
        setProgress(2);
        setTimeout(() => {
          router.push(`/view/${candy}/media`);
        }, 3000);
      }
    } catch (err) {
      console.error("not working handleUploadIrys");
    }
  };

  const renderProgressFeedback = () => {
    if (show) return;

    const steps = [{ title: "コンテンツアップロード" }, { title: "貼紙更新" }];

    return (
      <Card className="bg-gray-900">
        <CardContent>
          <div className="flex justify-center text-white">
            <h3>{progress < 2 ? "waiting....." : "complete!"}</h3>
          </div>
          <ul>
            {steps.map((step, index) => (
              <li key={index}>
                <p
                  className={
                    progress > index ? "text-pink-400" : "text-gray-500"
                  }
                >
                  {step.title}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {show ? (
        <div className="w-1/3 ">
          {authority && (
            <div className="space-y-10">
              {preview && preview.type === "video/mp4" ? (
                <div>
                  <video
                    src={preview.url}
                    controls
                    width={"100%"}
                    className="rounded-sm"
                  />
                </div>
              ) : (
                <img
                  src={preview?.url}
                  className="aspect-square object-contain"
                />
              )}
              <Form {...form}>
                <Card>
                  <CardContent className="pt-5">
                    <form onSubmit={form.handleSubmit(handleUploadIrys)}>
                      <FormField
                        control={form.control}
                        name="content"
                        render={({
                          field: { value, onChange, ...filedProps },
                        }) => (
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
                                  const file =
                                    e.target.files && e.target.files[0];
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
      ) : (
        <div>{renderProgressFeedback()}</div>
      )}
    </div>
  );
}
