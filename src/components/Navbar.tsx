import type { FC } from "react";
import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

const Navbar: FC = () => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2>Dashboard</h2>
      </div>

      <div className="navbar-right">

        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search..."
          />
        </div>

        <button className="icon-btn">
          <FaBell />
        </button>

        <div className="profile">
          <FaUserCircle className="profile-icon" />
          <div>
            <h4>Admin</h4>
            <small>Administrator</small>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;