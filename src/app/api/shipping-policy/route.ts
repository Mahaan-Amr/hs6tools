import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_FREE_SHIPPING_THRESHOLD } from "@/lib/shipping-policy";

export async function GET() {
  const policy = await prisma.shippingPolicy.findUnique({ where: { id: "default" } });
  return NextResponse.json({ threshold: policy?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD }, { headers: { "Cache-Control": "no-store" } });
}
