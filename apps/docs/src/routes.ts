import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("docs/*", "routes/page.tsx", { id: "docs" }),
  route("registry/*", "routes/page.tsx", { id: "registry" }),
  route("development/*", "routes/page.tsx", { id: "development" }),
  route("api/search", "routes/search.ts"),
  route("story/*", "routes/story.tsx"),
] satisfies RouteConfig;
