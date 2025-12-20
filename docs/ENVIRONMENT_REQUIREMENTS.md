# Environment Requirements and Exposure Review

## Public vs Server-Only
- Public vars must be prefixed `NEXT_PUBLIC_` and are exposed to the client.
- Server-only vars must NOT be prefixed and should only be read on the server.

## Currently Used Public Vars
- `NEXT_PUBLIC_APP_URL` (used for redirects/origin checks in payment flows).
- (Avoid using `NEXT_PUBLIC_KAVENEGAR_API_KEY`; prefer server-only `KAVENEGAR_API_KEY`.)

## Server-Only Vars (should NOT be exposed)

### SMS Service (SMS.ir - Priority)
- `SMSIR_API_KEY` (SMS.ir API key - required)
- `SMSIR_SECRET_KEY` (SMS.ir secret key - optional, only if required by account)
- `SMSIR_VERIFY_TEMPLATE_ID` (Template ID for verification codes - required)
- `SMSIR_PASSWORD_RESET_TEMPLATE_ID` (Template ID for password reset - optional)
- `SMSIR_LINE_NUMBER` (Sender line number - optional, uses default if not set)

### SMS Service (Kavenegar - Fallback)
- `KAVENEGAR_API_KEY` (Kavenegar API key)
- `KAVENEGAR_API_TOKEN` (alternative Kavenegar API key)
- `KAVENEGAR_SENDER` (Sender number, default: 2000660110)

### Payment
- `ZARINPAL_MERCHANT_ID`

### Database & Auth
- `DATABASE_URL` (Prisma)
- `NEXTAUTH_SECRET`

### Other
- Any payment/webhook secrets and signing keys

## Actions
- **SMS Provider Priority:** SMS.ir (if `SMSIR_API_KEY` is set) > Kavenegar (if `KAVENEGAR_API_KEY` is set)
- Prefer `KAVENEGAR_API_KEY` (server-only) over `NEXT_PUBLIC_KAVENEGAR_API_KEY`.
- Ensure `.env` files are not committed; `.env*` should remain local/secret.
- Keep `NEXT_PUBLIC_APP_URL` only if truly needed client-side; otherwise use server-only origin on the server.

## Recommended .env.example (server)

### Option 1: Using SMS.ir (Recommended)
```env
# SMS.ir Configuration
SMSIR_API_KEY=qr6OhgdzDXrmHeEhS3MrJ6PbDF4fxehV86y8QvhEzrQKRyFw
SMSIR_SECRET_KEY=  # Optional (new panels don't require it)
SMSIR_VERIFY_TEMPLATE_ID=408915
SMSIR_PASSWORD_RESET_TEMPLATE_ID=  # Optional (will use SMSIR_VERIFY_TEMPLATE_ID if not set)
SMSIR_LINE_NUMBER=  # Optional (will use default service number)

# Payment
ZARINPAL_MERCHANT_ID=your_merchant_id

# Auth & Database
NEXTAUTH_SECRET=your_nextauth_secret
DATABASE_URL=your_database_url

# Public (only if needed)
NEXT_PUBLIC_APP_URL=https://hs6tools.com
```

### Option 2: Using Kavenegar (Fallback)
```env
# Kavenegar Configuration
KAVENEGAR_API_KEY=your_key
KAVENEGAR_SENDER=2000660110

# Payment
ZARINPAL_MERCHANT_ID=your_merchant_id

# Auth & Database
NEXTAUTH_SECRET=your_nextauth_secret
DATABASE_URL=your_database_url

# Public (only if needed)
NEXT_PUBLIC_APP_URL=https://hs6tools.com
```

