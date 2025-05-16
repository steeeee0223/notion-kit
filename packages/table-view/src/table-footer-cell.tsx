import { Icon } from "@notion-kit/icons";

interface TableFooterCellProps {
  colId: number;
  width?: string;
}

export function TableFooterCell({ width }: TableFooterCellProps) {
  return (
    <div className="flex" style={{ width }}>
      <div
        role="button"
        tabIndex={0}
        className="transition: background 0.2s; flex h-8 w-full cursor-pointer items-center justify-end overflow-hidden pr-2 whitespace-nowrap select-auto hover:bg-default/5"
      >
        <div className="flex items-center opacity-100 transition-opacity duration-200">
          <div className="flex items-center">
            <span className="text-muted">Calculate</span>
            <Icon.ChevronDown className="mt-px ml-1 block h-full w-2.5 shrink-0 fill-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
