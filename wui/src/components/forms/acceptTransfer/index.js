import { useEffect, useState } from "react";
import { useContext } from "../../../hooks/context";

const AcceptTransferForm = ({ setState: setParentState }) => {
  const [transfers, setTransfers] = useState([]);
  const [state, setState] = useState({ transferId: "", passphrase: "" });
  const { web3, contract, user } = useContext();

  useEffect(() => {
    const getTransfers = async () => {
      const ids = await contract.methods.getTransferIds().call();
      for (const id of ids) {
        const transfer = await contract.methods
          .getTransfer(id)
          .call({ from: user.address })
          .catch(() => {});

        if (
          transfer &&
          transfer.receiver === user.address &&
          !transfer.finished
        ) {
          transfer.id = id;
          setTransfers((t) => {
            // Set default value to first available for accept transfer id
            setState((s) => ({ ...s, transferId: t[0] ? t[0].id : id }));
            return [...t, transfer];
          });
        }
      }
    };

    getTransfers();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setState((s) => ({ ...s, [name]: value }));
  };

  const acceptTransfer = async (e) => {
    e.preventDefault();
    const { transferId, passphrase } = state;
    try {
      await contract.methods
        .acceptTransfer(transferId, web3.utils.sha3(passphrase))
        .send({ from: user.address });

      const transfer = await contract.methods
        .getTransfer(transferId)
        .call({ from: user.address });

      alert(
        `Successfully accepted transfer ${transferId} and gain ${web3.utils.fromWei(
          transfer.count
        )} eth.`
      );
      setParentState((s) => ({
        ...s,
        balance: Number(s.balance) + Number(web3.utils.fromWei(transfer.count)),
      }));
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  return (
    <div className="acceptTransferForm">
      <form onSubmit={acceptTransfer}>
        <label>
          Transfer ID:
          <select
            onChange={onChange}
            name="transferId"
            defaultValue={state.transferId}
          >
            {transfers.map((transfer, i) => (
              <option key={i} value={transfer.id}>
                {transfer.id}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Passphrase:{" "}
          <input onChange={onChange} type="password" name="passphrase" />
        </label>
        <br />
        <button type="submit">Accept</button>
      </form>
    </div>
  );
};

export default AcceptTransferForm;
