export type FrequentIcons = Record<string, number>;

export interface IFrequentIconStorage {
  get: () => FrequentIcons;
  getList: () => string[];
  set: (value: FrequentIcons) => void;
  update: (iconId: string) => FrequentIcons;
}
