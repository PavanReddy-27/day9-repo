import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "100px",
            marginBottom: "10px",
            color: "#6366f1",
          }}
        >
          404
        </h1>

        <h2>Page Not Found</h2>

        <p style={{ margin: "20px 0" }}>
          Sorry, the page you are looking for doesn't exist.
        </p>

        <Link
          to="/dashboard"
          style={{
            padding: "12px 24px",
            background: "#6366f1",
            color: "#fff",
            borderRadius: "10px",
            textDecoration: "none",
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;