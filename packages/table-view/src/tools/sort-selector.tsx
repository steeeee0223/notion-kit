import { Icon } from "@notion-kit/icons";
import { Button, DropdownMenuTrigger } from "@notion-kit/ui/primitives";

import { useMenuCoordinator, useTableViewCtx } from "@/table-contexts";

export function SortSelector() {
  const { table } = useTableViewCtx();
  const { sortMenu } = useMenuCoordinator();

  return (
    <table.Subscribe
      selector={(state) => ({
        sorting: state.sorting,
        columnsInfo: state.columnsInfo,
      })}
    >
      {({ sorting, columnsInfo }) => {
        const count = sorting.length;
        const badgeDisplay = (() => {
          if (count === 1) {
            const sort = sorting[0]!;
            return (
              <>
                {sort.desc ? (
                  <Icon.ArrowDown className="size-3.5" />
                ) : (
                  <Icon.ArrowUp className="size-3.5" />
                )}
                {columnsInfo[sort.id]?.name}
              </>
            );
          }
          return (
            <>
              <Icon.ArrowUpDown className="size-4" />
              {count} sorts
            </>
          );
        })();

        return (
          <DropdownMenuTrigger
            handle={sortMenu.handle}
            render={
              <Button
                variant="soft-blue"
                size="xs"
                className="gap-1 rounded-full px-2 text-sm [&_svg]:fill-current"
              >
                {badgeDisplay}
                <Icon.Chevron side="down" className="size-3" />
              </Button>
            }
          />
        );
      }}
    </table.Subscribe>
  );
}
