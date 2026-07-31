import type {
  User,
} from "../types/auth";

interface TopbarProps {
  user: User;
}

function Topbar({
  user,
}: TopbarProps) {

  return (
    <header className="topbar">

      <div>
        <strong>
          Workforce Analytics
        </strong>
      </div>

      <div className="user-info">

        <span>
          {user.name}
        </span>

        <span className="role-badge">
          {user.role}
        </span>

      </div>

    </header>
  );
}

export default Topbar;