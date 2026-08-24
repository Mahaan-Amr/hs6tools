\set ON_ERROR_STOP on

BEGIN;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS sequence
  FROM users
)
UPDATE users AS target
SET email = 'user+' || md5(target.id) || '@masked.invalid',
    phone = CASE
      WHEN target.phone IS NULL THEN NULL
      ELSE '090' || lpad(numbered.sequence::text, 8, '0')
    END,
    "firstName" = 'Masked',
    "lastName" = 'User-' || substr(md5(target.id), 1, 8),
    "passwordHash" = '!staging-login-disabled-' || md5(target.id),
    avatar = NULL,
    "dateOfBirth" = NULL,
    company = CASE WHEN target.company IS NULL THEN NULL ELSE 'Masked Company' END,
    position = CASE WHEN target.position IS NULL THEN NULL ELSE 'Masked Position' END,
    industry = CASE WHEN target.industry IS NULL THEN NULL ELSE '[masked]' END,
    tags = ARRAY[]::text[],
    notes = CASE WHEN target.notes IS NULL THEN NULL ELSE '[masked]' END,
    "assignedSalesRep" = NULL,
    "leadSource" = CASE WHEN target."leadSource" IS NULL THEN NULL ELSE 'MASKED' END
FROM numbered
WHERE target.id = numbered.id;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS sequence
  FROM addresses
)
UPDATE addresses AS target
SET title = 'Masked address',
    "firstName" = 'Masked',
    "lastName" = 'Recipient-' || substr(md5(target.id), 1, 8),
    company = CASE WHEN target.company IS NULL THEN NULL ELSE 'Masked Company' END,
    "addressLine1" = 'Masked street ' || numbered.sequence,
    "addressLine2" = CASE WHEN target."addressLine2" IS NULL THEN NULL ELSE '[masked]' END,
    city = 'Masked City',
    state = 'Masked State',
    "postalCode" = lpad(numbered.sequence::text, 10, '0'),
    country = 'IR',
    phone = '090' || lpad(numbered.sequence::text, 8, '0')
FROM numbered
WHERE target.id = numbered.id;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS sequence
  FROM leads
)
UPDATE leads AS target
SET "firstName" = 'Masked',
    "lastName" = 'Lead-' || substr(md5(target.id), 1, 8),
    email = 'lead+' || md5(target.id) || '@masked.invalid',
    phone = CASE
      WHEN target.phone IS NULL THEN NULL
      ELSE '091' || lpad(numbered.sequence::text, 8, '0')
    END,
    company = CASE WHEN target.company IS NULL THEN NULL ELSE 'Masked Company' END,
    position = CASE WHEN target.position IS NULL THEN NULL ELSE 'Masked Position' END,
    industry = CASE WHEN target.industry IS NULL THEN NULL ELSE '[masked]' END,
    "assignedTo" = NULL,
    notes = CASE WHEN target.notes IS NULL THEN NULL ELSE '[masked]' END,
    tags = ARRAY[]::text[]
FROM numbered
WHERE target.id = numbered.id;

UPDATE customer_interactions
SET subject = CASE WHEN subject IS NULL THEN NULL ELSE '[masked]' END,
    content = '[masked]',
    outcome = CASE WHEN outcome IS NULL THEN NULL ELSE '[masked]' END,
    "nextAction" = CASE WHEN "nextAction" IS NULL THEN NULL ELSE '[masked]' END;

UPDATE lead_interactions
SET subject = CASE WHEN subject IS NULL THEN NULL ELSE '[masked]' END,
    content = '[masked]',
    outcome = CASE WHEN outcome IS NULL THEN NULL ELSE '[masked]' END,
    "nextAction" = CASE WHEN "nextAction" IS NULL THEN NULL ELSE '[masked]' END;

UPDATE tickets
SET subject = '[masked support request]';

UPDATE ticket_messages
SET body = '[masked]';

UPDATE ticket_attachments
SET url = '/masked/attachment-unavailable',
    name = 'masked-attachment',
    type = 'application/octet-stream';

UPDATE reviews
SET title = CASE WHEN title IS NULL THEN NULL ELSE '[masked]' END,
    content = '[masked review]';

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS sequence
  FROM orders
)
UPDATE orders AS target
SET "customerEmail" = 'order+' || md5(target.id) || '@masked.invalid',
    "customerPhone" = CASE
      WHEN target."customerPhone" IS NULL THEN NULL
      ELSE '093' || lpad(numbered.sequence::text, 8, '0')
    END,
    "customerNote" = CASE WHEN target."customerNote" IS NULL THEN NULL ELSE '[masked]' END,
    "trackingNumber" = CASE
      WHEN target."trackingNumber" IS NULL THEN NULL
      ELSE 'MASKED-' || substr(md5(target.id), 1, 12)
    END,
    "paymentId" = NULL
FROM numbered
WHERE target.id = numbered.id;

WITH numbered AS (
  SELECT id, row_number() OVER (ORDER BY id) AS sequence
  FROM verification_codes
)
UPDATE verification_codes AS target
SET phone = CASE
      WHEN target.phone IS NULL THEN NULL
      ELSE '092' || lpad(numbered.sequence::text, 8, '0')
    END,
    email = CASE
      WHEN target.email IS NULL THEN NULL
      ELSE 'verification+' || md5(target.id) || '@masked.invalid'
    END,
    code = '000000',
    "expiresAt" = TIMESTAMPTZ '2000-01-01 00:00:00+00',
    used = true,
    "usedAt" = COALESCE(target."usedAt", TIMESTAMPTZ '2000-01-01 00:00:00+00')
FROM numbered
WHERE target.id = numbered.id;

UPDATE email_settings
SET "smtpHost" = 'disabled.invalid',
    "smtpUser" = '',
    "smtpPassword" = '',
    "fromEmail" = 'noreply@masked.invalid',
    "isActive" = false;

UPDATE payment_settings
SET "zarinpalMerchantId" = '',
    "zarinpalApiKey" = '',
    "zarinpalSandbox" = true,
    "allowBankTransfer" = false,
    "allowCashOnDelivery" = false;

UPDATE system_settings
SET "contactEmail" = 'support@masked.invalid',
    "contactPhone" = '+00000000000',
    "businessAddress" = CASE WHEN "businessAddress" IS NULL THEN NULL ELSE '[masked]' END;

COMMIT;
