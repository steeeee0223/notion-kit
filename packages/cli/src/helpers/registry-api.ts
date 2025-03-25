import type { RegistryTheme } from "@notion-kit/validators";

export const getRegistryThemes = () => {
  return [
    { id: "darky", label: "Darky" },
    { id: "versel", label: "Versel" },
    { id: "githoub", label: "Githoub" },
  ];
};

export const getRegistryTheme = () => {
  return {
    name: "darky",
    label: "Darky",
    iconLibrary: "lucide-icons",
    primitives: {
      button: "basic",
      "toggle-button": "basic",
      input: "basic",
      modal: "basic",
    },
    css: {}, // TODO
  } satisfies RegistryTheme;
};
