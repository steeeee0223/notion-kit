"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-main group-[.toaster]:text-primary group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted ",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted ",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
