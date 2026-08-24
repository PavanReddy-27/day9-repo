import type {
  User,
} from "../types/auth";
import NotificationBell from "./notifications/NotificationBell";

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
        <NotificationBell />

        <span>
          {user.fullName || user.username}
        </span>

        <span className="role-badge">
          {user.role}
        </span>

      </div>

    </header>
  );
}

export default Topbar;