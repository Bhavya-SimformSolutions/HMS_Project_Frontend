# Architecture & File Structure

This document provides an overview of the Angular frontend architecture, folder structure, and how the application is organized for maintainability and scalability.

---

## 1. Tech Stack
- **Angular** (SPA framework)
- **TypeScript** (type safety)
- **RxJS** (reactive programming)
- **Socket.IO Client** (real-time notifications)

---

## 2. Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/         # Core services, guards, interceptors
│   │   ├── features/     # Feature modules by domain/role
│   │   ├── layout/       # Navbar, sidebar, layout components
│   │   ├── shared/       # Shared components, models, pipes, utils
│   │   ├── app.routes.ts # Route definitions
│   │   └── app.component.*
│   ├── assets/           # Static assets (images, icons)
│   └── environments/     # Environment configs
├── angular.json          # Angular CLI config
├── package.json          # Project metadata and scripts
└── tsconfig.json         # TypeScript config
```

---

## 3. Folder Roles
- **core/**: Singleton services (API, auth, notifications), guards, interceptors
- **features/**: All user-facing features, grouped by role (admin, doctor, patient, etc.)
- **layout/**: Application shell, navigation, and layout components
- **shared/**: Reusable components, models, pipes, and utility functions

---

## 4. Routing & Lazy Loading
- Routes are defined in `app.routes.ts` and use Angular's lazy loading for feature modules
- Guards protect routes based on authentication and user role

---

For more details, see the other documentation files in this folder.
