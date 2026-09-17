export const APP_BASE_PATH = "/v";

export const routes = {
  home: "/",
  onboarding: "/onboarding",
  workspace: (slug: string) => `/workspace/${slug}`,
} as const;

export function appURL(path: string) {
  if (path === "/") return APP_BASE_PATH;
  return `${APP_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
