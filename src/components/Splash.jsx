import { useCallback, useEffect, useRef, useState } from "react";
import { readMotionTokens } from "../lib/motionTokens.js";

// Launch splash: the "Recall." wordmark alone, fades and glows in, then fades out over
// the screen underneath. `long` = first launch (~2s), otherwise ~1s.
// A tap, Enter, Space or Escape skips it.
export function Splash({ long = false, onDone, framed = false }) {
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const timers = useRef([]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const leave = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    timers.current.push(setTimeout(() => onDoneRef.current(), readMotionTokens().splashOut * 1000));
  }, []);

  useEffect(() => {
    const t = readMotionTokens();
    timers.current.push(setTimeout(leave, (long ? t.splashFirst : t.splashReturn) * 1000));
    const onKey = e => { if (["Enter", " ", "Escape"].includes(e.key)) leave(); };
    if (!framed) window.addEventListener("keydown", onKey);
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.length = 0;
      window.removeEventListener("keydown", onKey);
    };
  }, [long, leave, framed]);

  return (
    <div
      className={`splash${framed ? " splash--framed" : ""}${leaving ? " is-leaving" : ""}`}
      onPointerDown={leave}
      role="status"
      aria-label="Recall"
    >
      <div className="splash__glow" aria-hidden="true" />
      <div className="splash__content" aria-hidden="true">
        <p className="splash__logo">Recall<span className="logo__dot">.</span></p>
      </div>
    </div>
  );
}
