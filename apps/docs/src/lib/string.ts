/**
 * aaa-bbb-ccc => Aaa Bbb Ccc
 */
export const kebabCaseToTitleCase = (string: string): string => {
  return string
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * aaa-bbb-ccc => aaaBbbCcc
 */
export const kebabCaseToCamelCase = (string: string): string => {
  return string.replace(/-([a-z])/g, (g) => g[1]?.toUpperCase() ?? g);
};
