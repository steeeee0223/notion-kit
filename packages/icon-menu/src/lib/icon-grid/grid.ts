import type { GridRow, IGrid, IGridSection } from "./types";

export class Grid<R, T extends string = string> implements IGrid<R, T> {
  protected grid = new Map<T, IGridSection<R, T>>();
  protected rowsCount = 1;
  protected sectionsIds: T[] = [];

  public addSection(
    sectionId: T,
    section: IGridSection<R, T>,
    elements: Record<string, string[]>,
  ) {
    section
      .setIndexRowStart(this.rowsCount)
      .addElements(elements[sectionId] ?? []);
    this.rowsCount += section.rowsNum;
    this.grid.set(sectionId, section);
    this.sectionsIds.push(sectionId);

    return this;
  }

  public indexOf(sectionId: T) {
    return this.sectionsIds.indexOf(sectionId);
  }

  public section(sectionId: T) {
    return this.grid.get(sectionId)!;
  }

  public sections() {
    return Array.from(this.grid.values());
  }

  public updateSection(sectionId: T, elements: string[]) {
    if (this.grid.has(sectionId)) {
      const section = this.grid.get(sectionId);
      section!.updateElements(elements);
    }

    return this;
  }

  public get size() {
    return this.grid.size;
  }
}

type Unknown = unknown;
export abstract class GridSection<R extends Unknown, T = string>
  implements IGridSection<R, T>
{
  protected _indexRowStart = 0;
  protected _root!: R;
  protected _rowsNum = 0;
  protected rows: GridRow[] = [];

  constructor(
    protected _id: T,
    protected perLine = 8,
  ) {
    this.createRootRef();
  }

  private addRow(elements: string[], lastPosition: number) {
    const start = lastPosition * this.perLine;
    const end = start + this.perLine;
    this.rows.push({
      id: this._indexRowStart + lastPosition,
      elements: elements.slice(start, end),
    });
  }

  private initRows(elements: string[]) {
    let i = 0;

    while (i < this.rowsNum) {
      this.addRow(elements, i++);
    }
  }

  protected abstract createRootRef(): void;

  public addElements(elements: string[]) {
    this._rowsNum = Math.ceil(elements.length / this.perLine);
    this.initRows(elements);

    return this;
  }

  getRows() {
    return this.rows;
  }

  public setIndexRowStart(start: number) {
    this._indexRowStart = start;

    return this;
  }

  public updateElements(elements: string[]) {
    this.rows = [];
    this.addElements(elements);

    return this;
  }

  get id() {
    return this._id;
  }

  get root(): R {
    return this._root;
  }

  get rowsNum() {
    return this._rowsNum;
  }
}
