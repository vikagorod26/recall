import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "./BottomSheet.jsx";
import { Button } from "./Buttons.jsx";
import { ChipCloud } from "./CategoryCloud.jsx";
import { reasons } from "../lib/content.js";

const OPTIONS = reasons.map(r => ({ id: r.id, label: r.label, icon: r.icon }));

// "Why do you want to play right now?" in a bottom sheet. Single-select
// brand-purple chips; the earlier answer (if any) starts preselected.
// Tapping a chip only selects it; "Show me tips" confirms and closes.
// Swipe down / backdrop / back button close it without applying anything.
//
// onClose(): the sheet should close (parent sets open=false).
// onAnswer(id) / onDismiss(): called after the closing animation has finished,
// so the screen behind changes only once the sheet is out of the way.
export function ReasonSheet({ open, current, onClose, onAnswer, onDismiss }) {
  const [picked, setPicked] = useState(current ? [current] : []);
  const closeRef = useRef(null);
  const result = useRef(null);

  useEffect(() => {
    if (open) setPicked(current ? [current] : []);
  }, [open, current]);

  const handleClose = how => {
    result.current = how === "done" && picked[0] ? picked[0] : null;
    onClose();
  };

  const handleExited = () => {
    if (result.current) onAnswer(result.current);
    else onDismiss();
    result.current = null;
  };

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      onExited={handleExited}
      labelledBy="reason-title"
      closeRef={closeRef}
      footer={
        <Button disabled={picked.length === 0} onClick={() => closeRef.current?.("done")}>
          Show me tips
        </Button>
      }
    >
      <h2 className="sheet__title" id="reason-title">Why do you want to play right now?</h2>
      <p className="sheet__lead">Be honest. Better excuse, better side quest.</p>
      <div className="sheet__cloud">
        <ChipCloud options={OPTIONS} selected={picked} onChange={setPicked} multiple={false} tone="brand" labelledBy="reason-title" />
      </div>
    </BottomSheet>
  );
}
