import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { readMotionTokens } from "../lib/motionTokens.js";

// Bottom sheet over the current screen. Slides up on a spring over a dimmed,
// slightly blurred backdrop. Closes by dragging it down, tapping the backdrop,
// Escape, or the phone's back button (it adds a history entry, so "back"
// closes the sheet instead of leaving the app). While open, everything else
// on the page is inert: nothing behind it can be tapped or swiped.
//
// onClose(how): how = "swipe" | "backdrop" | "back" | "escape" | "done"
// `closeRef` receives a function to close it from inside (e.g. a confirm button).
// `footer`: pinned under the content (e.g. the primary action); it never scrolls away.
// `onExited`: called once the closing animation has finished.
export function BottomSheet({ open, onClose, onExited, labelledBy, closeRef, footer, children }) {
  const reduce = !!useReducedMotion();
  const [t] = useState(readMotionTokens);
  const [host] = useState(() => document.createElement("div"));
  const sheet = useRef(null);
  const how = useRef("back");
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    document.body.appendChild(host);
    return () => host.remove();
  }, [host]);

  // Every close goes through history, so the back button and the UI agree.
  const requestClose = why => {
    how.current = why;
    if (history.state?.sheet) history.back();
    else onCloseRef.current(why);
  };
  if (closeRef) closeRef.current = requestClose;

  useEffect(() => {
    if (!open) return;
    how.current = "back";
    if (!history.state?.sheet) history.pushState({ ...history.state, sheet: true }, "");
    const onPop = () => onCloseRef.current(how.current);
    const onKey = e => { if (e.key === "Escape") requestClose("escape"); };
    window.addEventListener("popstate", onPop);
    window.addEventListener("keydown", onKey);

    // everything except the sheet becomes inert
    const others = [...document.body.children].filter(el => el !== host && !el.inert);
    others.forEach(el => { el.inert = true; });
    const returnFocus = document.activeElement;
    requestAnimationFrame(() => sheet.current?.focus());

    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
      others.forEach(el => { el.inert = false; });
      returnFocus?.focus?.();
    };
  }, [open]);

  // closed from outside while our history entry is still on top: remove it
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && !open && history.state?.sheet) history.back();
    wasOpen.current = open;
  }, [open]);

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: t.sheet.fade } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: t.sheet.spring };

  const handleDragEnd = (_, info) => {
    const h = sheet.current?.offsetHeight || 1;
    if (info.offset.y > h * t.sheet.closeThreshold || info.velocity.y > t.sheet.closeVelocity) requestClose("swipe");
  };

  return createPortal(
    <AnimatePresence onExitComplete={onExited}>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="sheet-backdrop"
            onClick={() => requestClose("backdrop")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: t.sheet.fade }}
            aria-hidden="true"
          />
          <motion.div
            key="sheet"
            ref={sheet}
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 1 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            {...slide}
          >
            <button type="button" className="sheet__handle" aria-label="Close" onClick={() => requestClose("swipe")} />
            <div className="sheet__body">{children}</div>
            {footer && <div className="sheet__footer">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    host,
  );
}
