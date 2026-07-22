import type { NextConfig } from "next";

const config = {
  reactStrictMode: true,
  reactCompiler: true,
  productionBrowserSourceMaps: true,

  /** We already do typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig;

export default config;
