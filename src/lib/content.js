import content from "../content.json";

export const categories = content.categories;
export const tips = content.tips;
export const tipsOfTheDay = content.tipsOfTheDay;
export const categoryById = Object.fromEntries(categories.map(c => [c.id, c]));

export function tipsForCategories(ids) {
  if (!ids) return tips;
  const wanted = new Set(ids);
  const picked = tips.filter(t => wanted.has(t.category));
  return picked.length ? picked : tips;
}

export function localToday(date = new Date()) {
  const p = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

// The tip of the day active today; if several are, the one ending soonest.
export function tipOfTheDay(today = localToday()) {
  return tipsOfTheDay
    .filter(d => d.starts <= today && d.expires >= today)
    .sort((a, b) => a.expires.localeCompare(b.expires))[0] ?? null;
}

export function shortDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
