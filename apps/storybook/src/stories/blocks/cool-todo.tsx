import * as React from "react";
import { create, useStore } from "zustand";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/ui/primitives";

import { Eject, type EjectRef } from "./eject";
import { Sortable, arrayMove } from "./sortable";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TodoItem {
  id: string;
  label: string;
  status: "active" | "done" | "archived";
}

interface TodoStore {
  todos: TodoItem[];
  addTodo: (label: string) => void;
  checkTodo: (id: string) => void;
  archiveTodo: (id: string) => void;
  restoreTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (activeId: string, overId: string) => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

const INITIAL_TODOS: TodoItem[] = [
  { id: "1", label: "Design the cool todo list spec", status: "active" },
  { id: "2", label: "Refactor SlingShot for multi-item", status: "active" },
  { id: "3", label: "Build the Sortable compound component", status: "active" },
  { id: "4", label: "Wire up Eject on checkbox", status: "active" },
  { id: "5", label: "Add SlingShot fling-to-trash", status: "active" },
  { id: "6", label: "Implement FallingBlocks trash box", status: "active" },
];

let nextId = 100;

function createTodoStore() {
  return create<TodoStore>((set) => ({
    todos: INITIAL_TODOS,
    addTodo: (label) =>
      set((state) => ({
        todos: [
          ...state.todos,
          { id: String(nextId++), label, status: "active" },
        ],
      })),
    checkTodo: (id) =>
      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, status: "done" as const } : t,
        ),
      })),
    archiveTodo: (id) =>
      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, status: "archived" as const } : t,
        ),
      })),
    restoreTodo: (id) =>
      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, status: "active" as const } : t,
        ),
      })),
    deleteTodo: (id) =>
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
      })),
    reorderTodos: (activeId, overId) =>
      set((state) => {
        const activeTodos = state.todos.filter((t) => t.status === "active");
        const oldIndex = activeTodos.findIndex((t) => t.id === activeId);
        const newIndex = activeTodos.findIndex((t) => t.id === overId);
        if (oldIndex === -1 || newIndex === -1) return state;
        const reordered = arrayMove(activeTodos, oldIndex, newIndex);
        const nonActive = state.todos.filter((t) => t.status !== "active");
        return { todos: [...reordered, ...nonActive] };
      }),
  }));
}

// ─── Store context ──────────────────────────────────────────────────────────

type TodoStoreApi = ReturnType<typeof createTodoStore>;
const TodoStoreContext = React.createContext<TodoStoreApi | null>(null);

function useTodoStore<T>(selector: (state: TodoStore) => T): T {
  const store = React.use(TodoStoreContext);
  if (!store) throw new Error("useTodoStore must be used inside TodoStoreProvider");
  return useStore(store, selector);
}

const useActiveTodos = () => useTodoStore((s) => s.todos.filter((t) => t.status === "active"));
const useArchivedTodos = () => useTodoStore((s) => s.todos.filter((t) => t.status === "archived"));

// ─── Components ─────────────────────────────────────────────────────────────

function TodoInput() {
  const addTodo = useTodoStore((s) => s.addTodo);
  const [value, setValue] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-b border-border">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a todo..."
        className="flex-1"
      />
      <Button type="submit" variant="blue" size="sm" disabled={!value.trim()}>
        Add
      </Button>
    </form>
  );
}

function TodoItemRow({ todo }: { todo: TodoItem }) {
  const checkTodo = useTodoStore((s) => s.checkTodo);
  const archiveTodo = useTodoStore((s) => s.archiveTodo);
  const ejectRef = React.useRef<EjectRef>(null);

  const handleCheck = () => {
    ejectRef.current?.eject();
    checkTodo(todo.id);
  };

  return (
    <Sortable.Item id={todo.id} className="group/todo">
      <Eject ref={ejectRef} mode="disappear" triggers={null}>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className={cn(
            "opacity-0 transition-opacity duration-200",
            "group-hover/todo:opacity-100",
          )}>
            <Sortable.DragHandle className="size-6" />
          </div>
          <Checkbox
            size="sm"
            checked={false}
            onCheckedChange={handleCheck}
          />
          <span className="flex-1 text-sm text-primary">{todo.label}</span>
          <div className={cn(
            "opacity-0 transition-opacity duration-200",
            "group-hover/todo:opacity-100",
            "has-[button[aria-expanded='true']]:opacity-100",
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="hint" className="size-6">
                  <Icon.Dots className="size-4 fill-icon" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  Body="Delete"
                  Icon={<Icon.Trash className="size-4" />}
                  variant="error"
                  onSelect={() => archiveTodo(todo.id)}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Eject>
    </Sortable.Item>
  );
}

function ArchivedItemRow({ todo }: { todo: TodoItem }) {
  const restoreTodo = useTodoStore((s) => s.restoreTodo);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Checkbox size="sm" checked disabled />
      <span className="flex-1 text-sm text-secondary line-through">{todo.label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="hint" className="size-6">
            <Icon.Dots className="size-4 fill-icon" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            Body="Restore"
            Icon={<Icon.Undo className="size-4" />}
            onSelect={() => restoreTodo(todo.id)}
          />
          <DropdownMenuItem
            Body="Delete forever"
            Icon={<Icon.Trash className="size-4" />}
            variant="error"
            onSelect={() => deleteTodo(todo.id)}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function TrashBox() {
  const archivedTodos = useArchivedTodos();

  return (
    <div className="fixed right-8 bottom-8 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="hint" size="md" className="rounded-full shadow-out-md">
            <Icon.Trash className="size-5 fill-icon" />
            {archivedTodos.length > 0 && (
              <span className="ml-1 text-xs text-secondary">{archivedTodos.length}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-80 p-0">
          <div className="p-3 text-sm font-medium text-secondary">
            Trash ({archivedTodos.length})
          </div>
          <div className="max-h-64 overflow-y-auto">
            {archivedTodos.length === 0 ? (
              <div className="px-3 pb-3 text-sm text-muted">No archived items</div>
            ) : (
              archivedTodos.map((todo) => (
                <ArchivedItemRow key={todo.id} todo={todo} />
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function TodoList() {
  const activeTodos = useActiveTodos();
  const reorderTodos = useTodoStore((s) => s.reorderTodos);

  return (
    <Sortable.Root
      items={activeTodos.map((t) => t.id)}
      onReorder={reorderTodos}
    >
      {activeTodos.map((todo) => (
        <TodoItemRow key={todo.id} todo={todo} />
      ))}
    </Sortable.Root>
  );
}

export function CoolTodo() {
  const [store] = React.useState(createTodoStore);

  return (
    <TodoStoreContext value={store}>
      <div className="flex h-screen w-screen bg-main">
        <div className="flex w-1/2 items-start justify-center p-12">
          <div className="w-full max-w-md rounded-lg border border-border bg-popover shadow-out-md">
            <TodoInput />
            <TodoList />
          </div>
        </div>
        <TrashBox />
      </div>
    </TodoStoreContext>
  );
}
