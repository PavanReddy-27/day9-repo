import { Request, Response } from "express";

interface SSEClient {
  id: string; // The employee _id string
  res: Response;
}

let clients: SSEClient[] = [];

/**
 * SSE Middleware to handle incoming event stream connections.
 * Note: Should be used *after* authenticateJWT or similar so req.employee is available, 
 * or the client must send a token in the query params.
 */
export const sseMiddleware = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Establish the connection immediately

  // Fallback to query param if JWT middleware not applied
  const employeeId = (req as any).employee?._id?.toString() || req.query.employeeId as string || "unknown";

  const client: SSEClient = { id: employeeId, res };
  clients.push(client);

  req.on("close", () => {
    clients = clients.filter((c) => c.res !== res);
  });
};

/**
 * Broadcasts an SSE event to all connected clients.
 * @param eventName Name of the event (e.g., 'ATTENDANCE_UPDATE')
 * @param payload The data to send
 */
export const broadcastSSE = (eventName: string, payload: any) => {
  clients.forEach((c) => {
    c.res.write(`event: ${eventName}\n`);
    c.res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
};

/**
 * Closes the SSE connection for a specific employee.
 * @param employeeId The employee ID to disconnect
 */
export const closeSSEConnection = (employeeId: string) => {
  clients = clients.filter((c) => {
    if (c.id === employeeId) {
      c.res.write(`event: LOGOUT\n`);
      c.res.write(`data: {}\n\n`);
      c.res.end();
      return false;
    }
    return true;
  });
};
