import type { Namespace, ParseKeys } from "i18next";
import type { TransProps as TransPrimitiveProps } from "react-i18next";

export type LOCALE = "en" | "de" | "es";
export type TransProps<Ns extends Namespace = "settings"> = TransPrimitiveProps<
  ParseKeys<Ns>
>;
