import { useSyncExternalStore } from "react";

import type { Row } from "@notion-kit/table-view";

type Account = NonNullable<Row["createdBy"]>;

export const systemAccount: Account = { id: "system", name: "System" };

const storageKey = "notion-table:visitor-id";
let visitor: Account | null = null;

function getVisitorId() {
  const id = crypto.randomUUID();
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return saved;
    localStorage.setItem(storageKey, id);
  } catch {
    // Private browsing can disable storage. Keep the identity for this page.
  }
  return id;
}

function createAvatar(id: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 48;
  const context = canvas.getContext("2d");
  if (!context) return undefined;

  const hue = Number.parseInt(id.slice(0, 8), 16) % 360 || 0;
  context.fillStyle = `hsl(${hue} 48% 37%)`;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.font = "600 26px system-ui";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("Y", 24, 24);
  return canvas.toDataURL();
}

function subscribe(onChange: () => void) {
  if (!visitor) {
    const id = getVisitorId();
    visitor = { id, name: "You", avatarUrl: createAvatar(id) };
    onChange();
  }
  return () => undefined;
}

export function useVisitorAccount() {
  return useSyncExternalStore(
    subscribe,
    () => visitor,
    () => null,
  );
}
