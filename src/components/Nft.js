import { useConnect } from "@stacks/connect-react";
import { useEffect, useState } from "react";
import { getImageUrl, getTokenUri, requestUrl, transfer } from "../helpers";

const Nft = ({ holding, owner }) => {
  const [progress, setProgress] = useState(0.2); // 0 to 1
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState(false);
  const [imageReceived, setImageReceived] = useState(false);

  const { doContractCall } = useConnect();

  console.log("holding", holding);

  useEffect(() => {
    async function init() {
      setProgress(0.4);
      const tokenUri = await getTokenUri(holding, owner);
      setProgress(0.7);
      if (!tokenUri) {
        return setError("Does not conform to .nft-trait");
      }

      const imageUrl = await getImageUrl(tokenUri, holding.value);
      setProgress(0.9);
      if (!imageUrl) {
        return setError("No standardized image available");
      }
      setImageUrl(imageUrl);
      setProgress(1);
      setImageReceived(await requestUrl(imageUrl));
    }

    init();
  }, [holding, owner]);

  if (error) {
    return (
      <div className="group h-full mx-6 flex items-center justify-center">
        <code className="text-center">{error}</code>
        <div className="absolute inset-0 bottom-0 p-1 invisible group-hover:visible">
          <div className="overflow-hidden text-ellipsis block">
            <a
              className="mb-1 block text-white rounded-sm text-md px-1 bg-purple-900/80"
              href={`https://explorer.stacks.co/txid/${holding.tx_id}`}
              rel="noreferrer"
              target="_blank"
              title="Open transaction in Stacks explorer"
            >
              Inspect in explorer ↗
            </a>
            <div className="mb-1 block text-white rounded-sm text-md px-1 bg-purple-900/80">
              <p>
                name: <code>{holding.asset_identifier.split("::")[1]}</code>
              </p>
              <p>
                value: <code>{holding.value}</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="h-full mx-16 flex items-center justify-center">
        <progress
          className="overflow-hidden"
          max="100"
          value={progress * 100}
        />
      </div>
    );
  }

  if (imageUrl && !imageReceived) {
    return (
      <div className="h-full mx-16 flex items-center justify-center">
        <progress className="overflow-hidden" />
      </div>
    );
  }

  return (
    <div className="group overflow-hidden text-ellipsis">
      <img src={imageUrl} alt="nft" className="h-full w-full" />
      <div className="absolute inset-0 p-1 invisible group-hover:visible">
        <div className="overflow-hidden text-ellipsis block">
          <button
            className="mb-1 block text-white rounded-sm text-md px-1 bg-purple-900/80"
            onClick={() => navigator.clipboard.writeText(imageUrl)}
            title="Copy image URL to clipboard"
          >
            Copy Image URL
          </button>
          <button
            className="block text-white rounded-sm text-md px-1 bg-purple-900/80"
            onClick={() => transfer(holding, owner, doContractCall)}
            title="Transfer NFT to different principal"
          >
            Transfer →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Nft;
