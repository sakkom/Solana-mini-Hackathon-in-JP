import { FC, useEffect, useState } from "react";
import { changeUserProfile } from "@/anchorClient";
import { genreNumberToObject } from "@/utils/util";
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
  connection: any;
}

export const ProfileCard: FC<ProfileCard> = ({ user, wallet, connection }) => {
  const router = useRouter();

  const [edit, setEdit] = useState<boolean>(false);
  const [icon, setIcons] = useState<string>("");

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

  const handleEditOn = () => {
    setEdit(true);
  };

  const handleChangeUser = async (values: z.infer<typeof formSchema>) => {
    if (!wallet) return;

    const genre: number = parseInt(values.genre);
    const name = values.username;
    // console.log("changeします", genre, name);
    try {
      const result = await changeUserProfile(wallet, connection, name, genre);
      console.log("transaction", result);
    } catch (err) {
      console.error("change not working", err);
    }

    setEdit(false);
    router.refresh();
  };

  return (
    <div>
      <div>
        {!edit && (
          <Card className="">
            <div className="flex justify-end">
              <div onClick={handleEditOn}>
                <TuneIcon className="cursor-pointer" />
              </div>
            </div>
            <div className="flex p-5 gap-5">
              <Image src={icon} alt="alt" width={72} height={72} />
              <h1>{user?.name}</h1>
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
                <CardContent>
                  <div className="">
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
                            <Input placeholder={user.name} {...field} />
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
        )}
      </div>
    </div>
  );
};
