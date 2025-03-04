import * as React from "react";

import { cn } from "@notion-kit/cn";

const Table = ({ className, ...props }: React.ComponentProps<"table">) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn(
        "border-y-primary/10 w-full border-y text-[13px]",
        className,
      )}
      {...props}
    />
  </div>
);
Table.displayName = "Table";

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;
const TableHeader = ({
  ref,
  className,
  ...props
}: TableHeaderProps & {
  ref: React.RefObject<HTMLTableSectionElement | null>;
}) => <thead ref={ref} className={className} {...props} />;
TableHeader.displayName = "TableHeader";

const TableBody = ({ className, ...props }: React.ComponentProps<"tbody">) => (
  <tbody className={className} {...props} />
);
TableBody.displayName = "TableBody";

const TableFooter = ({
  className,
  ...props
}: React.ComponentProps<"tfoot">) => (
  <tfoot
    className={cn(
      "bg-muted/50 border-t font-medium last:[&>tr]:border-b-0",
      className,
    )}
    {...props}
  />
);
TableFooter.displayName = "TableFooter";

const TableRow = ({ className, ...props }: React.ComponentProps<"tr">) => (
  <tr className={cn("border-t-primary/10 border-t", className)} {...props} />
);
TableRow.displayName = "TableRow";

const TableHead = ({ className, ...props }: React.ComponentProps<"th">) => (
  <th className={cn("py-2 text-start", className)} {...props} />
);
TableHead.displayName = "TableHead";

const TableCell = ({ className, ...props }: React.ComponentProps<"td">) => (
  <td className={cn("py-2", className)} {...props} />
);
TableCell.displayName = "TableCell";

const TableCaption = ({
  className,
  ...props
}: React.ComponentProps<"caption">) => (
  <caption
    className={cn("text-muted dark:text-muted-dark mt-4 text-sm", className)}
    {...props}
  />
);
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
