import type { actionMessages } from "@/edit-log/messages";

/**
 * Deeply-partial view of {@link TableViewMessages}. Used by the public
 * `messages` prop on `<TableView>` so a consumer can override a handful of
 * strings without repeating the entire English catalog.
 */
export type DeepPartial<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export interface RowViewModeMessages {
  /** Label shown in the peek-mode switcher and in the layout menu. */
  label: string;
  /** Tooltip shown on the toolbar / view-nav trigger that opens this mode. */
  tooltip: string;
  /** Longer description shown in the peek-mode switcher menu. */
  desc: string;
}

export type EditLogActionKey = keyof typeof actionMessages;

export interface TableViewMessages {
  toolbar: {
    /** aria-label and tooltip for the filter toolbar button. */
    filter: string;
    /** aria-label and tooltip for the sort toolbar button. */
    sort: string;
    /** aria-label and tooltip for the automations toolbar button. */
    automations: string;
    /** aria-label and tooltip for the "open as full page" toolbar button. */
    openFullPage: string;
    /** aria-label for the settings (view menu) toolbar button. */
    settings: string;
    /** aria-label and tooltip for the search toggle button. */
    search: string;
    /** aria-label for the search input itself. */
    searchInputLabel: string;
    /** Placeholder text shown in the search input. */
    searchPlaceholder: string;
    /** Label for the "New" row button. */
    newRow: string;
  };
  viewMenu: {
    viewSettings: string;
    layout: string;
    filter: string;
    sort: string;
    group: string;
    dataSourceSettings: string;
    editProperties: string;
    lockDatabase: string;
    unlockDatabase: string;
    editLog: string;
  };
  layoutMenu: {
    layoutTitle: string;
    calendarBy: string;
    timelineBy: string;
    openPagesIn: string;
    /** Layout option labels, keyed by layout id ("table", "board", ...). */
    layouts: Record<string, string>;
  };
  rowView: {
    /** Peek-mode metadata, keyed by row view id ("side", "center", "full"). */
    modes: Record<"side" | "center" | "full", RowViewModeMessages>;
    close: string;
    switchPeekMode: string;
    previousRow: string;
    nextRow: string;
    moreActions: string;
    /** Fallback title shown for a row without a title value. */
    newPageTitle: string;
    /** Label on the compact "Open" affordance on a hovered title cell. */
    open: string;
    /** aria-label / tooltip on the compact title cell's inline editor trigger. */
    edit: string;
  };
  footer: {
    /** Placeholder shown for a column with no calculation selected. */
    calculate: string;
    /** aria-label for a footer cell's calculation trigger, e.g. "Price calculation". */
    calculationFor: (propertyName: string) => string;
  };
  propsMenu: {
    properties: string;
    searchProperty: string;
    newProperty: string;
    deletedProperties: string;
    learnAboutProperties: string;
    editProperty: string;
    type: string;
    wrapInView: string;
    hideInView: string;
    duplicateProperty: string;
    deleteProperty: string;
    changeType: string;
    filter: string;
    sort: string;
    calculate: string;
    noResults: string;
    showAll: string;
    hideAll: string;
    moveProperty: (name: string) => string;
    toggleVisibility: (name: string) => string;
    group: string;
    ungroup: string;
    freezeUpToColumn: string;
    unfreezeColumns: string;
    wrapText: string;
    unwrapText: string;
    insertLeft: string;
    insertRight: string;
    duplicateNameError: (name: string) => string;
  };
  sortMenu: {
    addSort: string;
    deleteSort: string;
    moveSort: string;
    sortDirectionSelect: string;
    removeSort: string;
    searchProperty: string;
    noResults: string;
  };
  filterMenu: {
    filtersRegion: string;
    deleteFilter: string;
    addFilterRule: string;
    addFilterGroup: string;
    addFilterGroupDesc: string;
    filterLogicSelect: string;
    operatorSelect: string;
    actions: string;
    delete: string;
    value: string;
    valueSelect: string;
    chooseOption: string;
    chooseOptions: string;
    searchOptions: string;
    clearSelectedOptions: string;
    datePresetSelect: string;
    selectDate: string;
    customDateSelect: string;
    customDateInput: string;
    dateInputPlaceholder: string;
    dateRangeSelect: string;
    starting: string;
    ending: string;
    selectARange: string;
    relativeDateAmount: string;
    relativeDateUnit: string;
    where: string;
    logicAnd: string;
    logicOr: string;
    unavailableOperator: (operator: string) => string;
  };
  groupMenu: {
    none: string;
    groupBy: string;
    hideEmptyGroups: string;
    groups: string;
    removeGrouping: string;
    learnAboutGrouping: string;
    groupUsing: string;
    sortGroups: string;
    manual: string;
    searchProperty: string;
    noResults: string;
    moveGroup: (name: string) => string;
    toggleGroupVisibility: (name: string) => string;
  };
  calcMenu: {
    none: string;
    showLargeCounts: string;
    showLargeCountsDesc: string;
  };
  rowActionMenu: {
    searchActionsLabel: string;
    searchActionsPlaceholder: string;
    editIcon: string;
    openInNewTab: string;
    editLog: string;
    copyLink: string;
    duplicate: string;
    delete: string;
  };
  deletedPropsMenu: {
    title: string;
    restoreProperty: (name: string) => string;
    deleteProperty: (name: string) => string;
  };
  typesMenu: {
    typeTitle: string;
    selectToAdd: string;
    changePropertyType: string;
    newProperty: string;
    searchPropertyType: string;
    searchOrAddNewProperty: string;
  };
  editLog: {
    title: string;
    tableHistory: string;
    entriesAriaLabel: string;
    listAriaLabel: string;
    loading: string;
    empty: string;
    loadError: string;
    retry: string;
    loadMore: string;
    renamedTo: (name: string) => string;
    changedToType: (typeName: string) => string;
    changedToView: (layoutLabel: string) => string;
    groupedBy: string;
    removedGrouping: string;
    actions: Record<EditLogActionKey, string>;
  };
  bulkEdit: {
    /** Pluralizes the row count, e.g. "1 row" / "2 rows". */
    rowCount: (count: number) => string;
    deleteRows: (rowLabel: string) => string;
    deleteRowsConfirmTitle: (rowLabel: string) => string;
    moreBulkActions: string;
    duplicate: string;
    delete: string;
    cancel: string;
  };
  groupActions: {
    groupOptions: string;
    hideAggregation: string;
    showAggregation: string;
    hideGroup: string;
    deleteRows: string;
    deleteGroupConfirmTitle: string;
    delete: string;
    cancel: string;
    createNew: string;
  };
  rowActions: {
    addRow: string;
    addRowBelow: string;
    addRowAbove: string;
    dragToMove: string;
    clickToOpenMenu: string;
    rowActions: string;
    selectRow: (rowId: string) => string;
    newPage: string;
    removeSortingTitle: string;
    removeSortingConfirm: string;
    removeSortingCancel: string;
  };
  aria: {
    selectAllRows: string;
    back: string;
    close: string;
    propertySelect: string;
    copyToClipboard: string;
    addPropertyDescription: string;
    addDescriptionPlaceholder: string;
    unavailableProperty: (value: string) => string;
    actions: string;
    rowActionsHint: string;
    calendarRegion: string;
    timelineTable: string;
  };
}
