import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";

export function Button({ variant = "primary", className = "", ...props }) {
  return <button type="button" className={`btn btn--${variant} ${className}`} {...props} />;
}

// Round icon-only button. `label` is required: it's the accessible name.
export function IconButton({ icon, label, ...props }) {
  return (
    <button type="button" className="icon-btn" aria-label={label} title={label} {...props}>
      <Icon id={icon} />
    </button>
  );
}

// Destructive action: first tap arms it, second tap within a few seconds runs it.
export function TwoStepButton({ children, armedLabel, onConfirm, timeout = 4000 }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const click = () => {
    if (armed) {
      clearTimeout(timer.current);
      setArmed(false);
      onConfirm();
      return;
    }
    setArmed(true);
    timer.current = setTimeout(() => setArmed(false), timeout);
  };

  return (
    <button type="button" className={`btn btn--secondary${armed ? " btn--armed" : ""}`} onClick={click} aria-live="polite">
      {armed ? armedLabel : children}
    </button>
  );
}
