import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get payment settings (create default if none exist)
    let settings = await prisma.paymentSettings.findFirst();
    
    if (!settings) {
      // Create default settings
      settings = await prisma.paymentSettings.create({
        data: {
          zarinpalMerchantId: "",
          zarinpalApiKey: "",
          zarinpalSandbox: true,
          allowBankTransfer: true,
          allowCashOnDelivery: true,
          minimumOrderAmount: 0,
          maximumOrderAmount: 1000000000,
        },
      });
    }

    // Don't return the API key in the response
    const { zarinpalApiKey: _, ...safeSettings } = settings;
    return NextResponse.json({ success: true, data: safeSettings });
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      zarinpalMerchantId,
      zarinpalApiKey,
      zarinpalSandbox,
      allowBankTransfer,
      allowCashOnDelivery,
      minimumOrderAmount,
      maximumOrderAmount,
    } = body;

    // Validate required fields
    if (minimumOrderAmount < 0 || maximumOrderAmount < minimumOrderAmount) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount range" },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.paymentSettings.upsert({
      where: { id: "default" },
      update: {
        zarinpalMerchantId,
        zarinpalApiKey: zarinpalApiKey || undefined, // Only update if provided
        zarinpalSandbox,
        allowBankTransfer,
        allowCashOnDelivery,
        minimumOrderAmount,
        maximumOrderAmount,
      },
      create: {
        id: "default",
        zarinpalMerchantId,
        zarinpalApiKey,
        zarinpalSandbox,
        allowBankTransfer,
        allowCashOnDelivery,
        minimumOrderAmount,
        maximumOrderAmount,
      },
    });

    // Don't return the API key in the response
    const { zarinpalApiKey: _, ...safeSettings } = settings;
    return NextResponse.json({ success: true, data: safeSettings });
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
