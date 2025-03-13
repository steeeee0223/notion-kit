export interface PaletteProps<T extends Record<string, unknown>> {
  palette: T;
  value: keyof T;
  onSelect: (value: keyof T) => void;
}
