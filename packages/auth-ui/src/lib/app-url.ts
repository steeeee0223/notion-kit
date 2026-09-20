export function resolveAppURL(appURL: string, url: string): string {
  const base =
    appURL ||
    (typeof window !== "undefined" ? window.location.origin : undefined);
  if (!base && !/^https?:\/\//.test(url)) return url;
  return new URL(url, base).href;
}
