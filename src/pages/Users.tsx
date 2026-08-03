import Sidebar from "../components/Sidebar";
import "./Users.css";

const users = [
  {
    id: "EMP001",
    name: "John Doe",
    email: "john@gmail.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    email: "jane@gmail.com",
    role: "Manager",
    status: "Active",
  },
  {
    id: "EMP003",
    name: "Robert",
    email: "robert@gmail.com",
    role: "Employee",
    status: "Inactive",
  },
  {
    id: "EMP004",
    name: "David",
    email: "david@gmail.com",
    role: "Employee",
    status: "Active",
  },
];

const Users = () => {
  return (
    <div className="users-layout">
      <Sidebar />

      <main className="users-content">
        <section className="users-hero-card">
          <div className="users-hero-copy">
            <span className="eyebrow">Team Dashboard</span>
            <h1>Beautiful team management</h1>
            <p>
              A premium team overview for your workforce, with fast member search,
              activity stats, and clear action controls.
            </p>
          </div>

          <div className="hero-actions">
            <button className="secondary-btn">Invite Team</button>
            <button className="primary-btn">+ Add Member</button>
          </div>
        </section>

        <div className="stats-grid">
          <div className="stat-card accent-blue">
            <span>Total Members</span>
            <strong>250</strong>
          </div>
          <div className="stat-card accent-green">
            <span>Active Team</span>
            <strong>220</strong>
          </div>
          <div className="stat-card accent-pink">
            <span>Inactive</span>
            <strong>30</strong>
          </div>
          <div className="stat-card accent-purple">
            <span>Team Leads</span>
            <strong>10</strong>
          </div>
        </div>

        <div className="users-card">
          <div className="table-header">
            <div>
              <h2>Team Members</h2>
              <p>Search, filter, and manage everyone on the team.</p>
            </div>
            <input
              type="text"
              placeholder="Search by name, role, or status"
              className="search-input"
            />
          </div>

          <div className="table-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`status status-${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="edit-btn">Edit</button>
                      <button className="delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Users;
