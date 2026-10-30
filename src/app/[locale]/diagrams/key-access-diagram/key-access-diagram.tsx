"use client";

import { useState, type ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
  DatabaseIcon,
  DisplayIcon,
  FirmwareChipIcon,
  GlobeIcon,
  KeyIcon,
  KeypadIcon,
  LaptopIcon,
  NoteIcon,
  PackageIcon,
  QrIcon,
  SdCardIcon,
  ServerIcon,
  ShieldIcon,
  UsbIcon,
  type FirmwareIconProps,
} from "@/components/icons/firmware-icons";

type IconComponent = ComponentType<FirmwareIconProps>;

/**
 * `full` means a readable copy of the keys lives there, `transient` means they
 * are decrypted into it only while it signs, and `partial` means it holds a
 * passphrase or a single multisig share but never the whole key.
 */
type KeyAccess = "full" | "transient" | "partial";

type LayerId = "device" | "host" | "services" | "media" | "paper";

type Element = {
  id: string;
  layer: LayerId;
  icon: IconComponent;
  access?: KeyAccess;
};

type Wallet = {
  id: "jade" | "trezor" | "core";
  icon: IconComponent;
  elements: Element[];
};

/**
 * Full ecosystem of each setup, element by element. Elements without `access`
 * are drawn too, so the highlighted ones can be compared against the rest
 * instead of floating on their own.
 */
const WALLETS: Wallet[] = [
  {
    id: "jade",
    icon: QrIcon,
    elements: [
      { id: "secure-element", layer: "device", access: "full", icon: ShieldIcon },
      { id: "chip", layer: "device", access: "transient", icon: FirmwareChipIcon },
      { id: "firmware", layer: "device", icon: PackageIcon },
      { id: "green-app", layer: "host", icon: LaptopIcon },
      { id: "link", layer: "host", icon: UsbIcon },
      { id: "green-server", layer: "services", access: "partial", icon: ServerIcon },
      { id: "oracle", layer: "services", icon: GlobeIcon },
      { id: "backup", layer: "paper", access: "full", icon: NoteIcon },
    ],
  },
  {
    id: "trezor",
    icon: ShieldIcon,
    elements: [
      { id: "secure-element", layer: "device", access: "full", icon: ShieldIcon },
      { id: "chip", layer: "device", access: "transient", icon: FirmwareChipIcon },
      { id: "firmware", layer: "device", icon: PackageIcon },
      { id: "suite", layer: "host", access: "partial", icon: LaptopIcon },
      { id: "browser", layer: "host", access: "partial", icon: DisplayIcon },
      { id: "bridge", layer: "host", icon: UsbIcon },
      { id: "host-recovery", layer: "host", access: "full", icon: KeypadIcon },
      { id: "servers", layer: "services", icon: ServerIcon },
      { id: "connect-sites", layer: "services", icon: GlobeIcon },
      { id: "backup", layer: "paper", access: "full", icon: NoteIcon },
    ],
  },
  {
    id: "core",
    icon: SdCardIcon,
    elements: [
      { id: "os", layer: "device", access: "full", icon: PackageIcon },
      { id: "memory", layer: "device", access: "transient", icon: FirmwareChipIcon },
      { id: "keyboard", layer: "host", access: "partial", icon: KeypadIcon },
      { id: "online", layer: "host", icon: DisplayIcon },
      { id: "network", layer: "services", icon: GlobeIcon },
      { id: "gpg", layer: "services", icon: KeyIcon },
      { id: "wallet-file", layer: "media", access: "full", icon: SdCardIcon },
      { id: "dump", layer: "media", access: "full", icon: DatabaseIcon },
      { id: "psbt", layer: "media", icon: UsbIcon },
      { id: "paper-passphrase", layer: "paper", access: "partial", icon: NoteIcon },
    ],
  },
];

const LAYERS: LayerId[] = ["device", "host", "services", "media", "paper"];

const ACCESS_STYLES: Record<
  KeyAccess,
  { bar: string; tile: string; icon: string; badge: string; text: string }
> = {
  full: {
    bar: "bg-rose-500",
    tile: "border-rose-300 bg-rose-50/70 hover:border-rose-400",
    icon: "bg-rose-500/12 text-rose-600 ring-1 ring-rose-500/25 ring-inset",
    badge: "bg-rose-100 text-rose-800 ring-rose-200",
    text: "text-rose-950",
  },
  transient: {
    bar: "bg-amber-500",
    tile: "border-amber-300 bg-amber-50/70 hover:border-amber-400",
    icon: "bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/25 ring-inset",
    badge: "bg-amber-100 text-amber-900 ring-amber-200",
    text: "text-amber-950",
  },
  partial: {
    bar: "bg-violet-500",
    tile: "border-violet-300 bg-violet-50/70 hover:border-violet-400",
    icon: "bg-violet-500/12 text-violet-700 ring-1 ring-violet-500/25 ring-inset",
    badge: "bg-violet-100 text-violet-900 ring-violet-200",
    text: "text-violet-950",
  },
};

const LEVELS: KeyAccess[] = ["full", "transient", "partial"];

function accessCount(wallet: Wallet) {
  return wallet.elements.filter((element) => element.access).length;
}

/**
 * One bar per element, coloured by how far that element gets: the filled bars
 * are the key surface, and the whole row is the ecosystem it sits in.
 */
function SurfaceBars({
  wallet,
  active,
}: {
  wallet: Wallet;
  active: boolean;
}) {
  return (
    <span aria-hidden="true" className="flex items-end gap-[3px]">
      {wallet.elements.map((element) => (
        <span
          key={element.id}
          className={`w-[5px] rounded-full ${
            element.access
              ? `h-4 ${ACCESS_STYLES[element.access].bar}`
              : `h-2.5 ${active ? "bg-white/25" : "bg-zinc-300"}`
          }`}
        />
      ))}
    </span>
  );
}

export function KeyAccessDiagram() {
  const t = useTranslations("KeyAccessDiagram");
  const [walletId, setWalletId] = useState<Wallet["id"]>("jade");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const wallet = WALLETS.find((entry) => entry.id === walletId) ?? WALLETS[0];
  const reached = accessCount(wallet);
  const selected =
    wallet.elements.find((element) => element.id === selectedId) ?? null;
  const SelectedIcon = selected?.icon;

  function selectWallet(id: Wallet["id"]) {
    setWalletId(id);
    setSelectedId(null);
  }

  function toggleElement(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  return (
    <figure className="flex flex-col gap-3 rounded-3xl bg-white p-3 text-zinc-900 [color-scheme:light] sm:p-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <div role="tablist" aria-label={t("selectorLabel")} className="contents">
          {WALLETS.map((entry) => {
            const Icon = entry.icon;
            const active = entry.id === wallet.id;
            const count = accessCount(entry);

            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                id={`key-access-tab-${entry.id}`}
                aria-selected={active}
                aria-controls="key-access-panel"
                onClick={() => selectWallet(entry.id)}
                className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                  active
                    ? "border-black bg-black text-white"
                    : "border-black/[.1] bg-white text-zinc-900 hover:border-zinc-400"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${active ? "text-white/80" : "text-zinc-400"}`}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight">
                    {t(`wallets.${entry.id}.name`)}
                  </span>
                  <span
                    className={`shrink-0 text-xs font-semibold tabular-nums ${
                      active ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {count}/{entry.elements.length}
                  </span>
                </span>
                <SurfaceBars wallet={entry} active={active} />
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="key-access-panel"
        role="tabpanel"
        aria-labelledby={`key-access-tab-${wallet.id}`}
        className="flex flex-col gap-3"
      >
        <div
          className="rounded-3xl border border-black/[.08] p-4 sm:p-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.07) 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="flex flex-col">
              <p className="text-sm font-semibold tracking-tight text-black">
                {t(`wallets.${wallet.id}.name`)}
              </p>
              <p className="text-xs text-zinc-500">
                {t(`wallets.${wallet.id}.model`)}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-1.5 ring-1 ring-black/[.08] ring-inset">
              <KeyIcon className="h-4 w-4 text-rose-500" />
              <p className="text-xs leading-4 font-medium text-zinc-600">
                {t("countSummary", { count: reached, total: wallet.elements.length })}
              </p>
            </div>
          </div>

          <div className="relative flex flex-col gap-4">
            <div
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-[7px] border-l border-dashed border-zinc-300"
            />

            {LAYERS.map((layer) => {
              const elements = wallet.elements.filter(
                (element) => element.layer === layer,
              );

              if (elements.length === 0) return null;

              const layerReached = elements.filter(
                (element) => element.access,
              ).length;

              return (
                <section key={layer} className="relative pl-7">
                  <span
                    aria-hidden="true"
                    className={`absolute top-1.5 left-[7px] h-2 w-2 -translate-x-1/2 rounded-full ring-2 ring-white ${
                      layerReached > 0 ? "bg-zinc-900" : "bg-zinc-300"
                    }`}
                  />
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="text-[0.65rem] font-semibold tracking-wider text-zinc-500 uppercase">
                      {t(`layers.${layer}`)}
                    </h4>
                    <span className="text-[0.65rem] font-semibold text-zinc-400 tabular-nums">
                      {t("layerCount", {
                        count: layerReached,
                        total: elements.length,
                      })}
                    </span>
                    <span className="h-px flex-1 bg-black/[.07]" />
                  </div>

                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {elements.map((element) => {
                      const Icon = element.icon;
                      const isSelected = element.id === selectedId;
                      const access = element.access
                        ? ACCESS_STYLES[element.access]
                        : null;

                      return (
                        <li key={element.id}>
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => toggleElement(element.id)}
                            className={`flex h-full w-full cursor-pointer items-start gap-2 rounded-xl border p-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                              access
                                ? access.tile
                                : "border-dashed border-zinc-300 bg-white/60 text-zinc-500 hover:border-zinc-400"
                            } ${
                              isSelected
                                ? "ring-2 ring-zinc-900/70 ring-offset-1"
                                : ""
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                access
                                  ? access.icon
                                  : "bg-zinc-100 text-zinc-400"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="flex min-w-0 flex-col gap-1">
                              <span
                                className={`text-[0.72rem] leading-4 font-semibold ${
                                  access ? access.text : "text-zinc-500"
                                }`}
                              >
                                {t(
                                  `wallets.${wallet.id}.elements.${element.id}.name`,
                                )}
                              </span>
                              {element.access ? (
                                <span
                                  className={`w-fit rounded-full px-1.5 py-px text-[0.55rem] font-semibold tracking-wide uppercase ring-1 ring-inset ${access?.badge}`}
                                >
                                  {t(`levels.${element.access}.label`)}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-1 border-t border-black/[.06] pt-3">
            <p className="flex items-start gap-2 text-[0.7rem] leading-4 text-zinc-600">
              <span
                aria-hidden="true"
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500"
              />
              {t("legendAccess")}
            </p>
            <p className="flex items-start gap-2 text-[0.7rem] leading-4 text-zinc-600">
              <span
                aria-hidden="true"
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-zinc-300"
              />
              {t("legendNoAccess")}
            </p>
          </div>
        </div>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="min-h-[6.5rem] rounded-2xl border border-black/[.08] bg-zinc-50 p-4"
        >
          {selected && SelectedIcon ? (
            <div className="flex items-start gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  selected.access
                    ? ACCESS_STYLES[selected.access].icon
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                <SelectedIcon className="h-5 w-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-semibold tracking-tight text-black">
                    {t(
                      `wallets.${wallet.id}.elements.${selected.id}.name`,
                    )}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.55rem] font-semibold tracking-wide uppercase ring-1 ring-inset ${
                      selected.access
                        ? ACCESS_STYLES[selected.access].badge
                        : "bg-zinc-200 text-zinc-600 ring-zinc-300"
                    }`}
                  >
                    {selected.access
                      ? t(`levels.${selected.access}.label`)
                      : t("noAccessShort")}
                  </span>
                </div>
                <p className="text-sm leading-6 text-zinc-600">
                  {selected.access
                    ? t(`wallets.${wallet.id}.elements.${selected.id}.action`)
                    : t("actionNone")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-zinc-500">{t("prompt")}</p>
          )}
        </div>

        <ul aria-label={t("countLabel")} className="flex flex-col gap-1 px-1">
          {LEVELS.map((level) => (
            <li
              key={level}
              className="flex items-start gap-2 text-[0.7rem] leading-4 text-zinc-600"
            >
              <span
                aria-hidden="true"
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${ACCESS_STYLES[level].bar}`}
              />
              <span>
                <span className="font-semibold text-zinc-900">
                  {t(`levels.${level}.label`)}
                </span>{" "}
                — {t(`levels.${level}.note`)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <figcaption className="text-xs leading-5 text-zinc-500">
        {t("caption")}
      </figcaption>
    </figure>
  );
}
