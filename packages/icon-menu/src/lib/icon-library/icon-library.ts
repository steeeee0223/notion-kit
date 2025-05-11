import type { IFrequentIconStorage } from "../frequent-storage";
import { buildIconGrid, IconGridType } from "../icon-grid";
import { IconData } from "../types";
import {
  CategoryData,
  IconLibraryData,
  IconSettingsType,
  IIconLibrary,
} from "./types";

export class IconLibrary<Data extends IconData, Cat extends string = string>
  implements IIconLibrary<Data, Cat>
{
  private static instance?: IconLibrary<IconData, string>;

  private categories: Cat[];
  private icons: Record<string, string[]> = {};
  private grid: IconGridType<Cat>;

  protected _icons: Record<string, Data>;
  protected _hash: Record<string, string> = {};
  protected _keys: string[] = [];

  public static getInstance<Data extends IconData, Cat extends string = string>(
    settings: IconSettingsType<Cat>,
    localStorage: IFrequentIconStorage,
    library: IconLibraryData<Data>,
  ) {
    IconLibrary.instance ??= new IconLibrary<Data, Cat>(
      settings,
      localStorage,
      library,
    ) as unknown as IconLibrary<Data>;

    return IconLibrary.instance as unknown as IconLibrary<Data, Cat>;
  }

  private constructor(
    protected settings: IconSettingsType<Cat>,
    protected localStorage: IFrequentIconStorage,
    protected library: IconLibraryData<Data>,
  ) {
    this._icons = library.icons;
    this.init();
    this.categories = settings.categories;

    this.initIcons(library.categories);

    this.grid = buildIconGrid(
      this.localStorage,
      this.categories,
      this.icons,
      settings,
    );
  }

  private initIcons(categoriesLibrary: CategoryData[]) {
    for (const category of categoriesLibrary) {
      this.icons[category.id] = category.icons;
    }
  }

  public getGrid() {
    return this.grid;
  }

  public indexOf(focusedCategory: Cat) {
    const index = this.grid.indexOf(focusedCategory);
    return index < 1 ? 0 : index;
  }

  public updateFrequentCategory(emojiId: string) {
    this.localStorage.update(emojiId);
    this.grid.updateSection(
      (this.settings.showFrequent.key ?? "frequent") as Cat,
      this.localStorage.getList(),
    );
  }

  private createSearchableString(icon: Data) {
    const { id, keywords, name } = icon;

    return `${id},${this.getName(name)},${keywords.join(",")}`;
  }

  private getName(name: string) {
    return name.toLowerCase().split(" ").join(",");
  }

  private init() {
    Object.values(this._icons).forEach((emoji) => {
      const searchableString = this.createSearchableString(emoji);
      this._keys.push(searchableString);
      this._hash[searchableString] = emoji.id;
    });
  }

  getIcon(id: string) {
    return this._icons[id]!;
  }

  getIconId(key: string) {
    return this._hash[key]!;
  }

  get keys(): string[] {
    return this._keys;
  }
}
