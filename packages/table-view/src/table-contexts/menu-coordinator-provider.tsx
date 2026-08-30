import { createContext, use, useMemo, type PropsWithChildren } from "react";

import {
  DropdownMenu,
  Popover,
  type DropdownMenuHandle,
  type PopoverHandle,
} from "@notion-kit/ui/primitives";

export const FILTER_MENU_TOOLBAR_TRIGGER_ID =
  "table-view-filter-menu-toolbar-trigger";
export const SORT_MENU_TOOLBAR_TRIGGER_ID =
  "table-view-sort-menu-toolbar-trigger";

interface MenuCoordinatorContextValue {
  filterMenu: { handle: PopoverHandle };
  sortMenu: { handle: DropdownMenuHandle };
}

const MenuCoordinatorContext =
  createContext<MenuCoordinatorContextValue | null>(null);

export function useMenuCoordinator() {
  const context = use(MenuCoordinatorContext);
  if (!context) {
    throw new Error(
      "`useMenuCoordinator` must be used within `MenuCoordinatorProvider`",
    );
  }
  return context;
}

export function MenuCoordinatorProvider({ children }: PropsWithChildren) {
  const value = useMemo(
    () => ({
      filterMenu: { handle: Popover.createHandle() },
      sortMenu: { handle: DropdownMenu.createHandle() },
    }),
    [],
  );

  return (
    <MenuCoordinatorContext value={value}>{children}</MenuCoordinatorContext>
  );
}
