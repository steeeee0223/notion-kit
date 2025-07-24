import { DefaultIcon } from "../../common";
import { getState } from "../../lib/utils";
import type { TableViewAtom } from "../../table-contexts";
import { TitleCell } from "./title-cell";
import { TitleConfig } from "./title-config";
import type { TitleActionPayload, TitlePlugin } from "./types";

export function titleReducer(
  v: TableViewAtom,
  a: TitleActionPayload,
): TableViewAtom {
  switch (a.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case "update:col:meta:title": {
      const prop = v.properties[a.payload.id];
      if (!prop || prop.type !== "title") return v as never;
      prop.config.showIcon = getState(
        a.payload.updater,
        prop.config.showIcon ?? true,
      );
      return { ...v, properties: { ...v.properties, [a.payload.id]: prop } };
    }
    default:
      return v as never;
  }
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
