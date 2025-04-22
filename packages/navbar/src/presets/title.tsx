import { IconBlock } from "@notion-kit/icon-block";
import type { Page, UpdatePageParams } from "@notion-kit/schemas";
import { Button } from "@notion-kit/shadcn";

import { RenamePopover } from "./_components";

export interface TitleProps {
  page: Page;
  readOnly?: boolean;
  onUpdate?: (page: Pick<UpdatePageParams, "title" | "icon">) => void;
}

export const Title: React.FC<TitleProps> = ({ page, readOnly, onUpdate }) => {
  const icon = page.icon ?? { type: "lucide", src: "file" };

  return (
    <RenamePopover
      title={page.title}
      icon={icon}
      onChange={(value) => onUpdate?.(value)}
    >
      <Button
        variant="hint"
        size="xs"
        disabled={readOnly}
        className="gap-1.5 text-sm/[1.2] text-inherit"
      >
        <IconBlock icon={icon} />
        <span className="truncate">{page.title}</span>
      </Button>
    </RenamePopover>
  );
};
