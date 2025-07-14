# API Integration

This document explains how the Angular frontend communicates with the backend API, including service structure, error handling, and authentication.

---

## 1. Services
- All API calls are handled by Angular services in `core/services/`
- Each domain (patient, doctor, admin, etc.) has its own service (e.g., `patient.service.ts`)
- Services use Angular's `HttpClient` for requests

---

## 2. Authentication
- JWT tokens are stored in local storage or session storage
- Authenticated requests include the token in the `Authorization` header
- Interceptors handle token injection and error responses globally

---

## 3. Error Handling
- HTTP errors are caught and displayed via global error handlers or toast notifications
- User-friendly messages for common errors (401, 403, 404, 500)

---

## 4. Real-time Updates
- WebSocket integration via `websocket.service.ts` for notifications
- Notifications are pushed to the UI in real time

---

## 5. API Endpoints
- All endpoints are documented in the backend API docs
- Services are strongly typed using TypeScript interfaces in `shared/models/`

---

For endpoint details, see the backend [API Overview](../../backend/docs/api-overview.md).
