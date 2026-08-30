import type { NextConfig } from "next";

const config = {
  basePath: "/example/table",
  reactStrictMode: true,
  reactCompiler: true,

  /** We already do typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig;

export default config;
