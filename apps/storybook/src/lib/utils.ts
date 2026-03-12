import { toast } from "@notion-kit/shadcn";

export const delay = async (timeout: number): Promise<void> =>
  await new Promise((resolve) => setTimeout(resolve, timeout));

export async function asyncSuccess(msg: string) {
  await delay(1000);
  toast.success(msg);
}
