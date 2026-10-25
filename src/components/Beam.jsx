import { useState } from "react";
import { readMotionTokens } from "../lib/motionTokens.js";

// Border beam: a thin light beam travelling around the parent's rounded border.
// Put it inside a position:relative element and set --beam-radius there
// (and --beam-inset to the element's border width, so it sits on the border).
// Pure CSS ("Border beam" in components.css): a conic gradient masked to a
// ring that follows the border radius, rotated with a transform (GPU only).
// The loop phase follows the clock, so the beam never jumps back to the start
// when it re-renders or remounts (e.g. a new tip of the day, back from settings).
// `still`: show the static reduce-motion look (styleguide preview).
export function Beam({ still = false }) {
  const [phase] = useState(() => {
    const loop = readMotionTokens().beamLoop * 1000;
    return `-${Math.round(Date.now() % loop)}ms`;
  });
  return (
    <span className={`beam${still ? " beam--static" : ""}`} style={{ "--beam-phase": phase }} aria-hidden="true">
      <span className="beam__ring beam__ring--glow"><span className="beam__spin" /></span>
      <span className="beam__ring"><span className="beam__spin" /></span>
    </span>
  );
}
