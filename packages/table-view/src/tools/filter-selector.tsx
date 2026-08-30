import { Icon } from "@notion-kit/icons";
import { countFilterRules } from "@notion-kit/table-hook";
import { Button, PopoverTrigger } from "@notion-kit/ui/primitives";

import { useMenuCoordinator, useTableViewCtx } from "@/table-contexts";

export function FilterSelector() {
  const { table } = useTableViewCtx();
  const { filterMenu } = useMenuCoordinator();

  return (
    <table.Subscribe selector={(state) => state.tableGlobal.filters}>
      {(filters) => {
        const count = countFilterRules(filters);

        return (
          <PopoverTrigger
            handle={filterMenu.handle}
            render={
              <Button
                variant="soft-blue"
                size="xs"
                className="gap-1 rounded-full px-2 text-sm [&_svg]:fill-current"
              >
                <Icon.FilterSmall className="size-4" />
                {count} {count === 1 ? "rule" : "rules"}
                <Icon.Chevron side="down" className="size-3" />
              </Button>
            }
          />
        );
      }}
    </table.Subscribe>
  );
}
