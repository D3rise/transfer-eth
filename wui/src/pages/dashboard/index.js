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

      setState((s) => ({ ...s, role }));
    };

    getRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboardPage">
      {state.role === ROLES.ADMIN && <AdminDashboard />}
      <UserDashboard />
    </div>
  );
};

export default DashboardPage;
