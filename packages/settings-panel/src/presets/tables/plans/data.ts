import { Plan } from "@notion-kit/schemas";

import type { ContentPlanRow as Content, HighlightPlanRow } from "./columns";

export const highlightData: HighlightPlanRow[] = [
  {
    title: "Highlights",
    free: ["Up to 10 guests", "7 day page history", "70+ integrations"],
    plus: [
      "Up to 100 guests",
      "30 day page history",
      "Unlimited blocks",
      "Unlimited file uploads",
      "Unlimited charts",
    ],
    business: [
      "Up to 250 guests",
      "90 day page history",
      "Private teamspaces",
      "SAML SSO",
    ],
    enterprise: [
      "Custom guest limits",
      "User provisioning",
      "Workspace analytics",
      "Audit log",
      "Advanced security",
    ],
  },
];

const createTextContent = (
  title: string,
  [f, p, b, e]: [string?, string?, string?, string?],
): Content => ({
  title,
  [Plan.FREE]: { type: "value", value: f },
  [Plan.PLUS]: { type: "value", value: p },
  [Plan.BUSINESS]: { type: "value", value: b },
  [Plan.ENTERPRISE]: { type: "value", value: e },
});
const createCheckContent = (
  title: string,
  [f, p, b, e]: [boolean?, boolean?, boolean?, boolean?],
): Content => ({
  title,
  [Plan.FREE]: { type: "check", checked: f },
  [Plan.PLUS]: { type: "check", checked: p },
  [Plan.BUSINESS]: { type: "check", checked: b },
  [Plan.ENTERPRISE]: { type: "check", checked: e },
});

const content: Content[] = [
  createTextContent("Pages & blocks", [
    "Unlimited for individuals",
    "Unlimited",
    "Unlimited",
    "Unlimited",
  ]),
  createTextContent("File uploads", [
    "Up to 5 MB",
    "Unlimited",
    "Unlimited",
    "Unlimited",
  ]),
  createTextContent("Page history", [
    "7 days",
    "30 days",
    "90 days",
    "Unlimited",
  ]),
  createTextContent("Page analytics", [
    "Basic",
    "Basic",
    "Advanced",
    "Advanced",
  ]),
];
const collab: Content[] = [
  createCheckContent("Collaborative workspace", [true, true, true, true]),
  createTextContent("Guest invites", ["10", "100", "250", "Starting at 250"]),
  createCheckContent("Permission groups", [true, true, true, true]),
  createCheckContent("Teamspaces (open & closed)", [true, true, true, true]),
  createCheckContent("Teamspaces (private)", [false, false, true, true]),
  createCheckContent("Advanced teamspace permissions", [
    false,
    false,
    false,
    true,
  ]),
];
const workAndTime: Content[] = [
  ...[
    "Notion Calendar",
    "Views (timeline, boards, calendar, and more)",
    "Subtasks and dependencies",
    "Custom properties and filtering",
    "Formulas",
  ].map((title) => createCheckContent(title, [true, true, true, true])),
  createTextContent("Automations", [
    "Basic (buttons, Slack, sprints)",
    "Custom in databases",
    "Custom in databases",
    "Custom in databases",
  ]),
  createTextContent("Charts", ["1", "Unlimited", "Unlimited", "Unlimited"]),
];
const pulishing: Content[] = [
  createCheckContent("Unlimited published pages", [true, true, true, true]),
  createTextContent("notion.site domains", ["1", "5", "5", "5"]),
  createTextContent("Search engine indexing (SEO)", [
    "Basic",
    "Advanced",
    "Advanced",
    "Advanced",
  ]),
  createCheckContent("Site customizations", [false, true, true, true]),
  createCheckContent("Google Analytics integration", [false, true, true, true]),
  createTextContent("Custom domains and branding", [
    undefined,
    "Pay per domain",
    "Pay per domain",
    "Pay per domain",
  ]),
];
const integrations: Content[] = [
  createTextContent("Synced databases", [
    "1",
    "Unlimited",
    "Unlimited",
    "Unlimited",
  ]),
  createTextContent("Row limit per synced database", [
    "100",
    "20,000",
    "20,000",
    "20,000",
  ]),
  ...[
    "Dynamic link previews",
    "Connections to Slack, Zapier, and more",
    "Public API",
    "Basic Automations",
  ].map((title) => createCheckContent(title, [true, true, true, true])),
  createCheckContent("Custom Database Automations", [false, true, true, true]),
];
const admin: Content[] = [
  createCheckContent("Export entire workspace as HTML, Markdown, & CSV", [
    true,
    true,
    true,
    true,
  ]),
  createCheckContent("2-step verification", [true, true, true, true]),
  createCheckContent("Export entire workspace as PDF", [
    false,
    false,
    true,
    true,
  ]),
  createCheckContent("SAML Single Sign-On (SSO)", [false, false, true, true]),
  ...[
    "User provisioning (SCIM)",
    "Advanced workspace & teamspace security controls",
    "Workspace analytics",
    "Granular admin roles",
    "Audit log",
    "Admin content search",
    "Domain Management",
    "Workspace consolidation",
    "Managed users dashboard & controls",
    "Security & Compliance integrations",
    "HIPAA compliance",
    "Guest invite requests",
    "Custom data retention settings",
  ].map((title) => createCheckContent(title, [false, false, false, true])),
];
const support: Content[] = [
  createCheckContent("Priority support", [false, true, true, true]),
  createTextContent("Customer success manager", [
    undefined,
    undefined,
    undefined,
    "Custom",
  ]),
];

export const contentTables = [
  { title: "Content", data: content },
  { title: "Sharing & collaboration", data: collab },
  { title: "Manage work and time", data: workAndTime },
  { title: "Web publishing", data: pulishing },
  { title: "API & integrations", data: integrations },
  { title: "Admin & security", data: admin },
  { title: "Support", data: support },
];
