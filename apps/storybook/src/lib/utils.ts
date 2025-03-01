export const delay = async (timeout: number) =>
  await new Promise((resolve) => setTimeout(resolve, timeout));
