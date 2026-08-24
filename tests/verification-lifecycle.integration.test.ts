import assert from "node:assert/strict";
import { randomInt } from "node:crypto";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { createVerificationLifecycle } from "../src/lib/verification-lifecycle";

const databaseUrl = process.env.VERIFICATION_TEST_DATABASE_URL;

test(
  "real Postgres lifecycle and registration HTTP flow are atomic",
  {
    skip: databaseUrl
      ? false
      : "VERIFICATION_TEST_DATABASE_URL is not configured",
  },
  async () => {
    process.env.DATABASE_URL = databaseUrl;
    process.env.NEXTAUTH_SECRET = "integration-test-secret-with-enough-entropy";
    process.env.EXTERNAL_EFFECTS_DISABLED = "true";

    const [
      { PrismaClient },
      { prismaVerificationStore },
      { createRegistrationHandler },
      { checkVerificationRateLimit },
      { createPhoneVerificationIssuanceHandler },
      { POST: verifyRegistration },
    ] = await Promise.all([
      import("@prisma/client"),
      import("../src/lib/prisma-verification-store"),
      import("../src/lib/registration-handler"),
      import("../src/lib/verification-rate-limit"),
      import("../src/lib/phone-verification-issuance-handler"),
      import("../src/app/api/auth/verify-phone/registration/route"),
    ]);
    const cleanupClient = new PrismaClient();
    const phone = `09${randomInt(100_000_000, 1_000_000_000)}`;
    const concurrentPhone = `09${randomInt(100_000_000, 1_000_000_000)}`;
    const expiredPhone = `09${randomInt(100_000_000, 1_000_000_000)}`;
    const bindingPhone = `09${randomInt(100_000_000, 1_000_000_000)}`;
    const wrongPhone =
      bindingPhone === "09111111111" ? "09222222222" : "09111111111";
    const email = `verification-${Date.now()}@example.test`;
    let clock = new Date();
    let nextCode = "123456";
    const lifecycle = createVerificationLifecycle(prismaVerificationStore, {
      secret: process.env.NEXTAUTH_SECRET,
      now: () => clock,
      createCode: () => nextCode,
      createProof: () =>
        `proof-${randomInt(1_000_000_000)}-with-sufficient-entropy`,
    });

    try {
      assert.equal(
        await checkVerificationRateLimit(
          "integration",
          phone,
          2,
          60_000,
          clock,
        ),
        true,
      );
      assert.equal(
        await checkVerificationRateLimit(
          "integration",
          phone,
          2,
          60_000,
          clock,
        ),
        true,
      );
      assert.equal(
        await checkVerificationRateLimit(
          "integration",
          phone,
          2,
          60_000,
          clock,
        ),
        false,
      );

      await lifecycle.issue(bindingPhone, "PHONE_VERIFICATION");
      assert.deepEqual(
        await lifecycle.verify(wrongPhone, "PHONE_VERIFICATION", "123456"),
        { status: "invalid" },
      );
      assert.deepEqual(
        await lifecycle.verify(bindingPhone, "PASSWORD_RESET", "123456"),
        { status: "invalid" },
      );

      let sentCode: string | undefined;
      const issuePhone = createPhoneVerificationIssuanceHandler({
        async deliver(recipient, code) {
          assert.equal(recipient, phone);
          sentCode = code;
          return "delivered";
        },
      });
      const issueResponse = await issuePhone(
        new NextRequest("http://localhost/api/auth/verify-phone/send", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            host: "localhost",
            origin: "http://localhost",
            "x-forwarded-for": "198.51.100.8, 203.0.113.20",
          },
          body: JSON.stringify({ phone }),
        }),
      );
      assert.equal(issueResponse.status, 202);
      assert.ok(sentCode);

      const verifyResponse = await verifyRegistration(
        new NextRequest("http://localhost/api/auth/verify-phone/registration", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            host: "localhost",
            origin: "http://localhost",
            "x-real-ip": "203.0.113.20",
          },
          body: JSON.stringify({ phone, code: sentCode }),
        }),
      );
      assert.equal(verifyResponse.status, 200);
      const verified = await verifyResponse.json();
      assert.equal(verified.success, true);
      assert.equal(typeof verified.verificationProof, "string");

      const register = createRegistrationHandler();
      const response = await register(
        new NextRequest("http://localhost/api/auth/register", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            host: "localhost",
            origin: "http://localhost",
            "x-real-ip": "192.0.2.20",
          },
          body: JSON.stringify({
            email,
            password: "correct-horse-battery-staple",
            firstName: "Integration",
            lastName: "Customer",
            phone,
            verificationProof: verified.verificationProof,
          }),
        }),
      );
      assert.equal(response.status, 201);

      const replay = await register(
        new NextRequest("http://localhost/api/auth/register", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            host: "localhost",
            origin: "http://localhost",
            "x-real-ip": "192.0.2.20",
          },
          body: JSON.stringify({
            email: `replay-${email}`,
            password: "correct-horse-battery-staple",
            firstName: "Replay",
            lastName: "Customer",
            phone,
            verificationProof: verified.verificationProof,
          }),
        }),
      );
      assert.equal(replay.status, 400);

      nextCode = "654321";
      await lifecycle.issue(concurrentPhone, "PHONE_VERIFICATION");
      const concurrentVerification = await lifecycle.verify(
        concurrentPhone,
        "PHONE_VERIFICATION",
        "654321",
      );
      assert.equal(concurrentVerification.status, "verified");
      if (concurrentVerification.status !== "verified") return;
      const concurrentResults = await Promise.all([
        lifecycle.consume(
          concurrentPhone,
          "PHONE_VERIFICATION",
          concurrentVerification.proof,
          async () => "first",
        ),
        lifecycle.consume(
          concurrentPhone,
          "PHONE_VERIFICATION",
          concurrentVerification.proof,
          async () => "second",
        ),
      ]);
      assert.equal(
        concurrentResults.filter((result) => result.status === "consumed")
          .length,
        1,
      );

      nextCode = "111111";
      await lifecycle.issue(expiredPhone, "PHONE_VERIFICATION");
      clock = new Date(clock.getTime() + 5 * 60 * 1000 + 1);
      assert.deepEqual(
        await lifecycle.verify(expiredPhone, "PHONE_VERIFICATION", "111111"),
        { status: "invalid" },
      );
    } finally {
      await cleanupClient.user.deleteMany({ where: { email } });
      await cleanupClient.verificationCode.deleteMany({
        where: {
          phone: { in: [phone, concurrentPhone, expiredPhone, bindingPhone] },
        },
      });
      await cleanupClient.$disconnect();
    }
  },
);
