import type { ComponentProps } from "react";

import SettingsDemo from "@notion-kit/registry/settings-panel-notion";

interface DefaultProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function DefaultExample(overrides: DefaultProps) {
  const args = { tab: "account", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}

interface NotificationsProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function NotificationsExample(overrides: NotificationsProps) {
  const args = { tab: "notifications", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}

interface MyConnectionsProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function MyConnectionsExample(overrides: MyConnectionsProps) {
  const args = { tab: "my-connections", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}

interface WorkspaceProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function WorkspaceExample(overrides: WorkspaceProps) {
  const args = { tab: "general", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}

interface PeopleProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function PeopleExample(overrides: PeopleProps) {
  const args = { tab: "people", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}

interface EmojiProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function EmojiExample(overrides: EmojiProps) {
  const args = { tab: "emoji", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}

interface TeamspacesProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function TeamspacesExample(overrides: TeamspacesProps) {
  const args = { tab: "teamspaces", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}

interface SecurityProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function SecurityExample(overrides: SecurityProps) {
  const args = { tab: "security", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}

interface IdentityProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function IdentityExample(overrides: IdentityProps) {
  const args = { tab: "identity", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}

interface BillingProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function BillingExample(overrides: BillingProps) {
  const args = { tab: "billing", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}

interface PlansProps {
  tab?: ComponentProps<typeof SettingsDemo>["tab"];
}
export function PlansExample(overrides: PlansProps) {
  const args = { tab: "plans", ...overrides } satisfies Partial<
    ComponentProps<typeof SettingsDemo>
  >;
  return <SettingsDemo {...args} />;
}
