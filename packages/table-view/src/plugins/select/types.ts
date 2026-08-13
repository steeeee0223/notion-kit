import type { Cell } from "@notion-kit/table-hook";
import type {
  MultiSelectPlugin,
  SelectPlugin,
} from "@notion-kit/table-hook/plugins";

export type {
  MultiSelectPlugin,
  OptionConfig,
  SelectConfig,
  SelectPlugin,
  SelectSort,
} from "@notion-kit/table-hook/plugins";

export type SelectCell = Cell<SelectPlugin> | Cell<MultiSelectPlugin>;
