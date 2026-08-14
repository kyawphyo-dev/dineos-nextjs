const IMG_EMOJI_MAP: Record<string, string> = {
  soup: "🍲",
  curry: "🍛",
  salad: "🥗",
  noodle: "🍜",
  rice: "🍚",
  chicken: "🍗",
  fish: "🐟",
  shrimp: "🦐",
  beef: "🥩",
  pork: "🥓",
  egg: "🍳",
  tofu: "🧈",
  mango: "🥭",
  coconut: "🥥",
  drink: "🥤",
  tea: "🍵",
  coffee: "☕",
  dessert: "🍰",
  ice: "🍨",
};

export function pickEmoji(name: string, category: string): string {
  const haystack = `${name} ${category}`.toLowerCase();
  for (const key of Object.keys(IMG_EMOJI_MAP)) {
    if (haystack.includes(key)) return IMG_EMOJI_MAP[key];
  }
  return "🍽️";
}

export function formatDuration(startedAtIso: string): string {
  const start = new Date(startedAtIso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - start);
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return `${hours}h ${rem}m`;
}

export const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "TH", label: "ไทย" },
  { code: "ZH", label: "中文" },
  { code: "JA", label: "日本語" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const ALL_CATEGORY = "All";
