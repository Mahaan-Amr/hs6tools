"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import { Messages } from "@/lib/i18n";

export interface ConditionalFooterProps {
  locale: string;
  messages: Messages;
}

export default function ConditionalFooter({ locale, messages }: ConditionalFooterProps) {
  const pathname = usePathname();
  
  // Don't render Footer on admin pages to avoid blocking external resources
  const isAdminRoute = pathname?.includes("/admin");
  
  if (isAdminRoute) {
    return null;
  }
  
  return <Footer locale={locale} messages={messages} />;
}
