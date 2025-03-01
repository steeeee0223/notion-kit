import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--primary) / <alpha-value>)",
        secondary: {
          DEFAULT: "rgba(var(--primary) / 0.65)",
          dark: "rgba(var(--primary) / 0.45)",
        },
        muted: {
          DEFAULT: "rgba(var(--primary) / 0.50)",
          dark: "rgba(var(--primary) / 0.30)",
        },
        main: "rgb(var(--bg-main) / <alpha-value>)",
        input: "rgb(var(--bg-input) / <alpha-value>)",
        sidebar: "rgb(var(--bg-sidebar) / <alpha-value>)",
        modal: "rgb(var(--bg-modal) / <alpha-value>)",
        popover: "rgb(var(--bg-popover) / <alpha-value>)",
        tooltip: "rgb(var(--bg-tooltip) / <alpha-value>)",
        border: {
          DEFAULT: "rgba(var(--primary) / 0.10)",
          button: "rgba(var(--primary) / 0.15)",
          cell: "rgb(var(--border-cell) / <alpha-value>)",
        },
        ring: {
          DEFAULT: "rgba(15, 15, 15, 0.10)",
          dark: "rgba(255, 255, 255, 0.075)",
        },
        icon: {
          DEFAULT: "rgba(var(--primary) / 0.85)",
          dark: "rgba(var(--primary) / 0.80)",
        },
        blue: {
          DEFAULT: "rgb(35, 131, 226)",
          hover: "rgb(0, 119, 212)",
        },
        red: "rgb(235, 87, 87)",
        orange: "rgb(218, 163, 64)",
        /** Generated by Shadcn */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
} satisfies Config;
