import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { fetchEmployees } from "../redux/dashboardSlice";
import { getAccessToken } from "../utils/authStorage";

/**
 * Custom hook to establish a Server-Sent Events (SSE) connection.
 * When the server broadcasts an ATTENDANCE_UPDATE, it automatically triggers
 * a global DOM event and Redux fetch so that dashboards stay 100% in sync without polling.
 */
export const useSSE = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = getAccessToken() || "";
    
    if (!token) {
      return;
    }
    const url = `${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/events/stream?token=${token}`;
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log("SSE Connection established.");
    };

    eventSource.addEventListener("ATTENDANCE_UPDATE", (event) => {
      console.log("Received SSE Event:", event.data);
      // Trigger Redux re-fetch for KPI cards/dashboards
      dispatch(fetchEmployees());
      // Trigger custom window event for independent components (like Attendance tables)
      window.dispatchEvent(new Event("attendance_updated"));
    });

    eventSource.addEventListener("NOTIFICATION_UPDATE", (event) => {
      console.log("Received Notification SSE Event:", event.data);
      let payload;
      try { payload = JSON.parse(event.data); } catch (e) {}
      window.dispatchEvent(new CustomEvent("notification_updated", { detail: payload }));
    });

    eventSource.addEventListener("LEAVE_UPDATE", (event) => {
      console.log("Received Leave SSE Event:", event.data);
      window.dispatchEvent(new Event("leave_updated"));
    });

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      // EventSource auto-reconnects, but we can handle specific close logic here if needed
    };

    return () => {
      eventSource.close();
    };
  }, [dispatch]);
};
