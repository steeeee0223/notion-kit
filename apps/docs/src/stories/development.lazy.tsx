import { lazy } from "react";

export const uiRadioGroup = {
  DefaultExample: lazy(() =>
    import("./development/ui/radio-group.examples").then((module) => ({
      default: module.DefaultExample,
    })),
  ),
};

export const authAcceptInvitationForm = {
  DefaultExample: lazy(() =>
    import("./development/auth/accept-invitation-form.examples").then(
      (module) => ({
        default: module.DefaultExample,
      }),
    ),
  ),
};

export const authCreateWorkspaceForm = {
  DefaultExample: lazy(() =>
    import("./development/auth/create-workspace-form.examples").then(
      (module) => ({
        default: module.DefaultExample,
      }),
    ),
  ),
};

export const blocksCodeBlock = {
  MermaidPreviewingExample: lazy(() =>
    import("./development/blocks/code-block.examples").then((module) => ({
      default: module.MermaidPreviewingExample,
    })),
  ),
};

export const blocksCoolTodoCoolTodo = {
  DefaultExample: lazy(() =>
    import("./development/blocks/cool-todo/cool-todo.examples").then(
      (module) => ({
        default: module.DefaultExample,
      }),
    ),
  ),
};

export const blocksDateRangeInput = {
  DefaultExample: lazy(() =>
    import("./development/blocks/date-range-input.examples").then((module) => ({
      default: module.DefaultExample,
    })),
  ),
};

export const blocksEject = {
  DefaultExample: lazy(() =>
    import("./development/blocks/eject.examples").then((module) => ({
      default: module.DefaultExample,
    })),
  ),
  DisappearModeExample: lazy(() =>
    import("./development/blocks/eject.examples").then((module) => ({
      default: module.DisappearModeExample,
    })),
  ),
  GhostModeExample: lazy(() =>
    import("./development/blocks/eject.examples").then((module) => ({
      default: module.GhostModeExample,
    })),
  ),
  KeyboardShortcutExample: lazy(() =>
    import("./development/blocks/eject.examples").then((module) => ({
      default: module.KeyboardShortcutExample,
    })),
  ),
  ContextMenuTriggerExample: lazy(() =>
    import("./development/blocks/eject.examples").then((module) => ({
      default: module.ContextMenuTriggerExample,
    })),
  ),
  PlaygroundExample: lazy(() =>
    import("./development/blocks/eject.examples").then((module) => ({
      default: module.PlaygroundExample,
    })),
  ),
  DialogFormExample: lazy(() =>
    import("./development/blocks/eject.examples").then((module) => ({
      default: module.DialogFormExample,
    })),
  ),
};

export const blocksFallingBlocks = {
  BasicExample: lazy(() =>
    import("./development/blocks/falling-blocks.examples").then((module) => ({
      default: module.BasicExample,
    })),
  ),
  DraggableExample: lazy(() =>
    import("./development/blocks/falling-blocks.examples").then((module) => ({
      default: module.DraggableExample,
    })),
  ),
};

export const blocksLearningStepsDialog = {
  DefaultExample: lazy(() =>
    import("./development/blocks/learning-steps-dialog.examples").then(
      (module) => ({
        default: module.DefaultExample,
      }),
    ),
  ),
};

export const blocksSettingsPanelDialogs = {
  CreateTeamspaceModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.CreateTeamspaceModalExample,
      }),
    ),
  ),
  TeamspaceDetailModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.TeamspaceDetailModalExample,
      }),
    ),
  ),
  AddTeamMembersModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.AddTeamMembersModalExample,
      }),
    ),
  ),
  AddMembersModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.AddMembersModalExample,
      }),
    ),
  ),
  DeleteAccountModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.DeleteAccountModalExample,
      }),
    ),
  ),
  DeleteGuestModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.DeleteGuestModalExample,
      }),
    ),
  ),
  DeleteMemberModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.DeleteMemberModalExample,
      }),
    ),
  ),
  DeleteWorkspaceModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.DeleteWorkspaceModalExample,
      }),
    ),
  ),
  EmailSettingsModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.EmailSettingsModalExample,
      }),
    ),
  ),
  SetPasswordModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.SetPasswordModalExample,
      }),
    ),
  ),
  ChangePasswordModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.ChangePasswordModalExample,
      }),
    ),
  ),
  Add2FAModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.Add2FAModalExample,
      }),
    ),
  ),
  Enable2FAMethodModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.Enable2FAMethodModalExample,
      }),
    ),
  ),
  PasskeysManagementExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.PasskeysManagementExample,
      }),
    ),
  ),
  UpgradeModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.UpgradeModalExample,
      }),
    ),
  ),
  ChangePaymentMethodModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.ChangePaymentMethodModalExample,
      }),
    ),
  ),
  AddEmojiModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.AddEmojiModalExample,
      }),
    ),
  ),
  EditEmojiModalExample: lazy(() =>
    import("./development/blocks/settings-panel/dialogs.examples").then(
      (module) => ({
        default: module.EditEmojiModalExample,
      }),
    ),
  ),
};

export const blocksSettingsPanelSettingsPanel = {
  DefaultExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.DefaultExample,
      }),
    ),
  ),
  NotificationsExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.NotificationsExample,
      }),
    ),
  ),
  MyConnectionsExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.MyConnectionsExample,
      }),
    ),
  ),
  WorkspaceExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.WorkspaceExample,
      }),
    ),
  ),
  PeopleExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.PeopleExample,
      }),
    ),
  ),
  EmojiExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.EmojiExample,
      }),
    ),
  ),
  TeamspacesExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.TeamspacesExample,
      }),
    ),
  ),
  SecurityExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.SecurityExample,
      }),
    ),
  ),
  IdentityExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.IdentityExample,
      }),
    ),
  ),
  BillingExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.BillingExample,
      }),
    ),
  ),
  PlansExample: lazy(() =>
    import("./development/blocks/settings-panel/settings-panel.examples").then(
      (module) => ({
        default: module.PlansExample,
      }),
    ),
  ),
};

export const blocksSettingsPanelTables = {
  TeamMembersExample: lazy(() =>
    import("./development/blocks/settings-panel/tables.examples").then(
      (module) => ({
        default: module.TeamMembersExample,
      }),
    ),
  ),
  EmojisExample: lazy(() =>
    import("./development/blocks/settings-panel/tables.examples").then(
      (module) => ({
        default: module.EmojisExample,
      }),
    ),
  ),
};

export const blocksSlingShot = {
  DefaultExample: lazy(() =>
    import("./development/blocks/sling-shot.examples").then((module) => ({
      default: module.DefaultExample,
    })),
  ),
  SoftLandingExample: lazy(() =>
    import("./development/blocks/sling-shot.examples").then((module) => ({
      default: module.SoftLandingExample,
    })),
  ),
  NoGoalExample: lazy(() =>
    import("./development/blocks/sling-shot.examples").then((module) => ({
      default: module.NoGoalExample,
    })),
  ),
};

export const collectionsTableViewTableMenus = {
  TableViewMenuExample: lazy(() =>
    import("./development/collections/table-view/table-menus.examples").then(
      (module) => ({
        default: module.TableViewMenuExample,
      }),
    ),
  ),
  SortMenuExample: lazy(() =>
    import("./development/collections/table-view/table-menus.examples").then(
      (module) => ({
        default: module.SortMenuExample,
      }),
    ),
  ),
  FilterMenuExample: lazy(() =>
    import("./development/collections/table-view/table-menus.examples").then(
      (module) => ({
        default: module.FilterMenuExample,
      }),
    ),
  ),
  CalcMenuExample: lazy(() =>
    import("./development/collections/table-view/table-menus.examples").then(
      (module) => ({
        default: module.CalcMenuExample,
      }),
    ),
  ),
  PropMenuExample: lazy(() =>
    import("./development/collections/table-view/table-menus.examples").then(
      (module) => ({
        default: module.PropMenuExample,
      }),
    ),
  ),
  TypesMenuExample: lazy(() =>
    import("./development/collections/table-view/table-menus.examples").then(
      (module) => ({
        default: module.TypesMenuExample,
      }),
    ),
  ),
  EditPropMenuExample: lazy(() =>
    import("./development/collections/table-view/table-menus.examples").then(
      (module) => ({
        default: module.EditPropMenuExample,
      }),
    ),
  ),
  ColumnConfigMenusExample: lazy(() =>
    import("./development/collections/table-view/table-menus.examples").then(
      (module) => ({
        default: module.ColumnConfigMenusExample,
      }),
    ),
  ),
  RowActionMenuExample: lazy(() =>
    import("./development/collections/table-view/table-menus.examples").then(
      (module) => ({
        default: module.RowActionMenuExample,
      }),
    ),
  ),
};

export const collectionsTableViewTableView = {
  DatabaseViewExample: lazy(() =>
    import("./development/collections/table-view/table-view.examples").then(
      (module) => ({
        default: module.DatabaseViewExample,
      }),
    ),
  ),
  ControlledExample: lazy(() =>
    import("./development/collections/table-view/table-view.examples").then(
      (module) => ({
        default: module.ControlledExample,
      }),
    ),
  ),
  ListViewExample: lazy(() =>
    import("./development/collections/table-view/table-view.examples").then(
      (module) => ({
        default: module.ListViewExample,
      }),
    ),
  ),
  BoardViewExample: lazy(() =>
    import("./development/collections/table-view/table-view.examples").then(
      (module) => ({
        default: module.BoardViewExample,
      }),
    ),
  ),
  TimelineViewExample: lazy(() =>
    import("./development/collections/table-view/table-view.examples").then(
      (module) => ({
        default: module.TimelineViewExample,
      }),
    ),
  ),
};

export const hooksUseRect = {
  DefaultExample: lazy(() =>
    import("./development/hooks/use-rect.examples").then((module) => ({
      default: module.DefaultExample,
    })),
  ),
};

export const mapMapArc = {
  CustomStylingExample: lazy(() =>
    import("./development/map/map-arc.examples").then((module) => ({
      default: module.CustomStylingExample,
    })),
  ),
  WithHoverStateExample: lazy(() =>
    import("./development/map/map-arc.examples").then((module) => ({
      default: module.WithHoverStateExample,
    })),
  ),
  HighCurvatureExample: lazy(() =>
    import("./development/map/map-arc.examples").then((module) => ({
      default: module.HighCurvatureExample,
    })),
  ),
  StraightLinesExample: lazy(() =>
    import("./development/map/map-arc.examples").then((module) => ({
      default: module.StraightLinesExample,
    })),
  ),
};

export const mapMapClusterLayer = {
  CustomColorsExample: lazy(() =>
    import("./development/map/map-cluster-layer.examples").then((module) => ({
      default: module.CustomColorsExample,
    })),
  ),
  WithPointClickExample: lazy(() =>
    import("./development/map/map-cluster-layer.examples").then((module) => ({
      default: module.WithPointClickExample,
    })),
  ),
};

export const mapMapControls = {
  AllControlsExample: lazy(() =>
    import("./development/map/map-controls.examples").then((module) => ({
      default: module.AllControlsExample,
    })),
  ),
};

export const mapMapMarker = {
  DefaultExample: lazy(() =>
    import("./development/map/map-marker.examples").then((module) => ({
      default: module.DefaultExample,
    })),
  ),
  CustomContentExample: lazy(() =>
    import("./development/map/map-marker.examples").then((module) => ({
      default: module.CustomContentExample,
    })),
  ),
  WithPopupExample: lazy(() =>
    import("./development/map/map-marker.examples").then((module) => ({
      default: module.WithPopupExample,
    })),
  ),
  WithTooltipExample: lazy(() =>
    import("./development/map/map-marker.examples").then((module) => ({
      default: module.WithTooltipExample,
    })),
  ),
  WithLabelExample: lazy(() =>
    import("./development/map/map-marker.examples").then((module) => ({
      default: module.WithLabelExample,
    })),
  ),
  DraggableExample: lazy(() =>
    import("./development/map/map-marker.examples").then((module) => ({
      default: module.DraggableExample,
    })),
  ),
};

export const mapMapPopup = {
  DefaultExample: lazy(() =>
    import("./development/map/map-popup.examples").then((module) => ({
      default: module.DefaultExample,
    })),
  ),
};

export const mapMapRoute = {
  StyledExample: lazy(() =>
    import("./development/map/map-route.examples").then((module) => ({
      default: module.StyledExample,
    })),
  ),
  DashedExample: lazy(() =>
    import("./development/map/map-route.examples").then((module) => ({
      default: module.DashedExample,
    })),
  ),
  MultipleRoutesExample: lazy(() =>
    import("./development/map/map-route.examples").then((module) => ({
      default: module.MultipleRoutesExample,
    })),
  ),
};

export const mapMap = {
  DarkThemeExample: lazy(() =>
    import("./development/map/map.examples").then((module) => ({
      default: module.DarkThemeExample,
    })),
  ),
  LightThemeExample: lazy(() =>
    import("./development/map/map.examples").then((module) => ({
      default: module.LightThemeExample,
    })),
  ),
  GlobeExample: lazy(() =>
    import("./development/map/map.examples").then((module) => ({
      default: module.GlobeExample,
    })),
  ),
  ControlledViewportExample: lazy(() =>
    import("./development/map/map.examples").then((module) => ({
      default: module.ControlledViewportExample,
    })),
  ),
};

export const uiCalendar = {
  BasicExample: lazy(() =>
    import("./development/ui/calendar.examples").then((module) => ({
      default: module.BasicExample,
    })),
  ),
  RangeCalendarExample: lazy(() =>
    import("./development/ui/calendar.examples").then((module) => ({
      default: module.RangeCalendarExample,
    })),
  ),
  EnhancedDateTimePickerExample: lazy(() =>
    import("./development/ui/calendar.examples").then((module) => ({
      default: module.EnhancedDateTimePickerExample,
    })),
  ),
};

export const uiDropdownMenu = {
  InlineMenuExample: lazy(() =>
    import("./development/ui/dropdown-menu.examples").then((module) => ({
      default: module.InlineMenuExample,
    })),
  ),
};

export const uiInput = {
  WithClearExample: lazy(() =>
    import("./development/ui/input.examples").then((module) => ({
      default: module.WithClearExample,
    })),
  ),
};

export const uiPopover = {
  DetachExample: lazy(() =>
    import("./development/ui/popover.examples").then((module) => ({
      default: module.DetachExample,
    })),
  ),
};

export const uiSelectableSelectable = {
  BasicExample: lazy(() =>
    import("./development/ui/selectable/selectable.examples").then(
      (module) => ({
        default: module.BasicExample,
      }),
    ),
  ),
  SelectContainExample: lazy(() =>
    import("./development/ui/selectable/selectable.examples").then(
      (module) => ({
        default: module.SelectContainExample,
      }),
    ),
  ),
  MultiSelectExample: lazy(() =>
    import("./development/ui/selectable/selectable.examples").then(
      (module) => ({
        default: module.MultiSelectExample,
      }),
    ),
  ),
  NoOverlayExample: lazy(() =>
    import("./development/ui/selectable/selectable.examples").then(
      (module) => ({
        default: module.NoOverlayExample,
      }),
    ),
  ),
  WithDraggableItemsExample: lazy(() =>
    import("./development/ui/selectable/selectable.examples").then(
      (module) => ({
        default: module.WithDraggableItemsExample,
      }),
    ),
  ),
};

export const uiTableTable = {
  DefaultExample: lazy(() =>
    import("./development/ui/table/table.examples").then((module) => ({
      default: module.DefaultExample,
    })),
  ),
  EmptyExample: lazy(() =>
    import("./development/ui/table/table.examples").then((module) => ({
      default: module.EmptyExample,
    })),
  ),
  PinnedExample: lazy(() =>
    import("./development/ui/table/table.examples").then((module) => ({
      default: module.PinnedExample,
    })),
  ),
  StripedExample: lazy(() =>
    import("./development/ui/table/table.examples").then((module) => ({
      default: module.StripedExample,
    })),
  ),
};
