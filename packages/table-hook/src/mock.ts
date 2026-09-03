import type { TableViewState } from "@/features/menu";
import type { ColumnInfo, Row } from "@/lib/types";
import {
  groupByTextValue,
  groupByValue,
  sortByCheckbox,
  sortByNumber,
  sortByText,
} from "@/methods";
import {
  checkboxCounting,
  createdTime,
  date,
  email,
  genericCounting,
  lastEditedTime,
  multiSelect,
  phone,
  url,
  type CellPlugin,
} from "@/plugins";

export function createMockPlugins() {
  const isEmptyString = (data: string) => data.trim() === "";
  const titlePlugin: CellPlugin<"title", string, { showIcon: boolean }> = {
    id: "title",
    default: {
      data: "",
      config: { showIcon: true },
    },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    isEmpty: isEmptyString,
    toTextValue: (data) => data,
    counting: genericCounting(isEmptyString),
  };

  const textPlugin: CellPlugin<"text", string, undefined> = {
    id: "text",
    default: { data: "", config: undefined },
    fromValue: (value) => value?.toString() ?? "",
    toValue: (data) => data,
    isEmpty: isEmptyString,
    toTextValue: (data) => data,
    sorting: { defaultMethod: sortByText.id, methods: [sortByText] },
    grouping: {
      defaultMethod: groupByTextValue.id,
      methods: [groupByTextValue],
    },
    counting: genericCounting(isEmptyString),
  };

  const isEmptyNumber = (data: number | null) => data === null;
  const numberPlugin: CellPlugin<"number", number | null, undefined> = {
    id: "number",
    default: { data: 0, config: undefined },
    fromValue: (value) => {
      const next = typeof value === "number" ? value : Number(value);
      return Number.isFinite(next) ? next : null;
    },
    toValue: (data) => data,
    isEmpty: isEmptyNumber,
    toTextValue: (data) => data?.toString() ?? "",
    sorting: { defaultMethod: sortByNumber.id, methods: [sortByNumber] },
    grouping: {
      defaultMethod: groupByValue.id,
      methods: [groupByValue],
    },
    counting: genericCounting(isEmptyNumber),
  };

  const isEmptyCheckbox = (data: boolean) => data === false;
  const checkboxPlugin: CellPlugin<"checkbox", boolean, undefined> = {
    id: "checkbox",
    default: { data: false, config: undefined },
    fromValue: (value) => Boolean(value),
    toValue: (data) => data,
    isEmpty: isEmptyCheckbox,
    toTextValue: (data) => (data ? "true" : ""),
    sorting: { defaultMethod: sortByCheckbox.id, methods: [sortByCheckbox] },
    grouping: {
      defaultMethod: groupByValue.id,
      methods: [groupByValue],
    },
    counting: checkboxCounting(isEmptyCheckbox),
  };

  const isEmptySelect = (data: { name: string } | null) => data === null;
  const selectPlugin: CellPlugin<"select", { name: string } | null, undefined> =
    {
      id: "select",
      default: { data: null, config: undefined },
      fromValue: (value) =>
        value === null ? null : { name: value.toString() },
      toValue: (data) => data?.name ?? null,
      isEmpty: isEmptySelect,
      toTextValue: (data) => data?.name ?? "",
      sorting: {
        defaultMethod: sortByText.id,
        methods: [
          {
            ...sortByText,
            function: (rowA, rowB, colId) => {
              const valueA =
                (
                  rowA.properties[colId]?.value as {
                    name?: string;
                  } | null
                )?.name ?? "";
              const valueB =
                (
                  rowB.properties[colId]?.value as {
                    name?: string;
                  } | null
                )?.name ?? "";
              return valueA.localeCompare(valueB);
            },
          },
        ],
      },
      grouping: {
        defaultMethod: groupByTextValue.id,
        methods: [
          {
            ...groupByTextValue,
            function: (data) => data?.name ?? "",
          },
        ],
      },
      counting: genericCounting(isEmptySelect),
    };

  return [
    titlePlugin,
    textPlugin,
    numberPlugin,
    checkboxPlugin,
    selectPlugin,
    multiSelect(),
    email(),
    phone(),
    url(),
    date(),
    createdTime(),
    lastEditedTime(),
  ];
}

export type MockPlugin = ReturnType<typeof createMockPlugins>[number];
export type MockColumnInfo = ColumnInfo & { type: MockPlugin["id"] };

export interface MockTableFixture {
  data: Row[];
  properties: MockColumnInfo[];
  view: TableViewState;
}

const timestamp = 1_735_689_600_000;
const defaultView = {
  layout: "table",
  rowView: "side",
  openedRowId: null,
  locked: false,
} satisfies TableViewState;

const basicFixture = {
  properties: [
    {
      id: "col1",
      name: "Name",
      type: "text",
      width: "200",
      config: undefined,
    },
    {
      id: "col2",
      name: "Done",
      type: "checkbox",
      width: "100",
      config: undefined,
    },
  ],
  data: [
    {
      id: "row1",
      createdAt: timestamp,
      lastEditedAt: timestamp,
      properties: {
        col1: { id: "cell1", value: "Task 1" },
        col2: { id: "cell2", value: true },
      },
    },
    {
      id: "row2",
      createdAt: timestamp + 86_400_000,
      lastEditedAt: timestamp + 86_400_000,
      properties: {
        col1: { id: "cell3", value: "" },
        col2: { id: "cell4", value: false },
      },
    },
    {
      id: "row3",
      createdAt: timestamp + 172_800_000,
      lastEditedAt: timestamp + 172_800_000,
      properties: {
        col1: { id: "cell5", value: "Task 3" },
        col2: { id: "cell6", value: true },
      },
    },
  ],
  view: defaultView,
} satisfies MockTableFixture;

const fullFixture = {
  properties: [
    {
      id: "title",
      name: "Name",
      type: "title",
      width: "220",
      config: { showIcon: true },
    },
    {
      id: "notes",
      name: "Notes",
      type: "text",
      width: "180",
      config: undefined,
    },
    {
      id: "score",
      name: "Score",
      type: "number",
      width: "120",
      config: {
        format: "number",
        round: "default",
        showAs: "number",
        options: { color: "green", divideBy: 100, showNumber: true },
      },
    },
    {
      id: "status",
      name: "Status",
      type: "select",
      width: "140",
      config: {
        sort: "manual",
        options: {
          names: ["Backlog", "Active", "Done"],
          items: {
            Backlog: {
              id: "option-backlog",
              name: "Backlog",
              color: "gray",
            },
            Active: {
              id: "option-active",
              name: "Active",
              color: "blue",
            },
            Done: { id: "option-done", name: "Done", color: "green" },
          },
        },
      },
    },
    {
      id: "tags",
      name: "Tags",
      type: "multi-select",
      width: "160",
      config: {
        sort: "manual",
        options: {
          names: ["Frontend", "Backend"],
          items: {
            Frontend: {
              id: "option-frontend",
              name: "Frontend",
              color: "purple",
            },
            Backend: {
              id: "option-backend",
              name: "Backend",
              color: "orange",
            },
          },
        },
      },
    },
    {
      id: "complete",
      name: "Complete",
      type: "checkbox",
      width: "100",
      config: undefined,
    },
    {
      id: "due",
      name: "Due",
      type: "date",
      width: "160",
      config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
    },
    {
      id: "email",
      name: "Email",
      type: "email",
      width: "180",
      config: undefined,
    },
    {
      id: "phone",
      name: "Phone",
      type: "phone",
      width: "160",
      config: undefined,
    },
    {
      id: "website",
      name: "Website",
      type: "url",
      width: "180",
      config: undefined,
    },
    {
      id: "created",
      name: "Created",
      type: "created-time",
      width: "180",
      config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
    },
    {
      id: "edited",
      name: "Edited",
      type: "last-edited-time",
      width: "180",
      config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
    },
  ],
  data: [
    {
      id: "row-alpha",
      icon: { type: "emoji", src: "🧪" },
      createdAt: timestamp,
      lastEditedAt: timestamp,
      properties: {
        title: { id: "cell-alpha-title", value: "Alpha" },
        notes: { id: "cell-alpha-notes", value: "first note" },
        score: { id: "cell-alpha-score", value: "10" },
        status: { id: "cell-alpha-status", value: "Active" },
        tags: { id: "cell-alpha-tags", value: ["Frontend"] },
        complete: { id: "cell-alpha-complete", value: true },
        due: { id: "cell-alpha-due", value: { start: timestamp } },
        email: { id: "cell-alpha-email", value: "alpha@example.com" },
        phone: { id: "cell-alpha-phone", value: "+886900000001" },
        website: {
          id: "cell-alpha-website",
          value: "https://example.com/alpha",
        },
        created: { id: "cell-alpha-created", value: null },
        edited: { id: "cell-alpha-edited", value: null },
      },
    },
    {
      id: "row-empty",
      createdAt: timestamp + 86_400_000,
      lastEditedAt: timestamp + 86_400_000,
      properties: {
        title: { id: "cell-empty-title", value: "Empty" },
        notes: { id: "cell-empty-notes", value: "" },
        score: { id: "cell-empty-score", value: null },
        status: { id: "cell-empty-status", value: null },
        tags: { id: "cell-empty-tags", value: [] },
        complete: { id: "cell-empty-complete", value: false },
        due: { id: "cell-empty-due", value: {} },
        email: { id: "cell-empty-email", value: "" },
        phone: { id: "cell-empty-phone", value: "" },
        website: { id: "cell-empty-website", value: "" },
        created: { id: "cell-empty-created", value: null },
        edited: { id: "cell-empty-edited", value: null },
      },
    },
    {
      id: "row-omega",
      createdAt: timestamp + 172_800_000,
      lastEditedAt: timestamp + 172_800_000,
      properties: {
        title: { id: "cell-omega-title", value: "Omega" },
        notes: { id: "cell-omega-notes", value: "last note" },
        score: { id: "cell-omega-score", value: "90" },
        status: { id: "cell-omega-status", value: "Done" },
        tags: {
          id: "cell-omega-tags",
          value: ["Frontend", "Backend"],
        },
        complete: { id: "cell-omega-complete", value: false },
        due: {
          id: "cell-omega-due",
          value: { start: timestamp + 345_600_000 },
        },
        email: { id: "cell-omega-email", value: "omega@example.com" },
        phone: { id: "cell-omega-phone", value: "+886900000003" },
        website: {
          id: "cell-omega-website",
          value: "https://example.com/omega",
        },
        created: { id: "cell-omega-created", value: null },
        edited: { id: "cell-omega-edited", value: null },
      },
    },
  ],
  view: defaultView,
} satisfies MockTableFixture;

export function createMockTableFixture(): MockTableFixture {
  return structuredClone(basicFixture);
}

export function createMockFullTableFixture(): MockTableFixture {
  return structuredClone(fullFixture);
}
