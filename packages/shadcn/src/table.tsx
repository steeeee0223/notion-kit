import * as React from "react";

import { cn, cva } from "@notion-kit/cn";

type TableVariant = "default" | "striped";
const TableContext = React.createContext<{
  variant: TableVariant;
}>({
  variant: "default",
});

const tableVariants = cva("w-full text-[13px]", {
  variants: {
    variant: {
      default: "border-y border-y-default/10",
      striped: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TableProps extends React.ComponentProps<"table"> {
  variant?: TableVariant;
}

function Table({ className, variant = "default", ...props }: TableProps) {
  const ctx = React.useMemo(() => ({ variant }), [variant]);
  return (
    <TableContext value={ctx}>
      <div className="relative w-full overflow-auto">
        <table
          className={cn(tableVariants({ variant, className }))}
          {...props}
        />
      </div>
    </TableContext>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const { variant } = React.useContext(TableContext);
  return (
    <thead
      className={cn(
        variant === "striped" && "border-b border-border",
        className,
      )}
      {...props}
    />
  );
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

const tableRowVariants = cva("", {
  variants: {
    variant: {
      default: "border-t border-t-default/10",
      striped: "odd:bg-[#f7f7f5] dark:odd:bg-modal",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  const { variant } = React.useContext(TableContext);
  return (
    <tr className={cn(tableRowVariants({ variant, className }))} {...props} />
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
