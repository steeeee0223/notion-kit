import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

interface MenuHeaderProps {
  id?: string;
  title: string;
  onBack?: () => void;
  onClose?: () => void;
}

export function MenuHeader({ id, title, onBack, onClose }: MenuHeaderProps) {
  const { table } = useTableViewCtx();
  const closeMenu =
    onClose ?? (() => table.setTableMenuState({ open: false, page: null }));

  return (
    <div className="flex h-[42px] shrink-0 items-center px-4 pt-3.5 pb-1.5">
      {onBack !== undefined && (
        <Button
          variant="hint"
          className="mr-2 -ml-0.5 h-[22px] w-6 shrink-0 rounded-md p-0"
          onClick={onBack}
          aria-label="Back"
        >
          <Icon.ArrowLeftThick className="fill-default/45" />
        </Button>
      )}
      <h1 id={id} className="grow truncate text-sm font-semibold">
        {title}
      </h1>
      <Button
        variant="close"
        size="circle"
        aria-label="Close"
        onClick={closeMenu}
      >
        <Icon.Close className="h-full w-3.5 fill-secondary dark:fill-default/45" />
      </Button>
    </div>
  );
}

interface MenuGroupHeaderProps {
  title: string;
  action?: string | null;
  onActionClick?: () => void;
}

export function MenuGroupHeader({
  title,
  action,
  onActionClick,
}: MenuGroupHeaderProps) {
  return (
    <div className="mt-1.5 mb-2 flex h-[19px] fill-default/45 px-3.5 text-xs/tight font-medium text-secondary select-none">
      <div className="flex self-center">{title}</div>
      {action && (
        <div className="ml-auto">
          <Button
            tabIndex={0}
            variant="soft-blue"
            className="h-[initial] min-w-0 shrink bg-transparent px-1.5 py-0.5 text-xs/tight shadow-none"
            onClick={onActionClick}
          >
            {action}
          </Button>
        </div>
      )}
    </div>
  );
}
