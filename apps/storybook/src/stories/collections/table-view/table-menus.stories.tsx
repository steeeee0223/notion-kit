import { useState } from "react";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { Icon } from "@notion-kit/icons";
import { TableViewWrapper, useTableViewCtx } from "@notion-kit/table-view";
import * as Menu from "@notion-kit/table-view/menus";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { Code } from "@/components/code";

import {
  mockData,
  mockDateConfig,
  mockNumberConfig,
  mockProps,
  mockSelectConfig,
} from "./database";

const meta = {
  title: "collections/Table View/Menus",
  parameters: { layout: "fullscreen" },
  decorators: (Story) => (
    <TableViewWrapper properties={mockProps} data={mockData}>
      <Story />
    </TableViewWrapper>
  ),
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const TableViewMenu: Story = {
  render: () => {
    const { table } = useTableViewCtx();
    const { tableGlobal, grouping, groupingState } = table.getState();

    return (
      <div className="grid grid-cols-2 justify-between gap-4 p-20">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="nav-icon"
                aria-label="Settings"
                className="[&_svg]:fill-current"
              >
                <Icon.SlidersSmall />
              </Button>
            }
          />
          <DropdownMenuContent collisionPadding={12} className="w-72">
            <Menu.TableViewMenu />
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex w-full flex-col gap-3">
          <Code title="Table global" codeObject={tableGlobal} />
          <Code title="Grouping" codeObject={grouping} />
          <Code title="Grouping state" codeObject={groupingState} />
        </div>
      </div>
    );
  },
};

export const SortMenu: Story = {
  render: () => {
    const { table } = useTableViewCtx();
    const { sorting } = table.getState();

    return (
      <div className="grid grid-cols-2 justify-between gap-4 p-20">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="nav-icon"
                aria-label="Sort"
                className="[&_svg]:fill-current"
              >
                <Icon.ArrowUpDownSmall />
              </Button>
            }
          />
          <DropdownMenuContent collisionPadding={12} className="w-72">
            <Menu.SortMenu />
          </DropdownMenuContent>
        </DropdownMenu>
        <Code title="Sorting" codeObject={sorting} />
      </div>
    );
  },
};

export const ColumnConfigMenus: Story = {
  render: () => {
    const [dateConfig, setDateConfig] = useState(mockDateConfig);
    const [numberConfig, setNumberConfig] = useState(mockNumberConfig);
    const [selectConfig, setSelectConfig] = useState(mockSelectConfig);

    return (
      <div className="grid grid-cols-2 justify-between gap-4 p-20">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="hint" size="sm" className="w-30">
                Config menus
              </Button>
            }
          />
          <DropdownMenuContent className="w-55">
            <DropdownMenuGroup>
              <DropdownMenuLabel title="Date config" />
              <Menu.DateConfigMenu
                propId="prop-D1"
                config={dateConfig}
                onChange={setDateConfig}
              />
              <DropdownMenuLabel title="Number config" />
              <Menu.NumberConfigMenu
                propId="prop-N1"
                config={numberConfig}
                onChange={setNumberConfig}
              />
              <DropdownMenuLabel title="Select config" />
              <Menu.SelectConfigMenu
                propId="prop-S1"
                config={selectConfig}
                onChange={setSelectConfig}
              />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex w-full flex-col gap-3">
          <Code title="Date config" codeObject={dateConfig} />
          <Code title="Number config" codeObject={numberConfig} />
          <Code title="Select config" codeObject={selectConfig} />
        </div>
      </div>
    );
  },
};

export const RowActionMenu: Story = {
  render: () => {
    return (
      <div className="grid grid-cols-2 justify-between gap-4 p-20">
        <Popover>
          <TooltipPreset description="Click to open menu">
            <PopoverTrigger
              render={
                <Button
                  variant="hint"
                  aria-label="Row actions"
                  className="h-6 w-4.5"
                >
                  <Icon.DragHandle className="size-3.5 fill-icon" />
                </Button>
              }
            />
          </TooltipPreset>
          <PopoverContent className="w-[265px]" side="right" align="start">
            <Menu.RowActionMenu rowId={mockData[0]!.id} />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};
