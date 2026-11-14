import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, isActive: true, deletedAt: true } });
  if (!user || !user.isActive || user.deletedAt || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  let value: unknown;
  try { value = (await request.json()).threshold; } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 2147483640 || value % 10 !== 0) {
    return NextResponse.json({ error: "Invalid threshold" }, { status: 400 });
  }
  await prisma.shippingPolicy.upsert({ where: { id: "default" }, create: { id: "default", freeShippingThreshold: value }, update: { freeShippingThreshold: value } });
  return NextResponse.json({ success: true });
}
