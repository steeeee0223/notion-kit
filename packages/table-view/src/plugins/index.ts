import {
  checkbox as createCheckbox,
  createdBy as createCreatedBy,
  createdTime as createCreatedTime,
  date as createDate,
  email as createEmail,
  id as createId,
  lastEditedBy as createLastEditedBy,
  lastEditedTime as createLastEditedTime,
  location as createLocation,
  multiSelect as createMultiSelect,
  number as createNumber,
  person as createPerson,
  phone as createPhone,
  relation as createRelation,
  rollup as createRollup,
  select as createSelect,
  text as createText,
  title as createTitle,
  url as createUrl,
} from "@notion-kit/table-hook/plugins";

import { checkbox } from "./checkbox";
import { createdTime, date, lastEditedTime } from "./date";
import { id } from "./id";
import { email, phone, url } from "./link";
import { location } from "./location";
import { number } from "./number";
import { createdBy, lastEditedBy, person } from "./person";
import { createPluginRegistry } from "./registry";
import { relation } from "./relation";
import { rollup } from "./rollup";
import { multiSelect, select } from "./select";
import { text } from "./text";
import { title } from "./title";

export const DEFAULT_DATA_PLUGINS = [
  createTitle(),
  createText(),
  createNumber(),
  createCheckbox(),
  createSelect(),
  createMultiSelect(),
  createEmail(),
  createPhone(),
  createUrl(),
  createDate(),
  createCreatedTime(),
  createLastEditedTime(),
  createId(),
  createPerson(),
  createCreatedBy(),
  createLastEditedBy(),
  createLocation(),
  createRelation(),
  createRollup(),
];

export const DEFAULT_UI_PLUGINS = [
  title(),
  text(),
  number(),
  checkbox(),
  select(),
  multiSelect(),
  email(),
  phone(),
  url(),
  date(),
  createdTime(),
  lastEditedTime(),
  id(),
  person(),
  createdBy(),
  lastEditedBy(),
  location(),
  relation(),
  rollup(),
];

export const DEFAULT_PLUGINS = createPluginRegistry({
  data: DEFAULT_DATA_PLUGINS,
  ui: DEFAULT_UI_PLUGINS,
});

export type DefaultPlugins = typeof DEFAULT_DATA_PLUGINS;

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
  date,
  createdTime,
  lastEditedTime,
  id,
  person,
  createdBy,
  lastEditedBy,
  location,
  relation,
  rollup,
};
export { DefaultGroupingValue } from "./utils";
export { createPluginRegistry } from "./registry";
export type {
  BulkEditorProps,
  CellProps,
  ConfigMenuProps,
  GroupingValueProps,
  ReadOnlyValueProps,
  TablePluginPair,
  TablePluginRegistry,
  TableUiPlugin,
} from "./registry";

// TMP export for development examples
export * from "./date/date-cell";
