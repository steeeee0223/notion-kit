import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  appendFilterNode,
  createFilterGroup,
  createFilterRule,
  removeFilterNode,
  updateFilterNode,
} from "@notion-kit/table-hook";
import type { FilterGroup, FilterRule } from "@notion-kit/table-hook";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MenuGroup,
  MenuItem,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@notion-kit/ui/primitives";

import { PropertySelect } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

import { OperandControl } from "./operand-control";

const LOGIC_ITEMS = [
  { value: "and", label: "And" },
  { value: "or", label: "Or" },
];

interface FilterGroupEditorProps {
  group: FilterGroup;
  root: FilterGroup;
  depth: number;
}

export function FilterGroupEditor({
  group,
  root,
  depth,
}: FilterGroupEditorProps) {
  const { table } = useTableViewCtx();
  const [addingRule, setAddingRule] = useState(false);
  const properties = table.getFilterProperties();
  const defaultRule = table.getTitleFilterRule();
  const addGroup = () =>
    table.setFilters(appendFilterNode(root, group.id, createFilterGroup()));
  const addRule = () => {
    if (!defaultRule) {
      setAddingRule(true);
      return;
    }
    table.setFilters(
      appendFilterNode(
        root,
        group.id,
        createFilterRule(defaultRule.propertyId, defaultRule.operator),
      ),
    );
  };

  return (
    <div
      data-testid={`filter-group-${group.id}`}
      className={
        depth === 1
          ? "flex flex-col gap-2"
          : "ml-2 flex flex-col gap-2 rounded-md bg-default/5 p-2"
      }
    >
      {depth > 1 && (
        <div className="flex justify-end">
          <NodeActions id={group.id} root={root} />
        </div>
      )}

      {group.children.map((child, index) => (
        <div key={child.id} className="flex items-start gap-2">
          <FilterLogicLabel
            nodeId={child.id}
            index={index}
            group={group}
            root={root}
          />
          <div className="min-w-0 flex-1">
            {child.kind === "group" ? (
              <FilterGroupEditor group={child} root={root} depth={depth + 1} />
            ) : (
              <FilterRuleEditor rule={child} root={root} />
            )}
          </div>
        </div>
      ))}

      {addingRule && (
        <PendingPropertyPicker
          root={root}
          parentId={group.id}
          onCancel={() => setAddingRule(false)}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="xs"
              variant="hint"
              disabled={!properties.length && depth === 3}
            >
              <Icon.Plus className="size-3.5" />
              Add filter rule
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuGroup>
            {properties.length > 0 && (
              <DropdownMenuItem
                label="Add rule"
                icon={<Icon.Plus />}
                onClick={addRule}
              />
            )}
            {depth < 3 && (
              <DropdownMenuItem
                label="Add nested group"
                icon={<Icon.Plus />}
                onClick={addGroup}
              />
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {depth === 1 && (
        <>
          <Separator />
          <MenuGroup>
            <MenuItem
              icon={<Icon.Trash className="size-4" />}
              label="Delete filter"
              variant="warning"
              onClick={() => table.clearFilters()}
            />
          </MenuGroup>
        </>
      )}
    </div>
  );
}

function FilterLogicLabel({
  nodeId,
  index,
  group,
  root,
}: {
  nodeId: string;
  index: number;
  group: FilterGroup;
  root: FilterGroup;
}) {
  const { table } = useTableViewCtx();
  const { logic } = group;
  if (index === 0) {
    return (
      <span
        data-testid={`filter-label-${nodeId}`}
        className="w-14 pt-1.5 text-sm text-secondary"
      >
        Where
      </span>
    );
  }
  if (index > 1) {
    return (
      <span
        data-testid={`filter-label-${nodeId}`}
        className="w-14 pt-1.5 text-sm text-primary"
      >
        {logic === "and" ? "And" : "Or"}
      </span>
    );
  }
  return (
    <div data-testid={`filter-label-${nodeId}`} className="w-14">
      <Select
        items={LOGIC_ITEMS}
        value={logic}
        onValueChange={(value) => {
          if (value !== "and" && value !== "or") return;
          table.setFilters(
            updateFilterNode(root, group.id, (node) =>
              node.kind === "group" ? { ...node, logic: value } : node,
            ),
          );
        }}
      >
        <SelectTrigger aria-label="Filter logic select" className="px-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="and" label="AND" />
            <SelectItem value="or" label="OR" />
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function FilterRuleEditor({
  rule,
  root,
}: {
  rule: FilterRule;
  root: FilterGroup;
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
    <div
      data-testid={`filter-rule-${rule.id}`}
      className="flex items-center gap-1.5"
    >
      <PropertySelect
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
          className="w-32 border border-border"
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
      <NodeActions id={rule.id} root={root} />
    </div>
  );
}

function NodeActions({ id, root }: { id: string; root: FilterGroup }) {
  const { table } = useTableViewCtx();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="hint" size="circle" aria-label="Actions">
            <Icon.Dots className="size-4" />
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

export function PendingPropertyPicker({
  root,
  parentId = "",
  onCancel,
}: {
  root?: FilterGroup;
  parentId?: string;
  onCancel?: () => void;
}) {
  const { table } = useTableViewCtx();
  const properties = table.getFilterProperties();
  const items = properties.map(({ id, name }) => ({ value: id, label: name }));

  return (
    <Select<string>
      defaultOpen
      items={items}
      value={null}
      onOpenChange={(open) => {
        if (!open) onCancel?.();
      }}
      onValueChange={(propertyId) => {
        if (propertyId === null) return;
        const property = properties.find(({ id }) => id === propertyId);
        const operator = property
          ? table.getColumnPlugin(property.id).filtering?.operators[0]
          : undefined;
        if (!operator) return;
        table.setFilters(
          appendFilterNode(
            root,
            parentId,
            createFilterRule(propertyId, operator.id),
          ),
        );
        onCancel?.();
      }}
    >
      <SelectTrigger aria-label="Add property select">
        <SelectValue placeholder="Choose a property" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {properties.map(({ id, name }) => (
            <SelectItem key={id} value={id} label={name} />
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
