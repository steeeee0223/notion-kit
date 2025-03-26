"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

import { Hint, HintProvider } from "@notion-kit/common";
import { Button, Skeleton } from "@notion-kit/shadcn";

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
    <HintProvider>
      <div className={className}>
        <div className="group flex items-center px-3 py-1">
          <div className="grow">
            <Hint side="top" description="Click to hide section">
              <Button
                variant="hint"
                size="xs"
                onClick={toggle}
                className="py-0.5 font-semibold"
              >
                {title}
              </Button>
            </Hint>
          </div>
          {description && (
            <Hint side="right" description={description}>
              <Button
                variant="hint"
                size="xs"
                onClick={onCreate}
                className="ml-auto size-auto p-0.5 opacity-0 group-hover:opacity-100"
              >
                <Plus className="size-4" />
              </Button>
            </Hint>
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
    </HintProvider>
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
