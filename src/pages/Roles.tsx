import "./Roles.css";

const roles = [
  {
    id: 1,
    role: "Admin",
    users: 2,
    permissions: "Full Access",
    status: "Active",
  },
  {
    id: 2,
    role: "HR",
    users: 8,
    permissions: "Employee Management",
    status: "Active",
  },
  {
    id: 3,
    role: "Manager",
    users: 12,
    permissions: "Department Management",
    status: "Active",
  },
  {
    id: 4,
    role: "Employee",
    users: 120,
    permissions: "View Dashboard",
    status: "Active",
  },
];

const Roles = () => {
  return (
    <div className="roles-page">
      <div className="roles-header">
        <h1>Roles Management</h1>

        <button className="add-role-btn">
          + Add Role
        </button>
      </div>

      <table className="roles-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Role</th>
            <th>Users</th>
            <th>Permissions</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {roles.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.role}</td>
              <td>{item.users}</td>
              <td>{item.permissions}</td>

              <td>
                <span className="status active">
                  {item.status}
                </span>
              </td>

              <td>
                <button className="edit-btn">Edit</button>

                <button className="delete-btn">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Roles;