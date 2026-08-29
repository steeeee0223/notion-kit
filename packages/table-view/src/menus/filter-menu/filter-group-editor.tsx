import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { removeFilterNode, updateFilterNode } from "@notion-kit/table-hook";
import type { FilterGroup, FilterRule } from "@notion-kit/table-hook";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MenuGroup,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

import { PropertySelect } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

import { AddFilterMenu } from "./add-filter-menu";
import { OperandControl } from "./operand-control";

const LOGIC_ITEMS = [
  { value: "and", label: "And" },
  { value: "or", label: "Or" },
];

interface FilterGroupEditorProps {
  group: FilterGroup;
  root: FilterGroup;
  depth: number;
  className?: string;
  testId?: string;
}

export function FilterGroupEditor({
  group,
  root,
  depth,
  className,
  testId,
}: FilterGroupEditorProps) {
  return (
    <MenuGroup
      data-testid={testId}
      className={cn(
        "grid grid-cols-[4rem_minmax(0,1fr)_auto] items-start gap-2 p-2",
        depth > 1 && "ml-2 rounded-md bg-default/5",
        className,
      )}
    >
      {group.children.map((child, index) => (
        <div
          key={child.id}
          role="group"
          aria-label={`Filter ${child.kind}`}
          data-testid={`filter-${child.kind}-${child.id}`}
          className="col-span-3 grid grid-cols-subgrid items-start gap-x-2"
        >
          <div className="flex min-h-7 items-center justify-end text-sm">
            <FilterLogicLabel index={index} group={group} root={root} />
          </div>
          {child.kind === "group" ? (
            <FilterGroupEditor
              group={child}
              root={root}
              depth={depth + 1}
              className="col-start-2 min-w-0"
            />
          ) : (
            <FilterRuleEditor
              rule={child}
              root={root}
              className="col-start-2"
            />
          )}
          <NodeActions id={child.id} root={root} className="col-start-3" />
        </div>
      ))}

      <AddFilterMenu
        root={root}
        parentId={group.id}
        depth={depth}
        className="col-span-3"
      />
    </MenuGroup>
  );
}

function FilterLogicLabel({
  index,
  group,
  root,
}: {
  index: number;
  group: FilterGroup;
  root: FilterGroup;
}) {
  const { table } = useTableViewCtx();
  const { logic } = group;
  if (index === 0) {
    return <span className="text-secondary">Where</span>;
  }
  if (index > 1) {
    return (
      <span className="text-primary">
        {LOGIC_ITEMS.find((item) => item.value === logic)?.label}
      </span>
    );
  }
  return (
    <Select
      items={LOGIC_ITEMS}
      value={logic}
      onValueChange={(value) => {
        if (!value) return;
        table.setFilters(
          updateFilterNode(root, group.id, (node) =>
            node.kind === "group" ? { ...node, logic: value } : node,
          ),
        );
      }}
    >
      <SelectTrigger
        aria-label="Filter logic select"
        className="border border-border"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {LOGIC_ITEMS.map(({ value, label }) => (
            <SelectItem key={value} value={value} label={label} />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function FilterRuleEditor({
  rule,
  root,
  className,
}: {
  rule: FilterRule;
  root: FilterGroup;
  className?: string;
}) {
  const { table } = useTableViewCtx();
  const properties = table.getFilterProperties();
  const property = properties.find(({ id }) => id === rule.propertyId);
  const operators = property
    ? (table.getColumnPlugin(property.id).filtering?.operators ?? [])
    : [];
  const operator = operators.find(({ id }) => id === rule.operator);
  const operatorItems = [
    ...(!operator
      ? [{ value: rule.operator, label: `${rule.operator} (unavailable)` }]
      : []),
    ...operators.map(({ id, name }) => ({ value: id, label: name })),
  ];
  const updateRule = (update: (current: FilterRule) => FilterRule) =>
    table.setFilters(
      updateFilterNode(root, rule.id, (node) =>
        node.kind === "rule" ? update(node) : node,
      ),
    );

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <PropertySelect
        className="w-30"
        value={rule.propertyId}
        onValueChange={(propertyId) => {
          const nextProperty = properties.find(({ id }) => id === propertyId);
          const firstOperator = nextProperty
            ? table.getColumnPlugin(nextProperty.id).filtering?.operators[0]
            : undefined;
          if (!firstOperator) return;
          updateRule((current) => ({
            kind: "rule",
            id: current.id,
            propertyId,
            operator: firstOperator.id,
          }));
        }}
      />

      <Select
        items={operatorItems}
        value={rule.operator}
        onValueChange={(nextOperator) => {
          if (
            nextOperator === null ||
            !operators.some(({ id }) => id === nextOperator)
          )
            return;
          updateRule((current) => ({
            kind: "rule",
            id: current.id,
            propertyId: current.propertyId,
            operator: nextOperator,
          }));
        }}
      >
        <SelectTrigger
          aria-label="Operator select"
          className="w-fit border border-border"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {!operator && (
              <SelectItem
                value={rule.operator}
                label={`${rule.operator} (unavailable)`}
                disabled
              />
            )}
            {operators.map(({ id, name }) => (
              <SelectItem key={id} value={id} label={name} />
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {operator && property && <OperandControl rule={rule} root={root} />}
    </div>
  );
}

function NodeActions({
  id,
  root,
  className,
}: {
  id: string;
  root: FilterGroup;
  className?: string;
}) {
  const { table } = useTableViewCtx();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="hint"
            aria-label="Actions"
            className={cn("size-7", className)}
          >
            <Icon.Dots className="size-4 fill-icon" />
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="warning"
            icon={<Icon.Trash />}
            label="Delete"
            onClick={() => table.setFilters(removeFilterNode(root, id))}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
