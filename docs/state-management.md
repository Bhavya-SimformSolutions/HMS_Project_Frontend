# State Management

This document describes how state is managed in the Angular frontend.

---

## 1. Local State
- Most components use Angular's built-in state (component properties, services)
- Services hold shared state (e.g., current user, notifications)

---

## 2. Reactive Patterns
- RxJS `BehaviorSubject` and `Observable` are used for reactive state (e.g., auth status, notifications)
- Components subscribe to observables for real-time updates

---

## 3. Forms
- Angular Reactive Forms are used for all user input (login, registration, appointment booking, etc.)
- Form state and validation are managed via FormGroup and FormControl

---

## 4. UI State
- Loading indicators, error messages, and modals are managed via component state or shared services

---

For complex apps, NgRx or other state libraries can be added, but this project uses Angular's built-in tools for simplicity.
