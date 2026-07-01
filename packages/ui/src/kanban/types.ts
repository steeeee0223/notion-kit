export enum KanbanDnd {
  Item = "item",
  Column = "column",
}

export type InferProps<T> = T extends (props: infer P) => React.JSX.Element
  ? P
  : never;
