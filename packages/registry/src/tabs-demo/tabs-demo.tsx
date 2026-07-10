"use client";

import { useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@notion-kit/ui/primitives";

enum TabType {
  Overview = "overview",
  Tasks = "tasks",
  Notes = "notes",
}

export default function Demo() {
  const [value, setValue] = useState(TabType.Overview);

  return (
    <Tabs className="w-80" value={value} onValueChange={setValue}>
      <TabsList>
        <TabsTrigger value={TabType.Overview}>Overview</TabsTrigger>
        <TabsTrigger value={TabType.Tasks}>Tasks</TabsTrigger>
        <TabsTrigger value={TabType.Notes}>Notes</TabsTrigger>
      </TabsList>
      <TabsContent value={TabType.Overview} className="p-4 text-sm">
        A high-level summary of the workspace.
      </TabsContent>
      <TabsContent value={TabType.Tasks} className="p-4 text-sm">
        Open decisions and follow-up tasks.
      </TabsContent>
      <TabsContent value={TabType.Notes} className="p-4 text-sm">
        Meeting notes and context for the team.
      </TabsContent>
    </Tabs>
  );
}
