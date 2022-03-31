import { NonFungibleTokensApi } from "@stacks/blockchain-api-client";
import {
  AnchorMode,
  callReadOnlyFunction,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  validateStacksAddress,
} from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

const nftApi = new NonFungibleTokensApi();

const emojis = [
  ..."😜😍🥰😎🥳🥵😳🤯😱😈👾👽💩👻🎃✌👑🐶🐣🐠🌎🌍🌏🪐⭐🍓🚗🚌🚀",
];
export function randomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

export function sanitizeUri(tokenUri, id) {
  console.log(tokenUri, id);
  let url = tokenUri;
  url = url.replace(/https?:\/\/.*\/ipfs\//, "https://ipfs.io/ipfs/"); // overwrite other gateways
  url = url.replace("ipfs://", "https://ipfs.io/ipfs/");
  url = url.replace("/ipfs/ipfs/", "/ipfs/");
  url = url.replace("$TOKEN_ID", id);
  url = url.replace("{id}", id);
  return url;
}

export function overrideUri(uri, id, name) {
  // custom rules for specific collections
  switch (name) {
    case "bitcowboys":
      return `${uri}/${id}.json`;
    default:
      return uri;
  }
}

export async function getHoldings(principal) {
  // uncomment to override/stalk other addresses
  // principal = "SP1V1ZVKMWWHX8CEGBP9FQBQ3AKREMBDTHBF1E7Z5";
  return (
    await nftApi.getNftHoldings({
      principal,
    })
  ).results
    .filter((h) => !h.asset_identifier.includes(".bns"))
    .map((holding) => ({
      ...holding,
      value: parseInt(holding.value.repr.replace("u", "")),
    }));
}

export async function tryReadOnly(address, name, value, sender) {
  try {
    return (
      await callReadOnlyFunction({
        contractAddress: address,
        contractName: name,
        functionName: "get-token-uri",
        functionArgs: [uintCV(value)],
        senderAddress: sender,
      })
    ).value.value.data;
  } catch (e) {
    return false;
  }
}

export async function getTokenUri(holding, sender) {
  const [address, name] = holding.asset_identifier.split(/[.:]/);
  return await tryReadOnly(address, name, holding.value, sender);
}

export async function fetchImageUrl(url) {
  const response = await (await fetch(url, { cache: "force-cache" })).json();
  return response.image || response.imageUrl;
}

export async function getImageUrl(tokenUri, holding) {
  try {
    const name = holding.asset_identifier.split("::")[1];
    return sanitizeUri(
      await fetchImageUrl(
        overrideUri(sanitizeUri(tokenUri, holding.value), holding.value, name)
      ),
      holding.value
    );
  } catch (e) {
    return false;
  }
}

export async function requestUrl(url) {
  try {
    await fetch(url, { cache: "force-cache", mode: "no-cors" });
    return true;
  } catch (e) {
    return false;
  }
}

export function transfer(holding, sender, doContractCall, onSuccess) {
  const recipient = window.prompt("Enter recipient address", "SP...");
  if (!recipient) return; // user canceled prompt

  if (!validateStacksAddress(recipient)) {
    return window.alert("Invalid recipient address");
  }

  const [address, name] = holding.asset_identifier.split(/[.:]/);
  doContractCall({
    network: new StacksMainnet(),
    anchorMode: AnchorMode.OffChainOnly,
    contractAddress: address,
    contractName: name,
    functionName: "transfer",
    functionArgs: [
      uintCV(holding.value),
      standardPrincipalCV(sender),
      standardPrincipalCV(recipient),
    ],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    onFinish: (data) => {
      window.alert("Transfer sent");
      console.log(data);
      if (onSuccess) onSuccess(data);
    },
    onCancel: () => {
      window.alert("Transaction was canceled");
    },
  });
}
