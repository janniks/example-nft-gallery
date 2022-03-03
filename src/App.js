import { useConnect } from "@stacks/connect-react";
import "./App.css";
import logo from "./logo.svg";
import { userSession } from "./session";
import {
  NonFungibleTokensApi,
  TransactionsApi,
} from "@stacks/blockchain-api-client";
import { callReadOnlyFunction, uintCV } from "@stacks/transactions";
import { useEffect, useState } from "react";

const nftApi = new NonFungibleTokensApi();
const txApi = new TransactionsApi();

function dbg(x) {
  console.log(x);
  return x;
}

function tokenUriToUrl(tokenUri, id) {
  let url = tokenUri;
  url = url.replace("ipfs://", "https://ipfs.io/ipfs/");
  url = url.replace("/ipfs/ipfs/", "/ipfs/");
  url = url.replace("$TOKEN_ID", id);
  url = url.replace("{id}", id);
  return url;
}

function App() {
  const connect = useConnect();

  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    async function getHoldings() {
      return dbg(
        (
          await nftApi.getNftHoldings({
            principal: "SP10GH0ED2YA6AN2BT94N75KMVJAC3DGARD5W4HQM",
          })
        ).results
          .filter((h) => !h.asset_identifier.includes(".bns"))
          .map((h) => ({
            ...h,
            value: parseInt(h.value.repr.replace("u", "")),
          }))
      );
    }

    async function readOnly(address, name, value) {
      try {
        return (
          await callReadOnlyFunction({
            contractAddress: address,
            contractName: name,
            functionName: "get-token-uri",
            functionArgs: [uintCV(value)],
            senderAddress: "SP10GH0ED2YA6AN2BT94N75KMVJAC3DGARD5W4HQM",
          })
        ).value.value.data;
      } catch (e) {
        return `${address}.${name}`;
      }
    }

    async function addTokenUris(holdings) {
      return Promise.all(
        holdings.map(async (h) => {
          const [address, name] = h.asset_identifier.split(/[.:]/);
          return {
            ...h,
            tokenUri: await readOnly(address, name, h.value),
          };
        })
      );
    }

    async function getImageUrl(url) {
      try {
        const response = await (
          await fetch(url, { cache: "force-cache" })
        ).json();
        return response.image || response.imageUrl;
      } catch (e) {
        return "";
      }
    }

    async function addUrls(holdings) {
      return await Promise.all(
        holdings.map(async (h) => ({
          ...h,
          imageUrl: await getImageUrl(tokenUriToUrl(h.tokenUri, h.value)),
        }))
      );
    }

    async function chain() {
      setHoldings(await addUrls(await addTokenUris(await getHoldings())));
    }

    chain();
  }, []);

  console.log(connect);

  if (!userSession.isUserSignedIn) {
    return <button onClick={() => connect.doAuth()}>Connect Wallet</button>;
  }

  const userData = userSession.loadUserData();
  console.log(userData);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <code style={{ maxWidth: "100%", wordBreak: "break-all" }}>
          {JSON.stringify(holdings, null, 2)}
        </code>
        {/* <code style={{ maxWidth: "100%", wordBreak: "break-all" }}>
          {JSON.stringify(userData, null, 2)}
        </code> */}
      </header>
    </div>
  );
}

export default App;
