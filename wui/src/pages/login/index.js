import { useState } from "react";

const LogInPage = () => {
  const [state, setState] = useState({
    username: "",
    password: "",
    secret: "",
  });

  async function logIn(e) {
    e.preventDefault();
  }

  async function onChange(e) {
    const { value, name } = e.target;
    setState({ ...state, [name]: value });
  }

  return (
    <div className="logInPage">
      <form onSubmit={logIn}>
        <label>
          Username:{" "}
          <input type="text" onChange={onChange} value={state.username} />
        </label>
        <label>
          Password:{" "}
          <input type="text" onChange={onChange} value={state.password} />
        </label>
        <label>
          Secret: <input type="text" onChange={onChange} value={state.secret} />
        </label>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default LogInPage;
