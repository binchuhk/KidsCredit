export const ITEM_ICONS = [
  "⭐",
  "♟️",
  "🏊",
  "📚",
  "🧹",
  "🦷",
  "🏃",
  "🎨",
  "🎵",
  "🛏️",
  "🍎",
  "🚴",
  "🎮",
  "✍️",
  "😤",
  "⏰",
  "📱",
  "🗣️",
  "💤",
  "🥊",
  "🎁",
  "🍦",
  "📺",
  "🎠",
  "🧩",
  "🧸",
  "🍿",
  "👑",
] as const;

export type ItemIcon = (typeof ITEM_ICONS)[number];

export function normalizeIcon(icon: unknown, fallback = "⭐") {
  const value = String(icon || "").trim();
  return value || fallback;
}
