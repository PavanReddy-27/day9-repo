import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>

      {user && <Link to="/dashboard">Dashboard</Link>}

      {!user ? (
        <Link to="/login">Login</Link>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </nav>
  );
}