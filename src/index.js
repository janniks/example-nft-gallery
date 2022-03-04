import "./index.css";

import { Connect } from "@stacks/connect-react";
import { Buffer } from "buffer/";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { userSession } from "./session";

global["Buffer"] = Buffer;

ReactDOM.render(
  <React.StrictMode>
    <Connect
      authOptions={{
        appDetails: {
          name: "NFT Gallery",
          icon: window.location.origin + "/nft-logo.png",
        },
        redirectTo: "/",
        onFinish: () => {
          window.location.reload();
        },
        userSession,
      }}
    >
      <App />
    </Connect>
  </React.StrictMode>,
  document.getElementById("root")
);
