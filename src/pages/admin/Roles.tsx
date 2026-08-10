import "./Roles.css";

const Roles = () => {
  const roles = [
    {
      name: "Admin",
      permissions: "View, Create, Update, Delete",
    },
    {
      name: "HR",
      permissions: "View, Create, Update",
    },
    {
      name: "Manager",
      permissions: "View, Update",
    },
  ];

  return (
    <div className="roles-page">
      <div className="roles-header">
        <div>
          <h1>Role Management</h1>
          <p>Set access levels and control permissions for every team role.</p>
        </div>
        <button className="add-role-btn">+ New Role</button>
      </div>

      <div className="roles-card">
        <div className="roles-table-wrapper">
          <table className="roles-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.name}>
                  <td>{role.name}</td>
                  <td>{role.permissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Roles;