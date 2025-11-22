/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@notion-kit/table-view"],

  /** We already do typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
};

export default config;
