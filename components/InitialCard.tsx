import { FC, useEffect, useState } from "react";

import { createUser } from "@/anchorClient";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { formSchema } from "./ProfileCard";
import { iconOptions } from "@/utils/util";

interface InitialCardProps {
  wallet: any;
  connection: any;
  publicKey: any;
}

export const InitialCard: FC<InitialCardProps> = ({
  wallet,
  connection,
  publicKey,
}) => {
  const [status, setStatus] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genre: "0",
      username: "",
    },
  });

  const handleCreateUser = async (values: z.infer<typeof formSchema>) => {
    if (!wallet) return;

    setStatus("execute ...");

    const genre: number = parseInt(values.genre);
    const name = values.username;
    try {
      const result = await createUser(wallet, connection, name, genre);
      setStatus("プログラムが正常に実行されました");
      setResultUrl(`https://solscan.io/tx/${result}?cluster=devnet`);
    } catch (err: any) {
      setStatus(`プログラムの実行に失敗しました: ${err.message}`);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCreateUser)}
          className="space-y-5"
        >
          <Card>
            <CardContent>
              <div className="">
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value || "0"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              <Image
                                src={
                                  iconOptions.find(
                                    (option) =>
                                      option.value === (field.value || "0"),
                                  )?.src || ""
                                }
                                alt="alt"
                                width={64}
                                height={64}
                                className="mt-10"
                              />
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="mt-5">
                          {iconOptions.map((item, index) => (
                            <SelectItem value={item.value} key={index}>
                              <Image
                                src={item.src}
                                alt="alt"
                                width={64}
                                height={64}
                              />
                              <div>{item.label}</div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {publicKey && (
                          <Input
                            placeholder={publicKey.toString()}
                            {...field}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-center">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>

      {status && <div>{status}</div>}
      {resultUrl && <div>{resultUrl}</div>}
    </div>
  );
};
