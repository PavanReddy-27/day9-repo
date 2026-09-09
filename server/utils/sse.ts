import { Request, Response } from "express";

interface SSEClient {
  userId: string;
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

  const userId = (req as any).user?.id?.toString() || "unknown";
  const companyId = (req as any).companyId?.toString() || "unknown";

  const client: SSEClient = { userId, companyId, res };
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
 * Closes the SSE connection for a specific user.
 * @param userId The user ID to disconnect
 */
export const closeSSEConnection = (userId: string) => {
  clients = clients.filter((c) => {
    if (c.userId === userId) {
      c.res.write(`event: LOGOUT\n`);
      c.res.write(`data: {}\n\n`);
      c.res.end();
      return false;
    }
    return true;
  });
};

/**
 * Sends an SSE event to a specific user.
 * @param userId The user ID to target
 * @param eventName Name of the event
 * @param payload The data to send
 */
export const sendSSEToUser = (userId: string, eventName: string, payload: any) => {
  clients.forEach((c) => {
    if (c.userId === userId.toString()) {
      c.res.write(`event: ${eventName}\n`);
      c.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  });
};
