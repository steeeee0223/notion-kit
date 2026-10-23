import { fileURLToPath } from "node:url";
import story from "@fumadocs/story/vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [fumadocsMdx(), story(), tailwindcss(), reactRouter()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom", "lucide-react"],
  },
  ssr: { noExternal: ["lucide-react"] },
});
