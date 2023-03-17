import {
  AppWallet,
  AssetMetadata,
  ForgeScript,
  largestFirst,
  Mint,
  Transaction,
} from "@meshsdk/core";
import type { NextApiRequest, NextApiResponse } from "next";
import { KoiosProvider } from "@meshsdk/core";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const recipientAddress = req.body.recipientAddress;
  const utxos = req.body.utxos;
  const koiosProvider = new KoiosProvider("preprod");

  const appWallet = new AppWallet({
    networkId: 0,
    fetcher: koiosProvider,
    submitter: koiosProvider,
    key: {
      type: "mnemonic",
      words: [
        "topic",
        "myself",
        "coffee",
        "twelve",
        "very",
        "draw",
        "elegant",
        "family",
        "reopen",
        "left",
        "frozen",
        "shop",
        "basket",
        "mention",
        "ramp",
        "tower",
        "globe",
        "climb",
        "work",
        "blur",
        "just",
        "exchange",
        "coffee",
        "candy",
      ],
    },
  });

  const appWalletAddress = appWallet.getPaymentAddress();
  const forgingScript = ForgeScript.withOneSignature(appWalletAddress);

  const assetName = "Quotus Token";
  const assetMetadata: AssetMetadata = {
    name: "Anil",
    // image: "ipfs://QmUvV8FPscURUEiEQDgLhUdU89ESC5W9dPYB9bGGuP32Tx",
    image: 'https://meshjs.dev/logo-mesh/mesh.png',
    mediaType: "image/jpg",
    description: "This NFT is minted by Quotus.",
  };

  const asset: Mint = {
    assetName: assetName,
    assetQuantity: "5",
    metadata: assetMetadata,
    label: "721",
    recipient: recipientAddress,
  };

  
  const costLovelace = "10000000";
  const selectedUtxos = largestFirst(costLovelace, utxos, true);
  const bankWalletAddress =
    "addr_test1qze68kx6v2m4gc97td3shjv6ngtw8v5u8ewsh5sdnt3wtw6q28d8c9q0w50ku24m2r4s0ry63t505vkc0yy6r0shs7hs6n8s7e";

  const tx = new Transaction({ initiator: appWallet });
  tx.setTxInputs(selectedUtxos);
  tx.mintAsset(forgingScript, asset);
  tx.sendLovelace(bankWalletAddress, costLovelace);
  tx.setChangeAddress(recipientAddress);
  const _unsignedTx = await tx.build();
  const unsignedTx = await appWallet.signTx(_unsignedTx, true);

  res.status(200).json({ unsignedTx: unsignedTx });
}
