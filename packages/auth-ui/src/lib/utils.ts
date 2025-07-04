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
