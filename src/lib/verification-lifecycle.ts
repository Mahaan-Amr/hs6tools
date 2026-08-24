import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";

export type VerificationPurpose =
  | "PHONE_VERIFICATION"
  | "PASSWORD_RESET"
  | "EMAIL_VERIFICATION";

export type VerificationChallenge = {
  recipient: string;
  purpose: VerificationPurpose;
  codeDigest: string;
  attempts: number;
  proofDigest: string | null;
  expiresAt: Date;
  verifiedAt: Date | null;
  usedAt: Date | null;
  createdAt: Date;
};

export interface VerificationStore<Transaction> {
  issue(
    challenge: VerificationChallenge,
    cooldownCutoff: Date,
  ): Promise<boolean>;
  verify(input: {
    recipient: string;
    purpose: VerificationPurpose;
    codeDigest: string;
    proofDigest: string;
    now: Date;
  }): Promise<boolean>;
  consume<T>(
    input: {
      recipient: string;
      purpose: VerificationPurpose;
      proofDigest: string;
      now: Date;
    },
    action: (transaction: Transaction) => Promise<T>,
  ): Promise<T | null>;
  invalidate(codeDigest: string, now: Date): Promise<void>;
  cleanup(now: Date, consumedBefore: Date): Promise<number>;
}

type LifecycleOptions = {
  secret: string;
  now?: () => Date;
  createCode?: () => string;
  createProof?: () => string;
  ttlMs?: number;
  cooldownMs?: number;
  consumedRetentionMs?: number;
};

export function createVerificationLifecycle<Transaction>(
  store: VerificationStore<Transaction>,
  options: LifecycleOptions,
) {
  const now = options.now ?? (() => new Date());
  const createCode =
    options.createCode ?? (() => randomInt(100000, 1000000).toString());
  const createProof =
    options.createProof ?? (() => randomBytes(32).toString("base64url"));
  const ttlMs = options.ttlMs ?? 5 * 60 * 1000;
  const cooldownMs = options.cooldownMs ?? 2 * 60 * 1000;
  const consumedRetentionMs =
    options.consumedRetentionMs ?? 24 * 60 * 60 * 1000;

  function digestCode(
    recipient: string,
    purpose: VerificationPurpose,
    code: string,
  ) {
    return createHmac("sha256", options.secret)
      .update(`${purpose}\0${recipient}\0${code}`)
      .digest("hex");
  }

  function digestProof(proof: string) {
    return createHash("sha256").update(proof).digest("hex");
  }

  return {
    async issue(recipient: string, purpose: VerificationPurpose) {
      const issuedAt = now();
      const code = createCode();
      const codeDigest = digestCode(recipient, purpose, code);
      const issued = await store.issue(
        {
          recipient,
          purpose,
          codeDigest,
          attempts: 0,
          proofDigest: null,
          expiresAt: new Date(issuedAt.getTime() + ttlMs),
          verifiedAt: null,
          usedAt: null,
          createdAt: issuedAt,
        },
        new Date(issuedAt.getTime() - cooldownMs),
      );
      return issued
        ? ({
            status: "issued",
            code,
            codeDigest,
            expiresIn: Math.floor(ttlMs / 1000),
          } as const)
        : ({ status: "throttled" } as const);
    },

    async verify(
      recipient: string,
      purpose: VerificationPurpose,
      code: string,
    ) {
      const checkedAt = now();
      const proof = createProof();
      const verified = await store.verify({
        recipient,
        purpose,
        codeDigest: digestCode(recipient, purpose, code),
        proofDigest: digestProof(proof),
        now: checkedAt,
      });
      return verified
        ? ({ status: "verified", proof } as const)
        : ({ status: "invalid" } as const);
    },

    async consume<T>(
      recipient: string,
      purpose: VerificationPurpose,
      proof: string,
      action: (transaction: Transaction) => Promise<T>,
    ) {
      const value = await store.consume(
        { recipient, purpose, proofDigest: digestProof(proof), now: now() },
        action,
      );
      return value === null
        ? ({ status: "invalid" } as const)
        : ({ status: "consumed", value } as const);
    },

    invalidate(recipient: string, purpose: VerificationPurpose, code: string) {
      return store.invalidate(digestCode(recipient, purpose, code), now());
    },

    cleanup() {
      const cleanupAt = now();
      return store.cleanup(
        cleanupAt,
        new Date(cleanupAt.getTime() - consumedRetentionMs),
      );
    },
  };
}
