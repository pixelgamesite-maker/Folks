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
export const panel      = "#0a0c10";   // card / panel background, faint blue cast
export const panelRaise = "#0f131a";
export const line        = "rgba(46,90,172,0.22)";   // dark-blue hairline
export const lineStrong  = "rgba(46,90,172,0.4)";

// "gold" is the legacy name — value is now a dark blue instead of green.
// Kept white text on top of it rather than the old near-black "ink" text,
// since dark-blue-on-dark-text isn't readable the way bright-green-on-dark
// text was.
export const gold      = "#2E5AAC";
export const goldLight = "#4F7FD1";
export const goldDeep  = "#1B3A73";

// Whitelist accent — bright lime, unrelated to the blue above so buttons/
// highlights on the tasks page stay clearly legible against dark backgrounds.
// "violet" is the legacy name — value is a lime-green, not purple. Kept the
// name so Hero.tsx and whitelist.tsx pick up the color without each needing
// to be touched individually.
export const violet      = "#D4F95C";
export const violetLight = "#E4FF8C";
export const violetDeep  = "#9FCC2E";
export const violetLine  = "rgba(212,249,92,0.22)";

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
