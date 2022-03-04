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
import { userSession } from "./session";

const nftApi = new NonFungibleTokensApi();

const emojis = [
  ..."😜😍🥰😎🥳🥵😳🤯😱😈👾👽💩👻🎃✌️👑🐶🐣🐠🌎🌍🌏🪐⭐️🍓🚗🚌🚀",
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

export async function getHoldings(
  principal = "SP17YZQB1228EK9MPHQXA8GC4G3HVWZ66X7VRPMAX"
) {
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

export async function tryReadOnly(
  address,
  name,
  value,
  sender = "SP10GH0ED2YA6AN2BT94N75KMVJAC3DGARD5W4HQM"
) {
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

export async function getImageUrl(tokenUri, value) {
  try {
    return sanitizeUri(
      await fetchImageUrl(sanitizeUri(tokenUri, value)),
      value
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

export function transfer(holding, doContractCall, onSuccess) {
  const sender = userSession.loadUserData().profile.stxAddress.mainnet;

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