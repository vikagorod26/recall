import data from "./content.json";
const icon = (id, cls = "") => `<svg class="icon ${cls}" aria-hidden="true"><use href="./icons.svg#${id}"/></svg>`;
const esc = s => s.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const fmt = iso => new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const out = document.getElementById("content");
const { categories, tips, tipsOfTheDay, reasons = [], reasonTips = [] } = data;
const catById = Object.fromEntries(categories.map(c => [c.id, c]));
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const statusOf = d => d.expires < today ? "expired" : d.starts > today ? "upcoming" : "active";
const activeCount = tipsOfTheDay.filter(d => statusOf(d) === "active").length;
const leagueCount = tips.filter(t => t.league).length;

document.getElementById("stats").innerHTML =
  `<strong>${tips.length}</strong> tips in ${categories.length} categories · <strong>${reasonTips.length}</strong> "why play?" tips for ${reasons.length} reasons · <strong>${leagueCount}</strong> with a League reference (${Math.round(leagueCount / tips.length * 100)}%) · <strong>${tipsOfTheDay.length}</strong> tips of the day, ${activeCount} active today. Content updated ${fmt(data.updated)}.`;

document.getElementById("jump").innerHTML =
  categories.map(c => `<a href="#cat-${c.id}" data-category="${c.id}">${icon(c.icon)}${esc(c.label)}</a>`).join("") +
  reasons.map(r => `<a href="#reason-${r.id}" style="--cat: var(--color-brand-text)">${icon(r.icon)}${esc(r.label)}</a>`).join("") +
  `<a href="#daily" style="--cat: var(--color-brand-text)">${icon("sparkles")}Tips of the day</a>`;

const tipRow = (t, n) => `
  <li class="rv-tip" data-league="${t.league}">
    <span class="rv-num">${String(n + 1).padStart(2, "0")}</span>
    <div>
      <p class="rv-tip__title">${esc(t.title)}</p>
      <p class="rv-tip__text">${esc(t.text)}</p>
      <div class="rv-meta">
        <span>${icon("timer", "icon--sm")}${t.minutes} min</span>
        ${t.league ? `<span class="rv-badge rv-badge--league">League ref</span>` : ""}
        ${t.reason ? `<span class="tag" data-category="${t.category}">${icon(catById[t.category].icon)}${esc(catById[t.category].label)}</span>` : ""}
        <span>${t.id}</span>
      </div>
    </div>
  </li>`;

const sections = categories.map(c => {
  const list = tips.filter(t => t.category === c.id);
  return `
    <section class="rv-section" id="cat-${c.id}" data-category="${c.id}">
      <h2 class="rv-h">${icon(c.icon, "icon--lg")}${esc(c.label)}<span class="rv-h__count">${list.length} tips · ${list.filter(t => t.league).length} League</span></h2>
      <ol class="rv-list">${list.map(tipRow).join("")}</ol>
    </section>`;
}).join("");

const dailyRow = d => {
  const s = statusOf(d);
  const label = { active: "Active today", upcoming: "Upcoming", expired: "Expired" }[s];
  return `
    <li class="rv-tip${s === "expired" ? " is-expired" : ""}">
      <div>
        <p class="rv-tip__title">${esc(d.title)}</p>
        <p class="rv-tip__text">${esc(d.text)}</p>
        <div class="rv-meta">
          <span class="rv-badge rv-badge--${s}">${label}</span>
          <span>${fmt(d.starts)} – ${fmt(d.expires)}</span>
        </div>
        <p class="rv-fact">Based on: ${esc(d.fact)}</p>
      </div>
    </li>`;
};

const reasonSections = reasons.map(r => {
  const list = reasonTips.filter(t => t.reason === r.id);
  return `
    <section class="rv-section" id="reason-${r.id}" style="--cat: var(--color-brand-text)">
      <h2 class="rv-h">${icon(r.icon, "icon--lg")}Why play: ${esc(r.label)}<span class="rv-h__count">${list.length} tips · ${list.filter(t => t.league).length} League</span></h2>
      <p class="rv-reaction">“${esc(r.reaction)}”</p>
      <p class="rv-fact">Hook: ${esc(r.hook)}</p>
      <ol class="rv-list">${list.map(tipRow).join("")}</ol>
    </section>`;
}).join("");

out.innerHTML = sections + reasonSections + `
  <section class="rv-section rv-daily" id="daily">
    <h2 class="rv-h">${icon("sparkles", "icon--lg")}Tips of the day<span class="rv-h__count">${tipsOfTheDay.length} total · ${activeCount} active today</span></h2>
    <ol class="rv-list">${[...tipsOfTheDay].sort((a, b) => a.starts.localeCompare(b.starts)).map(dailyRow).join("")}</ol>
  </section>`;

// Filter
const chips = document.querySelectorAll("[data-filter]");
chips.forEach(chip => chip.addEventListener("click", () => {
  chips.forEach(c => c.setAttribute("aria-pressed", c === chip));
  const f = chip.dataset.filter;
  document.querySelectorAll(".rv-tip[data-league]").forEach(row => {
    row.hidden = f === "league" ? row.dataset.league !== "true" : f === "plain" ? row.dataset.league === "true" : false;
  });
}));
