export class LocalStorage<T> {
  constructor(
    protected key: string,
    protected defaultValue: T,
  ) {}

  get(): T {
    let value = this.defaultValue;

    if (typeof window === "undefined") return value;

    const valueInLocalStorage = window.localStorage.getItem(this.key);

    if (valueInLocalStorage) {
      try {
        value = JSON.parse(valueInLocalStorage) as T;
      } catch {
        window.localStorage.removeItem(this.key);
      }
    }

    return value;
  }

  set(value: T) {
    window.localStorage.setItem(this.key, JSON.stringify(value));
  }
}
