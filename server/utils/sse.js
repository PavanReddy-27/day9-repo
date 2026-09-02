"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeSSEConnection = exports.broadcastSSE = exports.sseMiddleware = void 0;
var clients = [];
/**
 * SSE Middleware to handle incoming event stream connections.
 * Note: Uses authenticateJWT so req.employee and req.companyId are available.
 */
var sseMiddleware = function (req, res) {
    var _a, _b, _c;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // Establish the connection immediately
    var employeeId = ((_b = (_a = req.employee) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || "unknown";
    var companyId = ((_c = req.companyId) === null || _c === void 0 ? void 0 : _c.toString()) || "unknown";
    var client = { id: employeeId, companyId: companyId, res: res };
    clients.push(client);
    req.on("close", function () {
        clients = clients.filter(function (c) { return c.res !== res; });
    });
};
exports.sseMiddleware = sseMiddleware;
/**
 * Broadcasts an SSE event to all connected clients within a specific company.
 * @param eventName Name of the event (e.g., 'ATTENDANCE_UPDATE')
 * @param payload The data to send
 * @param companyId The tenant ID to isolate the broadcast
 */
var broadcastSSE = function (eventName, payload, companyId) {
    clients.forEach(function (c) {
        if (!companyId || c.companyId === companyId.toString()) {
            c.res.write("event: ".concat(eventName, "\n"));
            c.res.write("data: ".concat(JSON.stringify(payload), "\n\n"));
        }
    });
};
exports.broadcastSSE = broadcastSSE;
/**
 * Closes the SSE connection for a specific employee.
 * @param employeeId The employee ID to disconnect
 */
var closeSSEConnection = function (employeeId) {
    clients = clients.filter(function (c) {
        if (c.id === employeeId) {
            c.res.write("event: LOGOUT\n");
            c.res.write("data: {}\n\n");
            c.res.end();
            return false;
        }
        return true;
    });
};
exports.closeSSEConnection = closeSSEConnection;
