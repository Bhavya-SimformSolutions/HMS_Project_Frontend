# Tailwind CSS Setup

This project uses [Tailwind CSS](https://tailwindcss.com/) for utility-first, responsive, and modern UI design.

---

## 1. Installation & Configuration
Tailwind CSS is already installed and configured in this project. You can find the configuration in `tailwind.config.js` and the main styles in `src/styles.css`.

If you need to reinstall or upgrade Tailwind, run:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

---

## 2. Usage
- Use Tailwind utility classes directly in your component HTML files:
  ```html
  <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
  ```
- Responsive, hover, and dark mode variants are available out of the box.

---

## 3. Customization
- Edit `tailwind.config.js` to add custom colors, fonts, or extend the default theme.
- Add global or feature-specific styles in `src/styles.css` as needed.

---

## 4. Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Play with Tailwind](https://play.tailwindcss.com/)

---

For UI/UX guidelines, see [UI/UX & Theming](./ui-ux.md).
