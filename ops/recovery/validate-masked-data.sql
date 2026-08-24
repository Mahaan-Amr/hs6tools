\set ON_ERROR_STOP on

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE email NOT LIKE '%@masked.invalid') THEN
    RAISE EXCEPTION 'unmasked user email remains';
  END IF;

  IF EXISTS (
    SELECT 1 FROM users
    WHERE (phone IS NOT NULL AND phone NOT LIKE '090%')
       OR "firstName" <> 'Masked'
       OR "passwordHash" NOT LIKE '!staging-login-disabled-%'
       OR cardinality(tags) <> 0
       OR (notes IS NOT NULL AND notes <> '[masked]')
  ) THEN
    RAISE EXCEPTION 'unmasked user personal data remains';
  END IF;

  IF EXISTS (SELECT 1 FROM leads WHERE email NOT LIKE '%@masked.invalid') THEN
    RAISE EXCEPTION 'unmasked lead email remains';
  END IF;

  IF EXISTS (
    SELECT 1 FROM leads
    WHERE (phone IS NOT NULL AND phone NOT LIKE '091%')
       OR "firstName" <> 'Masked'
       OR cardinality(tags) <> 0
       OR (notes IS NOT NULL AND notes <> '[masked]')
  ) THEN
    RAISE EXCEPTION 'unmasked lead personal data remains';
  END IF;

  IF EXISTS (
    SELECT 1 FROM addresses
    WHERE phone NOT LIKE '090%'
       OR "firstName" <> 'Masked'
       OR "addressLine1" NOT LIKE 'Masked street %'
  ) THEN
    RAISE EXCEPTION 'unmasked address data remains';
  END IF;

  IF EXISTS (
    SELECT 1 FROM orders
    WHERE "customerEmail" NOT LIKE '%@masked.invalid'
       OR ("customerPhone" IS NOT NULL AND "customerPhone" NOT LIKE '093%')
       OR ("customerNote" IS NOT NULL AND "customerNote" <> '[masked]')
       OR ("trackingNumber" IS NOT NULL AND "trackingNumber" NOT LIKE 'MASKED-%')
       OR "paymentId" IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'unmasked order personal or payment data remains';
  END IF;

  IF EXISTS (SELECT 1 FROM email_settings WHERE "isActive" OR "smtpPassword" <> '') THEN
    RAISE EXCEPTION 'email external effects remain enabled';
  END IF;

  IF EXISTS (
    SELECT 1 FROM payment_settings
    WHERE "zarinpalMerchantId" <> ''
       OR "zarinpalApiKey" <> ''
       OR NOT "zarinpalSandbox"
       OR "allowBankTransfer"
       OR "allowCashOnDelivery"
  ) THEN
    RAISE EXCEPTION 'payment external effects remain enabled';
  END IF;

  IF EXISTS (SELECT 1 FROM verification_codes WHERE NOT used OR "expiresAt" > now()) THEN
    RAISE EXCEPTION 'active verification code remains';
  END IF;
END
$$;
