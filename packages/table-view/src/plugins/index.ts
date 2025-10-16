import { checkbox } from "./checkbox";
import { number } from "./number";
import { multiSelect, select } from "./select";
import { text } from "./text";
import { title } from "./title";

export const DEFAULT_PLUGINS = [
  title(),
  text(),
  number(),
  checkbox(),
  select(),
  multiSelect(),
];

export type DefaultPlugins = (typeof DEFAULT_PLUGINS)[number][];

export { title, text, checkbox, select, multiSelect, number };
export type * from "./types";
