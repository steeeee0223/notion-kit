import { IconBlock } from "~/icon-block";
import { Button } from "~/primitives";

import type { Page, UpdatePageParams } from "@notion-kit/schemas";

import { RenamePopover } from "./_components";

export interface TitleProps {
  page: Page;
  readOnly?: boolean;
  onUpdate?: (page: Pick<UpdatePageParams, "title" | "icon">) => void;
}

export function Title({ page, readOnly, onUpdate }: TitleProps) {
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
        className="leading-tight text-inherit"
      >
        <IconBlock icon={icon} />
        <span className="truncate">{page.title}</span>
      </Button>
    </RenamePopover>
  );
}
