import * as React from "react";

import { cn } from "@notion-kit/cn";

const Table = ({ className, ...props }: React.ComponentProps<"table">) => (
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

const TableHeader = (props: React.ComponentProps<"thead">) => (
  <thead {...props} />
);

const TableBody = (props: React.ComponentProps<"tbody">) => (
  <tbody {...props} />
);

const TableFooter = ({
  className,
  ...props
}: React.ComponentProps<"tfoot">) => (
  <tfoot
    className={cn(
      "border-t bg-muted/50 font-medium last:[&>tr]:border-b-0",
      className,
    )}
    {...props}
  />
);

const TableRow = ({ className, ...props }: React.ComponentProps<"tr">) => (
  <tr className={cn("border-t border-t-default/10", className)} {...props} />
);

const TableHead = ({ className, ...props }: React.ComponentProps<"th">) => (
  <th className={cn("py-2 text-start", className)} {...props} />
);

const TableCell = ({ className, ...props }: React.ComponentProps<"td">) => (
  <td className={cn("py-2", className)} {...props} />
);

const TableCaption = ({
  className,
  ...props
}: React.ComponentProps<"caption">) => (
  <caption className={cn("mt-4 text-sm text-muted", className)} {...props} />
);

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
