import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SwipeDeck } from "../components/SwipeDeck.jsx";
import { DailyTip } from "../components/DailyTip.jsx";
import { IconButton } from "../components/Buttons.jsx";
import { Icon } from "../components/Icon.jsx";
import { ReasonSheet } from "../components/ReasonSheet.jsx";
import { reasonById, tipOfTheDay, tipsForCategories, tipsForReason } from "../lib/content.js";
import { readMotionTokens } from "../lib/motionTokens.js";
import { loadReason, saveReason } from "../lib/storage.js";

// `askOnOpen`: slide the "why play?" sheet up once the screen is ready
// (after the splash, or after onboarding) and has settled in.
// `entrance="gather"`: arriving from the category picker; the deck rises in
// and the rest fades in a beat later (reduce motion: plain fade).
export function MainScreen({ categories, onOpenSettings, ready = true, askOnOpen = false, onAsked, entrance = null }) {
  const reduce = !!useReducedMotion();
  const [t] = useState(readMotionTokens);
  const [rise] = useState(() => entrance === "gather" && !reduce);
  const key = categories.join(",");
  const pool = useMemo(() => tipsForCategories(categories), [key]);
  const daily = useMemo(() => tipOfTheDay(), []);

  const [reasonId, setReasonId] = useState(() => loadReason()?.id ?? null);
  const reason = reasonById[reasonId] ?? null;
  const lead = useMemo(() => tipsForReason(reasonId), [reasonId]);

  // mode: why the sheet is open ("launch" | "manual"); open: whether it's on screen
  const [mode, setMode] = useState(null);
  const [open, setOpen] = useState(false);
  const openSheet = m => { setMode(m); setOpen(true); };

  useEffect(() => {
    if (!ready || !askOnOpen) return;
    // mark it asked only once it really opens: marking it earlier would cancel this timer
    const wait = t.sheet.openDelay + (rise ? t.gather.riseSettle : 0);
    const id = setTimeout(() => { openSheet("launch"); onAsked?.(); }, wait * 1000);
    return () => clearTimeout(id);
  }, [ready, askOnOpen]);

  // both run after the sheet's closing animation, so the change follows it
  const answer = id => { saveReason(id); setReasonId(id); setMode(null); };
  const dismiss = () => {
    // a skip on open clears the reason; closing after opening it from the pill keeps it
    if (mode === "launch") { saveReason(null); setReasonId(null); }
    setMode(null);
  };

  const fadeIn = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, height: 0, y: 6 }, animate: { opacity: 1, height: "auto", y: 0 }, exit: { opacity: 0, height: 0 } };

  return (
    <div className={`app${rise ? " app--enter" : ""}`}>
      <header className="top-bar">
        <p className="logo logo--sm">Recall<span className="logo__dot">.</span></p>
        <IconButton icon="settings" label="Settings" onClick={onOpenSettings} />
      </header>
      <div className="app__reason">
        <button
          type="button"
          className={`pill-btn label${reason ? " is-set" : ""}`}
          onClick={() => openSheet("manual")}
          aria-label={reason ? `Reason: ${reason.label}. Change it` : "Why do you want to play? Pick a reason"}
        >
          <Icon id={reason ? reason.icon : "circle-help"} />
          <span>{reason ? reason.label : "Why play?"}</span>
        </button>
        <AnimatePresence initial={false} mode="wait">
          {reason && (
            <motion.div
              key={reason.id}
              className="app__reaction"
              {...fadeIn}
              transition={{ duration: t.sheet.reactionIn, ease: t.easeOut }}
            >
              <p className="reaction" aria-live="polite">{reason.reaction}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <main className="app__deck deck-area">
        <SwipeDeck tips={pool} lead={lead} persistKey="seen" lockScroll rise={rise} />
      </main>
      <p className="swipe-hint label app__hint">
        <Icon id="arrow-left" className="icon--sm" />
        Swipe for another tip
        <Icon id="arrow-right" className="icon--sm" />
      </p>
      <DailyTip tip={daily} />
      <ReasonSheet
        open={open}
        current={reasonId}
        onClose={() => setOpen(false)}
        onAnswer={answer}
        onDismiss={dismiss}
      />
    </div>
  );
}
