import type { IIconLibrary } from "../icon-library";
import type { IconData } from "../types";
import type { IIndexSearch } from "./types";

export class IconIndexSearch<Data extends IconData, Category extends string>
  implements IIndexSearch<Data>
{
  protected static instance?: IconIndexSearch<IconData, string>;

  protected input?: string;
  protected result: string[] = [];
  protected scores: Record<string, number> = {};

  protected constructor(
    protected library: IIconLibrary<Data, Category>,
    protected maxResult: number,
  ) {}

  public static getInstance<Data extends IconData, Category extends string>(
    library: IIconLibrary<Data, Category>,
    maxResult: number,
  ) {
    IconIndexSearch.instance ??= new IconIndexSearch(
      library,
      maxResult,
    ) as unknown as IconIndexSearch<Data, string>;

    return IconIndexSearch.instance as unknown as IconIndexSearch<
      Data,
      Category
    >;
  }

  private createSearchResult(value: string) {
    this.scores = {};
    this.result = [];

    for (const key of this.library.keys) {
      const score = key.indexOf(`${value}`);

      if (score === -1) continue;

      const iconId = this.library.getIconId(key);
      this.result.push(iconId);

      this.scores[iconId] ??= 0;
      this.scores[iconId] += iconId === value ? 0 : score + 1;
    }
  }

  private sortResultByScores(result: string[], scores: Record<string, number>) {
    result.sort((a, b) => {
      const aScore = scores[a]!;
      const bScore = scores[b]!;

      if (aScore === bScore) {
        return a.localeCompare(b);
      }

      return aScore - bScore;
    });
  }

  get() {
    const icons = [];

    for (const key of this.result) {
      const icon = this.library.getIcon(key);
      icons.push(icon);

      if (icons.length >= this.maxResult) break;
    }

    return icons;
  }

  hasFound(exact = false) {
    if (exact && this.input) {
      return this.result.includes(this.input);
    }

    return this.result.length > 0;
  }

  search(input: string): this {
    this.input = input.toLowerCase();
    const value = this.input;

    if (value) {
      this.createSearchResult(value);
      this.sortResultByScores(this.result, this.scores);
    } else {
      this.scores = {};
      this.result = [];
    }

    return this;
  }
}
