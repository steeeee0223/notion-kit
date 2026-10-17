import { toast } from "@notion-kit/ui/primitives";

export async function asyncSuccess(msg: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  toast.success(msg);
}
