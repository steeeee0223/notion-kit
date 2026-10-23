import {
  Table,
  TableBody,
  TableCell,
  TableEmptyCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@notion-kit/ui/primitives";

import { todos, users } from "./data";

export function DefaultExample() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-9">#</TableHead>
          <TableHead className="min-w-20">Name</TableHead>
          <TableHead className="w-40">Status</TableHead>
          <TableHead className="min-w-20">User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {todos.map((todo) => (
          <TableRow key={todo.id}>
            <TableCell>{todo.id}</TableCell>
            <TableCell>{todo.title}</TableCell>
            <TableCell>
              {todo.completed ? "Completed" : "Not Completed"}
            </TableCell>
            <TableCell>{users[todo.userId]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function EmptyExample() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-9">#</TableHead>
          <TableHead className="min-w-20">Name</TableHead>
          <TableHead className="w-40">Status</TableHead>
          <TableHead className="min-w-20">User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableEmptyCell colSpan={4}>No data.</TableEmptyCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export function PinnedExample() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead data-pinned="start" className="w-9">
            #
          </TableHead>
          <TableHead className="min-w-20">Name</TableHead>
          <TableHead className="w-40">Status</TableHead>
          <TableHead className="min-w-20">User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {todos.map((todo) => (
          <TableRow key={todo.id}>
            <TableCell data-pinned="start">{todo.id}</TableCell>
            <TableCell>{todo.title}</TableCell>
            <TableCell>
              {todo.completed ? "Completed" : "Not Completed"}
            </TableCell>
            <TableCell>{users[todo.userId]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function StripedExample() {
  return (
    <Table variant="striped">
      <TableHeader>
        <TableRow>
          <TableHead className="w-9">#</TableHead>
          <TableHead className="min-w-20">Name</TableHead>
          <TableHead className="w-40">Status</TableHead>
          <TableHead className="min-w-20">User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {todos.map((todo) => (
          <TableRow key={todo.id}>
            <TableCell>{todo.id}</TableCell>
            <TableCell>{todo.title}</TableCell>
            <TableCell>
              {todo.completed ? "Completed" : "Not Completed"}
            </TableCell>
            <TableCell>{users[todo.userId]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
