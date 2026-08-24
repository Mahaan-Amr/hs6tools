import { Prisma, VerificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  VerificationChallenge,
  VerificationPurpose,
  VerificationStore,
} from "@/lib/verification-lifecycle";

function prismaPurpose(purpose: VerificationPurpose) {
  return purpose as VerificationType;
}

export const prismaVerificationStore: VerificationStore<Prisma.TransactionClient> =
  {
    async issue(challenge: VerificationChallenge, cooldownCutoff: Date) {
      return prisma.$transaction(async (transaction) => {
        const lockKey = `${challenge.purpose}:${challenge.recipient}`;
        await transaction.$queryRaw`SELECT 1 AS "locked" FROM pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
        const existing = await transaction.verificationCode.findFirst({
          where: {
            phone: challenge.recipient,
            type: prismaPurpose(challenge.purpose),
          },
          orderBy: { createdAt: "desc" },
        });
        if (
          existing &&
          !existing.used &&
          existing.expiresAt > challenge.createdAt &&
          existing.createdAt > cooldownCutoff
        )
          return false;

        await transaction.verificationCode.deleteMany({
          where: {
            phone: challenge.recipient,
            type: prismaPurpose(challenge.purpose),
          },
        });

        await transaction.verificationCode.create({
          data: {
            phone: challenge.recipient,
            type: prismaPurpose(challenge.purpose),
            code: challenge.codeDigest,
            attempts: 0,
            proofDigest: null,
            expiresAt: challenge.expiresAt,
            used: false,
            usedAt: null,
            verifiedAt: null,
            createdAt: challenge.createdAt,
          },
        });
        return true;
      });
    },

    async verify(input) {
      const result = await prisma.verificationCode.updateMany({
        where: {
          phone: input.recipient,
          type: prismaPurpose(input.purpose),
          code: input.codeDigest,
          proofDigest: null,
          verifiedAt: null,
          used: false,
          attempts: { lt: 5 },
          expiresAt: { gt: input.now },
        },
        data: {
          proofDigest: input.proofDigest,
          verifiedAt: input.now,
          attempts: { increment: 1 },
        },
      });
      if (result.count === 1) return true;
      await prisma.verificationCode.updateMany({
        where: {
          phone: input.recipient,
          type: prismaPurpose(input.purpose),
          proofDigest: null,
          verifiedAt: null,
          used: false,
          attempts: { lt: 5 },
          expiresAt: { gt: input.now },
        },
        data: { attempts: { increment: 1 } },
      });
      return false;
    },

    async consume(input, action) {
      return prisma.$transaction(async (transaction) => {
        const consumed = await transaction.verificationCode.updateMany({
          where: {
            phone: input.recipient,
            type: prismaPurpose(input.purpose),
            proofDigest: input.proofDigest,
            verifiedAt: { not: null },
            used: false,
            expiresAt: { gt: input.now },
          },
          data: { used: true, usedAt: input.now },
        });
        if (consumed.count !== 1) return null;
        return action(transaction);
      });
    },

    async invalidate(codeDigest, now) {
      await prisma.verificationCode.updateMany({
        where: { code: codeDigest, used: false },
        data: { used: true, usedAt: now },
      });
    },

    async cleanup(now, consumedBefore) {
      const result = await prisma.verificationCode.deleteMany({
        where: {
          OR: [
            { expiresAt: { lte: now } },
            { used: true, usedAt: { lte: consumedBefore } },
          ],
        },
      });
      return result.count;
    },
  };
