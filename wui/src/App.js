import { Routes, Route, useNavigate, Link } from "react-router-dom";
import LogInPage from "./pages/login";
import { Context } from "./hooks/context";
import Web3 from "web3";
import ABI from "./common/abi";
import { CONTRACT_ADDRESS } from "./common/constants";
import SignUpPage from "./pages/signup";
import useLocalStorage from "./hooks/localStorage";
import { useEffect, useState } from "react";
import DashboardPage from "./pages/dashboard";

const App = () => {
  const web3 = new Web3("http://localhost:8545");
  const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

  const [user, setUser] = useLocalStorage("user", { address: null });
  const navigate = useNavigate();
  const [state, setState] = useState({ username: null });

  useEffect(() => {
    const getUsername = async () => {
      const username = await contract.methods
        .getUser(user.address)
        .call()
        .then((u) => u.username);
      setState((s) => {
        return { ...s, username };
      });
    };

    if (user.address) {
      getUsername();
    }
  }, [contract.methods, user.address]);

  return (
    <Context.Provider value={{ web3, contract, user, setUser }}>
      <div className="App">
        <h1>Transfer App</h1>
        {user.address && (
          <div style={{ paddingBottom: "10px" }}>
            Logged in as <strong>{state.username}</strong> |{" "}
            <Link
              to="/"
              onClick={() => {
                setUser({ address: null });
                navigate("/");
              }}
            >
              Log Out
            </Link>
          </div>
        )}
        <Routes>
          <Route path="/">
            <Route index element={<LogInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </div>
    </Context.Provider>
  );
};

export default App;
