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

export function WirelessIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <circle cx="12" cy="17.6" r="1.5" fill="currentColor" stroke="none" />
      <path d="M8.4 13.9a5.1 5.1 0 0 1 7.2 0" />
      <path d="M5.4 10.9a9.3 9.3 0 0 1 13.2 0" />
      <path d="M2.6 7.9a13.4 13.4 0 0 1 18.8 0" />
    </FirmwareIcon>
  );
}

export function CameraIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <rect x="2.5" y="6.5" width="19" height="13" rx="2.5" />
      <path d="M7.5 6.5 8.8 4h6.4l1.3 2.5" />
      <circle cx="12" cy="13" r="3.4" />
    </FirmwareIcon>
  );
}

export function SdCardIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <path d="M6.8 2.8h6.6L18.2 7.6V21H6.8V2.8Z" />
      <path d="M10.2 6v3.2M13 6v3.2M15.8 6v3.2" />
    </FirmwareIcon>
  );
}

export function FingerprintIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <path d="M3.4 11a8.6 8.6 0 0 1 17.2 0v1.4" />
      <path d="M6.6 11.6a5.4 5.4 0 0 1 10.8 0v3.6" />
      <path d="M9.8 12.4a2.2 2.2 0 0 1 4.4 0v6.2" />
    </FirmwareIcon>
  );
}

export function BatteryIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <rect x="2.5" y="7.5" width="16" height="9" rx="2.2" />
      <path d="M21 10.6v2.8" />
      <path d="M10.4 9.8 8.2 13h3.1l-1.9 3.2" />
    </FirmwareIcon>
  );
}

export function PackageIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <path d="M12 3 20.5 7.3v9.4L12 21l-8.5-4.3V7.3L12 3Z" />
      <path d="M3.5 7.3 12 11.6l8.5-4.3M12 11.6V21" />
    </FirmwareIcon>
  );
}

export function GlobeIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.4 12h17.2" />
      <path d="M12 3.4c2.2 2.4 3.4 5.4 3.4 8.6S14.2 18.2 12 20.6c-2.2-2.4-3.4-5.4-3.4-8.6S9.8 5.8 12 3.4Z" />
    </FirmwareIcon>
  );
}

export function QrIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <rect x="3.2" y="3.2" width="7" height="7" rx="1.6" />
      <rect x="13.8" y="3.2" width="7" height="7" rx="1.6" />
      <rect x="3.2" y="13.8" width="7" height="7" rx="1.6" />
      <path d="M14 14h2.4v2.4H14zM18.6 18.6H21V21h-2.4zM13.8 20.8h.01M20.8 13.8h.01" />
    </FirmwareIcon>
  );
}

export function ServerIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <rect x="3" y="3.5" width="18" height="7" rx="2" />
      <rect x="3" y="13.5" width="18" height="7" rx="2" />
      <path d="M7 7h.01M7 17h.01" />
    </FirmwareIcon>
  );
}

export function LaptopIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <rect x="4" y="4.5" width="16" height="11" rx="2" />
      <path d="M2 19.5h20" />
    </FirmwareIcon>
  );
}

export function NoteIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <path d="M5.5 3.5h9l4 4v13h-13v-17Z" />
      <path d="M14.5 3.5v4h4" />
      <path d="M8.5 12h7M8.5 15.5h4.5" />
    </FirmwareIcon>
  );
}

export function ExternalLinkIcon(props: FirmwareIconProps) {
  return (
    <FirmwareIcon {...props}>
      <path d="M13.5 4.5h6v6" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18 14.5v4a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6h4" />
    </FirmwareIcon>
  );
}
