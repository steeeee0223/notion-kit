import { cva } from "@notion-kit/cn";

export const rowViewContentVariants = cva(
  "grid w-full grid-cols-[var(--margin)_var(--content)_var(--margin)]",
  {
    variants: {
      mode: {
        center:
          "transition-[grid-template-columns] duration-200 ease-in-out [--content:1fr] [--margin:126px]",
        side: "[--content:1fr] [--margin:76px]",
        full: "[--content:minmax(auto,708px)] [--margin:minmax(96px,1fr)]",
      },
    },
  },
);
