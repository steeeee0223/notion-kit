"use client";

import React, { useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  Skeleton,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

interface TreeGroupProps extends React.PropsWithChildren {
  title: string;
  description?: string;
  className?: string;
  isLoading?: boolean;
  onCreate?: () => void;
}

const TreeGroup: React.FC<TreeGroupProps> = ({
  className,
  children,
  title,
  description,
  isLoading,
  onCreate,
}) => {
  const [openGroup, setOpenGroup] = useState(true);
  const toggle = () => setOpenGroup((prev) => !prev);

  return (
    <TooltipProvider>
      <div className={className}>
        <div className="group/tree flex items-center px-3 py-1">
          <div className="grow">
            <TooltipPreset side="top" description="Click to hide section">
              <Button
                variant="hint"
                size="xs"
                onClick={toggle}
                className="py-0.5 font-semibold"
              >
                {title}
              </Button>
            </TooltipPreset>
          </div>
          {description && (
            <TooltipPreset side="right" description={description}>
              <Button
                variant="hint"
                size="xs"
                onClick={onCreate}
                className="ml-auto size-auto opacity-0 group-hover/tree:opacity-100"
              >
                <Icon.Plus className="size-3 fill-current" />
              </Button>
            </TooltipPreset>
          )}
        </div>
        {isLoading ? (
          <>
            {Array.from([0, 1, 0, 1, 1]).map((level, i) => (
              <ItemSkeleton key={i} level={level} />
            ))}
          </>
        ) : (
          openGroup && <>{children}</>
        )}
      </div>
    </TooltipProvider>
  );
};

const ItemSkeleton = ({ level }: { level: number }) => {
  return (
    <div
      style={{ paddingLeft: `${(level + 1) * 20}px` }}
      className="flex h-[27px] w-full items-center gap-x-2 py-1 pr-3"
    >
      <Skeleton className="size-4 flex-shrink-0 p-0.5" />
      <Skeleton className="grow py-2" />
    </div>
  );
};

export { TreeGroup };
