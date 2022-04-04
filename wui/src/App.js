import { Routes, Route } from "react-router-dom";
import LogInPage from "./pages/login";
import { Context } from "./hooks/context";
import Web3 from "web3";
import ABI from "./common/abi";

const App = () => {
  const web3 = new Web3("http://localhost:8545");
  const contract = new web3.eth.Contract(
    ABI,
    "0x0213046255BFEC46D7CB168aDf28f5dE19CC0Dee"
  );

  return (
    <Context.Provider value={{ web3, contract }}>
      <div className="App">
        <h1>Transfer App</h1>
        <Routes>
          <Route path="/">
            <Route index element={<LogInPage />} />
          </Route>
        </Routes>
      </div>
    </Context.Provider>
  );
};

export default App;
