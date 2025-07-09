import { SessionsTable, type SessionRow } from "@notion-kit/settings-panel";

const mockSessions: SessionRow[] = [
  {
    id: "session-1",
    type: "laptop",
    device: "MacBook Pro",
    lastActive: Date.UTC(2023, 9, 1, 12, 0, 0),
    location: "New York, USA",
    token: "token-1",
  },
  {
    id: "session-2",
    device: "iPhone 14",
    type: "mobile",
    lastActive: Date.UTC(2023, 9, 2, 14, 30, 0),
    location: "San Francisco, USA",
    token: "token-2",
  },
  {
    id: "session-3",
    device: "iPad Pro",
    type: "mobile",
    lastActive: Date.UTC(2023, 9, 3, 9, 15, 0),
    location: "Los Angeles, USA",
    token: "token-3",
  },
  {
    id: "session-4",
    device: "Windows PC",
    type: "unknown",
    lastActive: Date.UTC(2023, 9, 4, 18, 45, 0),
    location: "Chicago, USA",
    token: "token-4",
  },
];

export default function Demo() {
  return (
    <SessionsTable data={mockSessions} currentSessionId={mockSessions[0]?.id} />
  );
}
