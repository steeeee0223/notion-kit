// WIP

import { cva, VariantProps } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

export interface ColorVariants {
  // decoupled
  Acc?: string; // AccPri, BacAccPri, BorAccPri, TexAccPri, IcoAccPri
  Mut?: string; // TexDis, IcoDis, TexInvSec, IcoInvSec
  TexSec?: string; // IcoSec
  TexTer?: string; // IcoTer
  BacPri?: string; // TexInvPri, IcoInvPri
  BacSec?: string; // BorSec
  BorPri?: string; // BacTer

  // original
  BacPriTra?: string;
  BacSecTra?: string;
  BacTerTra?: string;
  BacAccSec?: string;
  BorPriTra?: string;
  BorSecTra?: string;

  BorInvPri?: string;

  TexPri?: string;

  IcoPri?: string;
}

const variants = cva(
  [
    "flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 whitespace-nowrap select-none",
    "aria-disabled:cursor-not-allowed aria-disabled:text-(--nk-TexDis) aria-disabled:[&_svg]:fill-(--nk-IcoDis)",
  ],
  {
    variants: {
      variant: {
        primary:
          "border border-(--nk-BorPri) bg-(--nk-BacPri) text-(--nk-TexPri) hover:bg-(--nk-BacPriTra) [&_svg]:fill-(--nk-IcoPri)",
        secondary:
          "border border-(--nk-BorSec) bg-(--nk-BacSec) text-(--nk-TexSec) hover:bg-(--nk-BacSecTra) [&_svg]:fill-(--nk-IcoSec)",
        tertiary:
          "border border-(--nk-BorTer) bg-(--nk-BacTer) text-(--nk-TexTer) hover:bg-(--nk-BacTerTra) [&_svg]:fill-(--nk-IcoTer)",
      },
    },
  },
);

interface ColorButtonProps extends VariantProps<typeof variants> {
  name: string;
  disabled?: boolean;
}

function ColorButton({ variant, name, disabled }: ColorButtonProps) {
  return (
    <div
      role="button"
      className={variants({ variant })}
      aria-disabled={disabled}
    >
      <Icon.EmojiFace className="pointer-events-none block size-4 shrink-0" />
      {name}
    </div>
  );
}

function ColorVariants({ variants }: { variants: ColorVariants }) {
  const resolvedVariables = Object.fromEntries(
    Object.entries(variants).map(([key, value]) => [`--nk-${key}`, value]),
  ) as React.CSSProperties;

  return (
    <div className="grid w-2/3 grid-cols-3 gap-2" style={resolvedVariables}>
      <ColorButton variant="primary" name="Primary" />
      <ColorButton variant="secondary" name="Secondary" />
      <ColorButton variant="tertiary" name="Tertiary" />
      <ColorButton variant="primary" name="Primary Disabled" disabled />
      <ColorButton variant="secondary" name="Secondary Disabled" disabled />
      <ColorButton variant="tertiary" name="Tertiary Disabled" disabled />
    </div>
  );
}

export function ElementPalette() {
  return (
    <>
      <ColorVariants
        variants={{
          Acc: "#8e8b86",
          Mut: "#d4d3cf",
          BacPriTra: "rgba(66,35,3,.031)",
          BacSecTra: "#2a1c0012",
          BacTerTra: "#1c13011c",
          BacPri: "#f9f8f7",
          BacSec: "#f0efed",
          BacAccSec: "#989590",
          BorPriTra: "#1c13011c",
          BorSecTra: "#2a1c0012",
          BorPri: "#e6e5e3",
          BorInvPri: "#5f5e59",
          TexPri: "#494846",
          TexSec: "#86837e",
          TexTer: "#a8a49c",
          IcoPri: "#2c2c2b",
        }}
      />
      <ColorVariants
        variants={{
          Acc: "#e56458",
          Mut: "#f0c5be",
          BacPriTra: "rgba(199,3,3,.035)",
          BacSecTra: "rgba(223,22,0,.094)",
          BacTerTra: "rgba(206,24,0,.164)",
          BacPri: "#fdf6f6",
          BacSec: "#fce9e7",
          BacAccSec: "#e97366",
          BorPriTra: "rgba(196,27,0,.254)",
          BorSecTra: "rgba(223,22,0,.094)",
          BorPri: "#f7d9d5",
          BorInvPri: "#924943",
          TexPri: "#6d3531",
          TexSec: "#cf5148",
          TexTer: "#d0988d",
          IcoPri: "#6d3531",
        }}
      />
    </>
  );
}
