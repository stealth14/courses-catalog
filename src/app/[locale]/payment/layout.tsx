import { StepCard } from "@/components/step-card";

export default function PaymentLayout({
  children,
}: LayoutProps<"/[locale]/payment">) {
  return <StepCard>{children}</StepCard>;
}
