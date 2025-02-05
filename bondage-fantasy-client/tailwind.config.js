/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "app-shell": "var(--app-shell-border-color)",
        dimmed: "var(--mantine-color-dimmed)",
      },
      spacing: {
        xs: "var(--mantine-spacing-xs)",
        sm: "var(--mantine-spacing-sm)",
        md: "var(--mantine-spacing-md)",
        lg: "var(--mantine-spacing-lg)",
        xl: "var(--mantine-spacing-xl)",
      },
      fontSize: {
        xs: "var(--mantine-font-size-xs)",
        sm: "var(--mantine-font-size-sm)",
        md: "var(--mantine-font-size-md)",
        lg: "var(--mantine-font-size-lg)",
        xl: "var(--mantine-font-size-xl)",
      },
    },
  },
  plugins: [],
};
