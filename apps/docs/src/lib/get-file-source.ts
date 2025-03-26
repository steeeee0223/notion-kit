import fs from "node:fs";
import path from "path";

export const getFileSource = (filePath: string) => {
  const fullPath = path.join(process.cwd(), "src", filePath);
  const content = fs.readFileSync(fullPath, "utf-8");

  const fileName = path.basename(fullPath);

  const segments = filePath.split(".");

  return {
    fileName,
    code: content,
    lang: segments.length > 0 ? segments.at(-1)! : "tsx",
  };
};
