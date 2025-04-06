export interface GridRow {
  id: number;
  elements: string[];
}

export interface IGridSection<R, T> {
  id: T;
  root: R;
  rowsNum: number;
  addElements: (elements: string[]) => this;
  getRows: () => GridRow[];
  setIndexRowStart: (start: number) => this;
  updateElements: (elements: string[]) => this;
}

export interface IGrid<R, T extends string> {
  size: number;
  addSection: (
    sectionId: T,
    section: IGridSection<R, T>,
    elements: Record<string, string[]>,
  ) => this;
  indexOf: (sectionId: T) => number;
  section: (sectionId: T) => IGridSection<R, T>;
  sections: () => IGridSection<R, T>[];
  updateSection: (sectionId: T, elements: string[]) => this;
}

export type IconGridType<T extends string> = IGrid<
  React.RefObject<HTMLDivElement | null>,
  T
>;
