# 🔐 Security Hardening Roadmap (React / Next.js)

## Goals
- Reduce supply-chain risk, prevent XSS/SSRF/redirect abuse, and protect secrets.
- Add defense-in-depth headers (CSP/HSTS/etc.) without breaking UX.
- Lock down API authz, rate limits, and abuse surfaces.
- Keep docs + verification steps updated as changes land.

## Phases & Tasks

### Phase 0 – Baseline Audit (in progress)
- [x] Inventory current headers (next.config.ts) — tightened and documented below.
- [ ] Identify client vs server components handling secrets.
- [ ] Map auth flows (login, register, phone verify, password reset).
- [ ] Check env usage and NEXT_PUBLIC exposure.
- [ ] Check dependency posture (package-lock, npm provenance).

### Phase 1 – Supply Chain & Build Hygiene
- [ ] Enforce `npm ci` in CI with committed lockfile; block install scripts in CI (`--ignore-scripts`) except whitelisted.
- [ ] Enable npm provenance (`npm config set provenance true`) and/or Sigstore attestations if supported.
- [ ] Add Dependabot/Snyk (fail on high/critical).
- [ ] Remove unused deps; pin critical libraries.

### Phase 2 – Security Headers & CSP
- [x] Harden headers in `next.config.ts`:
  - HSTS (includeSubDomains, preload) for HTTPS-only.
  - X-Frame-Options DENY (already).
  - X-Content-Type-Options nosniff (already).
  - Referrer-Policy stricter (`strict-origin-when-cross-origin`).
  - Permissions-Policy to disable camera/mic/geolocation unless needed.
  - Cross-Origin-Opener/Resource policies (conservative defaults).
- [x] Add CSP in `Content-Security-Policy-Report-Only` to observe impact; tighten after testing.
- [ ] Add `Report-To`/`NEL` endpoints (optional) for CSP violation collection.

### Phase 3 – SSRF, Images, External Fetch
- [x] Restrict `images.remotePatterns` to required domains; disallow wildcards. (now: localhost, hs6tools.com/www, trustseal.enamad.ir)
- [ ] Review any server-side fetch with user-controlled URLs; block or validate allowlists.
- [ ] Disable `dangerouslyAllowSVG`; sanitize SVG if ever needed.

### Phase 4 – AuthZ, Redirects, CSRF, Rate Limits
- [ ] Enforce authz on all `app/api/**` routes (role checks centralized).
- [x] Add redirect allowlist for `callbackUrl`/`redirect` params to prevent open redirects (login/register now sanitized to same-origin locale paths).
- [x] Add rate limits for: phone verify send, password reset code (basic in-memory per-IP), NextAuth login POSTs (middleware).
- [x] Add CSRF origin checks for state-changing endpoints (verify-phone send, password-reset request, admin uploads).

### Phase 5 – Input Validation & XSS Controls
- [ ] Ensure all user input is validated (zod/valibot) server-side.
- [ ] Remove/limit `dangerouslySetInnerHTML`; sanitize HTML/Markdown with DOMPurify/rehype-sanitize server-side.
- [ ] Encode untrusted data in UI; prefer server components for sensitive data.

### Phase 6 – Secrets & Env Hygiene
- [x] Review `.env*`; ensure secrets not exposed via `NEXT_PUBLIC_*`. Added `docs/ENVIRONMENT_REQUIREMENTS.md` with public vs server-only guidance and sample env.
- [ ] Split client/public vs server-only env; document required vars.
- [ ] Add secret scanning (git-secrets / trufflehog) pre-commit/CI.

### Phase 7 – Monitoring & Logging
- [ ] Add structured logging for auth failures, rate-limit hits, and 5xx with correlation IDs.
- [ ] Add basic WAF/CDN rules (bot/XSS/SQLi filters) if behind CDN.
- [ ] (Optional) CSP/NEL reporting endpoint to capture violations.

### Phase 8 – Testing & Verification
- [ ] Add security checklist to CI (headers present, CSP report-only enabled).
- [ ] Regular `npm audit --production`; Snyk/Dependabot alerts triage SLA.
- [ ] Pen-test style checks: open redirect, XSS via Markdown, SSRF via image/fetch inputs.

## Immediate Next Steps (proposed)
1) Finalize audit notes (env exposure, API authz/rate limits).  
2) Add redirect allowlist to remaining flows if any.  
3) Expand rate limiting to other auth-sensitive endpoints if discovered (uploads covered).  
4) Enable Snyk and wire `ci:secure`/`audit:prod` in CI; keep npm provenance (`.npmrc`).  
5) Review env exposure (`NEXT_PUBLIC_*`) and centralize authz checks; document gaps.  
6) Consider moving CSP from report-only to enforce after observing reports.  
7) Document changes and verification steps per phase (continue).

## Progress Log
- ✅ Added hardened headers and CSP in `next.config.ts`: HSTS (prod), Permissions-Policy, COOP/CORP, stricter Referrer-Policy. CSP enforced in production, report-only in dev.
- ✅ Restricted image domains in `next.config.ts` to localhost, hs6tools.com/www, trustseal.enamad.ir.
- ✅ Added callback URL sanitization (same-origin, locale-scoped) for login/register to prevent open redirects.
- ✅ Added basic per-IP rate limits for: phone verification send (5/5min), password reset code (5/5min), registration (3/15min), NextAuth login POSTs (10/5min via middleware), admin uploads (10/5min), admin SMS send (20/5min).
- ✅ Added npm provenance (`.npmrc`) and npm scripts: `ci:secure` (npm ci --ignore-scripts), `audit:prod` (npm audit --production).
- ✅ Added CSRF origin checks (verify-phone send, password-reset request, admin uploads).
- ✅ Added Dependabot config for npm daily updates.
- ✅ Added GitHub Actions security workflow (npm ci + audit on push/PR and daily schedule).
- ✅ Centralized authz checks: Created `requireAuth()` helper in `src/lib/authz.ts` and migrated key admin routes (users, orders, analytics, coupons, sms/send).
- ✅ Fixed env exposure: Removed `NEXT_PUBLIC_APP_URL` from server-side code (payment callbacks now use `request.nextUrl.origin`). Kept legitimate client-side usage in `BlogContent.tsx`.
- ✅ CSP enforcement: Moved from report-only to enforced in production (dev still uses report-only for testing).
- 🚨 **CRITICAL:** Fixed CVE-2025-55182 (React2Shell RCE): Updated React from 19.1.0 → 19.2.1, Next.js from 15.4.6 → 15.5.7. See `docs/CVE-2025-55182_REACT2SHELL_FIX.md` for details.
- ⚠️ **Other Vulnerabilities Found:** jspdf (high - DoS), nodemailer (moderate), cookie (low) - need to address separately.

## Tracking & Docs
- This roadmap lives in `docs/SECURITY_ROADMAP.md`.
- Execution notes and verification steps should be appended here and in per-feature docs as we land changes.

