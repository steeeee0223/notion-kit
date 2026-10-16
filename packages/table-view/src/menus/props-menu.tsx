import React from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { TableViewMenuPage } from "@notion-kit/table-hook";
import type { ColumnInfo } from "@notion-kit/table-hook";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Button,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuList,
  DropdownMenuSeparator,
  MenuItemAction,
  MenuItemSelect,
  Sortable,
} from "@notion-kit/ui/primitives";

import { DefaultIcon, MenuGroupHeader, MenuHeader } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

/**
 * @summary The menu of all properties
 */
export function PropsMenu({
  query: search,
  onNavigate,
}: {
  query: string;
  onNavigate?: () => void;
}) {
  const { table } = useTableViewCtx();
  const { contains } = DropdownMenu.useFilter();
  const navigate = (state: Parameters<typeof table.setTableMenuState>[0]) => {
    table.setTableMenuState(state);
    onNavigate?.();
  };

  const openEditPropMenu = (propId: string) =>
    navigate({
      open: true,
      page: TableViewMenuPage.EditProp,
      id: propId,
    });

  return (
    <table.Subscribe
      selector={(state) => ({
        columnOrder: state.columnOrder,
        columnsInfo: state.columnsInfo,
        columnVisibility: state.columnVisibility,
      })}
    >
      {({ columnOrder, columnsInfo, columnVisibility }) => {
        const noShownProps =
          Object.values(columnVisibility).filter(Boolean).length === 1;
        const { props, deletedCount } = columnOrder.reduce(
          (acc, propId) => {
            const info = columnsInfo[propId]!;
            if (!info.isDeleted) {
              acc.props.push({ ...info, id: propId });
            } else {
              acc.deletedCount++;
            }
            return acc;
          },
          { deletedCount: 0, props: [] as ColumnInfo[] },
        );

        const visibleProps = props.filter((prop) =>
          contains(prop.name, search),
        );

        return (
          <>
            <MenuHeader
              title="Properties"
              onBack={() => navigate({ open: true, page: null })}
            />
            <DropdownMenuInput
              aria-label="Search properties"
              placeholder="Search for a property..."
            />

            <DropdownMenuList>
              <div className="max-h-75 overflow-x-hidden overflow-y-auto">
                {visibleProps.length > 0 && (
                  <DropdownMenuGroup>
                    <MenuGroupHeader
                      title="Properties"
                      action={
                        search ? null : noShownProps ? "Show all" : "Hide all"
                      }
                      onActionClick={table.toggleAllColumnsVisible}
                    />
                    <Sortable.Root
                      disabled={search.length > 0}
                      onDragEnd={table.handleColumnDragEnd}
                    >
                      <Sortable.List>
                        {visibleProps.map((prop) => (
                          <PropertyItem
                            key={prop.id}
                            index={props.findIndex(
                              (item) => item.id === prop.id,
                            )}
                            draggable={search.length === 0}
                            info={prop}
                            onClick={() => openEditPropMenu(prop.id)}
                            onVisibilityChange={() =>
                              table.setColumnInfo(prop.id, {
                                hidden: !prop.hidden,
                              })
                            }
                          />
                        ))}
                      </Sortable.List>
                    </Sortable.Root>
                  </DropdownMenuGroup>
                )}
                {visibleProps.length === 0 && (
                  <div className="flex min-h-7 items-center px-3 py-2 text-start text-sm/tight text-muted">
                    No results
                  </div>
                )}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="secondary"
                  icon={<Icon.Plus className="size-4" />}
                  label="New property"
                  closeOnClick={false}
                  onClick={() =>
                    navigate({
                      open: true,
                      page: TableViewMenuPage.CreateProp,
                    })
                  }
                />
                {deletedCount > 0 && (
                  <DropdownMenuItem
                    variant="secondary"
                    icon={<Icon.Trash />}
                    label="Deleted properties"
                    closeOnClick={false}
                    onClick={() =>
                      navigate({
                        open: true,
                        page: TableViewMenuPage.DeletedProps,
                      })
                    }
                  >
                    <MenuItemSelect>{deletedCount}</MenuItemSelect>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="secondary"
                  onClick={() =>
                    window.open(
                      "https://www.notion.com/help/database-properties",
                    )
                  }
                  icon={<Icon.Help className="size-4" />}
                  label="Learn about properties"
                />
              </DropdownMenuGroup>
            </DropdownMenuList>
          </>
        );
      }}
    </table.Subscribe>
  );
}

interface PropertyItemProps {
  draggable?: boolean;
  index: number;
  info: ColumnInfo;
  onClick: () => void;
  onVisibilityChange: () => void;
}

function PropertyItem({
  draggable,
  index,
  info,
  onClick,
  onVisibilityChange,
}: PropertyItemProps) {
  const { id, name, icon, hidden, type } = info;

  return (
    <Sortable.Item
      id={id}
      index={index}
      disabled={!draggable}
      render={
        <DropdownMenuItem
          label={name}
          closeOnClick={false}
          onClick={onClick}
          icon={[
            <Sortable.Handle
              key="drag-handle"
              aria-label={`Move ${name}`}
              className={cn("mr-2 hidden h-6 w-4.5", draggable && "flex")}
            />,
            <React.Fragment key="icon">
              {icon ? <IconBlock icon={icon} /> : <DefaultIcon type={type} />}
            </React.Fragment>,
          ]}
          className="*:data-[slot=menu-item-body]:leading-normal"
        />
      }
    >
      <MenuItemAction className="flex items-center text-muted [&_svg]:fill-current">
        <Button
          tabIndex={0}
          aria-label={`Toggle ${name} visibility`}
          disabled={type === "title"}
          variant="hint"
          className="size-6 p-0 disabled:opacity-40"
          onClick={(e) => {
            e.stopPropagation();
            onVisibilityChange();
          }}
        >
          {hidden ? <Icon.EyeHide /> : <Icon.Eye />}
        </Button>
        <Icon.Chevron
          side="right"
          className="ml-1.5 h-full w-3 animate-bg-out fill-icon"
        />
      </MenuItemAction>
    </Sortable.Item>
  );
}
