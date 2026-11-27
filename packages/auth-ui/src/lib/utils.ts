import type { ErrorContext } from "@notion-kit/auth/client";
import { IconObject, type IconData } from "@notion-kit/schemas";
import { toast } from "@notion-kit/ui/primitives";

export function handleError(
  { error }: ErrorContext | { error: { message?: string } },
  title: string,
) {
  console.error(title, error);
  toast.error(title, {
    description: error.message,
  });
}

export function parseWorkspaceIcon(
  logo: string | null | undefined,
  name: string,
): IconData {
  try {
    const icon = IconObject.safeParse(JSON.parse(logo ?? ""));
    if (icon.success) return icon.data;
  } catch {
    // Organizations can have an empty or legacy logo.
  }
  return { type: "text", src: name };
}

/**
 * Converts any name to a URL-friendly slug
 */
export function toSlugLike(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
