import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

function rateLimitSecret() {
  const secret =
    process.env.VERIFICATION_CODE_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "VERIFICATION_CODE_SECRET or NEXTAUTH_SECRET must be configured",
    );
  }
  return secret;
}

export function trustedClientIp(headers: Headers) {
  const forwarded = headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return forwarded?.at(-1) || headers.get("x-real-ip") || "unknown";
}

export async function checkVerificationRateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowMs: number,
  now = new Date(),
) {
  const key = createHmac("sha256", rateLimitSecret())
    .update(`${scope}\0${identifier}`)
    .digest("hex");
  await prisma.verificationRateLimit.deleteMany({
    where: { expiresAt: { lte: now } },
  });
  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT 1 AS "locked" FROM pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
    const bucket = await transaction.verificationRateLimit.findUnique({
      where: { key },
    });
    if (!bucket || bucket.expiresAt <= now) {
      await transaction.verificationRateLimit.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          expiresAt: new Date(now.getTime() + windowMs),
        },
        update: { count: 1, expiresAt: new Date(now.getTime() + windowMs) },
      });
      return true;
    }
    if (bucket.count >= limit) return false;
    await transaction.verificationRateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return true;
  });
}
