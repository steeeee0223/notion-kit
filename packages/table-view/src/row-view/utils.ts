import { cva } from "@notion-kit/cn";

export const rowViewContentVariants = cva("grid w-full", {
  variants: {
    mode: {
      center:
        "grid-cols-[126px_1fr_126px] transition-[grid-template-columns] duration-200 ease-in-out",
      side: "grid-cols-[76px_1fr_76px]",
    },
  },
});
