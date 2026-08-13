# Next.js 16 and Auth.js Migration Plan

## Objective

Move HS6Tools from Next.js 15 / NextAuth.js 4 to supported Next.js 16 and modern Auth.js without mixing the migration into the current release-hardening branch. The migration must preserve Customer, Admin, and Super Admin behavior and reduce the six remaining production dependency advisories.

## Baseline

- Next.js 15.5.23, React 19.2, NextAuth.js 4.24.15, Prisma adapter 1.x.
- Twenty Playwright regressions currently pass.
- Remaining audit result: four high and two moderate advisories, rooted in Next.js 15's bundled PostCSS/Sharp and NextAuth.js 4's Nodemailer dependency.
- Auth uses credential sessions, role-bearing JWT/session callbacks, protected Admin layouts, locale-aware login redirects, and Prisma-backed users.

## Migration sequence

1. Create `codex/next16-authjs-migration` from the verified release commit. Do not combine this with content or feature work.
2. Record `npm audit --omit=dev --json`, bundle sizes, all route outputs, and the 20-test result as the comparison baseline.
3. Upgrade Node runtime declarations and CI to Node 20.9 or newer.
4. Run the official Next.js upgrade codemod, then review rather than blindly accept its diff.
5. Rename `src/middleware.ts` to `src/proxy.ts`, rename the exported handler to `proxy`, and verify locale redirects plus the `x-hs6-locale` request header.
6. Audit every `cookies`, `headers`, `draftMode`, `params`, and `searchParams` use for the required asynchronous APIs. Run `next typegen` and TypeScript after each route group.
7. Verify `next.config.ts` under Turbopack. Keep Webpack only as a temporary documented fallback if a plugin is incompatible.
8. Replace NextAuth.js 4 configuration with modern Auth.js exports (`auth`, route handlers, `signIn`, `signOut`). Preserve the Credentials provider and existing password verification.
9. Replace `getServerSession(authOptions)` call sites with `auth()` one vertical slice at a time: catalog mutations, Customer APIs, Admin APIs, then pages/layouts.
10. Preserve JWT/session fields (`id`, `role`) and validate Customer/Admin/Super Admin boundaries after each slice.
11. Upgrade the Prisma adapter only after session parity is green. Validate existing user/account/session data before any schema migration.
12. Decide whether email-provider support is required. If unused, remove the direct Nodemailer dependency; if required, configure current Nodemailer with no user-controlled raw/envelope/transport fields.
13. Run types, lint, build, Prisma validation/status, all Playwright tests, and production audit.
14. Deploy to an isolated staging database and hostname. Execute login, logout, session expiry, callback URL, Customer denial, Admin admission, and catalog mutation tests.
15. Promote only if audit improves, the 20 existing tests plus new Auth.js tests pass, and rollback has been rehearsed.

## Required new tests

- Customer and Super Admin credential login survive a full navigation and refresh.
- Logout invalidates the protected session.
- Unsafe callback URLs are rejected; safe locale-local callback URLs work.
- Expired/invalid sessions receive 401 from protected APIs.
- Customer cannot access Admin UI or Admin mutation APIs.
- Super Admin can access Admin UI and valid catalog mutations.
- Locale middleware/proxy preserves `fa`/`en`/`ar` language and direction.

## Rollback

- Keep the current release commit deployable and its lockfile immutable.
- Take a staging database snapshot before adapter/schema changes.
- Do not run destructive seed/reset commands during migration.
- Roll back application and migrations together if session compatibility or stored auth data changes.

## Sources

- Next.js 16 upgrade guide: https://nextjs.org/docs/app/guides/upgrading/version-16
- Next.js codemods: https://nextjs.org/docs/app/guides/upgrading/codemods
- Auth.js upgrade guide: https://authjs.dev/getting-started/migrating-to-v5
- Prisma configuration: https://www.prisma.io/docs/orm/v6/reference/prisma-config-reference
