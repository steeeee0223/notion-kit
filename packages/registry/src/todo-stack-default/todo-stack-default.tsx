"use client";

import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/ui/primitives";
import { TodoItem, TodoStack } from "@notion-kit/ui/todo-stack";

interface Task {
  id: string;
  title: string;
  description: string;
  tone: "warning" | "danger" | "info";
  count: number;
}

const initialTasks: Task[] = [
  {
    id: "review",
    title: "3 invoices need review",
    description: "Amounts don't match the purchase order.",
    tone: "warning",
    count: 3,
  },
  {
    id: "failed",
    title: "1 sync failed",
    description: "The paired extension lost connection.",
    tone: "danger",
    count: 1,
  },
  {
    id: "digest",
    title: "Weekly digest ready",
    description: "12 invoices captured since Monday.",
    tone: "info",
    count: 12,
  },
];

export default function Default() {
  const [tasks, setTasks] = useState(initialTasks);

  return (
    <TodoStack className="w-96" title="To-dos" count={tasks.length}>
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          tone={task.tone}
          icon={<Icon.ExclamationMarkCircled className="size-4" />}
          title={task.title}
          description={task.description}
          count={task.count}
          dismissible
          onDismiss={() =>
            setTasks((prev) => prev.filter((t) => t.id !== task.id))
          }
          action={
            <Button variant="soft-blue" size="sm">
              Review
            </Button>
          }
        />
      ))}
    </TodoStack>
  );
}
