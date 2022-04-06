import { useEffect, useState } from "react";
import { useContext } from "../../../hooks/context";

const CreateTransferForm = ({ setState: setParentState }) => {
  const { web3, contract, user } = useContext();
  const [state, setState] = useState({
    toUsername: "",
    value: "0",
    passphrase: "",
    categoryId: "0",
    template: "-1",
  });
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const ids = await contract.methods.getTemplateIds().call();
      let result = [];

      for (const id of ids) {
        const template = await contract.methods.getTemplate(id).call();
        const category = await contract.methods
          .getCategory(template.categoryId)
          .call();

        template.id = id;
        template.category = category;
        result.push(template);
      }

      setTemplates(result);
    };

    const fetchCategories = async () => {
      const ids = await contract.methods.getCategoryIds().call();
      for (const id of ids) {
        const category = await contract.methods.getCategory(id).call();
        setCategories((s) => [...s, category]);
      }
    };

    fetchCategories();
    fetchTemplates();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setState((s) => ({ ...s, [name]: value }));

    if (name === "template" && value !== "-1") {
      setState((s) => ({
        ...s,
        value: templates[value].acceptableCounts[0]
          ? web3.utils.fromWei(templates[value].acceptableCounts[0])
          : s.value,
        categoryId: templates[value].categoryId,
      }));
    }
  };

  const createTransfer = async (e) => {
    e.preventDefault();
    const { toUsername, value, passphrase, categoryId } = state;
    try {
      await contract.methods
        .createTransfer(toUsername, web3.utils.sha3(passphrase), categoryId)
        .send({ from: user.address, value: web3.utils.toWei(value) });

      setParentState((s) => ({ ...s, balance: s.balance - value }));
      alert(`Created transfer to ${toUsername} with ${value} eth in it`);
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  return (
    <div className="createTransferForm">
      <form onSubmit={createTransfer}>
        <label>
          Template:{" "}
          <select name="template" onChange={onChange} value={state.template}>
            <option key={"-1"} value={"-1"}>
              Without template
            </option>
            {templates?.map((template, i) => (
              <option key={i} value={i}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          To (username):{" "}
          <input onChange={onChange} type="text" name="toUsername" />
        </label>
        <br />
        <label>
          Amount of eth to send:{" "}
          {state.template === "-1" ||
          templates[state.template].acceptableCounts.length === 0 ? (
            <input onChange={onChange} type="number" name="value" />
          ) : (
            <select name="value" onChange={onChange} value={state.value}>
              {templates[state.template].acceptableCounts.map((count, i) => (
                <option key={i} value={web3.utils.fromWei(count)}>
                  {web3.utils.fromWei(count)}
                </option>
              ))}
            </select>
          )}
        </label>
        <br />
        <label>
          Secret phrase:{" "}
          <input onChange={onChange} type="password" name="passphrase" />
        </label>
        <br />
        {state.template === "-1" && (
          <label>
            Category:{" "}
            <select onChange={onChange} name="categoryId">
              {categories.map((c, i) => (
                <option key={i} value={i}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}
        <br />
        <button type="submit">Create transfer</button>
      </form>
    </div>
  );
};

export default CreateTransferForm;
