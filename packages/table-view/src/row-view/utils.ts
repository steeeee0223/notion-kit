import { cva } from "@notion-kit/cn";

export const rowViewContentVariants = cva("grid w-full", {
  variants: {
    mode: {
      center:
        "grid-cols-[[full-start]_126px_[content-start]_1fr_[content-end]_126px_[full-end]] transition-[grid-template-columns] duration-200 ease-in-out",
      side: "grid-cols-[[full-start]_76px_[content-start]_1fr_[content-end]_76px_[full-end]]",
    },
  },
});
