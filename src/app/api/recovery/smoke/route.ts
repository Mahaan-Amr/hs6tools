import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { externalEffectsAreDisabled } from "@/lib/external-effects";
import { prisma } from "@/lib/prisma";

function tokensMatch(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function GET(request: NextRequest) {
  const expectedToken = process.env.RECOVERY_SMOKE_TOKEN;
  const expectedDatabase = process.env.RECOVERY_EXPECTED_DATABASE;
  if (
    !externalEffectsAreDisabled() ||
    !expectedToken ||
    !expectedDatabase?.startsWith("hs6tools_restore_")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  if (!tokensMatch(request.headers.get("x-recovery-smoke-token"), expectedToken)) {
    return new NextResponse(null, { status: 404 });
  }

  const [connection] = await prisma.$queryRaw<Array<{ database: string }>>`
    SELECT current_database() AS database
  `;
  if (connection?.database !== expectedDatabase) {
    return NextResponse.json(
      { success: false, error: "Recovery database mismatch" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    success: true,
    database: connection.database,
    externalEffectsDisabled: true,
  });
}
