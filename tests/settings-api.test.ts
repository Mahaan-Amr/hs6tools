import assert from "node:assert/strict";
import { test } from "node:test";
import {
  configureSettings,
  createRestrictedSettingsHandlers,
  initializeSettings,
  resolveSettingsPrincipal,
} from "../src/lib/settings-api";
import {
  sanitizeEmailSettings,
  sanitizePaymentSettings,
} from "../src/lib/settings-redaction";

type TestSettings = {
  value: string;
  secret: string;
};

function request(method: string, body?: unknown) {
  return new Request("http://localhost/api/settings/test", {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function createHarness(role?: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN") {
  let settings: TestSettings | null = null;
  let initializationAudits = 0;
  let writes = 0;

  const handlers = createRestrictedSettingsHandlers<TestSettings, TestSettings>({
    getPrincipal: async () =>
      role ? { id: `${role.toLowerCase()}-1`, role } : null,
    read: async () => settings,
    initialize: () =>
      initializeSettings({
        read: async () => settings,
        create: async () => {
          if (settings) return { settings, created: false };
          if (!settings) {
            settings = { value: "default", secret: "" };
            writes += 1;
          }
          return { settings, created: true };
        },
        audit: async () => {
          initializationAudits += 1;
        },
      }),
    update: (input) =>
      configureSettings({
        read: async () => settings,
        write: async () => {
          settings = input;
          writes += 1;
          return settings;
        },
        audit: async () => {
          initializationAudits += 1;
        },
      }),
    sanitize: ({ secret: _secret, ...safe }) => ({
      ...safe,
      secretConfigured: Boolean(_secret),
    }),
  });

  return {
    handlers,
    seed(value: TestSettings) {
      settings = value;
    },
    clear() {
      settings = null;
    },
    state() {
      return { settings, initializationAudits, writes };
    },
  };
}

test("Visitor cannot read or mutate restricted Settings", async () => {
  const { handlers, state } = createHarness();

  for (const [method, call] of [
    ["GET", () => handlers.GET()],
    ["POST", () => handlers.POST(request("POST"))],
    ["PUT", () => handlers.PUT(request("PUT", { value: "changed", secret: "secret" }))],
  ] as const) {
    const response = await call();
    assert.equal(response.status, 401, `${method} should require authentication`);
  }

  assert.equal(state().writes, 0);
});

test("Customer and Admin cannot read or mutate Super Admin Settings", async () => {
  for (const role of ["CUSTOMER", "ADMIN"] as const) {
    const { handlers, state } = createHarness(role);

    for (const call of [
      () => handlers.GET(),
      () => handlers.POST(request("POST")),
      () => handlers.PUT(request("PUT", { value: "changed", secret: "secret" })),
    ]) {
      const response = await call();
      assert.equal(response.status, 403, `${role} should be forbidden`);
    }

    assert.equal(state().writes, 0);
  }
});

test("Super Admin read is side-effect free when Settings are absent", async () => {
  const { handlers, state } = createHarness("SUPER_ADMIN");

  const response = await handlers.GET();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { success: true, data: null, initialized: false });
  assert.deepEqual(state(), {
    settings: null,
    initializationAudits: 0,
    writes: 0,
  });
});

test("Super Admin initialization is explicit, idempotent, audited once, and secret-safe", async () => {
  const { handlers, state } = createHarness("SUPER_ADMIN");

  const first = await handlers.POST(request("POST"));
  const second = await handlers.POST(request("POST"));

  assert.deepEqual(await first.json(), {
    success: true,
    data: { value: "default", secretConfigured: false },
    initialized: true,
    created: true,
  });
  assert.deepEqual(await second.json(), {
    success: true,
    data: { value: "default", secretConfigured: false },
    initialized: true,
    created: false,
  });
  assert.equal(state().writes, 1);
  assert.equal(state().initializationAudits, 1);
});

test("first-time Super Admin configuration is audited once", async () => {
  const { handlers, state } = createHarness("SUPER_ADMIN");

  await handlers.PUT(request("PUT", { value: "first", secret: "one" }));
  await handlers.PUT(request("PUT", { value: "second", secret: "two" }));

  assert.equal(state().writes, 2);
  assert.equal(state().initializationAudits, 1);
});

test("a later Settings lifecycle initialization creates a new audit event", async () => {
  const { handlers, clear, state } = createHarness("SUPER_ADMIN");

  await handlers.POST(request("POST"));
  clear();
  await handlers.POST(request("POST"));

  assert.equal(state().writes, 2);
  assert.equal(state().initializationAudits, 2);
});

test("Settings authorization uses the current active account role", async () => {
  const staleSuperAdmin = { id: "staff-1", role: "SUPER_ADMIN" as const };

  assert.equal(
    await resolveSettingsPrincipal(staleSuperAdmin, async () => ({
      id: "staff-1",
      role: "SUPER_ADMIN",
      isActive: false,
    })),
    null,
  );
  assert.deepEqual(
    await resolveSettingsPrincipal(staleSuperAdmin, async () => ({
      id: "staff-1",
      role: "ADMIN",
      isActive: true,
    })),
    { id: "staff-1", role: "ADMIN" },
  );
});

test("Settings responses report secret presence without returning stored secrets", async () => {
  const { handlers, seed } = createHarness("SUPER_ADMIN");
  seed({ value: "configured", secret: "do-not-return" });

  const getResponse = await handlers.GET();
  const putResponse = await handlers.PUT(
    request("PUT", { value: "updated", secret: "new-secret" }),
  );

  for (const response of [getResponse, putResponse]) {
    const body = await response.json();
    assert.equal(JSON.stringify(body).includes("do-not-return"), false);
    assert.equal(JSON.stringify(body).includes("new-secret"), false);
    assert.equal(body.data.secretConfigured, true);
  }
});

test("Payment and email Settings use explicit safe secret representations", () => {
  const payment = sanitizePaymentSettings({
    zarinpalMerchantId: "merchant",
    zarinpalApiKey: "stored-payment-secret",
  });
  const email = sanitizeEmailSettings({
    smtpHost: "smtp.example.com",
    smtpPassword: "stored-email-secret",
  });

  assert.deepEqual(payment, {
    zarinpalMerchantId: "merchant",
    zarinpalApiKeyConfigured: true,
  });
  assert.deepEqual(email, {
    smtpHost: "smtp.example.com",
    smtpPasswordConfigured: true,
  });
  assert.equal(JSON.stringify({ payment, email }).includes("stored-"), false);
});
