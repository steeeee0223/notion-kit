import { IconData } from "../types";

export interface IIndexSearch<Data extends IconData> {
  get: () => Data[];
  hasFound: () => boolean;
  search: (input: string) => void;
}
