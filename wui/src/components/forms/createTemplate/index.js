import { useEffect, useState } from "react";
import { useContext } from "../../../hooks/context";

const CreateTemplateForm = () => {
  const [state, setState] = useState({ name: "", categoryId: "0" });
  const [categories, setCategories] = useState([]);
  const { contract, user } = useContext();

  useEffect(() => {
    const fetchCategories = async () => {
      const ids = await contract.methods.getCategoryIds().call();
      let result = [];
      for (const id of ids) {
        const category = await contract.methods.getCategory(id).call();
        result.push(category);
      }
      setCategories(result);
    };

    fetchCategories();
  }, []);

  const createTemplate = async (e) => {
    e.preventDefault();
    const { categoryId, name } = state;
    try {
      await contract.methods
        .createTemplate(name, categoryId)
        .send({ from: user.address });
      alert("Successfully created template " + name);
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
    <div className="createTemplateForm">
      <form onSubmit={createTemplate}>
        <label>
          Name:{" "}
          <input
            type="text"
            name="name"
            onChange={onChange}
            value={state.name}
          />
        </label>
        <br />
        <label>
          Category:{" "}
          <select
            name="categoryId"
            value={state.categoryId}
            onChange={onChange}
          >
            {categories.map((category, i) => (
              <option key={i} value={i}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <br />
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateTemplateForm;
