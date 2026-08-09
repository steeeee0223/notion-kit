import { CountMethod } from "@notion-kit/table-hook";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  TooltipDescription,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import { countMethodHint } from "./constants";

interface CalcMenuProps {
  id: string; // column id
}

export function CalcMenu({ id }: CalcMenuProps) {
  const { table } = useTableViewCtx();
  const counting = table.getColumnCounting(id);
  const plugin = table.getColumnPlugin(id);
  const currentMethod = counting.method;
  const selectedMethod = plugin.counting
    ?.flatMap((group) => group.functions)
    .find((method) => method.id === currentMethod);

  return (
    <DropdownMenuGroup>
      <DropdownMenuCheckboxItem
        label="None"
        checked={currentMethod === CountMethod.NONE || !selectedMethod}
        onCheckedChange={() => table.setColumnCountMethod(id, CountMethod.NONE)}
      />
      {plugin.counting?.map((group, index) => (
        <DropdownMenuSub key={group.group}>
          <DropdownMenuSubTrigger label={group.group} />
          <DropdownMenuContent sideOffset={-4} className="w-[250px]">
            {index === 0 && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuCheckboxItem
                    checkType="switch"
                    label="Show large counts as 99+"
                    desc="This improves performance for large databases."
                    checked={counting.isCapped}
                    onCheckedChange={() =>
                      table.setColumnCountCapped(id, (v) => !v)
                    }
                  />
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              {group.functions.map((method) => (
                <CalculationItem
                  key={method.id}
                  method={method}
                  checked={currentMethod === method.id}
                  onCheckedChange={() =>
                    table.setColumnCountMethod(id, method.id)
                  }
                />
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenuSub>
      ))}
    </DropdownMenuGroup>
  );
}

interface CalculationItemProps {
  method: {
    id: string;
    name: string;
    hint?: { description: string; imageSrc?: string };
  };
  checked: boolean;
  onCheckedChange: () => void;
}

function CalculationItem({ method, ...props }: CalculationItemProps) {
  const legacyHint = countMethodHint[method.id as CountMethod];
  const description = method.hint?.description ?? legacyHint?.desc;
  const imageSrc = method.hint?.imageSrc ?? legacyHint?.imgSrc;

  if (!description) {
    return <DropdownMenuCheckboxItem {...props} label={method.name} />;
  }

  return (
    <TooltipPreset
      className="w-[156px]"
      side="right"
      description={
        <>
          {imageSrc && <TooltipDescription type="image" text={imageSrc} />}
          <TooltipDescription text={description} />
        </>
      }
    >
      <DropdownMenuCheckboxItem {...props} label={method.name} />
    </TooltipPreset>
  );
}
