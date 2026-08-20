import { checkbox as createCheckbox } from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { CheckboxCellEditor, CheckboxCellValue } from "./checkbox-cell";
import { CheckboxGroupingValue } from "./checkbox-grouping-value";

export function checkbox() {
  return createCheckbox({
    icon: <DefaultIcon type="checkbox" className="fill-menu-icon" />,
    defaultIcon: <DefaultIcon type="checkbox" />,
    renderCellValue: (props) => <CheckboxCellValue {...props} />,
    renderCellEditor: (props) => ({
      presentation: "inline",
      content: <CheckboxCellEditor {...props} />,
    }),
    renderGroupingValue: (props) => <CheckboxGroupingValue {...props} />,
  });
}
