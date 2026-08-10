interface PageStateProps {
  type:
    | "loading"
    | "error"
    | "empty";

  message?: string;
}

function PageState({
  type,
  message,
}: PageStateProps) {

  if (type === "loading") {
    return (
      <div className="page-state">
        <div className="spinner" />

        <p>
          Loading workforce data...
        </p>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="page-state error">
        <h3>
          Something went wrong
        </h3>

        <p>
          {message ||
            "Unable to load data."}
        </p>

        <button>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="page-state">
      <h3>
        No data available
      </h3>

      <p>
        {message ||
          "There is no data to display."}
      </p>
    </div>
  );
}

export default PageState;