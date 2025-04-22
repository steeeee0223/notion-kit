export type StateChangeEvent = (
  pageId: string,
  action: "archive" | "restore" | "delete",
) => void;
