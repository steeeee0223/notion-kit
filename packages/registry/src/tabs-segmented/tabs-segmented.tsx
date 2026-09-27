"use client";

import { useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@notion-kit/ui/primitives";

enum Range {
  Week = "week",
  Month = "month",
  Quarter = "quarter",
}

export default function Segmented() {
  const [value, setValue] = useState(Range.Month);

  return (
    <Tabs className="w-80" value={value} onValueChange={setValue}>
      <TabsList variant="segmented">
        <TabsTrigger value={Range.Week}>Week</TabsTrigger>
        <TabsTrigger value={Range.Month}>Month</TabsTrigger>
        <TabsTrigger value={Range.Quarter}>Quarter</TabsTrigger>
      </TabsList>
      <TabsContent value={Range.Week} className="p-4 text-sm">
        Numbers for the last 7 days.
      </TabsContent>
      <TabsContent value={Range.Month} className="p-4 text-sm">
        Numbers for the last 30 days.
      </TabsContent>
      <TabsContent value={Range.Quarter} className="p-4 text-sm">
        Numbers for the last 90 days.
      </TabsContent>
    </Tabs>
  );
}
