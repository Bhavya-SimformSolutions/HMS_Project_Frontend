# UI/UX & Theming

This document explains the UI/UX approach, theming, and component structure of the Angular frontend.

---

## 1. UI Library
- Uses custom components and utility-first CSS for modern, accessible UI
- Custom styles in `styles.css` and feature-specific CSS files

---

## 2. Layout
- Responsive design for desktop and mobile
- Sidebar navigation adapts to user role
- Dashboard, tables, and forms for all major features

---

## 3. Theming
- Custom theming for consistent look and feel
- Custom color palettes can be configured in `styles.css`

---

## 4. Component Structure
- Shared components (buttons, dialogs, tables) in `shared/components/`
- Feature-specific components in `features/`
- Layout components (navbar, sidebar) in `layout/`

---

## 5. Accessibility
- Follows accessibility best practices
- Keyboard navigation and ARIA attributes where needed

---

For more, see the code in `src/app/layout/` and `src/app/shared/components/`.
