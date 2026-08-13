function requiredCredential(name: string, localFallback: string) {
  const configured = process.env[name];
  if (configured) return configured;

  if (process.env.CI || process.env.PLAYWRIGHT_BASE_URL) {
    throw new Error(
      `${name} is required for CI and external Playwright targets.`,
    );
  }

  return localFallback;
}

export const customerCredentials = {
  email: requiredCredential("E2E_CUSTOMER_EMAIL", "user@hs6tools.com"),
  password: requiredCredential("E2E_CUSTOMER_PASSWORD", "User123!"),
};

export const adminCredentials = {
  email: requiredCredential("E2E_ADMIN_EMAIL", "admin@hs6tools.com"),
  password: requiredCredential("E2E_ADMIN_PASSWORD", "Admin123!"),
};
