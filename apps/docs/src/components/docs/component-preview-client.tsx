"use client";

import React from "react";

import { Skeleton } from "@notion-kit/shadcn";

import { useHorizontalResize } from "@/hooks/use-horizontal-resize";

interface ComponentWrapperProps extends React.PropsWithChildren {
  suspense?: boolean;
  fallback?: React.ReactNode;
}

export const ComponentWrapper: React.FC<ComponentWrapperProps> = ({
  suspense,
  fallback = <Skeleton className="h-40" />,
  children,
}) => {
  if (suspense) {
    return <React.Suspense fallback={fallback}>{children}</React.Suspense>;
  }
  return children;
};

interface ResizableContainerProps extends React.PropsWithChildren {
  resizable?: boolean;
}

export const ResizableContainer: React.FC<ResizableContainerProps> = ({
  children,
  resizable,
}) => {
  const { containerRef, width, handleMouseDown } = useHorizontalResize({
    // minWidth: 100, // Optional custom minimum width
  });

  if (!resizable) return children;

  return (
    <div
      className="relative overflow-hidden"
      ref={containerRef}
      style={{ width: width !== null ? `${width}px` : undefined }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-1/2 right-2 z-20 h-15 w-2 -translate-y-1/2 cursor-col-resize rounded-full bg-muted shadow-sm"
      />
      {children}
    </div>
  );
};
