import type { IconGridType } from "../icon-grid";
import type { IconData } from "../types";

export interface CategoryData {
  id: string;
  icons: string[];
}

export interface IconLibraryData<Data extends IconData> {
  categories: CategoryData[];
  icons: Record<string, Data>;
  aliases: Record<string, string>;
}

export interface IconSettingsType<Category extends string = string> {
  categories: Category[];
  maxSearchResult: number;
  buttonSize: number;
  perLine: number;
  showFrequent: {
    value: boolean;
    key?: string;
    limit?: number;
    prefix?: string;
  };
}

export interface IIconLibrary<
  Data extends IconData,
  Category extends string = string,
> {
  keys: string[];
  getIcon: (key: string) => Data;
  getIconId: (key: string) => string;
  getGrid: () => IconGridType<Category>;
  indexOf: (focusedCategory: Category) => number;
  updateFrequentCategory: (iconId: string) => void;
}
