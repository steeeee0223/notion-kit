import { ConnectionsTable, type Connection } from "@notion-kit/settings-panel";

const connections: Connection[] = [
  {
    id: "c1",
    connection: { type: "slack", account: "steeeee@example.com" },
    scopes: ["Can preview links"],
  },
  {
    id: "c2",
    connection: { type: "github", account: "steeeee0913" },
    scopes: ["Can preview links", "Can content"],
  },
  {
    id: "c3",
    connection: { type: "jira", account: "steeeee@example.com" },
    scopes: ["Can preview links and sync databases"],
  },
];

export default function Demo() {
  return <ConnectionsTable data={connections} />;
}
