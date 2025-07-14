# Features & User Flows

This document describes the main features and user flows for each role in the Healthcare Management System frontend.

---

## 1. Roles & Dashboards
- **Admin**: Manage doctors, patients, services, appointments, and billing. Access analytics dashboard.
- **Doctor**: View/manage appointments, add diagnosis/prescriptions, view patient records, billing, and notifications.
- **Patient**: Register, book appointments, view records, prescriptions, billing, and receive notifications.

---

## 2. Key Features
- **Authentication**: Login, registration, JWT-based session management
- **Role-based Navigation**: Sidebar and routes adapt to user role
- **Appointment Management**: Book, view, and manage appointments
- **Medical Records**: View and filter records, prescriptions, and vitals
- **Billing**: View and filter bills, download invoices
- **Notifications**: Real-time updates via WebSocket
- **Profile Management**: Update profile, upload images
- **Admin Tools**: Add/edit doctors, services, and view system analytics

---

## 3. Typical User Flows

### Patient
1. Register and complete profile
2. Book an appointment
3. Receive confirmation and reminders
4. Attend appointment and view diagnosis/prescription
5. View records and bills

### Doctor
1. Log in and view dashboard
2. See upcoming appointments
3. Add diagnosis/prescriptions after consultation
4. View patient history and vitals
5. Manage billing

### Admin
1. Log in to admin dashboard
2. Manage users, services, and appointments
3. Monitor analytics and billing

---

For API details, see [API Integration](./api-integration.md).
