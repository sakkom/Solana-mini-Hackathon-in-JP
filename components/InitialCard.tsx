import { FC, useEffect, useState } from "react";

import { createUser } from "@/anchorClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
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
import { useRouter } from "next/navigation";

interface InitialCardProps {
  wallet: any;
  publicKey: any;
}

export const InitialCard: FC<InitialCardProps> = ({ wallet, publicKey }) => {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");

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
      await createUser(wallet, name, genre);
      setTimeout(() => {
        router.push(`/profile`);
      }, 2000);
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
          <div className="flex justify-center">
            <p>profileを作成してください</p>
          </div>
          <Card>
            <div className="flex items-center p-5">
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
                              className=""
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
                      {publicKey && <Input placeholder={`guest`} {...field} />}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <div className="flex justify-center">
            <Button type="submit" size={"sm"}>
              Submit
            </Button>
          </div>
        </form>
      </Form>

      {status && <div>{status}</div>}
    </div>
  );
};
