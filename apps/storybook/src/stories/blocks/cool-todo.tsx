import * as React from "react";
import { create, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/ui/primitives";

import { Eject, type EjectRef } from "./eject";
import { FallingBlocks } from "./falling-blocks";
import { SlingShot } from "./sling-shot";
import { arrayMove, Sortable } from "./sortable";

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
  if (!store)
    throw new Error("useTodoStore must be used inside TodoStoreProvider");
  return useStore(store, selector);
}

// Stable selector functions defined outside to prevent reference changes on render
const activeTodosSelector = (s: TodoStore) =>
  s.todos.filter((t) => t.status === "active");
const archivedTodosSelector = (s: TodoStore) =>
  s.todos.filter((t) => t.status === "archived");
const checkTodoSelector = (s: TodoStore) => s.checkTodo;
const archiveTodoSelector = (s: TodoStore) => s.archiveTodo;
const addTodoSelector = (s: TodoStore) => s.addTodo;
const reorderTodosSelector = (s: TodoStore) => s.reorderTodos;

// Custom hooks utilizing stable selectors and shallow comparison for array slices
const useActiveTodos = () => useTodoStore(useShallow(activeTodosSelector));
const useArchivedTodos = () => useTodoStore(useShallow(archivedTodosSelector));

// ─── Components ─────────────────────────────────────────────────────────────

function TodoInput() {
  const addTodo = useTodoStore(addTodoSelector);
  const [value, setValue] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-b border-border p-3"
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a todo..."
        className="flex-1"
      />
      <Button
        type="submit"
        variant="blue"
        size="sm"
        className="h-7"
        disabled={!value.trim()}
      >
        Add
      </Button>
    </form>
  );
}

function TodoItemRow({ todo }: { todo: TodoItem }) {
  const checkTodo = useTodoStore(checkTodoSelector);
  const archiveTodo = useTodoStore(archiveTodoSelector);
  const ejectRef = React.useRef<EjectRef>(null);

  const handleCheck = async () => {
    await ejectRef.current?.eject();
    checkTodo(todo.id);
  };

  return (
    <Sortable.Item id={todo.id} className="group/todo">
      <SlingShot.Item id={todo.id} className="block w-full">
        <Eject ref={ejectRef} mode="disappear" triggers={null}>
          <div className="flex items-center gap-2 rounded-md border border-border/50 bg-popover px-3 py-2 shadow-sm">
            <div
              className={cn(
                "opacity-0 transition-opacity duration-200",
                "group-hover/todo:opacity-100",
              )}
            >
              <Sortable.DragHandle className="size-6" />
            </div>
            <Checkbox size="sm" checked={false} onCheckedChange={handleCheck} />
            <span className="flex-1 text-sm text-primary select-none">
              {todo.label}
            </span>
            <div
              className={cn(
                "opacity-0 transition-opacity duration-200",
                "group-hover/todo:opacity-100",
                "has-[button[aria-expanded='true']]:opacity-100",
              )}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="hint" className="size-6">
                    <Icon.Dots className="size-4 fill-icon" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      Body="Delete"
                      Icon={<Icon.Trash />}
                      variant="error"
                      onSelect={() => archiveTodo(todo.id)}
                    />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Eject>
      </SlingShot.Item>
    </Sortable.Item>
  );
}

function TrashBox() {
  const archivedTodos = useArchivedTodos();
  const [open, setOpen] = React.useState(false);
  const [runId, setRunId] = React.useState(0);
  const store = React.use(TodoStoreContext)!;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) setRunId((v) => v + 1);
  };

  return (
    <div className="fixed right-8 bottom-8 z-50">
      <SlingShot.Goal id="trash" className="rounded-full">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="hint"
              size="md"
              className="rounded-full shadow-out-md"
            >
              <Icon.Trash className="size-5 fill-icon" />
              {archivedTodos.length > 0 && (
                <span className="ml-1 text-xs text-secondary">
                  {archivedTodos.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="h-80 w-100 overflow-hidden p-0"
          >
            <div className="fixed top-0 left-0 p-3 text-sm font-medium text-secondary">
              Trash ({archivedTodos.length})
            </div>
            <FallingBlocks.Root
              runId={runId}
              count={archivedTodos.length}
              className="relative size-full bg-input"
            >
              {archivedTodos.map((todo) => (
                <FallingBlocks.Item key={todo.id} asChild>
                  <div className="group/block relative flex size-[62px] cursor-grab flex-col items-center justify-center rounded-md border border-border bg-popover p-1 shadow-sm select-none">
                    <Checkbox
                      size="xs"
                      checked={false}
                      disabled
                      className="size-3 shrink-0"
                    />
                    <span className="mt-0.5 w-full truncate px-0.5 text-center text-[8px] text-secondary line-through">
                      {todo.label}
                    </span>
                    <div className="absolute right-0.5 bottom-0.5 opacity-0 transition-opacity duration-150 group-hover/block:opacity-100">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="hint"
                            className="flex size-4 items-center justify-center p-0"
                          >
                            <Icon.Dots className="size-2.5 fill-icon" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              Body="Restore"
                              Icon={<Icon.Undo className="size-4" />}
                              onSelect={() =>
                                store.getState().restoreTodo(todo.id)
                              }
                            />
                            <DropdownMenuItem
                              Body="Delete forever"
                              Icon={<Icon.Trash />}
                              variant="error"
                              onSelect={() =>
                                store.getState().deleteTodo(todo.id)
                              }
                            />
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </FallingBlocks.Item>
              ))}
            </FallingBlocks.Root>
          </PopoverContent>
        </Popover>
      </SlingShot.Goal>
    </div>
  );
}

function TodoList() {
  const activeTodos = useActiveTodos();
  const reorderTodos = useTodoStore(reorderTodosSelector);

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
  const screenRef = React.useRef<HTMLDivElement>(null);

  return (
    <TodoStoreContext value={store}>
      <div ref={screenRef} className="relative flex h-screen w-screen bg-main">
        <SlingShot
          boundsRef={screenRef}
          onGoalHit={({ itemId }) => {
            store.getState().archiveTodo(itemId);
          }}
          className="contents"
        >
          <SlingShot.Arrow />
          <SlingShot.Preview />
          <SlingShot.Power className="w-20" />
          <SlingShot.Item id="dummy" className="hidden" />

          <div className="flex w-1/2 items-start justify-center p-12">
            <div className="w-full max-w-md rounded-lg border border-border bg-popover shadow-out-md">
              <TodoInput />
              <TodoList />
            </div>
          </div>

          <TrashBox />
        </SlingShot>
      </div>
    </TodoStoreContext>
  );
}
