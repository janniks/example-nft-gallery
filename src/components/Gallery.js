import React, { useEffect, useState } from "react";
import { getHoldings } from "../helpers";
import { userSession } from "../session";
import Nft from "./Nft";

export function Gallery() {
  const [holdings, setHoldings] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const stalk = queryParams.get("owner");
  const owner = stalk || userSession.loadUserData().profile.stxAddress.mainnet;

  useEffect(() => {
    async function init() {
      setHoldings(await getHoldings(owner));
    }

    init();
  }, [owner]);

  if (!holdings) return <span className="text-white text-lg">Loading...</span>;

  return (
    <>
      {!!stalk || (
        <button
          className="Button px-2 py-1 text-purple-50 bg-purple-600 hover:bg-purple-700 outline-purple-600 hover:outline font-semibold rounded-md"
          onClick={() => userSession.signUserOut(window.location.href)}
        >
          Disconnect Wallet
        </button>
      )}
      <div className="w-full mt-16 mb-32 px-4 md:px-8">
        <div className="w-full grid gap-4 grid-cols-2 sm:grid-cols-3 md:gap-8">
          {holdings.map((h) => (
            <div
              key={h.tx_id}
              className="GridItem p-1 bg-purple-400 rounded-lg"
            >
              <div className="relative aspect-square rounded-md overflow-hidden">
                <Nft holding={h} owner={owner} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
