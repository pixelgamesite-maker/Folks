/**
 * Image paths used by the Folks landing sections.
 *
 * Kept in its own file so it doesn't collide with whatever is already in
 * lib/assets.ts. Feel free to fold these into that file instead — just
 * update the two imports in components/MeetFolks.tsx and components/Ranks.tsx.
 */

/** Rotating registry-card gallery on the "Meet The Folks" section. */
export const GALLERY_IMAGES = Array.from({ length: 20 }, (_, i) => `/Folk-${i + 1}.jpg`);

/** One thumbnail per rank tier, in the same order as the RANKS array in components/Ranks.tsx. */
export const RANK_IMAGES = [
  "/Folk-rank-1.jpg",
  "/Folk-rank-2.jpg",
  "/Folk-rank-3.jpg",
  "/Folk-rank-4.jpg",
  "/Folk-rank-5.jpg",
];
