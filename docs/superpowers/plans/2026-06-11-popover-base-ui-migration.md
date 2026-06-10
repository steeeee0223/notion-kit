# Popover Base UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `packages/ui/src/primitives/popover.tsx` from Radix UI to Base UI while preserving the existing wrapper API except for removing unused `PopoverAnchor`.

**Architecture:** Keep the public wrapper components focused in one primitive file. Use Base UI `render` for trigger composition, and split content rendering into Base UI `Portal`, `Positioner`, and `Popup`.

**Tech Stack:** React 19, TypeScript, Base UI `@base-ui/react/popover`, Vitest, Testing Library, pnpm workspace scripts.

---

## Files

- Modify: `packages/ui/src/primitives/popover.tsx`
- Create: `packages/ui/src/primitives/popover.test.tsx`
- Verify: `packages/ui` and `packages/table-view` Vitest suites

## Task 1: Add Popover Tests

- [ ] **Step 1: Add tests for the wrapper API**

Create `packages/ui/src/primitives/popover.test.tsx` with tests that render the current wrapper API:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

describe("Popover", () => {
  it("keeps Base UI render composition available", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger
          render={<button type="button">Render trigger</button>}
        />
        <PopoverContent>Rendered content</PopoverContent>
      </Popover>,
    );

    expect(
      screen.getByRole("button", { name: "Render trigger" }),
    ).toHaveAttribute("data-slot", "popover-trigger");
    expect(screen.getByText("Rendered content")).toBeInTheDocument();
  });

  it("supports controlled open state and close button", async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen>
        <PopoverTrigger render={<button type="button">Open</button>} />
        <PopoverContent>
          <span>Closable content</span>
          <PopoverClose />
        </PopoverContent>
      </Popover>,
    );

    expect(screen.getByText("Closable content")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByText("Closable content")).not.toBeInTheDocument();
  });

  it("keeps Radix-style sticky compatibility on content", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger render={<button type="button">Open</button>} />
        <PopoverContent sticky="always">Sticky content</PopoverContent>
      </Popover>,
    );

    expect(screen.getByText("Sticky content")).toHaveAttribute(
      "data-slot",
      "popover-content",
    );
  });
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
pnpm --filter @notion-kit/ui test -- src/primitives/popover.test.tsx
```

Expected: FAIL before migration because the current Radix wrapper does not support Base UI `render` and still uses Radix-only typing.

## Task 2: Migrate Popover Primitive

- [ ] **Step 1: Replace Radix with Base UI**

Update `packages/ui/src/primitives/popover.tsx` so it imports Base UI popover parts, preserves the wrapper exports, uses `render` for trigger composition, splits content positioning, and removes `PopoverAnchor`.

- [ ] **Step 2: Run focused tests and verify GREEN**

Run:

```bash
pnpm --filter @notion-kit/ui test -- src/primitives/popover.test.tsx
```

Expected: PASS.

## Task 3: Verify Package Compatibility

- [ ] **Step 1: Typecheck UI**

Run:

```bash
pnpm --filter @notion-kit/ui typecheck
```

Expected: PASS.

- [ ] **Step 2: Typecheck table-view**

Run:

```bash
pnpm --filter @notion-kit/table-view typecheck
```

Expected: PASS or only reveal pre-existing unrelated issues. Any `PopoverAnchor`, `PopoverTrigger`, or `PopoverContent` errors must be fixed.

- [ ] **Step 3: Run UI unit tests**

Run:

```bash
pnpm --filter @notion-kit/ui test
```

Expected: PASS. If sandboxed DNS blocks `lucide.dev`, rerun with approved network access and record the result.

- [ ] **Step 4: Run table-view unit tests**

Run:

```bash
pnpm --filter @notion-kit/table-view test
```

Expected: No new failures beyond the recorded baseline failure in `select-config-menu.test.tsx` Flow 14, or a fully passing suite if that baseline is fixed during implementation with evidence.

## Task 4: Commit

- [ ] **Step 1: Review diff**

Run:

```bash
git diff -- packages/ui/src/primitives/popover.tsx packages/ui/src/primitives/popover.test.tsx
```

Expected: only the popover primitive migration and focused tests changed.

- [ ] **Step 2: Commit implementation**

Run:

```bash
git add packages/ui/src/primitives/popover.tsx packages/ui/src/primitives/popover.test.tsx docs/superpowers/plans/2026-06-11-popover-base-ui-migration.md
git commit -m "refactor: migrate popover to base ui"
```
