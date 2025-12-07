import CheckoutPageClient from "./CheckoutPageClient";
import { CustomerProvider } from "@/contexts/CustomerContext";

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;
  
  return (
    <CustomerProvider>
      <CheckoutPageClient locale={locale} />
    </CustomerProvider>
  );
}
