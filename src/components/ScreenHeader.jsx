import { useEffect, useRef } from "react";
import { IconButton } from "./Buttons.jsx";

// Back button · centered title · empty spacer (keeps the title centered).
// The title takes focus when the screen opens, so screen readers announce it.
export function ScreenHeader({ title, onBack, backLabel = "Back" }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <header className="screen-header">
      {onBack ? <IconButton icon="chevron-left" label={backLabel} onClick={onBack} /> : <span />}
      <h1 className="screen-header__title" ref={ref} tabIndex={-1}>{title}</h1>
      <span />
    </header>
  );
}
