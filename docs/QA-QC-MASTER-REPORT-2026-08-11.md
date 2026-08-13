# HS6Tools Full QA/QC Report — 2026-08-11

## Status

- Phase: Remediation and verification complete for the approved QA scope.
- Production: Read-only Visitor checks only.
- Local: Stateful Visitor, Customer, Admin, and Super Admin checks using records prefixed `QA-20260811-`.
- External effects: No real payment, SMS, email, production order, production account, or production admin mutation.

## Evidence and cleanup protocol

- Preserve all records that predate this run.
- Record every QA-created database identifier in the cleanup ledger.
- Snapshot and restore any global setting touched by a test.
- Compare baseline and final model counts.
- Capture route, actor, locale, viewport, theme, expected result, actual result, and evidence for every defect.

## Severity policy

- P0 — Release stop: destructive data loss, critical security compromise, or total business outage.
- P1 — High: core purchase/admin flow blocked, authorization bypass, or severe accessibility/SEO failure.
- P2 — Medium: important flow degraded, confusing UX, incomplete validation, or material responsive defect.
- P3 — Low: polish, consistency, minor content, or low-impact edge case.

## Master checklist

| Area | Coverage | First pass | Fix | Retest |
| --- | --- | --- | --- | --- |
| Engineering baseline | install/build/types/lint/dependencies/schema/migrations/runtime logs | Complete | Complete | Pass with documented upstream dependency residuals |
| Visitor storefront | home/search/categories/products/content/navigation | Complete | Complete | Pass |
| Internationalization | Persian/English/Arabic, RTL/LTR, locale switching | Complete | Partial | Storefront pass; Admin content debt remains |
| Cart and checkout | cart/coupon/auth/address/shipping/payment/order/failures | Complete to payment handoff | Complete | Pass to payment boundary |
| Customer account | profile/security/addresses/orders/wishlist/reviews/settings/support | Complete without external delivery | Complete | Pass for sampled flows |
| Admin commerce | dashboard/products/categories/orders/coupons/shipping | Complete without destructive/refund execution | Complete | Pass for sampled non-destructive flows |
| Admin content | homepage/pages/articles/education/uploads/localization | Complete without publishing/upload side effects | Partial | Routes pass; full Admin localization remains |
| Admin operations | users/RBAC/CRM/analytics/support/integration settings | Complete without external messages | Complete | Pass for access/read flows |
| UI/UX and visual | responsive/theme/empty/loading/error/consistency | Complete | Complete | Pass at sampled desktop/mobile viewports |
| Accessibility | keyboard/focus/semantics/names/contrast/reduced motion | Complete baseline | Complete | Pass for repaired paths; not a formal WCAG conformance audit |
| SEO and resilience | metadata/canonical/hreflang/sitemap/robots/404/images/no-JS | Complete | Complete | 14 public/resilience assertions pass |
| Security and privacy | authz/input/upload/secrets/session/error leakage | Complete baseline | Complete | Application P0 closed; dependency residuals documented |

## Issue register

First-pass findings are appended here and frozen before implementation begins.

| ID | Severity | Actor | Flow | Environment | Finding | Evidence | Fix | Retest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| QA-001 | P0 | Visitor | Catalog administration API | Local/source | Product and Category mutations lacked authorization. | Source review plus anonymous HTTP probes | Role guards added to all six mutation handlers | Pass: anonymous POST/PUT/DELETE return 401 |
| QA-002 | P0 | All | Supply-chain security | Local | Production graph initially had 39 advisories, including 4 critical. | `npm audit --omit=dev` | Direct packages and safe transitives upgraded | Partial: 6 remain (4 high, 2 moderate), constrained by Next 15/NextAuth 4; no critical advisories |
| QA-003 | P1 | Visitor/Customer/Admin | Locale semantics | Local | Root HTML was always Persian RTL. | `/fa`, `/en`, `/ar` probes | Middleware-to-layout locale header drives `lang` and `dir` | Pass across all locales |
| QA-004 | P1 | Visitor/Customer/Admin | English localization | Local | English storefront retained Persian catalog data; Admin has mixed translations. | Responsive storefront/Admin evidence | Catalog localization added across shop/category/detail/cart | Storefront pass; Admin translation debt remains |
| QA-005 | P1 | Customer | Checkout address validation | Local | Blank address step exposed no accessible errors. | Customer checkout probe | Required/invalid/described-by state, seven inline alerts, and focus-to-first-error added | Pass |
| QA-006 | P1 | Customer | Mobile cart | Local | Product details and controls overlapped at 390px. | Before screenshot | Responsive stacked item layout and named controls | Pass at 390px |
| QA-007 | P1 | Admin/Super Admin | Dashboard decision data | Local | Quick Stats/performance values were fabricated. | Dashboard DOM vs DB | Hard-coded metric blocks removed; revenue/order values use real APIs | Pass |
| QA-008 | P2 | All | Hydration | Local | Footer seal and reveal DOM caused React hydration mismatches. | Browser console | Deterministic seal JSX; animation dependency removed | Pass: no mismatch console errors |
| QA-009 | P2 | All | Accessible names | Local/production | Icon controls lacked names. | Accessible-name probe | Header, cart, mini-cart, and Admin controls labelled | Pass on covered flows |
| QA-010 | P2 | Visitor | Image performance | Local | Raw images and missing responsive sizing caused lint/runtime warnings. | Build/lint/browser console | Local logos migrated to Next Image; fill sizing added; domain-bound seal explicitly isolated | Pass: lint has zero warnings |
| QA-011 | P1 | Operator | Database seeding | Source | Seed could wipe data and embedded/printed reusable credentials. | `prisma/seed.ts` | Explicit destructive opt-in and required password environment variables; credential output removed | Pass by source verification |
| QA-012 | P1 | Customer/Operator | Sensitive logging | Source | Profile logged user enumeration/details; phone verification logged phone/code. | Static source review | Sensitive profile/OTP logs removed; dev OTP exposure requires explicit opt-in | Pass for identified paths |
| QA-013 | P2 | Operator | Database health reporting | Local | Migration retry appeared twice with false in-progress status. | Status command comparison | Latest attempt deduplicated and failed/rolled-back states distinguished | Pass: 18 unique applied migrations match Prisma |
| QA-014 | P2 | Admin | Admin localization/currency | Local | Admin content/statuses are incompletely localized and currency labels were inconsistent. | Admin route sweep | Central price formatter used; English label corrected to Toman; lifecycle heading consumes locale messages | Partial: several legacy Admin components still contain Persian fallback/content |
| QA-015 | P2 | Customer | Empty wishlist | Local | Empty recovery state was inconsistent during account loading. | Customer panel sweep | Verified stable empty explanation and Shop recovery action; centralized Toman formatting | Pass |
| QA-016 | P2 | Visitor | Production SEO parity | Production | Live `/fa/shop` lacks a route canonical and points hreflang alternates at locale homepages; local hardening already has passing coverage. | Read-only live DOM vs local E2E | Implemented locally in prior batch | 10 public tests pass locally |
| QA-017 | P2 | Engineering | Quality gates | Local | Lint used deprecated `next lint`; Prisma package configuration is deprecated for Prisma 7. | lint/migration output | Lint migrated to ESLint CLI with generated-output ignores | Lint pass; Prisma 7 config migration remains low-risk debt |
| QA-018 | P2 | Engineering | Regression depth | Local | Initial E2E covered only public pages. | Test inventory | Added authenticated role, checkout, localization, hydration, a11y, mutation, mobile, and admin integrity coverage | Pass: 20/20 |
| QA-019 | P2 | Admin | Mobile horizontal overflow | Local | Off-canvas Admin sidebar increased the 390px document width to 710px while closed. | Final responsive recheck | Admin lifecycle applies document-level horizontal clipping while mounted | Pass: 390/390 CSS pixels |
| QA-020 | P2 | Customer/Admin | Login transition | Local | Successful credentials could leave the visible URL on Login while the authenticated navigation was still resolving. | Retest trace | Successful login now performs a full destination navigation so server auth sees the cookie | Pass for Customer and Super Admin |

### Evidence freeze notes

- Clean-context role test confirms a Customer is redirected away from Admin; the earlier shared-browser result was discarded as stale-session evidence.
- Mobile layouts have no document-level horizontal overflow on the sampled public routes, and dark mode activates successfully.
- Anonymous checkout correctly redirects to login with a callback URL; Customer checkout stops before payment submission.
- All Admin routes load under Super Admin. External sends, refunds, real payment requests, and production writes were not executed by design.

## Cleanup ledger

| Record type | Identifier | Created for | Cleanup status |
| --- | --- | --- | --- |
| None | — | Read-only/non-destructive QA | No cleanup required |

## Health score

Scores reflect the verified local build and sampled production read-only checks. They are not a certification or penetration test.

| Dimension | Score | Rationale |
| --- | ---: | --- |
| Functional correctness | 92/100 | Core Visitor, Customer, and Admin sampled flows pass; external payment/message side effects intentionally excluded. |
| UI/UX consistency | 87/100 | Mobile cart/Admin overflow repaired; legacy Admin copy is still inconsistent. |
| Accessibility | 89/100 | Validation semantics and control names repaired; no formal assistive-technology/contrast certification. |
| Internationalization | 80/100 | Storefront data and document direction pass; legacy Admin localization remains incomplete. |
| Performance/resilience | 84/100 | No-JS and image fallbacks pass; Admin bundles remain large and dev runs showed external fetch timeouts. |
| Security/privacy | 86/100 | P0 authz closed, seed/logging hardened, critical advisories removed; six upstream advisories remain. |
| SEO/content integrity | 95/100 | Canonical/hreflang/sitemap/robots/legal/blog/image-fallback coverage passes locally; production needs deployment. |
| Test maintainability | 92/100 | 20 stable serial browser tests cover public and authenticated seams; external integrations remain mocked/excluded. |

**Overall sampled health: 88/100 — healthy for continued staging, not yet recommended for an unqualified production release until the framework/auth dependency migration and Admin localization debt are scheduled.**

## Final change log

- Hardened Product and Category mutation authorization.
- Made product grids permanently visible without JavaScript/reveal dependencies.
- Added route-aware locale semantics and localized catalog records.
- Repaired checkout validation, mobile cart layout, login transition, Admin mobile overflow, and accessible names.
- Removed fabricated Admin metrics and standardized real price formatting.
- Made trust-seal hydration deterministic and improved responsive image handling/fallbacks.
- Added route-specific metadata, canonical/hreflang, sitemap/robots, legal/blog destinations, and broken-image resilience.
- Guarded destructive seeding, removed embedded/output credentials, and reduced sensitive OTP/profile logging.
- Updated dependencies and reduced production advisories from 39 to 6, with zero critical advisories.
- Corrected migration health reporting and migrated lint to the supported ESLint CLI.
- Added 20 Playwright regressions; final result: 20 passed.
- Verification: TypeScript pass, lint pass with zero warnings, production build pass, 18/18 migrations current, database health 100/100, and baseline data counts unchanged (2 users, 3 products, 7 categories, 1 order, 2 articles, 0 reviews).
