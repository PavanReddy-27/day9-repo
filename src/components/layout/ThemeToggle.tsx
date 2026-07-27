import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle ${theme}`}
      onClick={toggleTheme}
      aria-label="Toggle Theme"
    >
      <div className="toggle-thumb">
        {theme === "light" ? <FiSun /> : <FiMoon />}
      </div>
    </button>
  );
};

export default ThemeToggle;