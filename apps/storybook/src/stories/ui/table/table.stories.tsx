import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Table,
  TableBody,
  TableCell,
  TableEmptyCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@notion-kit/shadcn";

import { users } from "./data";

interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

const meta = {
  title: "Shadcn/Table",
  parameters: { layout: "centered" },
  loaders: async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos");
    return { data: (await res.json()) as Todo[] };
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, { loaded: { data } }) => {
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
          {(data as Todo[]).map((todo) => (
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
  },
};

export const Empty: Story = {
  render: () => {
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
  },
};

export const Pinned: Story = {
  render: (_, { loaded: { data } }) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-pinned="left" className="w-9">
              #
            </TableHead>
            <TableHead className="min-w-20">Name</TableHead>
            <TableHead className="w-40">Status</TableHead>
            <TableHead className="min-w-20">User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data as Todo[]).map((todo) => (
            <TableRow key={todo.id}>
              <TableCell data-pinned="left">{todo.id}</TableCell>
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
  },
};
