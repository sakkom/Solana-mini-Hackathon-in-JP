import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { AssetWithHarigami, fetchJacketFromAsset } from "@/utils/util";
import Link from "next/link";
import { Card } from "./ui/card";
import { JacketCube } from "./JacketCube";

interface UserAssetProps {
  harigami: AssetWithHarigami;
}

export const UserAsset: FC<UserAssetProps> = ({ harigami }) => {
  const { data: imgUrls, status } = useQuery({
    queryKey: ["jacket", harigami.asset.uri],
    queryFn: () => fetchJacketFromAsset(harigami.asset.uri),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return (
    <div>
      {status === "success" ? (
        <div>
          <Link href={`/view/${harigami.candy.toString()}`}>
            <Card className="bg-transparent p-3 bg-black">
              {imgUrls && <JacketCube urls={imgUrls} />}
            </Card>
          </Link>
        </div>
      ) : (
        <div>
          <Card className="bg-transparent aspect-square flex justify-center items-center">
            loading...
          </Card>
        </div>
      )}
    </div>
  );
};
