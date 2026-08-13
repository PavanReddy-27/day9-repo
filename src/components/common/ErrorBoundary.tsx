import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time exceptions anywhere in the subtree and shows a recoverable
 * fallback instead of unmounting the whole app to a blank/black screen.
 *
 * Without this, a single bad record (e.g. a missing field on an attendance row)
 * throws during render and React tears down the entire tree, leaving the user
 * staring at a black page with only a console error.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface for debugging without leaking anything sensitive.
    console.error("[ErrorBoundary] Caught a render error:", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          color: "var(--text-h, #111)",
        }}
      >
        <h2 style={{ margin: 0 }}>Something went wrong on this page</h2>
        <p style={{ maxWidth: 480, opacity: 0.75, margin: 0 }}>
          The page hit an unexpected error while rendering. You can try again, or reload the app.
        </p>
        <pre
          style={{
            maxWidth: "90vw",
            overflowX: "auto",
            fontSize: 12,
            opacity: 0.6,
            background: "var(--surface, rgba(0,0,0,0.04))",
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          {error.message}
        </pre>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={this.reset}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--border, #ccc)",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#2563EB",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
