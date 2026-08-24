import { Request, Response } from "express";

interface SSEClient {
  id: string; // The employee _id string
  companyId: string;
  res: Response;
}

let clients: SSEClient[] = [];

/**
 * SSE Middleware to handle incoming event stream connections.
 * Note: Uses authenticateJWT so req.employee and req.companyId are available.
 */
export const sseMiddleware = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Establish the connection immediately

  const employeeId = (req as any).employee?._id?.toString() || "unknown";
  const companyId = (req as any).companyId?.toString() || "unknown";

  const client: SSEClient = { id: employeeId, companyId, res };
  clients.push(client);

  req.on("close", () => {
    clients = clients.filter((c) => c.res !== res);
  });
};

/**
 * Broadcasts an SSE event to all connected clients within a specific company.
 * @param eventName Name of the event (e.g., 'ATTENDANCE_UPDATE')
 * @param payload The data to send
 * @param companyId The tenant ID to isolate the broadcast
 */
export const broadcastSSE = (eventName: string, payload: any, companyId?: string) => {
  clients.forEach((c) => {
    if (!companyId || c.companyId === companyId.toString()) {
      c.res.write(`event: ${eventName}\n`);
      c.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
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
