import type { Appearance } from "@stripe/stripe-js";

const FONT_FAMILY =
  'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

/** Blue accent — `--blue` in base.css */
const BLUE = "hsl(210, 76%, 51%)";
/** Danger — `--red` in base.css */
const DANGER = "hsl(0, 77%, 63%)";

/**
 * Shared Stripe Elements rules that apply to both themes.
 * Input boxShadow border is overridden per theme since the ring color differs.
 */
const sharedRules: Appearance["rules"] = {
  ".Input": {
    border: "none",
    padding: "4px 6px",
    lineHeight: "20px",
    transition: "box-shadow 0.15s ease",
  },
  ".Input:focus": {
    boxShadow: `inset 0 0 0 1px hsla(210, 76%, 51%, 0.57), 0 0 0 2px hsla(210, 76%, 51%, 0.35)`,
  },
  ".Input--invalid": {
    boxShadow: `inset 0 0 0 2px ${DANGER}`,
  },
  ".Label": {
    fontWeight: "500",
    fontSize: "12px",
    lineHeight: "18px",
    marginBottom: "4px",
  },
  ".Error": {
    fontSize: "12px",
  },
};

/**
 * Light theme — matches `:root` in base.css
 */
export const stripeLight: Appearance = {
  theme: "flat",
  variables: {
    fontFamily: FONT_FAMILY,
    fontSizeBase: "14px",
    fontSizeSm: "12px",
    fontWeightNormal: "500",
    // Colors
    colorPrimary: BLUE,
    colorBackground: "hsla(45, 17%, 94%, 0.6)",
    colorText: "hsl(60, 1%, 17%)",
    colorTextSecondary: "hsl(38, 4%, 54%)",
    colorTextPlaceholder: "hsla(40, 6%, 18%, 0.45)",
    colorDanger: DANGER,
    // Borders
    borderRadius: "6px",
    colorIconTab: "hsl(38, 4%, 54%)",
    colorIconTabSelected: BLUE,
  },
  rules: {
    ...sharedRules,
    ".Input": {
      ...sharedRules[".Input"],
      backgroundColor: "hsla(45, 17%, 94%, 0.6)",
      boxShadow: "inset 0 0 0 1px hsla(0, 0%, 6%, 0.1)",
    },
    ".Input--invalid": {
      ...sharedRules[".Input--invalid"],
      backgroundColor: "hsla(0, 77%, 63%, 0.15)",
    },
    ".Label": {
      ...sharedRules[".Label"],
      color: "hsl(38, 4%, 54%)",
    },
  },
};

/**
 * Dark theme — matches `.dark` in base.css
 */
export const stripeDark: Appearance = {
  theme: "flat",
  variables: {
    fontFamily: FONT_FAMILY,
    fontSizeBase: "14px",
    fontSizeSm: "12px",
    fontWeightNormal: "500",
    // Colors
    colorPrimary: BLUE,
    colorBackground: "hsla(0, 0%, 100%, 0.055)",
    colorText: "hsl(40, 10%, 94%)",
    colorTextSecondary: "hsl(40, 6%, 64%)",
    colorTextPlaceholder: "hsla(0, 0%, 100%, 0.3)",
    colorDanger: DANGER,
    // Borders
    borderRadius: "6px",
    colorIconTab: "hsl(38, 3%, 49%)",
    colorIconTabSelected: BLUE,
  },
  rules: {
    ...sharedRules,
    ".Input": {
      ...sharedRules[".Input"],
      backgroundColor: "hsla(0, 0%, 100%, 0.055)",
      boxShadow: "inset 0 0 0 1px hsla(0, 0%, 100%, 0.075)",
    },
    ".Input--invalid": {
      ...sharedRules[".Input--invalid"],
      backgroundColor: "hsla(0, 77%, 63%, 0.15)",
    },
    ".Label": {
      ...sharedRules[".Label"],
      color: "hsl(40, 6%, 64%)",
    },
  },
};
