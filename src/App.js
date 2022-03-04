import "./App.css";
import { ConnectWallet } from "./component/ConnectWallet";
import { Gallery } from "./component/Gallery";
import { randomEmoji } from "./helpers";
import { userSession } from "./session";

function App() {
  const isSignedIn = userSession.isUserSignedIn();

  return (
    <>
      <div className="Background"></div>
      <div className="relative flex flex-col items-center min-h-screen">
        <h1 className="Logo relative mt-32 mb-8 px-9 py-6 text-[64px] font-bold text-purple-200 bg-purple-400 rounded-md">
          NFT Gallery
          <span className="rotate-2 hover:-rotate-2 text-5xl -top-3 -right-3 absolute cursor-default">
            {randomEmoji()}
          </span>
        </h1>
        {isSignedIn ? <Gallery /> : <ConnectWallet />}
      </div>
    </>
  );
}

export default App;
