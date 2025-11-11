"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTOR = "[data-scroll-reveal]";
const ACTIVE_CLASS = "scroll-reveal-active";

export default function ScrollEffects() {
  const pathname = usePathname();
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
    );

    // Disconnect any previous observers
    intersectionObserverRef.current?.disconnect();
    mutationObserverRef.current?.disconnect();

    elements.forEach((element) => element.classList.remove(ACTIVE_CLASS));

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(ACTIVE_CLASS);
            intersectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    const registerElements = (targets: Iterable<HTMLElement>) => {
      for (const el of targets) {
        if (!el.classList.contains(ACTIVE_CLASS)) {
          intersectionObserver.observe(el);
        }
      }
    };

    if (elements.length) {
      registerElements(elements);
    }

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches(REVEAL_SELECTOR)) {
              registerElements([node]);
            }
            const nested = node.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
            if (nested.length) {
              registerElements(nested);
            }
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    intersectionObserverRef.current = intersectionObserver;
    mutationObserverRef.current = mutationObserver;

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}

