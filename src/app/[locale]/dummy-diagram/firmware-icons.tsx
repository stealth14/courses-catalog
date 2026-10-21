import type { SVGProps } from "react";

export type FirmwareIconProps = SVGProps<SVGSVGElement>;

/**
 * Shared stroke setup so every icon in the firmware diagram reads at the same
 * weight; each icon only supplies its own paths.
 */
function FirmwareIcon({ children, ...props }: FirmwareIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function DisplayIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <rect x="2.5" y="4" width="19" height="13" rx="2.5" />
      <path d="M9 21h6M12 17v4" />
    </FirmwareIcon>
  );
}

export function TapIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <circle cx="12" cy="16.5" r="2.5" />
      <path d="M8.2 12.7a5.4 5.4 0 0 1 7.6 0" />
      <path d="M5.2 9.7a9.6 9.6 0 0 1 13.6 0" />
    </FirmwareIcon>
  );
}

export function UsbIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <path d="M9 2.5V8M15 2.5V8" />
      <path d="M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0V8Z" />
      <path d="M12 17v4.5" />
    </FirmwareIcon>
  );
}

export function KeyIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11 20 20M17.5 17.5 19.5 15.5M14.5 14.5 16.5 12.5" />
    </FirmwareIcon>
  );
}

const KEYPAD_DOTS = [
  [8, 9],
  [12, 9],
  [16, 9],
  [8, 13],
  [12, 13],
  [16, 13],
  [12, 17],
] as const;

export function KeypadIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      {KEYPAD_DOTS.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="1.1"
          fill="currentColor"
          stroke="none"
        />
      ))}
    </FirmwareIcon>
  );
}

export function DatabaseIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </FirmwareIcon>
  );
}

export function ShieldIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <path d="M12 2.8 19 6v5.8c0 4.6-3 7.6-7 9.4-4-1.8-7-4.8-7-9.4V6l7-3.2Z" />
      <path d="m9.2 12 2 2 3.6-3.8" />
    </FirmwareIcon>
  );
}

const DICE_PIPS = [
  [8.5, 8.5],
  [15.5, 15.5],
  [12, 12],
] as const;

export function DiceIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      {DICE_PIPS.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="1.2"
          fill="currentColor"
          stroke="none"
        />
      ))}
    </FirmwareIcon>
  );
}

export function FirmwareChipIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" />
      <path d="M10 2.5v4M14 2.5v4M10 17.5v4M14 17.5v4M2.5 10h4M2.5 14h4M17.5 10h4M17.5 14h4" />
    </FirmwareIcon>
  );
}

export function WarningIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <path d="M12 3.8 21 20H3l9-16.2Z" />
      <path d="M12 9.5v4.5M12 17h.01" />
    </FirmwareIcon>
  );
}
