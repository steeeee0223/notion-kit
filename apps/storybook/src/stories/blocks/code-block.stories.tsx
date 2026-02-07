import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { CodeBlockValue } from "@notion-kit/code-block";
import {
  CodeBlock,
  CodeBlockCaption,
  CodeBlockContent,
  CodeBlockLang,
  CodeBlockToolbar,
  MermaidPreview,
} from "@notion-kit/code-block";

const meta = {
  title: "blocks/Code Block",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const sampleCode = `// Using 'typeof' to infer types
const person = { name: "Alice", age: 30 };
type PersonType = typeof person;  // { name: string; age: number }

// 'satisfies' to ensure a type matches but allows more specific types
type Animal = { name: string };
const dog = { name: "Buddy", breed: "Golden Retriever" } satisfies Animal;

// Generics with 'extends' and default values
function identity<T extends number | string = string>(arg: T): T {
  return arg;
}

let str = identity();  // Default type is string
let num = identity(42);  // T inferred as number

// 'extends' with interface and class
interface HasLength {
  length: number;
}

function logLength<T extends HasLength = string>(arg: T): void {
  console.log(arg.length);
}

logLength("Hello");    // OK: string has length (default is string)
logLength([1, 2, 3]);  // OK: array has length
// logLength(123);      // Error: number doesn't have length

// 'typeof' with functions
function add(x: number, y: number): number {
  return x + y;
}

type AddFunctionType = typeof add;  // (x: number, y: number) => number

// Generic interfaces with 'extends' and default types
interface Box<T extends object = { message: string }> {
  content: T;
}

let defaultBox: Box = { content: { message: "Hello" } };  // Uses default type
let customBox: Box<{ status: number }> = { content: { status: 200 } };

// Complex example with 'satisfies' and default generics
type Task = {
  title: string;
  description?: string;
  completed: boolean;
};

const myTask = {
  title: "Learn TypeScript",
  completed: false,
  priority: "High",
} satisfies Task;  // Allows priority but ensures Task structure

// Generic function with default type
function wrapInArray<T = string>(value: T): T[] {
  return [value];
}

const stringArray = wrapInArray();  // Default to string
const numberArray = wrapInArray(42);  // T inferred as number

/**
 * Combines two generic types into a tuple.
 * 
 * @template T - The first type.
 * @template U - The second type.
 * @param {T} first - The first value.
 * @param {U} second - The second value.
 * @returns {[T, U]} A tuple containing both values.
 */
function combine<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
  `;

export const Default: Story = {
  render: () => {
    return (
      <CodeBlock
        className="w-150"
        defaultValue={{
          code: sampleCode,
          lang: "typescript",
        }}
      >
        <CodeBlockLang />
        <CodeBlockToolbar />
        <CodeBlockContent />
        <CodeBlockCaption />
      </CodeBlock>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<CodeBlockValue>({
      code: sampleCode,
      lang: "typescript",
      ts: Date.now(),
    });

    return (
      <div className="w-150 space-y-4">
        <CodeBlock value={value} onChange={setValue}>
          <CodeBlockLang />
          <CodeBlockToolbar />
          <CodeBlockContent />
          <CodeBlockCaption />
        </CodeBlock>

        {/* Debug panel to show current state */}
        <div className="rounded-lg bg-muted p-4 text-sm">
          <h4 className="mb-2 font-semibold">Current State:</h4>
          <pre className="text-xs text-muted">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};

const sampleMermaidCode = `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Deploy]
    E --> F[Monitor]
    F --> G{Issues?}
    G -->|Yes| D
    G -->|No| H[Success! 🎉]
`;

export const Mermaid: Story = {
  render: () => {
    return (
      <CodeBlock
        className="w-150"
        defaultValue={{ code: sampleMermaidCode, lang: "mermaid" }}
      >
        <CodeBlockLang />
        <CodeBlockToolbar />
        <CodeBlockContent />
        <CodeBlockCaption />
      </CodeBlock>
    );
  },
};

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

export const MermaidPreviewing: Story = {
  render: () => {
    return (
      <CodeBlock
        className="w-150"
        defaultValue={{ code: sampleMermaidSequence, lang: "mermaid" }}
      >
        <MermaidPreview />
      </CodeBlock>
    );
  },
};
