import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  externalEffectsAreDisabled,
  externalEffectsDisabledError,
} from "../src/lib/external-effects";
import { requestPayment } from "../src/lib/zarinpal";
import { GET as getSmsDiagnostics } from "../src/app/api/admin/sms/test/route";
import { GET as getRecoverySmoke } from "../src/app/api/recovery/smoke/route";
import { NextRequest } from "next/server";

const originalValue = process.env.EXTERNAL_EFFECTS_DISABLED;
const originalSmokeToken = process.env.RECOVERY_SMOKE_TOKEN;
const originalExpectedDatabase = process.env.RECOVERY_EXPECTED_DATABASE;

function restoreEnvironment(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

afterEach(() => {
  restoreEnvironment("EXTERNAL_EFFECTS_DISABLED", originalValue);
  restoreEnvironment("RECOVERY_SMOKE_TOKEN", originalSmokeToken);
  restoreEnvironment("RECOVERY_EXPECTED_DATABASE", originalExpectedDatabase);
});

test("external effects remain enabled unless the recovery flag is explicitly true", () => {
  delete process.env.EXTERNAL_EFFECTS_DISABLED;
  assert.equal(externalEffectsAreDisabled(), false);

  process.env.EXTERNAL_EFFECTS_DISABLED = "false";
  assert.equal(externalEffectsAreDisabled(), false);
});

test("masked restore runtime disables every external-effect provider", () => {
  process.env.EXTERNAL_EFFECTS_DISABLED = "true";

  assert.equal(externalEffectsAreDisabled(), true);
  assert.deepEqual(externalEffectsDisabledError("payment"), {
    success: false,
    error: "payment is disabled in this environment",
  });
});

test("payment provider is not contacted when external effects are disabled", async () => {
  process.env.EXTERNAL_EFFECTS_DISABLED = "true";
  const originalFetch = globalThis.fetch;
  let contacted = false;
  globalThis.fetch = async () => {
    contacted = true;
    throw new Error("network should not be called");
  };

  try {
    const result = await requestPayment({
      merchantId: "x".repeat(36),
      amount: 10000,
      description: "masked restore test",
      callbackUrl: "https://masked.invalid/callback",
    });

    assert.equal(contacted, false);
    assert.deepEqual(result, {
      success: false,
      error: "payment is disabled in this environment",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Admin SMS diagnostics cannot bypass the masked-runtime kill switch", async () => {
  process.env.EXTERNAL_EFFECTS_DISABLED = "true";

  const response = await getSmsDiagnostics();

  assert.equal(response.status, 503);
});

test("recovery smoke endpoint is hidden without its dedicated runtime configuration", async () => {
  process.env.EXTERNAL_EFFECTS_DISABLED = "true";
  delete process.env.RECOVERY_SMOKE_TOKEN;
  delete process.env.RECOVERY_EXPECTED_DATABASE;

  const response = await getRecoverySmoke(
    new NextRequest("http://localhost/api/recovery/smoke"),
  );

  assert.equal(response.status, 404);
});
