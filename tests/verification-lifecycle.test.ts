import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import {
  createVerificationLifecycle,
  type VerificationChallenge,
  type VerificationPurpose,
  type VerificationStore,
} from "../src/lib/verification-lifecycle";
import { createRegistrationHandler } from "../src/lib/registration-handler";
import { POST as register } from "../src/app/api/auth/register/route";
import { trustedClientIp } from "../src/lib/verification-rate-limit";

class MemoryVerificationStore implements VerificationStore<void> {
  private challenge: VerificationChallenge | null = null;

  async issue(next: VerificationChallenge, cooldownCutoff: Date) {
    if (
      this.challenge &&
      this.challenge.recipient === next.recipient &&
      this.challenge.purpose === next.purpose &&
      !this.challenge.usedAt &&
      this.challenge.createdAt > cooldownCutoff
    ) {
      return false;
    }
    this.challenge = next;
    return true;
  }

  async verify(input: {
    recipient: string;
    purpose: VerificationPurpose;
    codeDigest: string;
    proofDigest: string;
    now: Date;
  }) {
    const challenge = this.challenge;
    if (
      !challenge ||
      challenge.recipient !== input.recipient ||
      challenge.purpose !== input.purpose ||
      challenge.codeDigest !== input.codeDigest ||
      challenge.attempts >= 5 ||
      challenge.proofDigest ||
      challenge.usedAt ||
      challenge.expiresAt <= input.now
    ) {
      if (
        challenge &&
        challenge.recipient === input.recipient &&
        challenge.purpose === input.purpose &&
        !challenge.proofDigest &&
        !challenge.usedAt &&
        challenge.expiresAt > input.now
      ) {
        challenge.attempts += 1;
      }
      return false;
    }
    challenge.attempts += 1;
    challenge.proofDigest = input.proofDigest;
    challenge.verifiedAt = input.now;
    return true;
  }

  async consume<T>(
    input: {
      recipient: string;
      purpose: VerificationPurpose;
      proofDigest: string;
      now: Date;
    },
    action: (transaction: void) => Promise<T>,
  ) {
    const challenge = this.challenge;
    if (
      !challenge ||
      challenge.recipient !== input.recipient ||
      challenge.purpose !== input.purpose ||
      challenge.proofDigest !== input.proofDigest ||
      !challenge.verifiedAt ||
      challenge.usedAt ||
      challenge.expiresAt <= input.now
    ) {
      return null;
    }
    challenge.usedAt = input.now;
    return action(undefined);
  }

  async invalidate(codeDigest: string, now: Date) {
    if (this.challenge?.codeDigest === codeDigest && !this.challenge.usedAt) {
      this.challenge.usedAt = now;
    }
  }

  async cleanup(now: Date, consumedBefore: Date) {
    if (
      this.challenge &&
      (this.challenge.expiresAt <= now ||
        (!!this.challenge.usedAt && this.challenge.usedAt <= consumedBefore))
    ) {
      this.challenge = null;
      return 1;
    }
    return 0;
  }
}

function fixture(now = new Date("2026-08-24T10:00:00.000Z")) {
  let clock = now;
  let token = 0;
  const store = new MemoryVerificationStore();
  const lifecycle = createVerificationLifecycle<void>(store, {
    secret: "test-secret-with-enough-entropy",
    now: () => clock,
    createCode: () => "123456",
    createProof: () => `proof-${++token}`,
  });
  return { lifecycle, store, setNow: (value: Date) => (clock = value) };
}

test("successful registration consumes a server-issued proof exactly once", async () => {
  const { lifecycle } = fixture();
  const issued = await lifecycle.issue("09123456789", "PHONE_VERIFICATION");
  assert.equal(issued.status, "issued");
  assert.equal(issued.code, "123456");

  const verified = await lifecycle.verify(
    "09123456789",
    "PHONE_VERIFICATION",
    "123456",
  );
  assert.equal(verified.status, "verified");

  let registrations = 0;
  const first = await lifecycle.consume(
    "09123456789",
    "PHONE_VERIFICATION",
    verified.proof,
    async () => ++registrations,
  );
  const replay = await lifecycle.consume(
    "09123456789",
    "PHONE_VERIFICATION",
    verified.proof,
    async () => ++registrations,
  );

  assert.deepEqual(first, { status: "consumed", value: 1 });
  assert.deepEqual(replay, { status: "invalid" });
  assert.equal(registrations, 1);
});

test("verification rejects expiry, wrong purpose, and wrong recipient", async () => {
  const { lifecycle, setNow } = fixture();
  await lifecycle.issue("09123456789", "PHONE_VERIFICATION");

  assert.deepEqual(
    await lifecycle.verify("09999999999", "PHONE_VERIFICATION", "123456"),
    { status: "invalid" },
  );
  assert.deepEqual(
    await lifecycle.verify("09123456789", "PASSWORD_RESET", "123456"),
    { status: "invalid" },
  );

  setNow(new Date("2026-08-24T10:05:00.001Z"));
  assert.deepEqual(
    await lifecycle.verify("09123456789", "PHONE_VERIFICATION", "123456"),
    { status: "invalid" },
  );
});

test("concurrent verification and registration allow only one winner", async () => {
  const { lifecycle } = fixture();
  await lifecycle.issue("09123456789", "PHONE_VERIFICATION");

  const verificationResults = await Promise.all([
    lifecycle.verify("09123456789", "PHONE_VERIFICATION", "123456"),
    lifecycle.verify("09123456789", "PHONE_VERIFICATION", "123456"),
  ]);
  const winner = verificationResults.find(
    (result) => result.status === "verified",
  );
  assert.equal(
    verificationResults.filter((result) => result.status === "verified").length,
    1,
  );
  assert.ok(winner && winner.status === "verified");

  const registrationResults = await Promise.all([
    lifecycle.consume(
      "09123456789",
      "PHONE_VERIFICATION",
      winner.proof,
      async () => "first",
    ),
    lifecycle.consume(
      "09123456789",
      "PHONE_VERIFICATION",
      winner.proof,
      async () => "second",
    ),
  ]);
  assert.equal(
    registrationResults.filter((result) => result.status === "consumed").length,
    1,
  );
});

test("concurrent password resets consume a purpose-bound code once", async () => {
  const { lifecycle } = fixture();
  await lifecycle.issue("09123456789", "PASSWORD_RESET");
  const verified = await lifecycle.verify(
    "09123456789",
    "PASSWORD_RESET",
    "123456",
  );
  assert.equal(verified.status, "verified");
  if (verified.status !== "verified") return;

  const results = await Promise.all([
    lifecycle.consume(
      "09123456789",
      "PASSWORD_RESET",
      verified.proof,
      async () => "first",
    ),
    lifecycle.consume(
      "09123456789",
      "PASSWORD_RESET",
      verified.proof,
      async () => "second",
    ),
  ]);
  assert.equal(
    results.filter((result) => result.status === "consumed").length,
    1,
  );
});

test("recipient issuance is throttled and cleanup preserves active challenges", async () => {
  const { lifecycle, setNow } = fixture();
  assert.equal(
    (await lifecycle.issue("09123456789", "PHONE_VERIFICATION")).status,
    "issued",
  );
  assert.deepEqual(await lifecycle.issue("09123456789", "PHONE_VERIFICATION"), {
    status: "throttled",
  });

  assert.equal(await lifecycle.cleanup(), 0);
  setNow(new Date("2026-08-24T10:06:00.000Z"));
  assert.equal(await lifecycle.cleanup(), 1);
});

test("provider failure invalidates only the code that failed delivery", async () => {
  const { lifecycle } = fixture();
  const issued = await lifecycle.issue("09123456789", "PHONE_VERIFICATION");
  assert.equal(issued.status, "issued");
  await lifecycle.invalidate("09123456789", "PHONE_VERIFICATION", issued.code);

  assert.deepEqual(
    await lifecycle.verify("09123456789", "PHONE_VERIFICATION", issued.code),
    { status: "invalid" },
  );
});

test("verification locks a challenge after five wrong codes", async () => {
  const { lifecycle } = fixture();
  await lifecycle.issue("09123456789", "PHONE_VERIFICATION");
  for (let attempt = 0; attempt < 5; attempt += 1) {
    assert.deepEqual(
      await lifecycle.verify("09123456789", "PHONE_VERIFICATION", "999999"),
      { status: "invalid" },
    );
  }
  assert.deepEqual(
    await lifecycle.verify("09123456789", "PHONE_VERIFICATION", "123456"),
    { status: "invalid" },
  );
});

test("verification rate limits use the proxy-appended client address", () => {
  const headers = new Headers({
    "x-forwarded-for": "198.51.100.8, 203.0.113.10",
    "x-real-ip": "203.0.113.10",
  });
  assert.equal(trustedClientIp(headers), "203.0.113.10");
});

test("registration rejects a client-supplied verified flag without a server proof", async () => {
  const response = await register(
    new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "localhost",
        origin: "http://localhost",
      },
      body: JSON.stringify({
        email: "customer@example.com",
        password: "correct-horse-battery-staple",
        firstName: "Test",
        lastName: "Customer",
        phone: "09123456789",
        phoneVerified: true,
      }),
    }),
  );

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "Validation error");
});

test("registration HTTP flow succeeds only when the server proof is consumed", async () => {
  let proofConsumed = false;
  let welcomeSent = false;
  const handler = createRegistrationHandler({
    hashPassword: async () => "hashed-password",
    async createVerifiedUser(data, passwordHash) {
      assert.equal(data.verificationProof, "server-proof-that-is-long-enough");
      assert.equal(passwordHash, "hashed-password");
      proofConsumed = true;
      return {
        id: "customer-1",
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: "CUSTOMER",
        isActive: true,
        emailVerified: false,
        phoneVerified: true,
        createdAt: new Date("2026-08-24T10:00:00.000Z"),
      };
    },
    sendWelcome() {
      welcomeSent = true;
    },
  });
  const response = await handler(
    new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "localhost",
        origin: "http://localhost",
        "x-real-ip": "192.0.2.10",
      },
      body: JSON.stringify({
        email: "customer@example.com",
        password: "correct-horse-battery-staple",
        firstName: "Test",
        lastName: "Customer",
        phone: "09123456789",
        verificationProof: "server-proof-that-is-long-enough",
      }),
    }),
  );

  assert.equal(response.status, 201);
  assert.equal(proofConsumed, true);
  assert.equal(welcomeSent, true);
  assert.equal((await response.json()).user.phoneVerified, true);
});
