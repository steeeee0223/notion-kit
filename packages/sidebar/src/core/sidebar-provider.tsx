"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { cn } from "@notion-kit/cn";
import { useIsMobile } from "@notion-kit/hooks";
import { ModalProvider } from "@notion-kit/modal";
import { TooltipProvider } from "@notion-kit/shadcn";

import { DEFAULT_CONFIG, type SidebarConfig } from "./constants";

interface SidebarContextProps {
  config: SidebarConfig;
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  //* For sidebar resizing
  width: string;
  setWidth: (width: string) => void;
  isDraggingRail: boolean;
  setIsDraggingRail: (isDraggingRail: boolean) => void;
}

const SidebarContext = createContext<SidebarContextProps | null>(null);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
};

interface SidebarProviderProps extends React.ComponentProps<"div"> {
  config?: Partial<SidebarConfig>;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SidebarProvider: React.FC<SidebarProviderProps> = ({
  config = DEFAULT_CONFIG,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  //* Config
  const CONFIG = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  //* For sidebar resizing
  const [width, setWidth] = useState(CONFIG.defaultWidth);
  const [isDraggingRail, setIsDraggingRail] = useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${CONFIG.cookieName.state}=${openState}; path=/; max-age=${CONFIG.cookieMaxAge}`;
    },
    [setOpenProp, open, CONFIG],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = useCallback(() => {
    return isMobile
      ? setOpenMobile((open) => !open)
      : setOpen((open) => {
          console.log(`setting sidebar open to ${!open}`);
          return !open;
        });
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === CONFIG.shortcut && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [CONFIG.shortcut, toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  const contextValue = useMemo<SidebarContextProps>(
    () => ({
      config: CONFIG,
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      //* For sidebar resizing
      width,
      setWidth,
      isDraggingRail,
      setIsDraggingRail,
    }),
    [
      CONFIG,
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      toggleSidebar,
      width,
      isDraggingRail,
    ],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider>
        <ModalProvider>
          <div
            data-slot="sidebar-wrapper"
            style={
              {
                "--sidebar-width": width,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full",
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </ModalProvider>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
};

export { useSidebar, SidebarProvider };
