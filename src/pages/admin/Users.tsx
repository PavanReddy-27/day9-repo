import { useMemo, useState } from "react";
import "./Users.css";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
};

const initialUsers: User[] = [
  {
    id: "EMP001",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Manager",
    status: "Active",
  },
  {
    id: "EMP003",
    name: "Robert Wilson",
    email: "robert.wilson@example.com",
    role: "Employee",
    status: "Inactive",
  },
  {
    id: "EMP004",
    name: "David Kim",
    email: "david.kim@example.com",
    role: "Employee",
    status: "Active",
  },
];

const defaultUser: User = {
  id: "",
  name: "",
  email: "",
  role: "Employee",
  status: "Active",
};

const Users = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formValues, setFormValues] = useState<User>(defaultUser);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const query = search.toLowerCase();
        return (
          user.id.toLowerCase().includes(query) ||
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query) ||
          user.status.toLowerCase().includes(query)
        );
      }),
    [search, users]
  );

  const activeCount = users.filter((user) => user.status === "Active").length;
  const inactiveCount = users.length - activeCount;

  const openAddModal = () => {
    setEditingUser(null);
    setFormValues(defaultUser);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormValues(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormValues(defaultUser);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!formValues.id.trim() || !formValues.name.trim() || !formValues.email.trim()) {
      return;
    }

    setUsers((current) => {
      const existingIndex = current.findIndex((user) => user.id === formValues.id);
      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = formValues;
        return next;
      }
      return [formValues, ...current];
    });

    closeModal();
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Delete this user? This action cannot be undone.");
    if (!confirmed) return;
    setUsers((current) => current.filter((user) => user.id !== id));
  };

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <h1>User Management</h1>
          <p>Track, search, and manage team members from one place.</p>
        </div>
        <button className="add-user-btn" onClick={openAddModal}>
          + Add User
        </button>
      </div>

      <div className="admin-users-stats">
        <div className="stat-card">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>
        <div className="stat-card">
          <span>Active Users</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="stat-card">
          <span>Inactive Users</span>
          <strong>{inactiveCount}</strong>
        </div>
      </div>

      <div className="admin-users-table-card">
        <div className="admin-table-top">
          <input
            type="text"
            placeholder="Search users..."
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="users-table-wrapper">
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
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status-pill ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td className="action-buttons">
                  <button className="edit-btn" onClick={() => openEditModal(user)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="user-modal">
            <div className="modal-header">
              <div>
                <h2>{editingUser ? "Edit User" : "Add User"}</h2>
                <p>{editingUser ? "Update user details." : "Create a new user profile."}</p>
              </div>
              <button className="close-modal-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-form">
              <label>
                User ID
                <input
                  name="id"
                  value={formValues.id}
                  onChange={handleChange}
                  placeholder="EMP005"
                />
              </label>
              <label>
                Name
                <input
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder="jane.doe@example.com"
                />
              </label>
              <label>
                Role
                <input
                  name="role"
                  value={formValues.role}
                  onChange={handleChange}
                  placeholder="Employee"
                />
              </label>
              <label>
                Status
                <select name="status" value={formValues.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={closeModal}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;