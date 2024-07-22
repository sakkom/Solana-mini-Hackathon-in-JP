"use client";

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
import { createHarigami } from "@/actions/createHarigami";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { addUserCollective } from "@/anchorClient";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const harigamiFormSchema = z.object({
  // coverImage: z.custom<FileList>().refine((files) => 0 < files.length, {
  //   message: "ファイルをアップロードしてください",
  // }),
  coverImage: z
    .instanceof(File)
    .refine((file) => file !== null, {
      message: "ファイルをアップロードしてください",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "jpeg, jpgの画像を選択してください",
    }),
  title: z.string().min(1, {
    message: "Titleを入力してください",
  }),
});

export default function Page() {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const form = useForm<z.infer<typeof harigamiFormSchema>>({
    resolver: zodResolver(harigamiFormSchema),
  });

  const handleCreateHarigami = async (
    values: z.infer<typeof harigamiFormSchema>,
  ) => {
    if (!anchorWallet) return;

    try {
      const candy = await createHarigami(wallet, values);

      const result = await addUserCollective(anchorWallet, connection, candy);
      console.log("transaction", result);
    } catch (err) {
      console.error("uploadに失敗しました", err);
    }
  };

  return (
    <div>
      <Form {...form}>
        <Card>
          <form onSubmit={form.handleSubmit(handleCreateHarigami)}>
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field: { value, onChange, ...filedProps } }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...filedProps}
                      type="file"
                      onChange={(e) =>
                        onChange(e.target.files && e.target.files[0])
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="タイトルを入力してください"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Card>
      </Form>
    </div>
  );
}
