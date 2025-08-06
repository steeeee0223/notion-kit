import { checkbox } from "./checkbox";
import { multiSelect, select } from "./select";
import { text } from "./text";
import { title } from "./title";

export const DEFAULT_PLUGINS = [
  title(),
  text(),
  checkbox(),
  select(),
  multiSelect(),
];

export type DefaultPlugins = (typeof DEFAULT_PLUGINS)[number][];

export { title, text, checkbox, select, multiSelect };
export type * from "./types";
