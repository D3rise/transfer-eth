import { useState } from "react";
import { useContext } from "../../../hooks/context";

const CreateTransferForm = () => {
  const { contract, user } = useContext();
  const [state, setState] = useState({
    toUsername: "",
    value: "0",
    category: "0",
  });
};

export default CreateTransferForm;
