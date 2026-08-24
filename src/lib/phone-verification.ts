import { prismaVerificationStore } from "@/lib/prisma-verification-store";
import { createVerificationLifecycle } from "@/lib/verification-lifecycle";

export function getPhoneVerificationLifecycle() {
  const secret =
    process.env.VERIFICATION_CODE_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "VERIFICATION_CODE_SECRET or NEXTAUTH_SECRET must be configured",
    );
  }
  return createVerificationLifecycle(prismaVerificationStore, { secret });
}
