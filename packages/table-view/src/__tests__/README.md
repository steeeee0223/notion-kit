# Table View Unit Tests

This directory contains comprehensive unit tests for the `@notion-kit/table-view` package using Vitest.

## Setup Complete ✅

The following has been configured:

### 1. Vitest Configuration
- `vitest.config.ts` - Test configuration with coverage setup
- `vitest.setup.ts` - Setup file with jest-dom matchers
- **Test scripts** added to `package.json`:
  - `test` - Run tests once
  - `test:watch` - Run tests in watch mode
  - `test:ui` - Open Vitest UI
  - `test:coverage` - Run tests with coverage report

### 2. Test Structure

Tests are organized by feature:

#### `column-info.test.tsx` - Column CRUD Operations
- ✅ Column initialization  
- ✅ Column info access
- ✅ Column updates (width, etc.)
- ⚠️ **TODO**: Test `table.addColumnInfo()` API directly
- ⚠️ **TODO**: Test `table.removeColumnInfo()` API directly
- ⚠️ **TODO**: Test `table.duplicateColumnInfo()` API directly
- ⚠️ **TODO**: Test `table.handleColumnDragEnd()` for column DnD
- ✅ Both controlled & uncontrolled modes

#### `row-data.test.tsx` - Row CRUD Operations
- ✅ Row initialization
- ✅ Row data access
- ⚠️ **TODO**: Test `table.addRow()` API directly
- ⚠️ **TODO**: Test `table.deleteRow()` API directly
- ⚠️ **TODO**: Test `table.duplicateRow()` API directly  
- ⚠️ **TODO**: Test `table.handleRowDragEnd()` for row DnD
- ✅ Batch updates
- ✅ Both controlled & uncontrolled modes

#### `sorting-grouping.test.tsx` - Sorting & Grouping
**Sorting:**
- ✅ Text column sorting (asc/desc)
- ✅ Number column sorting (asc/desc)
- ✅ Toggle sorting
- ✅ Multi-column sorting
- ✅ Clear sorting

**Grouping (`src/features/grouping.ts`):**
- ✅ Group by column
- ✅ Get grouped values
- ✅ Clear grouping
- ⚠️ **TODO**: Test `groupingState.groupOrder` - order of groups
- ⚠️ **TODO**: Test `groupingState.groupVisibility` - show/hide individual groups
- ⚠️ **TODO**: Test `groupingState.groupValues` - group value storage
- ⚠️ **TODO**: Test `groupingState.showAggregates` - toggle aggregates display
- ⚠️ **TODO**: Test `groupingState.hideEmptyGroups` - filter empty groups
- ⚠️ **TODO**: Test `table.toggleGroupVisible(groupId)` - toggle individual group
- ⚠️ **TODO**: Test `table.toggleAllGroupsVisible()` - toggle all groups
- ⚠️ **TODO**: Test `table.toggleHideEmptyGroups()` - toggle empty groups filter
- ⚠️ **TODO**: Test `table.handleGroupedRowDragEnd()` - group DnD reordering
- ⚠️ **TODO**: Test `table.getIsSomeGroupVisible()` - check if any group visible
- ⚠️ **TODO**: Test `row.toggleGroupVisibility()` - toggle from row API
- ⚠️ **TODO**: Test `row.getShouldShowGroupAggregates()` - aggregate visibility

#### `counting.test.tsx` - **NEW** - Counting Feature
**From `src/features/counting.ts`:**
- ⚠️ **TODO**: Test `table.getColumnCounting(colId)` - get counting state for column
- ⚠️ **TODO**: Test `table.setColumnCountMethod(colId, method)` - set count method
- ⚠️ **TODO**: Test `table.setColumnCountCapped(colId, isCapped)` - toggle cap display
- ⚠️ **TODO**: Test `table.getColumnCountResult(colId)` - get computed count result
- ⚠️ **TODO**: Test all `CountMethod` enum values:
  - `NONE`, `ALL`, `VALUES`, `UNIQUE`
  - `EMPTY`, `NONEMPTY`
  - `CHECKED`, `UNCHECKED`
  - `PERCENTAGE_CHECKED`, `PERCENTAGE_UNCHECKED`
  - `PERCENTAGE_EMPTY`, `PERCENTAGE_NONEMPTY`

#### `freezing.test.tsx` - **NEW** - Column Freezing Feature
**From `src/features/freezing.ts`:**
- ⚠️ **TODO**: Test `table.getFreezingState()` - get current freezing state
- ⚠️ **TODO**: Test `table.setColumnFreezing(state)` - freeze column at index
- ⚠️ **TODO**: Test `table.toggleColumnFreezed(colId)` - toggle freeze on/off
- ⚠️ **TODO**: Test `table.getCanFreezeColumn(colId)` - check if column can freeze
- ⚠️ **TODO**: Test freezing state: `{ colId: string, index: number } | null`
- ⚠️ **TODO**: Test that freezing updates `columnPinning` state
- ⚠️ **TODO**: Test that last column cannot be frozen

## Running Tests

```bash
# From package directory
cd packages/table-view

# Run tests once
pnpm test

# Run in watch mode
pnpm test:watch

# Open Vitest UI
pnpm test:ui

# Run with coverage
pnpm test:coverage
```

## Test Coverage

The tests cover:
- **Column Management**: All CRUD operations on columns
- **Row Management**: All CRUD operations on rows
- **Sorting**: Single and multi-column sorting
- **Grouping**: Basic grouping by columns
- **State Management**: Both controlled and uncontrolled modes
- **Data Flow**: Proper callback invocation

**Still Need Coverage:**
- ⚠️ Column custom APIs (`addColumnInfo`, `removeColumnInfo`, `duplicateColumnInfo`, DnD)
- ⚠️ Row custom APIs (`addRow`, `deleteRow`, `duplicateRow`, DnD)
- ⚠️ Extended grouping states and visibility controls
- ⚠️ Counting feature with all count methods
- ⚠️ Freezing feature with pinning integration

## Next Steps

### Priority 1: Fix Current Tests
1. Update mock plugins to include `default.config` structure
2. Fix property type mismatches in test data

### Priority 2: Test Custom APIs
1. **Column APIs** - Test directly instead of via `onColumnInfoChange`:
   - `table.addColumnInfo({ id, type, name, at })`
   - `table.removeColumnInfo(colId)`
   - `table.duplicateColumnInfo(colId, at)`
   - `table.handleColumnDragEnd(event)`

2. **Row APIs** - Test directly instead of via `onTableDataChange`:
   - `table.addRow(at)`
   - `table.deleteRow(rowId)`
   - `table.duplicateRow(rowId, at)`
   - `table.handleRowDragEnd(event)`

### Priority 3: Extended Features
1. **Grouping Extended States** (`grouping.test.tsx`):
   - Group visibility toggles
   - Group order and DnD
   - Empty groups filtering
   - Aggregate display control

2. **Counting Feature** (`counting.test.tsx`):
   - All count methods
   - Count capping
   - Computed results

3. **Freezing Feature** (`freezing.test.tsx`):
   - Freeze/unfreeze columns
   - Pinning state integration
   - Boundary conditions

## Test Patterns

### Testing Uncontrolled Mode

```typescript
it("should update in uncontrolled mode", () => {
  const { result } = renderHook(() =>
    useTableView({
      plugins: mockPlugins,
      data: mockData,
      properties: mockProperties,
    })
  );

  const table = result.current.table;

  act(() => {
    // Perform action
    table.onTableDataChange?.((prev) => [...prev, newRow]);
  });

  // Assert state changed
  expect(table.getRowModel().rows).toHaveLength(3);
});
```

### Testing Controlled Mode

```typescript
it("should use controlled state", () => {
  const onDataChange = vi.fn();

  const { result } = renderHook(() =>
    useTableView({
      plugins: mockPlugins,
      data: mockData,
      properties: mockProperties,
      onDataChange,
    })
  );

  const table = result.current.table;

  act(() => {
    table.onTableDataChange?.((prev) => [...prev, newRow]);
  });

  // Assert callback was called
  expect(onDataChange).toHaveBeenCalled();

  // State should NOT change without external update
  expect(table.getRowModel().rows).toHaveLength(2);
});
```

## Dependencies

- `vitest` - Test framework
- `@testing-library/react` - React testing utilities (includes `renderHook`)
- `@vitejs/plugin-react` - React support for Vite
- `jsdom` - DOM environment for tests
- `@vitest/coverage-v8` - Coverage reporting
- `@vitest/ui` - Visual test UI

## Notes

- Tests use `renderHook` from `@testing-library/react` (React 18+)
- No need for `@testing-library/react-hooks` (deprecated)
- All tests use `act()` for state updates
- Mock plugins are minimal but functional
