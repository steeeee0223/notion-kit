import { ErrorContext } from "@notion-kit/auth";
import { toast } from "@notion-kit/shadcn";

export function handleError(
  { error }: ErrorContext | { error: { message?: string } },
  title: string,
) {
  console.error(title, error);
  toast.error(title, {
    description: error.message,
  });
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
