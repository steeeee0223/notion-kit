import type { NumberConfig } from "./types";

export function formatNumber(
  value: number,
  config: NumberConfig,
  locale?: string,
) {
  const roundDigits =
    config.round === "default" ? undefined : Number(config.round);
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: roundDigits,
    maximumFractionDigits: roundDigits,
  };

  switch (config.format) {
    case "number_with_commas":
      return value.toLocaleString(locale, options);
    case "percent":
      return (value / 100).toLocaleString(locale, {
        ...options,
        style: "percent",
      });
    case "currency":
      return value.toLocaleString(locale, {
        ...options,
        style: "currency",
        currency: "USD",
      });
    default:
      return value.toLocaleString(locale, { ...options, useGrouping: false });
  }
}
