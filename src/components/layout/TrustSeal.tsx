"use client";

import { useState, useSyncExternalStore } from "react";

const TRUST_SEAL_URL =
  "https://trustseal.enamad.ir/logo.aspx?id=672815&Code=uTJMZOh3491RFLi2w3AvM2s9AmsVM5tf";
const TRUST_PAGE_URL =
  "https://trustseal.enamad.ir/?id=672815&Code=uTJMZOh3491RFLi2w3AvM2s9AmsVM5tf";
const subscribeToHydration = () => () => undefined;

export default function TrustSeal() {
  const [failed, setFailed] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  return (
    <a
      referrerPolicy="origin"
      target="_blank"
      rel="noopener noreferrer"
      href={TRUST_PAGE_URL}
      aria-label="E-Namad trust seal"
      className="flex h-[60px] w-[120px] items-center justify-center"
    >
      {!hydrated ? (
        <span
          className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
          aria-hidden="true"
        />
      ) : failed ? (
        <span
          className="flex h-full w-full items-center justify-center rounded-lg border border-gray-300 bg-gray-100 px-2 text-center text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          data-testid="trust-seal-fallback"
        >
          E-Namad verification unavailable
        </span>
      ) : (
        // The seal is domain-bound and must be loaded directly by the browser.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          referrerPolicy="origin"
          src={TRUST_SEAL_URL}
          alt="E-Namad trust seal"
          className="max-h-[60px] max-w-[120px] cursor-pointer object-contain"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </a>
  );
}
