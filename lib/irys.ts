import Irys from "@irys/sdk";

export const getIrys = async () => {
  const network = "devnet";
  const providerUrl = "https://api.devnet.solana.com";
  const token = "solana";

  const irys = new Irys({
    network,
    token,
    key: process.env.PRIVATE_KEY,
    config: { providerUrl },
  });

  return irys;
};
