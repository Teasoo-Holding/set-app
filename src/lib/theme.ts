import {
  createLightTheme,
  createDarkTheme,
  type BrandVariants,
  type Theme,
} from "@fluentui/react-components";

/**
 * SIS brand ramp — Fluent 2 brand variants.
 * Tuned so the primary (brand[80]) ≈ #2563EB, matching the approved
 * stakeholder-tracker demo's blue "S" mark and primary actions.
 */
export const sisBrand: BrandVariants = {
  10: "#050914",
  20: "#0E1733",
  30: "#122252",
  40: "#152C6E",
  50: "#17368B",
  60: "#1841A8",
  70: "#1B4CC6",
  80: "#2563EB",
  90: "#3D74EE",
  100: "#5685F0",
  110: "#6F96F3",
  120: "#88A7F5",
  130: "#A1B8F7",
  140: "#BAC9F9",
  150: "#D3DAFB",
  160: "#ECEFFD",
};

export const sisLightTheme: Theme = createLightTheme(sisBrand);
export const sisDarkTheme: Theme = createDarkTheme(sisBrand);

/**
 * Semantic status colours for risk / sentiment. Fluent 2 palette values.
 * Always paired with a text label in the UI (NFR-1: colour-independent status).
 */
export const statusColors = {
  high: "#c50f1f", // High risk / Resistant  (red)
  medium: "#f7630c", // Medium risk           (orange)
  warning: "#eaa300", // Due-soon / Neutral    (amber)
  low: "#0e700e", // Low risk / Supportive    (green)
  neutral: "#616161", // Neutral grey
} as const;
