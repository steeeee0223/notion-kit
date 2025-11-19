import { DatabaseIcon, Ellipsis, Plus } from "lucide-react";

import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@notion-kit/shadcn";
import { TableView } from "@notion-kit/table-view";

import { ButtonGroup } from "./button-group";
import { mockData, mockProps } from "./data";
import { ViewWrapper } from "./view-wrapper";

export const Database = () => {
  return (
    <Tabs
      defaultValue="members"
      className="group/database relative mt-1 w-full"
    >
      <TabsList className="gap-3 overflow-y-auto p-0">
        <div className="flex grow items-center">
          <TabsTrigger value="members">Members</TabsTrigger>
          <Button
            variant="nav-icon"
            className="size-6 opacity-0 group-hover/database:opacity-100"
          >
            <Plus className="size-3.5 shrink-0 text-default/45" />
          </Button>
        </div>
        <ButtonGroup className="opacity-0 group-hover/database:opacity-100" />
      </TabsList>
      <div className="flex w-full items-center justify-between pt-2">
        <div className="mx-1 flex items-center gap-1">
          <DatabaseIcon className="relative size-6 shrink-0" />
          <div className="w-full max-w-full text-[22px] font-bold wrap-break-word whitespace-pre-wrap caret-primary">
            Title
          </div>
          <Button
            variant="nav-icon"
            className="size-6 shrink-0 opacity-0 group-hover/database:opacity-100"
          >
            <Ellipsis className="size-3.5 shrink-0 text-default/45" />
          </Button>
        </div>
      </div>
      <TabsContent value="members" className="mt-0 bg-main">
        <ViewWrapper>
          <TableView properties={mockProps} data={mockData} />
        </ViewWrapper>
      </TabsContent>
    </Tabs>
  );
};
