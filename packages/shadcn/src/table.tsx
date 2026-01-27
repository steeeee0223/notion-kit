import * as React from "react";

import { cn, cva } from "@notion-kit/cn";

const tableVariants = cva("", {
  variants: {
    "table-row": {
      default: "border-t border-t-default/10",
      striped: "odd:bg-[#f7f7f5] dark:odd:bg-modal",
    },
  },
  defaultVariants: {
    "table-row": "default",
  },
});

type TableVariant = "default" | "striped";

function tableClasses(
  slot: "table-row" | "table-cell",
  variant?: TableVariant,
) {
  return tableVariants({ [slot]: variant });
}

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn(
          "w-full border-y border-y-default/10 text-[13px]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader(props: React.ComponentProps<"thead">) {
  return <thead {...props} />;
}

function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      className={cn(
        "border-t bg-muted/50 font-medium last:[&>tr]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

interface TableRowProps extends React.ComponentProps<"tr"> {
  variant?: TableVariant;
}

function TableRow({ className, variant, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(tableClasses("table-row", variant), className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "sticky top-0 h-8 bg-transparent text-start text-xs font-normal text-secondary",
        "data-[pinned=left]:left-0 data-[pinned=left]:z-40 data-[pinned=left]:bg-modal data-[pinned=left]:shadow-l-pinned",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "h-[42px] bg-transparent pr-3",
        "data-[pinned=left]:sticky data-[pinned=left]:left-0 data-[pinned=left]:z-20 data-[pinned=left]:bg-modal data-[pinned=left]:shadow-l-pinned",
        className,
      )}
      {...props}
    />
  );
}

function TableEmptyCell({
  colSpan,
  className,
  children,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <TableCell
      colSpan={colSpan}
      className={cn("h-8 text-start text-secondary", className)}
      {...props}
    >
      {children}
    </TableCell>
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption className={cn("mt-4 text-sm text-muted", className)} {...props} />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableEmptyCell,
  TableCaption,
};
