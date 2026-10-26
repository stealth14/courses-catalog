/**
 * Trailing arrow for links that open something else. It nudges on hover
 * only where the surrounding link carries Tailwind's `group` class.
 */
export function ArrowIcon({
  className = "h-3.5 w-3.5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${className}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  );
}
