import { useEffect, useState } from "react";
import { useContext } from "../../../hooks/context";

const CancelTransferForm = ({ setState: setParentState }) => {
  const { web3, contract, user } = useContext();
  const [state, setState] = useState({ transferId: "0" });
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    const getTransfers = async () => {
      const ids = await contract.methods.getTransferIds().call();
      let result = [];
      for (const id of ids) {
        const transfer = await contract.methods
          .getTransfer(id)
          .call({ from: user.address })
          .catch(() => {});

        if (
          transfer &&
          !transfer.finished &&
          transfer.sender === user.address
        ) {
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

      setTransfers((t) => {
        setState((s) => ({ ...s, transferId: result[0]?.id }));
        return result;
      });
    };

    getTransfers();
  }, []);

  const cancelTransfer = async (e) => {
    e.preventDefault();
    const { transferId } = state;

    try {
      const transfer = await contract.methods
        .getTransfer(transferId)
        .call({ from: user.address });
      await contract.methods
        .cancelTransfer(transferId)
        .send({ from: user.address });

      setParentState((s) => ({
        ...s,
        balance: Number(s.balance) + Number(web3.utils.fromWei(transfer.count)),
      }));
      alert(
        `Successfully cancelled transfer ${transferId} and gain ${web3.utils.fromWei(
          transfer.count
        )} eth!`
      );
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setState((s) => ({ ...s, [name]: value }));
  };

  return (
    <div className="cancelTransferForm">
      <form onSubmit={cancelTransfer}>
        <label>
          Transfer ID:{" "}
          <select
            name="transferId"
            defaultValue={state.transferId}
            onChange={onChange}
          >
            {transfers.map((transfer, i) => (
              <option key={transfer.id} value={transfer.id}>
                {transfer.id}
              </option>
            ))}
          </select>
        </label>
        <br />
        <button type="submit">Cancel transfer</button>
      </form>
    </div>
  );
};

export default CancelTransferForm;
