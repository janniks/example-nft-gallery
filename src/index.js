import { Connect } from "@stacks/connect-react";
import { Buffer } from "buffer/";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { userSession } from "./session";

global["Buffer"] = Buffer;

ReactDOM.render(
  <React.StrictMode>
    <Connect
      authOptions={{
        appDetails: {
          name: "NFT Gallery",
          icon: window.location.origin + "/logo.svg",
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
