# Component guidelines

Use these rules when composing UI components or changing shared primitives.

## Use existing primitives

- Compose the project's primitives before building custom controls.
- Follow the project skill for primitive selection, composition, styling, and accessible names.
- Use primitive defaults without adding `className` unless a concrete requirement needs different styling.
- Prefer existing variants when a requirement needs a different appearance. Keep caller-specific layout adjustments local.
- When shared styling needs improvement, propose an update to the primitive's default classes and obtain approval. Avoid repeating the same adjustment across callers.

## Preserve Base UI defaults

- Prefer uncontrolled state when the application does not need to own the value.
- Use Base UI's default parameters, including highlighting, focus, keyboard navigation, and dismissal.
- Preserve native roles and accessibility relationships. Supply accessible names where required.
- Override defaults only for a concrete requirement. Explain the requirement and verify the affected behavior.
- Avoid duplicate state, clear handlers, and role overrides that repeat behavior owned by Base UI.

## Obtain approval for primitive design changes

- Before changing primitive props, interfaces, or architecture, propose the change and request maintainer approval.
- Include added optional props, removed props, narrowed types, changed defaults, and exported types in the proposal.
- Proceed when existing authorization explicitly covers the proposed change.
- Adapt callers to the approved contract. Do not restore removed APIs to accommodate stale callers.
- Expose only the variants required by the component. Do not expose every variant of an underlying style helper.
