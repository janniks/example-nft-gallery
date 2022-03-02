import { useConnect } from "@stacks/connect-react";
import "./App.css";
import logo from "./logo.svg";
import { userSession } from "./session";

function App() {
  const connect = useConnect();

  console.log(connect);

  if (!userSession.isUserSignedIn) {
    return <button onClick={() => connect.doAuth()}>Connect Wallet</button>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
