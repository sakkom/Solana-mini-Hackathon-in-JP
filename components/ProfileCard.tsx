import { FC, useEffect, useState } from "react";
import { changeUserProfile } from "@/anchorClient";
import { genreNumberToObject } from "@/utils/util";
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
import TuneIcon from "@mui/icons-material/Tune";
import { useRouter } from "next/navigation";
import { iconOptions } from "@/utils/util";

export const formSchema = z.object({
  genre: z.string().min(1),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

interface ProfileCard {
  user: any;
  wallet: any;
}

export const ProfileCard: FC<ProfileCard> = ({ user, wallet }) => {
  const router = useRouter();

  const [edit, setEdit] = useState<boolean>(false);
  const [icon, setIcons] = useState<string>("");
  const [status, setStatus] = useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genre: "0",
      username: "",
    },
  });

  useEffect(() => {
    const icon_src = genreNumberToObject(user.genre);
    if (!icon_src) return;
    setIcons(icon_src);
  }, [user]);

  const handleChangeUser = async (values: z.infer<typeof formSchema>) => {
    if (!wallet) return;

    setStatus("更新...");

    const genre: number = parseInt(values.genre);
    const name = values.username;
    // console.log("changeします", genre, name);
    try {
      await changeUserProfile(wallet, name, genre);
    } catch (err) {
      console.error("change not working", err);
    }

    setTimeout(() => {
      setEdit(false);
      setStatus(undefined);
      router.refresh();
    }, 10000);
  };

  return (
    <div>
      <div>
        {!edit && (
          <Card className="">
            <div className="flex justify-end">
              <div onClick={() => setEdit(true)}>
                <TuneIcon className="cursor-pointer" />
              </div>
            </div>
            <div className="flex p-5 gap-5">
              <Image
                src={icon}
                alt="alt"
                width={50}
                height={50}
                className="object-contain"
              />
              <p className="text-4xl">{user?.name}</p>
            </div>
          </Card>
        )}

        {edit && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleChangeUser)}
              className="space-y-5"
            >
              <Card>
                {status === "更新..." && (
                  <div className="flex justify-center">
                    <p className="text-pink-400">{status}</p>
                  </div>
                )}
                <div
                  onClick={() => setEdit(false)}
                  className="flex justify-end"
                >
                  <p className="cursor-pointer">戻る</p>
                </div>
                <div className="flex items-center">
                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue>
                                <Image
                                  src={
                                    iconOptions.find(
                                      (option) =>
                                        option.value === (field.value || "0"),
                                    )?.src || "/icons/guest.png"
                                  }
                                  alt="alt"
                                  width={64}
                                  height={64}
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
                          <Input placeholder={user.name} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size={"sm"}>
                    Submit
                  </Button>
                </div>
              </Card>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};
