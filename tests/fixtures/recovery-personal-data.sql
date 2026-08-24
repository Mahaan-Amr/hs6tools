INSERT INTO users (id, email, phone, "firstName", "lastName", "passwordHash", tags, notes, "updatedAt")
VALUES ('user-fixture', 'real.customer@example.com', '09123456789', 'Real', 'Customer', 'real-hash', ARRAY['vip'], 'private note', now());

INSERT INTO addresses (
  id, "userId", type, title, "firstName", "lastName", "addressLine1", city,
  state, "postalCode", country, phone, "updatedAt"
)
VALUES (
  'address-fixture', 'user-fixture', 'SHIPPING', 'Home', 'Real', 'Customer',
  'Private street', 'Tehran', 'Tehran', '1234567890', 'IR', '09123456789', now()
);

INSERT INTO orders (
  id, "orderNumber", "userId", "totalAmount", subtotal, "taxAmount", "shippingAmount",
  "discountAmount", "customerEmail", "customerPhone", "customerNote", "shippingAddressId",
  "paymentMethod", "paymentId", "trackingNumber", "updatedAt"
)
VALUES (
  'order-fixture', 'ORDER-PRIVATE', 'user-fixture', 110000, 100000, 0, 10000,
  0, 'real.customer@example.com', '09123456789', 'private delivery note', 'address-fixture',
  'ZARINPAL', 'real-payment-id', 'real-tracking-number', now()
);

INSERT INTO leads (
  id, "firstName", "lastName", email, phone, source, status, notes, tags, "updatedAt"
)
VALUES (
  'lead-fixture', 'Private', 'Lead', 'lead@example.com', '09999999999',
  'WEBSITE', 'NEW', 'private lead note', ARRAY['private'], now()
);

INSERT INTO verification_codes (
  id, phone, email, code, type, "expiresAt"
)
VALUES (
  'verification-fixture', '09123456789', 'real.customer@example.com', '123456',
  'PASSWORD_RESET', now() + interval '1 hour'
);

INSERT INTO email_settings (id, "smtpPassword", "isActive", "updatedAt")
VALUES ('email-fixture', 'real-smtp-secret', true, now());

INSERT INTO payment_settings (
  id, "zarinpalMerchantId", "zarinpalApiKey", "zarinpalSandbox",
  "allowBankTransfer", "allowCashOnDelivery", "updatedAt"
)
VALUES ('payment-fixture', 'real-merchant', 'real-api-key', false, true, true, now());

INSERT INTO system_settings (
  id, "contactEmail", "contactPhone", "businessAddress", "updatedAt"
)
VALUES ('system-fixture', 'owner@example.com', '+989121234567', 'Private office', now());
