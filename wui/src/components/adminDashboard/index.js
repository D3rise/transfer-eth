import CreateTemplateForm from "../forms/createTemplate";

const AdminDashboard = () => {
  return (
    <div className="adminDashboard">
      <h2>Admin Functions</h2>
      <ul>
        <li>
          <h3>Create template</h3>
          <CreateTemplateForm />
        </li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
