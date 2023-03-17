//  * Succesfully run

import { BrowserWallet } from "@meshsdk/core";
import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { KoiosProvider } from "@meshsdk/core";
import { createTransaction } from "@/backend";

const Home: NextPage = () => {
  const { connected } = useWallet();

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 style={{ marginBottom: "10px" }}>Mint My Token</h1>
        {connected ? <MintSection /> : <CardanoWallet />}
      </div>
    </div>
  );
};

export default Home;




function AssetList() {
  const { wallet } = useWallet();
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const getAssets = async () => {
      const assets = await wallet.getAssets();
      setAssets(assets);
    };
    getAssets();
  }, [wallet]);

  return (
    <ul>
      {assets.map((asset, index) => (
        <>
          <li key={index}>
            {asset.policyId && <p>Asset Policy Id-{asset.policyId}</p>}
            {asset.assetName && <p>AssetName - {asset.assetName}</p>}
            {asset.quantity && <p>Asset quantity -{asset.quantity}</p>}
            {asset.fingerprint && <p>Asset fingerprint -{asset.fingerprint}</p>}
          </li>
        </>
      ))}
    </ul>
  );
}




function MintSection() {
  const koiosProvider = new KoiosProvider("preprod");

  const { wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [showAssetList, setShowAssetList] = useState(false);

  const toggleAssetList = () => {
    setShowAssetList(!showAssetList);
  };

  console.log("Browser wallet", BrowserWallet.getInstalledWallets());

  async function startMinting() {
    setSuccess(false);
    setTxHash(undefined);
    setLoading(true);
    const recipientAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    console.log("starting minting", { recipientAddress, utxos });
    const { unsignedTx } = await createTransaction(recipientAddress, utxos);

    const assets = await wallet.getAssets();
    console.log("assets", assets);

    // BrowserWallet.getInstalledWallets();

    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log({ txHash });
    setLoading(false);
    setTxHash(txHash);

    koiosProvider.onTxConfirmed(txHash, () => {
      console.log("Transaction confirmed");
      setSuccess(true);
    });
  }

  const viewAssets = () => {
    console.log("this is view assets");
  };

  return (
    <>
      {txHash ? (
        <>
          <p>
            <b>Tx Hash:</b>
            <br />
            {txHash}
          </p>
          {success ? (
            <p>Transaction confirmed</p>
          ) : (
            <p>Waiting confirmation...</p>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => startMinting()}
          disabled={loading}
          style={{
            fontSize: "20px",
            margin: "16px",
            padding: "10px",
            cursor: "pointer",
            backgroundColor: loading ? "orange" : "grey",
          }}
        >
          Mint Now!
        </button>
      )}
      {/* <AssetList /> */}
      {/* <button onClick={viewAssets} >View Asstes</button> */}

      {!showAssetList ? (
        <>
          <button onClick={toggleAssetList}>View Assets</button>
        </>
      ) : (
        <>
          <AssetList />
          <button onClick={toggleAssetList}>Close</button>
        </>
      )}
    </>
  );
}
