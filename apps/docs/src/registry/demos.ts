/**
 * Demo manifest for the docs site.
 * Each name corresponds to a directory in `packages/registry/src/<name>/`.
 * The build-internal-registry script uses this list to:
 * 1. Generate React.lazy imports from `@notion-kit/registry/<name>`
 * 2. Auto-discover source files for the code preview panel
 */
export const DEMOS = [
  // Badge
  "badge-default",
  "badge-sizes",
  "badge-variants",
  // Button
  "button-default",
  "button-disabled",
  "button-hint",
  "button-icon-button",
  "button-nav-icon",
  "button-sizes",
  "button-variants",
  "button-warning",
  // Checkbox
  "checkbox-default",
  "checkbox-sizes",
  // Code Block
  "code-block-controlled",
  "code-block-default",
  "code-block-mermaid",
  "code-block-readonly",
  // Context Menu
  "context-menu",
  // Cover
  "cover-default",
  "cover-picker",
  // Dropdown Menu
  "dropdown-menu",
  "dropdown-menu-checkbox",
  // Icon Block
  "icon-block-emoji",
  "icon-block-lucide",
  "icon-block-sizes",
  "icon-block-text",
  "icon-block-url",
  // Icon Menu
  "icon-menu-custom-factory",
  "icon-menu-default",
  "icon-menu-notion-icons",
  // Input
  "input-default",
  "input-flat",
  "input-search",
  // Login Form
  "login-form-auth",
  "login-form-default",
  // Multi Select
  "multi-select-creatable",
  "multi-select-default",
  "multi-select-inline",
  "multi-select-max-selected",
  // Navbar
  "navbar-menu",
  "navbar-notion",
  "navbar-participants",
  "navbar-sharing",
  "navbar-title",
  // Resizable
  "resizable-demo",
  // Select
  "select-custom",
  "select-default",
  // Separator
  "separator-demo",
  // Settings Panel
  "settings-panel-connections-table",
  "settings-panel-guests-table",
  "settings-panel-invitations-table",
  "settings-panel-members-table",
  "settings-panel-notion",
  "settings-panel-plans-table",
  "settings-panel-sessions-table",
  "settings-panel-teamspaces-table",
  // Sidebar
  "sidebar-basic",
  "sidebar-favorite-list",
  "sidebar-notion",
  "sidebar-page-list",
  "sidebar-search-command",
  "sidebar-trash-box",
  "sidebar-workspace-switcher",
  // Single Image Dropzone
  "single-image-dropzone-default",
  // Skeleton
  "skeleton-demo",
  // Spinner
  "spinner-default",
  "spinner-variants",
  // Switch
  "switch-default",
  "switch-sizes",
  // Table View
  "table-view-controlled",
  "table-view-uncontrolled",
  // Tabs
  "tabs-demo",
  // Tags Input
  "tags-input-default",
  // Timeline
  "timeline-layout",
  "timeline-with-sidebar",
  "timeline-without-sidebar",
  // Tooltip
  "tooltip-demo",
  // Tree
  "tree-command",
  "tree-default",
  "tree-multi-select",
  "tree-non-collapsible",
  "tree-show-empty",
  // Unsplash
  "unsplash-default",
  "unsplash-search",
] as const;

export type DemoName = (typeof DEMOS)[number];
