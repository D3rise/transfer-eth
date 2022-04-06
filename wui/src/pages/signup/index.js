import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RESERVE_ACCOUNT } from "../../common/constants";
import { useContext } from "../../hooks/context";

const SignUpPage = () => {
  const [state, setState] = useState({
    username: "",
    password: "",
    secret: "",
  });

  const navigate = useNavigate();
  const { web3, contract, user, setUser } = useContext();

  useEffect(() => {
    if (user.address) return navigate("/dashboard");
  }, [user.address, navigate]);

  const signUp = async (e) => {
    e.preventDefault();
    const { username, password, secret } = state;
    console.log(state);
    try {
      const existentAddress = await contract.methods
        .getUserAddress(username)
        .call()
        // contract throws an error if we're trying to get
        // address of non-existent user, so we'll ignore it
        .catch(() => {});

      // if address is not undefined,
      // then user with this username already exists
      if (existentAddress)
        throw new Error("User with this username already exists!");

      const address = await web3.eth.personal.newAccount(password);
      await web3.eth.personal.unlockAccount(address, password, 0);
      await web3.eth.sendTransaction({
        from: RESERVE_ACCOUNT,
        to: address,
        value: web3.utils.toWei("1500"),
      });

      await contract.methods
        .registerUser(username, web3.utils.keccak256(secret))
        .send({ from: address });

      setUser({ address });
      alert("Successfully registered and logged in as " + username + "!");
    } catch (e) {
      alert(e.message);
      console.error(e);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  return (
    <div className="signUpPage">
      <form onSubmit={signUp}>
        <label>
          Username: <input onChange={onChange} type="text" name="username" />
        </label>
        <br />
        <label>
          Password:{" "}
          <input onChange={onChange} type="password" name="password" />
        </label>
        <br />
        <label>
          Secret: <input onChange={onChange} type="password" name="secret" />
        </label>
        <br />
        <button type="submit">Sign Up</button>
        <br />
        <br />
        <Link to="/">Want to log in?</Link>
      </form>
    </div>
  );
};

export default SignUpPage;
