import { JacketCard } from "@/components/CollectiveCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page({ params }: { params: { candy: string } }) {
  const candy = params.candy;

  return (
    <div className="flex justify-center">
      <div className="w-1/3 space-y-5">
        <div className="flex  items-center justify-end gap-5">
          <p>残り 10</p>
          <Button size={"sm"}>Mint</Button>
        </div>
        <Card className="">
          <CardHeader></CardHeader>
          <CardContent className="space-y-5">
            {candy && <JacketCard candy={candy} />}

            <div>
              <Link href={`/view/${candy}/media`}>
                <Button
                  className="w-full bg-transparent"
                  size={"lg"}
                  variant={"outline"}
                >
                  閲覧
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
