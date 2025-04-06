import { LocalStorage } from "./local-storage";
import type { FrequentIcons, IFrequentIconStorage } from "./types";

interface FrequentIconStorageProps {
  key?: string;
  limit?: number;
  prefix?: string;
}

export class FrequentIconStorage implements IFrequentIconStorage {
  protected limit = 8;
  protected localStorage;

  constructor(
    props: FrequentIconStorageProps,
    protected defaultValue: FrequentIcons = {},
  ) {
    this.limit = props.limit ?? this.limit;
    const key = `${props.prefix ?? "icon"}:${props.key ?? "frequent"}`;
    this.localStorage = new LocalStorage(key, defaultValue);
  }

  get(): FrequentIcons {
    const data = this.localStorage.get();

    const freq = Object.fromEntries(
      Object.entries(data).sort(([, v1], [, v2]) => v2 - v1),
    );
    return freq;
  }

  getList(): string[] {
    return Object.keys(this.get()).splice(0, this.limit);
  }

  set(value: FrequentIcons) {
    this.localStorage.set(value);
  }

  update(iconId: string) {
    const prevIcons = this.localStorage.get();
    const count = prevIcons[iconId] ? prevIcons[iconId] + 1 : 1;

    const emojis: FrequentIcons = {
      ...prevIcons,
      [iconId]: count,
    };

    this.localStorage.set(emojis);

    return emojis;
  }
}
