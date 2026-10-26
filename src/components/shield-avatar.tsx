/** Brand mark shown in the navbar where the profile photo used to be. */
export function ShieldAvatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-black/[.08] dark:ring-white/[.145]">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px] fill-primary"
      >
        <path d="M12 2.25 19.5 5.5v6c0 4.4-3 8-7.5 10.25C7.5 19.5 4.5 15.9 4.5 11.5v-6L12 2.25Z" />
      </svg>
    </span>
  );
}
