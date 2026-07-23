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

export const ink        = "#08090a";   // page background — near-black, slightly cooler
export const panel      = "#0b0f0c";   // card / panel background, faint green cast
export const panelRaise = "#10140f";
export const line        = "rgba(46,125,74,0.22)";   // muted green hairline
export const lineStrong  = "rgba(46,125,74,0.4)";

// "gold" is the legacy name — value is now a muted, desaturated green
// instead of Robinhood's neon brand green. Same idea, much quieter.
export const gold      = "#3E9B5C";
export const goldLight = "#5FBE7C";
export const goldDeep  = "#245C38";

// Secondary accent — reserved for the Whitelist flow (uncapped, unhurried)
// so it reads as a genuinely different path from Early Role (green, scarce),
// and so the page isn't monochrome green top to bottom.
export const violet      = "#8B6BF0";
export const violetLight = "#AC94F5";
export const violetDeep  = "#5A3FC0";
export const violetLine  = "rgba(139,107,240,0.22)";

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
