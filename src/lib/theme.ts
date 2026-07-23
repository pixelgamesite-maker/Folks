/**
 * FOLKS — design tokens (Robinhood-launch theme)
 *
 * Token *names* are unchanged from the original build (gold, goldLight,
 * goldDeep, line, etc.) so every component that already imports from here
 * keeps working — only the values changed, from gold to Robinhood's green.
 */

export const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";

// Display — bold geometric sans, carries the fintech/app energy.
export const display = "'Space Grotesk', 'Segoe UI', sans-serif";
// Body / UI sans — clean, highly readable.
export const body = "'Inter', 'Segoe UI', Arial, sans-serif";
// Numerals / stats / ledger details.
export const mono = "'JetBrains Mono', 'Courier New', monospace";

export const ink        = "#050605";   // page background — near-black
export const panel      = "#0a0f0a";   // card / panel background, faint green cast
export const panelRaise = "#0f150f";
export const line        = "rgba(0,200,5,0.18)";   // green hairline
export const lineStrong  = "rgba(0,200,5,0.36)";

// "gold" is the legacy name — value is Robinhood's signature green.
export const gold      = "#00C805";
export const goldLight = "#3DFF5C";
export const goldDeep  = "#017a03";

export const white = "#f5f7f5";
export const muted = "rgba(245,247,245,0.55)";
export const faint = "rgba(245,247,245,0.32)";
export const ghost = "rgba(245,247,245,0.14)";

export const radius = { sm: "6px", md: "10px", lg: "16px", pill: "999px" };

export function alpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
