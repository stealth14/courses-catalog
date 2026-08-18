export default function PaymentLayout({
  children,
}: LayoutProps<"/[locale]/payment">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 font-sans dark:bg-black">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-[#111]">
        {children}
      </div>
    </main>
  );
}
