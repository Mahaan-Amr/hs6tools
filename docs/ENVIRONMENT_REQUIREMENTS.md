# Environment Requirements and Exposure Review

## Public vs Server-Only
- Public vars must be prefixed `NEXT_PUBLIC_` and are exposed to the client.
- Server-only vars must NOT be prefixed and should only be read on the server.

## Currently Used Public Vars
- `NEXT_PUBLIC_APP_URL` (used for redirects/origin checks in payment flows).
- (Avoid using `NEXT_PUBLIC_KAVENEGAR_API_KEY`; prefer server-only `KAVENEGAR_API_KEY`.)

## Server-Only Vars (should NOT be exposed)
- `KAVENEGAR_API_KEY` (SMS)
- `KAVENEGAR_API_TOKEN` (alternative SMS key)
- `ZARINPAL_MERCHANT_ID`
- `DATABASE_URL` (Prisma)
- `NEXTAUTH_SECRET`
- Any payment/webhook secrets and signing keys

## Actions
- Prefer `KAVENEGAR_API_KEY` (server-only) over `NEXT_PUBLIC_KAVENEGAR_API_KEY`.
- Ensure `.env` files are not committed; `.env*` should remain local/secret.
- Keep `NEXT_PUBLIC_APP_URL` only if truly needed client-side; otherwise use server-only origin on the server.

## Recommended .env.example (server)
```
KAVENEGAR_API_KEY=your_key
ZARINPAL_MERCHANT_ID=your_merchant_id
NEXTAUTH_SECRET=your_nextauth_secret
DATABASE_URL=your_database_url
NEXT_PUBLIC_APP_URL=https://hs6tools.com  # Only if needed on client
```

