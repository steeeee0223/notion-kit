"use client";

import { BookTextIcon, Github } from "lucide-react";

import {
  Button,
  ThemeToggle,
  TooltipPreset as Tooltip,
  TooltipProvider,
} from "@notion-kit/shadcn";
import { TableView } from "@notion-kit/table-view";

import { mockData, mockProps } from "@/lib/data";

export default function Page() {
  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <TooltipProvider>
      <main className="relative flex h-screen w-screen flex-col items-center justify-center gap-10 bg-main p-10">
        <div className="absolute top-10 right-10 z-10 flex items-center gap-2">
          <Tooltip description="Change theme">
            <ThemeToggle />
          </Tooltip>
          <Tooltip description="View documentation">
            <Button
              variant="nav-icon"
              onClick={() => openLink("https://notion-ui.vercel.app/docs")}
            >
              <BookTextIcon className="size-5" />
            </Button>
          </Tooltip>
          <Tooltip description="View on Github">
            <Button
              variant="nav-icon"
              onClick={() =>
                openLink("https://github.com/steeeee0223/notion-kit")
              }
            >
              <Github className="size-5" />
            </Button>
          </Tooltip>
        </div>
        <div className="text-3xl text-primary">Notion Clone - Table View</div>
        <div className="relative flex max-h-150 w-screen grow flex-col justify-center">
          <div className="h-full shrink-0 overflow-auto">
            <TableView
              defaultState={{ properties: mockProps, data: mockData }}
            />
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
