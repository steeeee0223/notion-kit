import React from "react";

import {
  ThemeProvider,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

export function ColorPalette({
  children,
  theme,
}: React.PropsWithChildren<{ theme: string }>) {
  return (
    <ThemeProvider attribute="class" defaultTheme={theme}>
      <TooltipProvider delayDuration={0}>
        <div className="grid grid-cols-[1fr_6fr] gap-x-10 gap-y-4 rounded-lg bg-main p-8 shadow-lg">
          {children}
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

interface ColorGroupProps {
  title: string;
  prefix: string;
  colors: Record<string, string>;
}

export function ColorGroup({ title, prefix, colors }: ColorGroupProps) {
  const colorItems = Object.entries(colors);

  return (
    <>
      <div className="flex flex-col">
        <div className="text-sm font-medium text-primary">{title}</div>
        <div className="text-xs text-secondary">{prefix}</div>
      </div>
      <div className="flex flex-col">
        <div
          className="grid rounded-lg border border-border"
          style={{
            gridTemplateColumns: `repeat(${colorItems.length}, minmax(0, 1fr))`,
          }}
        >
          {colorItems.map(([name, color]) => (
            <TooltipPreset
              key={name}
              side="top"
              description={[
                { type: "default", text: prefix + name },
                { type: "secondary", text: color },
              ]}
            >
              <div
                role="button"
                className="h-12 first:rounded-l-lg last:rounded-r-lg"
                style={{ backgroundColor: color }}
              />
            </TooltipPreset>
          ))}
        </div>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${colorItems.length}, minmax(0, 1fr))`,
          }}
        >
          {colorItems.map(([name]) => (
            <div
              key={name}
              className="mr-1 overflow-hidden text-center text-xs text-secondary"
            >
              <div className="truncate">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
