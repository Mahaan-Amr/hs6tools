export function sanitizePaymentSettings(settings: {
  zarinpalApiKey: string;
  [key: string]: unknown;
}) {
  const { zarinpalApiKey, ...safeSettings } = settings;
  return {
    ...safeSettings,
    zarinpalApiKeyConfigured: zarinpalApiKey.trim().length > 0,
  };
}

export function sanitizeEmailSettings(settings: {
  smtpPassword: string;
  [key: string]: unknown;
}) {
  const { smtpPassword, ...safeSettings } = settings;
  return {
    ...safeSettings,
    smtpPasswordConfigured: smtpPassword.length > 0,
  };
}
