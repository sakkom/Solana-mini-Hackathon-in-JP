"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createHarigami } from "@/actions/createHarigami";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { addUserCollective, createHarigamiPda } from "@/anchorClient";
import { useState } from "react";
import { PreviewImages } from "@/components/PreviewImages";
import { JacketCube } from "@/components/JacketCube";
import { useRouter } from "next/navigation";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

const harigamiFormSchema = z.object({
  coverImage: z
    .unknown()
    .transform((value) => {
      if (value instanceof FileList && value.length > 0) {
        return Array.from(value);
      }
      return [];
    })
    .refine((files) => files.length > 0 && files.length <= 4, {
      message: "1~4の画像を選択してください",
    })
    .refine(
      (files) =>
        files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      {
        message: "JPEG, JPG, PNG, GIFが可能",
      },
    ),
});

export default function Page() {
  const router = useRouter();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const form = useForm<z.infer<typeof harigamiFormSchema>>({
    resolver: zodResolver(harigamiFormSchema),
  });
  const [status, setStatus] = useState<string>("");
  const [previewUrls, setPreviewUrls] = useState<string[]>();
  const [progress, setProgress] = useState<number>(0);
  const [show, setShow] = useState(true);

  const updateProgress = (newProgress: number) => {
    setProgress(newProgress);
  };

  const handleFileChange = (e: any) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map((file) => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        } else {
          return "";
        }
      });

      setPreviewUrls(urls);
    }
  };

  const handleCreateHarigami = async (
    values: z.infer<typeof harigamiFormSchema>,
  ) => {
    if (!anchorWallet || !wallet.publicKey) return;
    // console.log(values.coverImage);

    setShow(false);

    try {
      const candy = await createHarigami(wallet, values, updateProgress);

      console.log("create candy");
      await addUserCollective(anchorWallet, candy);
      setProgress(3);

      await createHarigamiPda(
        anchorWallet,

        [wallet.publicKey],
        candy,
      );
      setProgress(4);

      const formData = new FormData();
      formData.append("candy", candy.toString());

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/harigami`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setProgress(5);
      }

      setTimeout(() => {
        router.replace("/profile");
      }, 2000);
      // console.log("transaction", result);
    } catch (err) {
      console.error("uploadに失敗しました", err);
    }
  };

  const renderProgressFeedback = () => {
    if (show) return;

    const steps = [
      { title: "メタデータ作成" },
      { title: "キャンディマシン作成" },
      { title: "ユーザー情報更新" },
      { title: "張紙作成" },
      { title: "張紙コレクション更新" },
    ];

    return (
      <Card className="bg-gray-900">
        <CardContent>
          <div className="flex justify-center text-white">
            <h3>{progress < 5 ? "waiting....." : "complete!"}</h3>
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
      <div className="w-1/3 ">
        {show ? (
          <div className="space-y-10">
            {previewUrls && <JacketCube urls={previewUrls} />}
            <Form {...form}>
              <Card>
                <CardContent className="pt-5">
                  <form onSubmit={form.handleSubmit(handleCreateHarigami)}>
                    <FormField
                      control={form.control}
                      name="coverImage"
                      render={({
                        field: { value, onChange, ...filedProps },
                      }) => (
                        <FormItem>
                          <FormLabel className="border-2 border-black rounded-sm text-lg">
                            Upload File
                          </FormLabel>
                          <FormDescription>
                            画像を1~4枚選択してください
                          </FormDescription>
                          <FormControl>
                            <Input
                              {...filedProps}
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files && files?.length <= 4) {
                                  onChange(e.target.files);
                                  handleFileChange(e);
                                  setStatus("");
                                } else {
                                  setStatus("4つまで選択可能");
                                }
                              }}
                            />
                          </FormControl>
                          {status && (
                            <div className="text-red-600">{status}</div>
                          )}
                          <FormMessage />
                          {previewUrls && (
                            <div className="py-3">
                              <PreviewImages imgUrl={previewUrls} />
                            </div>
                          )}
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
        ) : (
          <div>{renderProgressFeedback()}</div>
        )}
      </div>
    </div>
  );
}
