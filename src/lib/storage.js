// On-device storage. Every access is wrapped: private mode or blocked storage
// must never break the app, it just forgets between visits.

const PREFIX = "recall:v1:";

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep going in memory */
  }
}

// prefs: { categories: string[], onboarded: true }. Missing = first launch.
export function loadPrefs() {
  const prefs = load("prefs", null);
  const ok = prefs?.onboarded && Array.isArray(prefs.categories) && prefs.categories.length > 0;
  return ok ? prefs : null;
}

export function savePrefs(prefs) {
  save("prefs", { ...prefs, onboarded: true });
}

// Forget everything this app stored on the device.
export function resetAll() {
  try {
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
  } catch {
    /* storage unavailable: nothing to clear */
  }
}

// "Why do you want to play?" answer: { id: reasonId | null, at: ms timestamp }.
// id null = skipped. The question is asked on every launch.

export function loadReason() {
  const r = load("reason", null);
  return r && typeof r.at === "number" ? r : null;
}

export function saveReason(id) {
  const r = { id: id ?? null, at: Date.now() };
  save("reason", r);
  return r;
}
