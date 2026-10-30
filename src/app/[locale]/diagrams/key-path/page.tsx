import type { Metadata } from "next";
import { KeyPathDiagram } from "./key-path-diagram";

export const metadata: Metadata = {
  title: "Key path",
  description:
    "Animated journey of the private keys when a Trezor Safe 7 signs a bitcoin transaction.",
};

/**
 * Key path diagram: an animated walkthrough of where the private keys go
 * while a Trezor Safe 7 sends bitcoin, and which components touch them.
 */
export default function KeyPathPage() {
  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 pt-8 pb-10 sm:px-6 sm:pt-8 sm:pb-16">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
            Key path
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Follow a bitcoin send from Trezor Suite to the network: the
            unsigned transaction travels in, the private key moves only inside
            the device, and only the signature comes out.
          </p>
        </header>

        <KeyPathDiagram />
      </div>
    </main>
  );
}
