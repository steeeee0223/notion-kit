import { checkbox } from "./checkbox";
import { email, phone, url } from "./link";
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
  email(),
  phone(),
  url(),
];

export type DefaultPlugins = (typeof DEFAULT_PLUGINS)[number][];

export {
  title,
  text,
  checkbox,
  select,
  multiSelect,
  number,
  email,
  phone,
  url,
};
export type * from "./types";
