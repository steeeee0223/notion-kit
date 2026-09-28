import * as React from "react";

import { cn } from "@notion-kit/cn";

export interface PageHeaderProps
  extends Omit<React.ComponentProps<"header">, "title"> {
  /** A breadcrumb trail rendered above the title. */
  breadcrumb?: React.ReactNode;
  title: React.ReactNode;
  /** The element/component used for the title. @default "h1" */
  as?: React.ElementType;
  description?: React.ReactNode;
  /** Buttons rendered next to the title; wraps below it on narrow screens. */
  actions?: React.ReactNode;
  /** A tabs or metadata slot rendered below the title row. */
  meta?: React.ReactNode;
}

/**
 * A page-level header: breadcrumb, title, description, actions, and an
 * optional tabs/meta slot underneath.
 */
function PageHeader({
  breadcrumb,
  title,
  as: TitleTag = "h1",
  description,
  actions,
  meta,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {breadcrumb && <div className="text-sm text-muted">{breadcrumb}</div>}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <TitleTag className="text-2xl/tight font-semibold text-primary">
            {title}
          </TitleTag>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {meta && <div data-slot="page-header-meta">{meta}</div>}
    </header>
  );
}

export { PageHeader };
