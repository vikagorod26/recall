// Round "next" button with a progress ring. `progress` 0..1 fills the ring;
// `done` morphs the arrow into a checkmark. Icon paths: Lucide arrow-right / check.
export function ProgressButton({ progress, done = false, label, onClick }) {
  return (
    <button
      type="button"
      className={`progress-btn${done ? " is-done" : ""}`}
      style={{ "--progress": progress }}
      aria-label={label}
      onClick={onClick}
    >
      <svg className="progress-btn__ring" viewBox="0 0 72 72" aria-hidden="true">
        <circle className="progress-btn__track" cx="36" cy="36" r="34" />
        <circle className="progress-btn__fill" cx="36" cy="36" r="34" pathLength="1" />
      </svg>
      <span className="progress-btn__core">
        <svg className="progress-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
          <g className="progress-btn__arrow">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </g>
          <path className="progress-btn__check" d="M20 6 9 17l-5-5" pathLength="1" />
        </svg>
      </span>
    </button>
  );
}
