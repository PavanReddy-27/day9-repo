import type { User } from "../types/user";

interface Props {
  users: User[];
}

const UserTable = ({ users }: Props) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>

          <th>Name</th>

          <th>Email</th>

          <th>Role</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>

            <td>{user.name}</td>

            <td>{user.email}</td>

            <td>{user.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;