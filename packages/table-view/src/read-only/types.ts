/**
 * Fine-grained read-only presentation flags. Passing `readOnly` as an object
 * enables read-only mode (equivalent to `readOnly: true`, i.e. the table
 * behaves as `locked`: no edits, no drag, no row selection) and hides every
 * listed affordance by default; set an individual flag to `false` to keep
 * that affordance visible while the table stays locked.
 *
 * `hideAddProperty` and `hideRowActions` describe affordances that are
 * already structurally gated by `locked` elsewhere in table-view (adding a
 * property or dragging/selecting a row are edits). They are always hidden
 * while read-only; the flags exist for API completeness and documentation,
 * but setting them to `false` currently has no effect while the table is
 * locked.
 */
export interface TableViewReadOnlyOptions {
  /** Hide the toolbar "New" button. */
  hideNewButton?: boolean;
  /** Hide the "+ add property" column header affordance. Always hidden while locked. */
  hideAddProperty?: boolean;
  /** Hide the calculation/footer row. */
  hideFooter?: boolean;
  /** Hide per-row drag handle, checkbox, and "add row" affordances. Always hidden while locked. */
  hideRowActions?: boolean;
  /** Hide the view settings (gear) toolbar button entirely. */
  hideViewSettings?: boolean;
}

export type TableViewReadOnly = boolean | TableViewReadOnlyOptions;

export interface ResolvedTableViewReadOnly {
  locked: boolean;
  hideNewButton: boolean;
  hideAddProperty: boolean;
  hideFooter: boolean;
  hideRowActions: boolean;
  hideViewSettings: boolean;
}

const ALL_HIDDEN: Omit<ResolvedTableViewReadOnly, "locked"> = {
  hideNewButton: true,
  hideAddProperty: true,
  hideFooter: true,
  hideRowActions: true,
  hideViewSettings: true,
};

const NONE_HIDDEN: Omit<ResolvedTableViewReadOnly, "locked"> = {
  hideNewButton: false,
  hideAddProperty: false,
  hideFooter: false,
  hideRowActions: false,
  hideViewSettings: false,
};

export function resolveTableViewReadOnly(
  readOnly: TableViewReadOnly | undefined,
): ResolvedTableViewReadOnly {
  if (!readOnly) return { locked: false, ...NONE_HIDDEN };
  if (readOnly === true) return { locked: true, ...ALL_HIDDEN };
  return {
    locked: true,
    hideNewButton: readOnly.hideNewButton ?? true,
    hideAddProperty: readOnly.hideAddProperty ?? true,
    hideFooter: readOnly.hideFooter ?? true,
    hideRowActions: readOnly.hideRowActions ?? true,
    hideViewSettings: readOnly.hideViewSettings ?? true,
  };
}
