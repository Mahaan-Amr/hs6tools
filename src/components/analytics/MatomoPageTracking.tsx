"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPublicPage } from "@/lib/matomo";

export default function MatomoPageTracking() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackPublicPage(pathname);
  }, [pathname]);
  return null;
}
