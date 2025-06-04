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

export const getFilePath = (filePath: string) => {
  return path.join(process.cwd(), "../../packages", filePath);
};

export const getRegistryPath = (name: string) => {
  return process.env.NODE_ENV === "development"
    ? `http://localhost:3000/registry/${name}.json`
    : `https://notion-ui.vercel.app/registry/${name}.json`;
};
