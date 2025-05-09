import type { GuestRow } from "./types";

export function generateGuestsCsv(data: GuestRow[]) {
  const rows = [];
  if (data.length > 0) {
    rows.push(["Email", "Name", "Pages", "ID"].join(","));
  }
  data.forEach((guest) => {
    const pagesStr = `"${guest.access
      .map((page) => `${page.name} (${page.id})`)
      .join(", ")
      .replace(/"/g, '""')}"`;
    rows.push(
      [guest.user.email, guest.user.name, pagesStr, guest.user.id].join(","),
    );
  });
  return new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
}
