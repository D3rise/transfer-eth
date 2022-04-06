import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "../../hooks/context";

const LogInPage = () => {
  const { web3, contract, user, setUser } = useContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.address) navigate("/dashboard");
  }, [navigate, user.address]);

  const [state, setState] = useState({
    username: "",
    password: "",
    secret: "",
  });

  async function logIn(e) {
    e.preventDefault();
    const { username, password, secret } = state;
    try {
      const address = await contract.methods.getUserAddress(username).call();
      await web3.eth.personal.unlockAccount(address, password, 0);
      await contract.methods.authenticateUser(secret).call({
        from: address,
      });

      setUser({ address });
      alert("Successfully authenticated as " + username + "!");
    } catch (e) {
      alert(e.message);
      console.error(e);
    }
  }

  function onChange(e) {
    const { value, name } = e.target;
    setState({ ...state, [name]: value });
  }

  return (
    <div className="logInPage">
      <form onSubmit={logIn}>
        <label>
          Username:{" "}
          <input
            type="text"
            name="username"
            onChange={onChange}
            value={state.username}
          />
        </label>
        <br />
        <label>
          Password:{" "}
          <input
            type="text"
            name="password"
            onChange={onChange}
            value={state.password}
          />
        </label>
        <br />
        <label>
          Secret:{" "}
          <input
            type="text"
            name="secret"
            onChange={onChange}
            value={state.secret}
          />
        </label>
        <br />
        <button type="submit">Log In</button>
      </form>
      <br />
      <Link to="/signup">Want to sign up?</Link>
    </div>
  );
};

export default LogInPage;
