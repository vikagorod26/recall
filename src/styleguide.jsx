import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, IconButton, TwoStepButton } from "./components/Buttons.jsx";
import { Splash } from "./components/Splash.jsx";
import { CategoryPicker } from "./components/CategoryPicker.jsx";
import { CategoryCloud, CloudChip } from "./components/CategoryCloud.jsx";
import { ProgressButton } from "./components/ProgressButton.jsx";
import { IntroArt } from "./components/IntroArt.jsx";
import { IntroCarousel } from "./components/IntroCarousel.jsx";
import { INTRO_SLIDES } from "./screens/Onboarding.jsx";
import { categories, tips, tipOfTheDay } from "./lib/content.js";
import { Icon } from "./components/Icon.jsx";
import { CategoryTag, TipCard } from "./components/TipCard.jsx";
import { DailyTip } from "./components/DailyTip.jsx";
import { SwipeDeck, SwipeCardStill } from "./components/SwipeDeck.jsx";
import { readMotionTokens } from "./lib/motionTokens.js";

const tipById = Object.fromEntries(tips.map(t => [t.id, t]));
const mount = (id, node) => createRoot(document.getElementById(id)).render(node);

// ---- Swipe card -------------------------------------------------------------
const t = readMotionTokens();
const STATES = [
  { label: "Resting", note: "offset 0", tip: "outdoors-01", offset: 0 },
  { label: "Dragged left", note: "glow at full strength", tip: "sleep-01", offset: -t.threshold },
  { label: "Dragged right", note: "same glow, other side", tip: "music-10", offset: t.threshold },
  { label: "Flying out", note: "past threshold, released", tip: "cooking-01", offset: 0.75, flying: true },
];

mount("swipe-states", STATES.map(s => (
  <div className="sg-state" key={s.label}>
    <div className="sg-state__frame">
      <div className="sg-state__stage">
        <SwipeCardStill tip={tipById[s.tip]} offset={s.offset} flying={s.flying} />
      </div>
    </div>
    <span className="sg-state__label">{s.label} · <code>{s.note}</code></span>
  </div>
)));

mount("swipe-live", (
  <>
    <SwipeDeck tips={tips} />
    <div className="swipe-hint label">
      <Icon id="arrow-left" className="icon--sm" />
      Swipe for another tip
      <Icon id="arrow-right" className="icon--sm" />
    </div>
    <DailyTip tip={tipOfTheDay()} />
  </>
));

// ---- Splash ---------------------------------------------------------------------
function SplashDemo() {
  const [run, setRun] = useState({ n: 0, long: true, on: true });
  const play = long => setRun(r => ({ n: r.n + 1, long, on: true }));
  return (
    <>
      <div className="sg-splash__frame">
        <span>Next screen shows here</span>
        {run.on && <Splash key={run.n} long={run.long} framed onDone={() => setRun(r => ({ ...r, on: false }))} />}
      </div>
      <div className="sg-splash__actions">
        <Button variant="secondary" onClick={() => play(true)}>First launch · 2s</Button>
        <Button variant="secondary" onClick={() => play(false)}>Later launch · 1s</Button>
      </div>
    </>
  );
}
mount("splash-demo", <SplashDemo />);

// ---- Onboarding intro -----------------------------------------------------------
const PROGRESS_STATES = [
  { label: "Screen 1 · 1/3", progress: 1 / 3 },
  { label: "Screen 2 · 2/3", progress: 2 / 3 },
  { label: "Screen 3 · done", progress: 1, done: true },
];
mount("progress-states", PROGRESS_STATES.map(s => (
  <div className="sg-progress__item" key={s.label}>
    <ProgressButton progress={s.progress} done={s.done} label={s.label} />
    <span>{s.label}</span>
  </div>
)));

function ProgressLive() {
  const [step, setStep] = useState(0);
  const done = step === 2;
  return (
    <>
      <ProgressButton progress={(step + 1) / 3} done={done} label="Next" onClick={() => setStep(s => (s + 1) % 3)} />
      <span>{done ? "Done (tap to start over)" : `Screen ${step + 1} of 3`}</span>
    </>
  );
}
mount("progress-live", <ProgressLive />);

mount("intro-arts", INTRO_SLIDES.map((s, i) => (
  <div className="sg-art" key={s.art}>
    <div className="sg-art__frame"><IntroArt variant={s.art} /></div>
    <span className="sg-art__label">{i + 1} · <code>{s.art}</code> · {s.title}</span>
  </div>
)));

function IntroDemo() {
  const [run, setRun] = useState(0);
  const restart = () => setRun(n => n + 1);
  return <IntroCarousel key={run} slides={INTRO_SLIDES} onDone={restart} onSkip={restart} framed />;
}
mount("intro-live", <IntroDemo />);

// ---- Category cloud chip ----------------------------------------------------------
mount("chip-states", [
  { label: "Unselected", id: "sports", selected: false },
  { label: "Pressed", id: "reading", selected: false, pressed: true },
  { label: "Selected", id: "outdoors", selected: true },
].map(s => (
  <div className="sg-chip-state" key={s.label}>
    <span>{s.label}</span>
    <CloudChip categoryId={s.id} selected={s.selected} pressed={s.pressed} />
  </div>
)));
mount("chip-all", categories.map(c => <CloudChip key={c.id} categoryId={c.id} selected />));

function CloudDemo() {
  const [run, setRun] = useState(0);
  const [selected, setSelected] = useState([]);
  return (
    <>
      <CategoryCloud key={run} selected={selected} onChange={setSelected} />
      <Button variant="secondary" onClick={() => setRun(n => n + 1)}>Replay the fall</Button>
    </>
  );
}
mount("chip-cloud", <CloudDemo />);

// ---- Category picker, header, two-step button ---------------------------------
function PickerDemo() {
  const [selected, setSelected] = useState(["outdoors", "cooking", "music"]);
  return <CategoryPicker selected={selected} onChange={setSelected} keepOne />;
}
mount("category-picker", <PickerDemo />);

mount("screen-header-demo", (
  <>
    <div className="screen-header">
      <IconButton icon="chevron-left" label="Back" />
      <p className="screen-header__title">Settings</p>
      <span />
    </div>
    <div className="top-bar">
      <p className="logo logo--sm">Recall<span className="logo__dot">.</span></p>
      <IconButton icon="settings" label="Settings" />
    </div>
  </>
));

function TwoStepDemo() {
  const [done, setDone] = useState(0);
  return (
    <div className="stack">
      <TwoStepButton armedLabel="Tap again to reset" onConfirm={() => setDone(n => n + 1)}>Reset app</TwoStepButton>
      <p className="sg-note">Confirmed {done} time{done === 1 ? "" : "s"} (demo only, nothing is cleared).</p>
    </div>
  );
}
mount("two-step-demo", <TwoStepDemo />);

// ---- Tags & example cards -----------------------------------------------------
mount("tags", categories.map(c => <CategoryTag key={c.id} categoryId={c.id} />));

const EXAMPLE_IDS = ["outdoors-01", "movies-01", "sports-01", "reading-01", "cooking-01", "sleep-01", "music-10", "friends-01"];
const examples = EXAMPLE_IDS.map(id => tipById[id]);
mount("examples", examples.map((tip, n) => (
  <div className="deck" key={tip.id}>
    <div className="deck__layer deck__layer--1" data-category={examples[(n + 1) % examples.length].category} />
    <TipCard tip={tip} compact />
  </div>
)));

// ---- Static reference sections (plain DOM) ----------------------------------
const COLOR_NAMES = { sports: "Lime", movies: "Rose", reading: "Yellow", outdoors: "Mint", cooking: "Orange", sleep: "Sky", music: "Pink", friends: "Cyan" };
const icon = (id, cls = "") => `<svg class="icon ${cls}" aria-hidden="true"><use href="./icons.svg#${id}"/></svg>`;

document.getElementById("cat-icons").innerHTML = categories.map(c =>
  `<div class="icon-tile" data-category="${c.id}">${icon(c.icon, "icon--lg")}${c.label.split(" ")[0]}</div>`).join("");

const css = getComputedStyle(document.documentElement);
const val = v => css.getPropertyValue(v).trim();
const swatch = (v, name) => `
  <div class="sw">
    <div class="sw__chip" style="--sw: var(${v})"></div>
    <div><div class="sw__name">${name}</div><div class="sw__meta">${val(v)}<br><code>${v}</code></div></div>
  </div>`;
document.getElementById("base-swatches").innerHTML = [
  ["--color-bg", "Background"], ["--color-surface", "Surface"],
  ["--color-surface-raised", "Surface raised"], ["--color-border-strong", "Border"],
  ["--color-text", "Text"], ["--color-text-muted", "Text muted"],
  ["--color-text-subtle", "Text subtle"],
].map(([v, n]) => swatch(v, n)).join("");
document.getElementById("brand-swatches").innerHTML = [
  ["--color-brand", "Brand"], ["--color-brand-accent", "Accent"],
  ["--color-brand-text", "Brand text / links"], ["--color-brand-pressed", "Brand pressed"],
].map(([v, n]) => swatch(v, n)).join("");

const lin = c => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const lum = hex => { const [r, g, b] = [1, 3, 5].map(k => lin(parseInt(hex.slice(k, k + 2), 16))); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return ((x + 0.05) / (y + 0.05)).toFixed(1); };
const surface = val("--color-surface");
document.getElementById("cat-swatches").innerHTML = categories.map(c => {
  const hex = val(`--cat-${c.id}`);
  return `<div class="cat-row" data-category="${c.id}">
    <div class="cat-row__chip"></div>
    <div class="cat-row__text"><span class="cat-row__name">${c.label}</span><span class="sw__meta">${COLOR_NAMES[c.id]} · ${hex} · ${ratio(hex, surface)}:1 · <code>--cat-${c.id}</code></span></div>
    ${icon(c.icon, "icon--lg")}
  </div>`;
}).join("");

document.getElementById("space-list").innerHTML = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map(n =>
  `<div class="space-row"><span>space-${n} · ${n * 4}</span><div class="space-bar" style="width: var(--space-${n})"></div></div>`).join("");

document.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () =>
  b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true")));
document.querySelectorAll(".toggle").forEach(b => b.addEventListener("click", () =>
  b.setAttribute("aria-checked", b.getAttribute("aria-checked") !== "true")));
