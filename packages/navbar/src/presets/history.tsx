"use client";

import { useState, useTransition } from "react";

import { Icon } from "@notion-kit/icons";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerTrigger,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { NavbarItem } from "../core";

interface Log {
  id: string;
  msg: string;
}

interface HistoryProps {
  pageId: string;
  fetchLogs?: (pageId: string) => Promise<Log[]>;
}

/**
 * @deprecated
 */
export function History({ pageId, fetchLogs }: HistoryProps) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, startTransition] = useTransition();
  const handleClick = () =>
    startTransition(
      () =>
        void fetchLogs?.(pageId)
          .then((data) => setLogs(data))
          .catch(() => toast.message("Error while fetching logs")),
    );
  const hint = `${open ? "Close" : "View"} all updates`;

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <NavbarItem hint={hint} className="w-7" onClick={handleClick}>
          <Icon.Clock className="size-5 fill-current" />
        </NavbarItem>
      </DrawerTrigger>
      <DrawerContent side="right" noTitle className="w-90">
        <div className="absolute top-0 left-0 ml-2.5 flex h-12 items-center">
          <TooltipPreset description="Close panel">
            <Button
              variant="hint"
              onClick={() => setOpen(false)}
              className="size-6"
            >
              <Icon.ArrowChevronDoubleBackward className="size-5 rotate-180 fill-current" />
            </Button>
          </TooltipPreset>
        </div>
        <div className="relative top-12 flex-1 bg-main">
          <Tabs defaultValue="updates" className="relative my-0.5 w-full">
            <TabsList>
              <TabsTrigger value="updates">Updates</TabsTrigger>
            </TabsList>
            <TabsContent value="updates" className="bg-main pt-3">
              {isLoading ? (
                <div className="inset-0 flex items-center justify-center py-4">
                  <Spinner className="fill-icon" />
                </div>
              ) : (
                <div className="flex flex-col gap-y-0 overflow-x-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-default/5">
                      {log.msg}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
