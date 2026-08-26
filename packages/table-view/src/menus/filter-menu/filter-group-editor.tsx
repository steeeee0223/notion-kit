import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import {
  appendFilterNode,
  createFilterGroup,
  createFilterRule,
  removeFilterNode,
  updateFilterNode,
} from "@notion-kit/table-hook";
import type {
  FilterGroup,
  FilterRule,
  TableFilterState,
} from "@notion-kit/table-hook";
import type { CellPlugin } from "@notion-kit/table-hook/plugins";
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

import { OperandControl, operandDraftKey } from "./operand-control";
import type { DefaultFilterRule, FilterProperty } from "./types";
import { omitRuleValue } from "./utils";

type FilterNode = FilterGroup | FilterRule;

const LOGIC_ITEMS = [
  { value: "and", label: "And" },
  { value: "or", label: "Or" },
];

interface FilterGroupEditorProps {
  group: FilterGroup;
  root: FilterGroup;
  depth: number;
  properties: FilterProperty[];
  plugins: Record<string, CellPlugin>;
  onChange: (next: TableFilterState) => void;
  defaultRule?: DefaultFilterRule;
}

export function FilterGroupEditor({
  group,
  root,
  depth,
  properties,
  plugins,
  onChange,
  defaultRule,
}: FilterGroupEditorProps) {
  const [addingRule, setAddingRule] = useState(false);
  const updateNode = (
    nodeId: string,
    update: (node: FilterNode) => FilterNode,
  ) => onChange(updateFilterNode(root, nodeId, update));
  const removeNode = (nodeId: string) =>
    onChange(removeFilterNode(root, nodeId));
  const addGroup = () =>
    onChange(appendFilterNode(root, group.id, createFilterGroup()));
  const addRule = () => {
    if (!defaultRule) {
      setAddingRule(true);
      return;
    }
    onChange(
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
          <NodeActions id={group.id} onDelete={removeNode} />
        </div>
      )}

      {group.children.map((child, index) => (
        <div key={child.id} className="flex items-start gap-2">
          <FilterLogicLabel
            nodeId={child.id}
            index={index}
            logic={group.logic}
            onChange={(logic) =>
              updateNode(group.id, (node) =>
                node.kind === "group" ? { ...node, logic } : node,
              )
            }
          />
          <div className="min-w-0 flex-1">
            {child.kind === "group" ? (
              <FilterGroupEditor
                group={child}
                root={root}
                depth={depth + 1}
                properties={properties}
                plugins={plugins}
                onChange={onChange}
                defaultRule={defaultRule}
              />
            ) : (
              <FilterRuleEditor
                rule={child}
                root={root}
                properties={properties}
                plugins={plugins}
                onChange={onChange}
              />
            )}
          </div>
        </div>
      ))}

      {addingRule && (
        <PendingPropertyPicker
          properties={properties}
          plugins={plugins}
          onCancel={() => setAddingRule(false)}
          onSelect={(propertyId, operator) => {
            onChange(
              appendFilterNode(
                root,
                group.id,
                createFilterRule(propertyId, operator),
              ),
            );
            setAddingRule(false);
          }}
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
              onClick={() => onChange(null)}
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
  logic,
  onChange,
}: {
  nodeId: string;
  index: number;
  logic: "and" | "or";
  onChange: (logic: "and" | "or") => void;
}) {
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
          if (value === "and" || value === "or") onChange(value);
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
  properties,
  plugins,
  onChange,
}: {
  rule: FilterRule;
  root: FilterGroup;
  properties: FilterProperty[];
  plugins: Record<string, CellPlugin>;
  onChange: (next: TableFilterState) => void;
}) {
  const property = properties.find(({ id }) => id === rule.propertyId);
  const operators = property
    ? (plugins[property.type]?.filtering?.operators ?? [])
    : [];
  const operator = operators.find(({ id }) => id === rule.operator);
  const operatorItems = [
    ...(!operator
      ? [{ value: rule.operator, label: `${rule.operator} (unavailable)` }]
      : []),
    ...operators.map(({ id, name }) => ({ value: id, label: name })),
  ];
  const updateRule = (update: (current: FilterRule) => FilterRule) =>
    onChange(
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
            ? plugins[nextProperty.type]?.filtering?.operators[0]
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

      {operator && property && (
        <OperandControl
          key={`${rule.id}:${rule.operator}:${operandDraftKey(
            rule.value,
            operator.operand,
            property.config,
          )}`}
          rule={rule}
          metadata={operator.operand}
          property={property}
          onChange={(value) =>
            updateRule((current) =>
              value === undefined
                ? omitRuleValue(current)
                : { ...current, value },
            )
          }
        />
      )}
      <NodeActions
        id={rule.id}
        onDelete={(id) => onChange(removeFilterNode(root, id))}
      />
    </div>
  );
}

function NodeActions({
  id,
  onDelete,
}: {
  id: string;
  onDelete: (id: string) => void;
}) {
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
            onClick={() => onDelete(id)}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PendingPropertyPicker({
  properties,
  plugins,
  onSelect,
  onCancel,
}: {
  properties: FilterProperty[];
  plugins: Record<string, CellPlugin>;
  onSelect: (propertyId: string, operator: string) => void;
  onCancel?: () => void;
}) {
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
          ? plugins[property.type]?.filtering?.operators[0]
          : undefined;
        if (operator) onSelect(propertyId, operator.id);
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
