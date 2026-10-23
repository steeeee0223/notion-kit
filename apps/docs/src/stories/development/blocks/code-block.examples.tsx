import { CodeBlock, MermaidPreview } from "@notion-kit/code-block";

const sampleMermaidSequence = `sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as Database

    U->>C: Enter credentials
    C->>S: POST /api/login
    S->>DB: Query user
    DB-->>S: User data
    S-->>C: JWT Token
    C-->>U: Redirect to dashboard
`;

export function MermaidPreviewingExample() {
  return (
    <CodeBlock
      className="w-150"
      defaultValue={{ code: sampleMermaidSequence, lang: "mermaid" }}
    >
      <MermaidPreview />
    </CodeBlock>
  );
}
