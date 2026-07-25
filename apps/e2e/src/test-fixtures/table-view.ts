import type { ColumnDefs, Row, TableViewState } from "@notion-kit/table-view";

const selectOptions = {
  sort: "manual" as const,
  options: {
    names: ["Backlog", "Active", "Done"],
    items: {
      Backlog: { id: "option-backlog", name: "Backlog", color: "gray" },
      Active: { id: "option-active", name: "Active", color: "blue" },
      Done: { id: "option-done", name: "Done", color: "green" },
    },
  },
};

const tagOptions = {
  sort: "manual" as const,
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
};

const dateConfig = {
  dateFormat: "full" as const,
  timeFormat: "24-hour" as const,
  tz: "UTC",
};

const INITIAL_PROPERTIES: ColumnDefs = [
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
    config: selectOptions,
  },
  {
    id: "tags",
    name: "Tags",
    type: "multi-select",
    width: "160",
    config: tagOptions,
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
    config: dateConfig,
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
    config: dateConfig,
  },
  {
    id: "edited",
    name: "Edited",
    type: "last-edited-time",
    width: "180",
    config: dateConfig,
  },
];

const INITIAL_DATA: Row[] = [
  {
    id: "row-alpha",
    icon: { type: "emoji", src: "🧪" },
    createdAt: 1_735_689_600_000,
    lastEditedAt: 1_735_689_600_000,
    properties: {
      title: { id: "cell-alpha-title", value: "Alpha" },
      notes: { id: "cell-alpha-notes", value: "first note" },
      score: { id: "cell-alpha-score", value: "10" },
      status: { id: "cell-alpha-status", value: "Active" },
      tags: { id: "cell-alpha-tags", value: ["Frontend"] },
      complete: { id: "cell-alpha-complete", value: true },
      due: {
        id: "cell-alpha-due",
        value: { start: 1_735_689_600_000 },
      },
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
    createdAt: 1_735_776_000_000,
    lastEditedAt: 1_735_776_000_000,
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
    createdAt: 1_735_862_400_000,
    lastEditedAt: 1_735_862_400_000,
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
        value: { start: 1_736_035_200_000 },
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
];

const INITIAL_VIEW: TableViewState = {
  layout: "table",
  rowView: "side",
  openedRowId: null,
  locked: false,
};

export function createTableViewFixture() {
  return structuredClone({
    data: INITIAL_DATA,
    properties: INITIAL_PROPERTIES,
    view: INITIAL_VIEW,
  });
}

export function createPluginConfigurationScenario() {
  const next = createTableViewFixture();
  const score = next.properties.find((property) => property.id === "score");
  const status = next.properties.find((property) => property.id === "status");
  const due = next.properties.find((property) => property.id === "due");

  if (score?.type !== "number" || status?.type !== "select") {
    throw new Error("Plugin configuration fixture properties are missing");
  }
  if (due?.type !== "date") {
    throw new Error("Plugin configuration fixture date property is missing");
  }

  score.config = {
    format: "currency",
    round: "0",
    showAs: "bar",
    options: { color: "green", divideBy: 100, showNumber: true },
  };
  status.config = {
    sort: "reverse-alphabetical",
    options: {
      names: ["Waiting", "In progress", "Backlog"],
      items: {
        Waiting: {
          id: "option-waiting",
          name: "Waiting",
          color: "yellow",
        },
        "In progress": {
          id: "option-active",
          name: "In progress",
          color: "purple",
        },
        Backlog: {
          id: "option-backlog",
          name: "Backlog",
          color: "gray",
        },
      },
    },
  };
  due.config = {
    dateFormat: "MM/dd/yyyy",
    timeFormat: "12-hour",
    tz: "UTC",
  };

  const alpha = next.data.find((row) => row.id === "row-alpha");
  const omega = next.data.find((row) => row.id === "row-omega");
  if (!alpha || !omega) {
    throw new Error("Plugin configuration fixture rows are missing");
  }
  alpha.properties.status!.value = "In progress";
  alpha.properties.due!.value = {
    start: 1_735_689_600_000,
    includeTime: true,
  };
  omega.properties.status!.value = null;

  return next;
}
