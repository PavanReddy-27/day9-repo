# Workforce Analytics API Documentation

Base URL: `http://localhost:5000/api/v1`

## 1. Authentication

### Login
`POST /auth/login`
- **Body**: `{ "email": "admin@stackly.com", "password": "Password123!" }`
- **Response**: Returns JWT `accessToken` and `refreshToken`.

### Logout
`POST /auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "success": true, "message": "Logged out successfully" }`
- **Effect**: Adds the token to the `TokenBlacklist` MongoDB collection.

## 2. Attendance

### Check In
`POST /attendance/check-in`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "latitude": 17.385, "longitude": 78.486 }`
- **Response**: Creates an `AttendanceRecord`, emits SSE `ATTENDANCE_UPDATE`, creates an `AuditLog`.

### Check Out
`POST /attendance/check-out`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Finalizes work hours, emits SSE update, creates an `AuditLog`.

### Start Break / Resume Work
`POST /attendance/break/start` and `POST /attendance/break/resume`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Toggles break state.

## 3. Analytics (Manager/HR/Admin)

### Get Overview KPIs
`GET /analytics/overview`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `timeRange=month`
- **Response**: Aggregated KPI data (headcount, attendance rate, attrition, overtime).

### Get Real-Time Stream (SSE)
`GET /events/stream`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Text-event stream pushing live dashboard updates.
