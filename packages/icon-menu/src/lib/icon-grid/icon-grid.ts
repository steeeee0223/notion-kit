import { createRef } from "react";

import type { IFrequentIconStorage } from "../frequent-storage";
import type { IconSettingsType } from "../icon-library/types";
import { Grid, GridSection } from "./grid";

export class GridWithRoot<T extends string> extends Grid<
  React.RefObject<HTMLDivElement | null>,
  T
> {
  public createRootRef() {
    return createRef<HTMLDivElement>();
  }
}

export class GridSectionWithRoot<T extends string> extends GridSection<
  React.RefObject<HTMLDivElement | null>,
  T
> {
  protected createRootRef() {
    this._root = createRef<HTMLDivElement>();
  }
}

export function buildIconGrid<Category extends string>(
  localStorage: IFrequentIconStorage,
  sections: Category[],
  elements: Record<string, string[]>,
  settings: IconSettingsType<Category>,
) {
  const grid = new GridWithRoot<Category>();

  if (settings.showFrequent.value) {
    const id = (settings.showFrequent.key ?? "frequent") as Category;
    grid.addSection(id, new GridSectionWithRoot(id, settings.perLine), {
      [id]: localStorage.getList(),
    });
  }

  sections.forEach((id) => {
    if (elements[id]?.length) {
      grid.addSection(
        id,
        new GridSectionWithRoot(id, settings.perLine),
        elements,
      );
    }
  });

  return grid;
}
