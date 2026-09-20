import { z } from "zod/v4";

const imageContentType = z.enum([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

export async function fileToBase64(file: File) {
  const contentType = imageContentType.parse(file.type);
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return { imageBase64: btoa(binary), contentType };
}
