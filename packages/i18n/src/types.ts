import type { Namespace, ParseKeys } from "i18next";
import type { TransProps as TransPrimitiveProps } from "react-i18next";

export const locales = ["en", "de", "es"] as const;
export type LOCALE = (typeof locales)[number];

export type TransProps<Ns extends Namespace = "settings"> = TransPrimitiveProps<
  ParseKeys<Ns>
>;
