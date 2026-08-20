import { Request, Response } from "express";

let clients: Response[] = [];

/**
 * SSE Middleware to handle incoming event stream connections.
 */
export const sseMiddleware = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Establish the connection immediately

  // Add the client to the list
  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
};

/**
 * Broadcasts an SSE event to all connected clients.
 * @param eventName Name of the event (e.g., 'ATTENDANCE_UPDATE')
 * @param payload The data to send
 */
export const broadcastSSE = (eventName: string, payload: any) => {
  clients.forEach((client) => {
    client.write(`event: ${eventName}\n`);
    client.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
};
