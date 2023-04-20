import { BasicMarketplace } from "@meshsdk/contracts";
import { KoiosProvider } from "@meshsdk/core";

export function getMarketplace(wallet) {
  const blockchainProvider = new KoiosProvider("preprod");

  const marketplace = new BasicMarketplace({
    fetcher: blockchainProvider,
    initiator: wallet,
    network: "preprod",
    signer: wallet,
    submitter: blockchainProvider,
    percentage: 2500, // 2.5%
    owner: "addr_test1qqf4vf7zv8zlgc8mv4u4kmwve8njg4laj9v8qfpsplngcnev4hvexzf78khcza2fuhv39gnwvhkzvhs4ccpx3ax0cvks8sq7jj", //my wallet address
  });

  return marketplace;
}
