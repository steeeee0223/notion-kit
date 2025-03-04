import type { Config } from "tailwindcss";
import theme from "tailwindcss/defaultTheme";

import baseConfig from "@notion-kit/tailwind-config/web";

const config = {
  darkMode: "class",
  content: [...baseConfig.content, "../../packages/shadcn/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...theme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...theme.fontFamily.mono],
      },
    },
  },
} satisfies Config;

export default config;
