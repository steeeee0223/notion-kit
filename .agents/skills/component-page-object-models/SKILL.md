---
name: component-page-object-models
description: Use when writing or refactoring React Testing Library component/page-object models, especially when nested controls, dynamic records, menus, dialogs, or repeated controls make global queries or DOM-order selectors brittle.
---

# Component/Page Object Models

## Core Pattern

Model the user-visible ownership hierarchy first. A child query must start at the smallest semantic owner that contains exactly the intended control.

```tsx
class FilterMenuObject {
  rule(id: string) {
    return screen.getByTestId(`filter-rule-${id}`);
  }

  actions(id: string) {
    return within(this.rule(id)).getByRole("button", { name: "Actions" });
  }

  async deleteNode(id: string) {
    await this.user.click(this.actions(id));
    await this.user.click(await screen.findByRole("menuitem", { name: "Delete" }));
  }
}
```

The model uses data only to identify its owner. Inner controls use role plus a fixed accessible name that describes their purpose, never an id or current value.

## Rules

1. Expose owners (`dialog`, row, rule, menu) and child actions as methods; tests should not reimplement queries.
2. Use `within(owner).getByRole(role, { name })` for controls. Use `findByRole` on `screen` only after an interaction opens a portalled overlay.
3. Give unnamed controls fixed accessible names: `Property select`, `Operator select`, `Actions`, `Remove`. A selected value is state to assert, not the control name.
4. Do not identify interactive controls with `data-slot`, `data-testid`, CSS classes, or `[0]`/`[1]` ordering when a role/name query is possible.
5. Make the owner narrower if it includes repeated nested controls. Add or expose a semantic intermediate owner; do not make the inner accessible name dynamic just to regain uniqueness.

## Assertions

Use the control's fixed name to interact, then assert its displayed value or resulting state separately:

```tsx
const property = filter.property("rule-1");
await user.click(property);
await user.click(await screen.findByRole("option", { name: "Done" }));
expect(property).toHaveTextContent("Done");
```

## Common Mistakes

| Mistake | Prefer |
| --- | --- |
| `screen.getByRole(..., { name: \`Actions for ${id}\` })` | Scope to `node(id)`, then query fixed `Actions`. |
| `getAllByRole("combobox")[1]` | A scoped, fixed-name `combobox`. |
| Use selected text as a combobox name | Label the combobox's purpose; assert selected text separately. |
| Global query for a repeated button | Owner object + `within(owner)`. |

Use `testing-strategy` for deciding behavior coverage and `using-primitives-for-components` for primitive-specific accessibility rules.
