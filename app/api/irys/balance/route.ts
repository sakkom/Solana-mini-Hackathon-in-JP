import { getIrys } from "@/lib/irys";

export async function GET() {
  const irys = await getIrys();

  const atomicBalance = await irys.getLoadedBalance();
  console.log(`Node balance (atomic units) = ${atomicBalance}`);

  // Convert balance to standard
  const convertedBalance = irys.utils.fromAtomic(atomicBalance);
  console.log(`Node balance (converted) = ${convertedBalance}`);

  return Response.json(convertedBalance);
}
