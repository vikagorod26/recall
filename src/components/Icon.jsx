// Lucide icon from the public/icons.svg sprite.
export function Icon({ id, className = "" }) {
  return (
    <svg className={`icon ${className}`} aria-hidden="true">
      <use href={`${import.meta.env.BASE_URL}icons.svg#${id}`} />
    </svg>
  );
}
