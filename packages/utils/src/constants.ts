export const COLOR = {
  default: {
    name: "Default",
    rgba: "rgba(255, 255, 255, 0.094)",
    hex: "#55534E",
  },
  gray: { name: "Gray", rgba: "rgba(255, 255, 255, 0.13)", hex: "#A6A299" },
  brown: { name: "Brown", rgba: "rgba(184, 101, 67, 0.45)", hex: "#9F6B53" },
  orange: { name: "Orange", rgba: "rgba(233, 126, 35, 0.45)", hex: "#D9730D" },
  yellow: { name: "Yellow", rgba: "rgba(250, 177, 67, 0.5)", hex: "#CB912F" },
  green: { name: "Green", rgba: "rgba(45, 153, 100, 0.5)", hex: "#448361" },
  blue: { name: "Blue", rgba: "rgba(51, 126, 169, 0.5)", hex: "#337EA9" },
  purple: { name: "Purple", rgba: "rgba(168, 91, 242, 0.34)", hex: "#9065B0" },
  pink: { name: "Pink", rgba: "rgba(220, 76, 145, 0.4)", hex: "#C14C8A" },
  red: { name: "Red", rgba: "rgba(222, 85, 83, 0.45)", hex: "#D44C47" },
} as const;

export type Color = keyof typeof COLOR;
