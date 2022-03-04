import React, { useEffect, useState } from "react";
import { getHoldings } from "../helpers";
import { userSession } from "../session";
import Nft from "./Nft";

export function Gallery() {
  const [holdings, setHoldings] = useState(false);

  useEffect(() => {
    async function init() {
      setHoldings(
        await getHoldings(userSession.loadUserData().profile.stxAddress.mainnet)
      );
    }

    init();
  }, []);

  if (!holdings) return <>Loading...</>;

  return (
    <>
      <button
        className="mb-16 Button px-2 py-1 text-purple-50 bg-purple-600 hover:bg-purple-700 outline-purple-600 hover:outline font-semibold rounded-md"
        onClick={() => userSession.signUserOut(window.location.href)}
      >
        Disconnect Wallet
      </button>
      <div className="grid gap-8 grid-cols-3 w-2/3 mb-32">
        {holdings.map((h) => (
          <div key={h.tx_id} className="GridItem p-1 bg-purple-400 rounded-lg">
            <div className="relative aspect-square rounded-md overflow-hidden">
              <Nft holding={h} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
