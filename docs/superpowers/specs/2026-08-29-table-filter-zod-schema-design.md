# Specification: Table Filter Zod Schema Refactor

## Goal

Replace the manual structural type guards in `packages/table-hook/src/features/filtering.ts` with `zod/mini` schemas while preserving the current fail-closed validation contract.

## Scope

- Define schemas for filter rules, groups, recursive filter nodes, and the nullable table filter state.
- Parse untrusted state through `z.safeParse` in `validateTableFilterState`.
- Retain validation of finite JSON-compatible rule operands, plain own data properties, dense normal arrays, cyclic input, and a maximum of three nested groups.
- Preserve all public TypeScript interfaces and filter evaluation behavior.

## Design

`filterRuleSchema` and `filterGroupSchema` describe the object discriminants and primitive fields. A lazy recursive node schema composes them; the group schema is constructed in three levels so a fourth group cannot parse. The state schema accepts `null` or the root group schema.

Zod object schemas strip unknown keys, so a small preprocessing/refinement boundary will reject inputs whose own property shape is not the exact serialized filter shape before parsing. The JSON operand schema similarly validates actual plain records and dense arrays before recursively parsing their contents. This preserves the existing resistance to getters, exotic prototypes, sparse arrays, and cycles.

## Verification

- Add regression cases for unexpected keys, accessors, and sparse arrays, which must be rejected without throwing.
- Run the focused `@notion-kit/table-hook` filtering test, then package typecheck and the full package test suite.
