import { useEffect, useState } from "react";
import { useContext } from "../../hooks/context";
import AcceptTransferForm from "../forms/acceptTransfer";
import CancelTransferForm from "../forms/cancelTransfer";
import CreateTransferForm from "../forms/createTransfer";

const UserDashboard = () => {
  const [state, setState] = useState({
    balance: 0,
    transfers: [],
    showFinished: true,
  });
  const { web3, contract, user } = useContext();

  useEffect(() => {
    const getBalance = async () => {
      const balance = await web3.eth.getBalance(user.address);
      setState((s) => ({ ...s, balance: web3.utils.fromWei(balance) }));
    };

    const getTransfers = async () => {
      const ids = await contract.methods.getTransferIds().call();
      let result = [];
      for (const id of ids) {
        const transfer = await contract.methods
          .getTransfer(id)
          .call({ from: user.address })
          .catch(() => {});

        if (transfer && (state.showFinished || !transfer.finished)) {
          transfer.id = id;
          const sender = await contract.methods
            .getUser(transfer.sender)
            .call()
            .then((u) => u.username);
          const receiver = await contract.methods
            .getUser(transfer.receiver)
            .call()
            .then((u) => u.username);
          transfer.sender = sender;
          transfer.receiver = receiver;

          result.push(transfer);
        }
      }

      setState((s) => ({ ...s, transfers: result }));
    };

    getBalance();
    getTransfers();
  }, [state.showFinished]);

  const onShowFinishedChange = (e) => {
    const { checked } = e.target;
    setState((s) => ({ ...s, showFinished: checked }));
  };

  return (
    <div className="userDashboard">
      {" "}
      <h3>
        Your balance: <b>{state.balance}</b> eth
      </h3>
      <ul>
        <li>
          <h3>Your transfers:</h3>
          <input
            type="checkbox"
            name="showFinished"
            defaultChecked
            value={state.showFinished}
            onChange={onShowFinishedChange}
          />{" "}
          Show finished
          <table border={"1px"} cellPadding={"5px"}>
            <thead>
              <td>
                <b>ID</b>
              </td>
              <td>
                <b>From</b>
              </td>
              <td>
                <b>To</b>
              </td>
              <td>
                <b>Value</b>
              </td>
              <td>
                <b>Date</b>
              </td>
              <td>
                <b>Category</b>
              </td>
              <td>
                <b>Finished</b>
              </td>
            </thead>
            <tbody>
              {state.transfers.map((transfer) => (
                <tr>
                  <td>{transfer.id}</td>
                  <td>{transfer.sender}</td>
                  <td>{transfer.receiver}</td>
                  <td>{web3.utils.fromWei(transfer.count) + " eth"}</td>
                  <td>{new Date(transfer.timestamp * 1000).toString()}</td>
                  <td>{transfer.category}</td>
                  <td>{transfer.finished ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </li>
        <li>
          <h3>Create transfer</h3>
          <CreateTransferForm state={state} setState={setState} />
        </li>
        <li>
          <h3>Accept transfer</h3>
          <AcceptTransferForm state={state} setState={setState} />
        </li>
        <li>
          <h3>Cancel transfer</h3>
          <CancelTransferForm state={state} setState={setState} />
        </li>
      </ul>
    </div>
  );
};

export default UserDashboard;
