import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { fetchEmployees } from "../redux/dashboardSlice";
import { getAccessToken } from "../utils/authStorage";

/**
 * Custom hook to establish a Server-Sent Events (SSE) connection.
 * Dynamically binds to Redux auth state so the connection activates
 * immediately upon user sign-in and tears down on logout.
 */
export const useSSE = () => {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    const token = accessToken || getAccessToken() || "";
    
    if (!token || !isAuthenticated) {
      window.dispatchEvent(new CustomEvent("sse_connection_changed", { detail: { connected: false } }));
      return;
    }

    const base = import.meta.env.VITE_API_BASE_URL || "/api/v1";
    const url = `${base.replace(/\/$/, "")}/events/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onopen = () => {
      console.log("[SSE] Connection established successfully.");
      window.dispatchEvent(new CustomEvent("sse_connection_changed", { detail: { connected: true } }));
    };

    eventSource.addEventListener("ATTENDANCE_UPDATE", (event) => {
      console.log("[SSE] Received ATTENDANCE_UPDATE:", event.data);
      dispatch(fetchEmployees());
      window.dispatchEvent(new Event("attendance_updated"));
    });

    eventSource.addEventListener("NOTIFICATION_UPDATE", (event) => {
      console.log("[SSE] Received NOTIFICATION_UPDATE:", event.data);
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        payload = event.data;
      }
      window.dispatchEvent(new CustomEvent("notification_updated", { detail: payload }));
    });

    eventSource.addEventListener("LEAVE_UPDATE", (event) => {
      console.log("[SSE] Received LEAVE_UPDATE:", event.data);
      window.dispatchEvent(new Event("leave_updated"));
    });

    eventSource.addEventListener("SYSTEM_PING", (event) => {
      console.log("[SSE] Received SYSTEM_PING:", event.data);
      window.dispatchEvent(new CustomEvent("system_ping_received", { detail: event.data }));
    });

    eventSource.onerror = (error) => {
      console.warn("[SSE] Stream interrupted or reconnecting:", error);
      window.dispatchEvent(new CustomEvent("sse_connection_changed", { detail: { connected: false } }));
    };

    return () => {
      eventSource.close();
      window.dispatchEvent(new CustomEvent("sse_connection_changed", { detail: { connected: false } }));
    };
  }, [dispatch, accessToken, isAuthenticated]);
};
