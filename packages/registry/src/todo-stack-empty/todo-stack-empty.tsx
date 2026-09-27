import { TodoStack } from "@notion-kit/ui/todo-stack";

export default function Empty() {
  return <TodoStack className="w-96" title="To-dos" count={0} />;
}
