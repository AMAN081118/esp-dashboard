# ESP Dashboard API Documentation

## Base URL

- HTTP: `http://<server-ip>:5000`
- WebSocket: `ws://<server-ip>:5000`

---

## REST API Endpoints

### 1. POST `/api/data`
- **Description:** Add a new sensor reading (for HTTP clients/ESP fallback).
- **Body:**
  ```json
  {
    "rpm": 1200,
    "vibration": 0.5,
    "encoder": 10,
    "machine_id": "MACHINE_1",
    "worker_id": 1
  }
  ```
- **Response:** `{ success: true, id, status }`

### 2. GET `/api/live`
- **Description:** Get the latest 50 sensor readings.
- **Response:**
  ```json
  [
    { "timestamp": "...", "rpm": 1200, "vibration": 0.5, "encoder": 10, ... },
    ...
  ]
  ```

### 3. GET `/api/history`
- **Description:** Get historical readings (filter by date, time, year).
- **Query Params:** `date`, `time`, `year`
- **Response:** Array of readings.

### 4. GET `/api/session/:sessionId/status-summary`
- **Description:** Get count of each machine status for a session.
- **Response:**
  ```json
  [
    { "status": "Off", "count": 10 },
    { "status": "Idle", "count": 5 },
    ...
  ]
  ```

### 5. GET `/api/sessions/:sessionId/uptime`
- **Description:** Get total uptime (in seconds) for a session.
- **Response:** `{ uptimeSeconds: 1234 }`

### 6. Session Management
- **POST `/api/sessions`**: Start a session. Body: `{ worker_id, machine_id }`
- **POST `/api/sessions/end`**: End a session. Body: `{ session_id }`
- **GET `/api/sessions/active`**: Get active session for worker/machine.
- **GET `/api/sessions/all-active`**: Get all active sessions.

---

## WebSocket API

- **URL:** `ws://<server-ip>:5000`
- **Send (from ESP):**
  ```json
  {
    "rpm": 1200,
    "vibration": 0.5,
    "encoder": 10,
    "machine_id": "MACHINE_1",
    "worker_id": 1
  }
  ```
- **Receive (to dashboard):**
  ```json
  {
    "rpm": 1200,
    "vibration": 0.5,
    "encoder": 10,
    "worker_id": 1,
    "machine_id": "MACHINE_1",
    "status": "Machining Active",
    "timestamp": "2025-06-27T12:34:56.789Z"
  }
  ```

---

## Notes
- All endpoints return JSON.
- WebSocket is for real-time data; REST is for history and session management.
- Replace `<server-ip>` with your server's IP or `localhost` for local testing.
