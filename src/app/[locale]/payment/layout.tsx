export default function PaymentLayout({
  children,
}: LayoutProps<"/[locale]/payment">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black sm:px-6 sm:py-24">
      <div className="mt-4 flex w-full max-w-md flex-col gap-6 sm:mt-6 sm:rounded-2xl sm:border sm:border-black/[.08] sm:bg-white sm:p-8 sm:dark:border-white/[.145] sm:dark:bg-[#111]">
        {children}
      </div>
    </main>
  );
}
