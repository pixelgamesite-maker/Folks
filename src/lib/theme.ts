/**
 * FOLKS — design tokens
 * Palette: black, gold, white (per brand). Everything else in the app
 * should pull from here rather than hard-coding colors, so the theme
 * stays consistent and easy to retune from one place.
 */

export const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,440;0,9..144,560;0,9..144,650;1,9..144,440;1,9..144,560&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";

// Display serif — carries the personality of the page.
export const display = "'Fraunces', Georgia, serif";
// Body / UI sans — clean, geometric, quiet.
export const body = "'Manrope', 'Segoe UI', Arial, sans-serif";
// Ledger / numeral face — used for IDs, stats, timestamps.
export const mono = "'JetBrains Mono', 'Courier New', monospace";

export const ink        = "#060605";   // page background
export const panel      = "#0c0b09";   // card / panel background
export const panelRaise = "#131110";   // slightly raised panel
export const line        = "rgba(201,162,39,0.16)";  // gold hairline
export const lineStrong  = "rgba(201,162,39,0.32)";

export const gold      = "#c9a227";
export const goldLight = "#e8cf82";
export const goldDeep  = "#7c5f20";

export const white = "#f7f5ef";
export const muted = "rgba(247,245,239,0.52)";
export const faint = "rgba(247,245,239,0.30)";
export const ghost = "rgba(247,245,239,0.14)";

export const radius = { sm: "6px", md: "10px", lg: "16px", pill: "999px" };

export function alpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
