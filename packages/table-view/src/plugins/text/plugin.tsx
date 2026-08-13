import { text as createText } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { TextCell } from "./text-cell";

export function text() {
  return createText({
    icon: <DefaultIcon type="text" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="text" />,
    renderCell: (props) => <TextCell {...props} />,
  });
}
