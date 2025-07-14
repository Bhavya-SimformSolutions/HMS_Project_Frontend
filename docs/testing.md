# Testing

This document describes the testing approach for the Angular frontend.

---

## 1. Unit Testing
- Uses Jasmine and Karma (default Angular setup)
- Test files are named `*.spec.ts` and located alongside components/services
- Run tests with:
  ```bash
  ng test
  ```

---

## 2. End-to-End (E2E) Testing
- E2E tests can be added using Cypress, Protractor, or Playwright
- E2E tests simulate real user flows (login, booking, etc.)
- Run E2E tests with:
  ```bash
  ng e2e
  ```

---

## 3. Best Practices
- Write tests for all core logic and UI components
- Mock API calls in unit tests
- Use Angular TestBed for component/service testing

---

For more, see Angular's [Testing Guide](https://angular.io/guide/testing).
