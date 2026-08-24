import assert from "node:assert/strict";
import { after, before, mock, test } from "node:test";
import { UserRole } from "@prisma/client";

const enabled = process.env.SETTINGS_INTEGRATION_DATABASE === "true";
let sessionUser: { id: string } | null = null;

const mockedNextAuth = Object.assign(() => null, {
  getServerSession: async () =>
    sessionUser ? { user: sessionUser } : null,
});

mock.module("next-auth", { defaultExport: mockedNextAuth });

const testUserIds = {
  customer: "settings-test-customer",
  admin: "settings-test-admin",
  superAdmin: "settings-test-super-admin",
};

const request = (method: "POST" | "PUT", body?: unknown) =>
  new Request("http://localhost/api/settings/test", {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

async function cleanup() {
  if (!enabled) return;
  const { prisma } = await import("../src/lib/prisma");
  await prisma.settingsAuditLog.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.paymentSettings.deleteMany();
  await prisma.emailSettings.deleteMany();
  await prisma.user.deleteMany({ where: { id: { in: Object.values(testUserIds) } } });
}

before(async () => {
  if (!enabled) return;
  const { prisma } = await import("../src/lib/prisma");
  await cleanup();
  for (const [name, role] of [
    ["customer", UserRole.CUSTOMER],
    ["admin", UserRole.ADMIN],
    ["superAdmin", UserRole.SUPER_ADMIN],
  ] as const) {
    await prisma.user.create({
      data: {
        id: testUserIds[name],
        email: `${name}@settings.test.invalid`,
        firstName: "Settings",
        lastName: "Test",
        passwordHash: "not-used",
        role,
        tags: [],
      },
    });
  }
});

after(async () => {
  if (!enabled) return;
  const { prisma } = await import("../src/lib/prisma");
  await cleanup();
  await prisma.$disconnect();
});

test(
  "real Settings routes enforce current roles, pure reads, audited initialization, and redaction",
  { skip: !enabled },
  async () => {
    const { prisma } = await import("../src/lib/prisma");
    const system = await import("../src/app/api/settings/system/route");
    const payment = await import("../src/app/api/settings/payment/route");
    const email = await import("../src/app/api/settings/email/route");
    const routes = [system, payment, email];

    sessionUser = null;
    for (const route of routes) assert.equal((await route.GET()).status, 401);

    for (const id of [testUserIds.customer, testUserIds.admin]) {
      sessionUser = { id };
      for (const route of routes) {
        assert.equal((await route.GET()).status, 403);
        assert.equal((await route.POST(request("POST"))).status, 403);
      }
    }

    sessionUser = { id: testUserIds.superAdmin };
    for (const route of routes) {
      const response = await route.GET();
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        success: true,
        data: null,
        initialized: false,
      });
    }
    assert.equal(await prisma.systemSettings.count(), 0);
    assert.equal(await prisma.paymentSettings.count(), 0);
    assert.equal(await prisma.emailSettings.count(), 0);
    assert.equal(await prisma.settingsAuditLog.count(), 0);

    for (const route of routes) {
      assert.equal((await route.POST(request("POST"))).status, 200);
      assert.equal((await route.POST(request("POST"))).status, 200);
    }
    assert.equal(await prisma.systemSettings.count(), 1);
    assert.equal(await prisma.paymentSettings.count(), 1);
    assert.equal(await prisma.emailSettings.count(), 1);
    assert.equal(await prisma.settingsAuditLog.count(), 3);

    const paymentResponse = await payment.PUT(
      request("PUT", {
        zarinpalMerchantId: "merchant",
        zarinpalApiKey: "payment-secret",
        zarinpalSandbox: true,
        allowBankTransfer: true,
        allowCashOnDelivery: true,
        minimumOrderAmount: 0,
        maximumOrderAmount: 100,
      }),
    );
    const emailResponse = await email.PUT(
      request("PUT", {
        smtpHost: "smtp.test.invalid",
        smtpPort: 587,
        smtpUser: "mailer",
        smtpPassword: "email-secret",
        fromEmail: "mailer@settings.test.invalid",
        fromName: "Settings Test",
        enableSSL: true,
        isActive: true,
      }),
    );
    for (const [response, configuredField] of [
      [paymentResponse, "zarinpalApiKeyConfigured"],
      [emailResponse, "smtpPasswordConfigured"],
    ] as const) {
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.data[configuredField], true);
      assert.equal(JSON.stringify(body).includes("secret"), false);
    }

    await prisma.user.update({
      where: { id: testUserIds.superAdmin },
      data: { role: UserRole.ADMIN },
    });
    assert.equal((await system.GET()).status, 403);
    await prisma.user.update({
      where: { id: testUserIds.superAdmin },
      data: { isActive: false },
    });
    assert.equal((await system.GET()).status, 401);
  },
);
