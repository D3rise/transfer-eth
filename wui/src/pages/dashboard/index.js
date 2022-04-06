import { useEffect, useState } from "react";
import { useContext } from "../../hooks/context";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "../../components/adminDashboard";
import { ROLES } from "../../common/constants";
import UserDashboard from "../../components/userDashboard";

const DashboardPage = () => {
  const { contract, user } = useContext();
  const navigate = useNavigate();
  const [state, setState] = useState({ role: 0 });

  useEffect(() => {
    if (!user.address) return navigate("/");

    const getRole = async () => {
      const role = await contract.methods
        .getUser(user.address)
        .call()
        .then((u) => u.role);

      console.log(typeof role);
      setState((s) => {
        return { ...s, role };
      });
    };

    getRole();
  }, [contract.methods, navigate, user.address]);

  return (
    <div className="dashboardPage">
      {state.role === ROLES.ADMIN && <AdminDashboard />}
      <UserDashboard />
    </div>
  );
};

export default DashboardPage;
