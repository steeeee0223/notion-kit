import * as React from "react";
import { create, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { cn } from "@notion-kit/cn";
import { Eject, type EjectRef } from "@notion-kit/cool-blocks/eject";
import { FallingBlocks } from "@notion-kit/cool-blocks/falling-blocks";
import { SlingShot } from "@notion-kit/cool-blocks/sling-shot";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  getSortableItemsAfterDrag,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sortable,
} from "@notion-kit/ui/primitives";

interface TodoItem {
  id: string;
  label: string;
  status: "active" | "done" | "archived" | "launched";
}

interface TodoStore {
  todos: TodoItem[];
  addTodo: (label: string) => void;
  checkTodo: (id: string) => void;
  launchTodo: (id: string) => void;
  archiveTodo: (id: string) => void;
  restoreTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (updated: TodoItem[]) => void;
}

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
          t.id === id ? { ...t, status: "done" } : t,
        ),
      })),
    launchTodo: (id) =>
      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, status: "launched" } : t,
        ),
      })),
    archiveTodo: (id) =>
      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, status: "archived" } : t,
        ),
      })),
    restoreTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (!todo) return state;
        return {
          todos: [
            ...state.todos.filter((t) => t.id !== id),
            { ...todo, status: "active" },
          ],
        };
      }),
    deleteTodo: (id) =>
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
      })),
    reorderTodos: (updated) =>
      set((state) => {
        const inactive = state.todos.filter((todo) => todo.status !== "active");
        return { todos: [...updated, ...inactive] };
      }),
  }));
}

type TodoStoreApi = ReturnType<typeof createTodoStore>;
const TodoStoreContext = React.createContext<TodoStoreApi | null>(null);

function useTodoStore<T>(selector: (state: TodoStore) => T): T {
  const store = React.use(TodoStoreContext);
  if (!store)
    throw new Error("useTodoStore must be used inside TodoStoreProvider");
  return useStore(store, selector);
}

// Stable selector functions defined outside to prevent reference changes on render

// Custom hooks utilizing stable selectors and shallow comparison for array slices
const useActiveTodos = () =>
  useTodoStore(useShallow((s) => s.todos.filter((t) => t.status === "active")));
const useArchivedTodos = () =>
  useTodoStore(
    useShallow((s) => s.todos.filter((t) => t.status === "archived")),
  );
const useLaunchedTodos = () =>
  useTodoStore(
    useShallow((s) => s.todos.filter((t) => t.status === "launched")),
  );

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

function TodoItemCard({
  todo,
  hoverGroup = "todo",
}: {
  todo: TodoItem;
  hoverGroup?: "todo" | "launched";
}) {
  const { checkTodo, archiveTodo } = useTodoStore(
    useShallow((s) => ({
      checkTodo: s.checkTodo,
      archiveTodo: s.archiveTodo,
    })),
  );
  const ejectRef = React.useRef<EjectRef>(null);

  const handleCheck = async () => {
    await ejectRef.current?.eject();
    checkTodo(todo.id);
  };

  return (
    <Eject
      ref={ejectRef}
      mode="disappear"
      className="flex items-center gap-2 rounded-md border border-border/50 bg-popover px-3 py-2 shadow-sm"
    >
      {hoverGroup === "todo" && (
        <div className="opacity-0 transition-opacity duration-200 group-hover/todo:opacity-100">
          <Sortable.Handle className="size-6" />
        </div>
      )}
      <Checkbox size="sm" checked={false} onCheckedChange={handleCheck} />
      <span className="flex-1 text-sm text-primary select-none">
        {todo.label}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="hint"
              className={cn(
                "size-6 opacity-0 transition-opacity duration-200",
                hoverGroup === "launched"
                  ? "group-hover/launched:opacity-100"
                  : "group-hover/todo:opacity-100",
                "has-[button[aria-expanded='true']]:opacity-100",
              )}
            >
              <Icon.Dots className="size-4 fill-icon" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              label="Delete"
              icon={<Icon.Trash />}
              variant="error"
              onClick={() => archiveTodo(todo.id)}
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Eject>
  );
}

function TrashBox() {
  const [runId, setRunId] = React.useState(0);
  const archivedTodos = useArchivedTodos();
  const { restoreTodo, deleteTodo } = useTodoStore(
    useShallow((s) => ({
      restoreTodo: s.restoreTodo,
      deleteTodo: s.deleteTodo,
    })),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setRunId((v) => v + 1);
  };

  return (
    <SlingShot.Goal
      id="trash"
      className="fixed right-8 bottom-8 z-50 rounded-full"
    >
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
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
          }
        />
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
            className="size-full bg-input"
          >
            {archivedTodos.map((todo) => (
              <FallingBlocks.Item
                key={todo.id}
                className="group/block relative flex size-[62px] cursor-grab flex-col items-center justify-center rounded-md border border-border bg-popover p-1 shadow-sm select-none"
              >
                <Checkbox size="xs" disabled />
                <span className="mt-0.5 w-full truncate px-0.5 text-center text-[8px] text-secondary line-through">
                  {todo.label}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="hint"
                        className="absolute right-0.5 bottom-0.5 flex size-4 items-center justify-center p-0 opacity-0 transition-opacity duration-150 group-hover/block:opacity-100"
                      >
                        <Icon.Dots className="size-2.5 fill-icon" />
                      </Button>
                    }
                  />

                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        label="Restore"
                        icon={<Icon.Undo className="size-4" />}
                        onClick={() => restoreTodo(todo.id)}
                      />

                      <DropdownMenuItem
                        label="Delete forever"
                        icon={<Icon.Trash />}
                        variant="error"
                        onClick={() => deleteTodo(todo.id)}
                      />
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </FallingBlocks.Item>
            ))}
          </FallingBlocks.Root>
        </PopoverContent>
      </Popover>
    </SlingShot.Goal>
  );
}

function ActiveTodoList() {
  const activeTodos = useActiveTodos();
  const reorderTodos = useTodoStore((s) => s.reorderTodos);

  return (
    <Sortable.Root
      onDragEnd={(event) =>
        reorderTodos(getSortableItemsAfterDrag(activeTodos, event))
      }
    >
      <Sortable.List>
        {activeTodos.map((todo, index) => (
          <Sortable.Item
            key={todo.id}
            id={todo.id}
            index={index}
            className="group/todo"
          >
            <SlingShot.Item id={todo.id} className="block w-full">
              <TodoItemCard todo={todo} />
            </SlingShot.Item>
          </Sortable.Item>
        ))}
      </Sortable.List>
    </Sortable.Root>
  );
}

function LaunchedTodoList() {
  const launchedTodos = useLaunchedTodos();

  return (
    <div style={{ height: 0, overflow: "visible", position: "relative" }}>
      {launchedTodos.map((todo) => (
        <SlingShot.Item
          key={todo.id}
          id={todo.id}
          className="group/launched block w-full"
          style={{ position: "absolute" as const }}
        >
          <TodoItemCard todo={todo} hoverGroup="launched" />
        </SlingShot.Item>
      ))}
    </div>
  );
}

function SlingShotPlayground() {
  const screenRef = React.useRef<HTMLDivElement>(null);
  const { archiveTodo, launchTodo } = useTodoStore(
    useShallow((s) => ({
      archiveTodo: s.archiveTodo,
      launchTodo: s.launchTodo,
    })),
  );

  return (
    <div ref={screenRef} className="relative flex h-screen w-screen bg-main">
      <SlingShot
        boundsRef={screenRef}
        onGoalHit={({ itemId }) => archiveTodo(itemId)}
        onLand={({ itemId }) => launchTodo(itemId)}
        className="contents"
      >
        <SlingShot.Arrow />
        <SlingShot.Preview />
        <SlingShot.Power className="w-20" />
        <SlingShot.Item id="dummy" className="hidden" />

        <div className="flex w-1/2 items-start justify-center p-12">
          <div className="w-full max-w-md rounded-lg border border-border bg-popover shadow-out-md">
            <TodoInput />
            <LaunchedTodoList />
            <ActiveTodoList />
          </div>
        </div>

        <TrashBox />
      </SlingShot>
    </div>
  );
}

export function CoolTodo() {
  const [store] = React.useState(createTodoStore);

  return (
    <TodoStoreContext value={store}>
      <SlingShotPlayground />
    </TodoStoreContext>
  );
}
