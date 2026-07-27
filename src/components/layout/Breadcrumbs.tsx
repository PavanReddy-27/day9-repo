import { Link, useLocation } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";
import "./Breadcrumbs.css";

const formatLabel = (segment: string) => {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const Breadcrumbs = () => {
  const location = useLocation();

  const pathnames = location.pathname
    .split("/")
    .filter((path) => path);

  return (
    <div className="breadcrumbs">
      <Link to="/" className="breadcrumb-link home-link">
        <FiHome />
        <span>Home</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = "/" + pathnames.slice(0, index + 1).join("/");
        const isLast = index === pathnames.length - 1;

        return (
          <div
            className="breadcrumb-item"
            key={to}
          >
            <FiChevronRight className="breadcrumb-arrow" />

            {isLast ? (
              <span className="breadcrumb-current">
                {formatLabel(value)}
              </span>
            ) : (
              <Link
                to={to}
                className="breadcrumb-link"
              >
                {formatLabel(value)}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;