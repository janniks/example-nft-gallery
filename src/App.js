import "./App.css";
import { ConnectWallet } from "./components/ConnectWallet";
import { Gallery } from "./components/Gallery";
import { randomEmoji } from "./helpers";
import { userSession } from "./session";

function App() {
  const isSignedIn = userSession.isUserSignedIn();

  return (
    <>
      <div className="Background"></div>
      <div className="relative flex flex-col items-center w-full max-w-5xl m-auto min-h-screen">
        <div className="w-full p-4 text-center">
          <a href="/">
            <h1 className="Logo inline-block relative mt-32 mb-8 px-9 py-6 text-[64px] font-bold text-purple-200 bg-purple-400 rounded-md">
              NFT Gallery
              <span className="rotate-2 hover:-rotate-2 text-5xl -top-3 -right-3 absolute cursor-default">
                {randomEmoji()}
              </span>
            </h1>
          </a>
        </div>
        {isSignedIn ? <Gallery /> : <ConnectWallet />}
      </div>
    </>
  );
}

export default App;
