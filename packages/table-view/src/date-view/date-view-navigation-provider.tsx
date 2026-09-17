import {
  createContext,
  use,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

interface DateViewNavigation {
  anchorDate: number;
  setAnchorDate: (value: number) => void;
}

const DateViewNavigationContext = createContext<DateViewNavigation | null>(
  null,
);

export function DateViewNavigationProvider({ children }: PropsWithChildren) {
  const [anchorDate, setAnchorDate] = useState(Date.now);
  const value = useMemo(() => ({ anchorDate, setAnchorDate }), [anchorDate]);
  return (
    <DateViewNavigationContext value={value}>
      {children}
    </DateViewNavigationContext>
  );
}

export function useDateViewNavigation() {
  const value = use(DateViewNavigationContext);
  if (!value) throw new Error("Date navigation requires TableViewWrapper");
  return value;
}
