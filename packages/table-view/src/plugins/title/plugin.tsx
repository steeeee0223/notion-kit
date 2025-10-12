import { functionalUpdate } from "@tanstack/react-table";

import { DefaultIcon } from "../../common";
import type { ColumnInfo } from "../../lib/types";
import { TableDataAtom } from "../types";
import { TitleCell } from "./title-cell";
import { TitleConfig } from "./title-config";
import type { TitleActions, TitlePlugin } from "./types";

function titleReducer(v: TableDataAtom, a: TitleActions): TableDataAtom {
  const prop = v.properties[a.id] as ColumnInfo<TitlePlugin>;
  prop.config.showIcon = functionalUpdate(
    a.updater,
    prop.config.showIcon ?? true,
  );
  return { ...v, properties: { ...v.properties, [a.id]: prop } };
}

export function title(): TitlePlugin {
  return {
    id: "title",
    default: {
      name: "Title",
      icon: <DefaultIcon type="title" />,
      data: { value: "" },
      config: { showIcon: true },
    },
    fromReadableValue: (value) => ({ value }),
    toReadableValue: (data) => data.value,
    toTextValue: (data) => data.value,
    renderCell: ({ data, config, wrapped, onChange }) => (
      <TitleCell
        value={data.value}
        wrapped={wrapped}
        icon={config?.showIcon ? data.icon : undefined}
        onUpdate={(value) => onChange?.({ ...data, value })}
      />
    ),
    renderConfigMenu: ({ propId, config }) => (
      <TitleConfig propId={propId} config={config} />
    ),
    reducer: titleReducer,
  };
}
