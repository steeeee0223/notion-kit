"use client";

import { createContext, useContext } from "react";

export interface MenuControlInterface {
  openPopover: (
    popover: React.ReactNode,
    style: {
      x?: number;
      y?: number;
      className?: string;
    },
  ) => void;
  closePopover: () => void;
}

export const MenuControlContext = createContext<MenuControlInterface | null>(
  null,
);

export const useMenuControl = () => {
  const context = useContext(MenuControlContext);
  if (!context) {
    throw new Error("useMenuControl must be used within a MenuControlProvider");
  }
  return context;
};
