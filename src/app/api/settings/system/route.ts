import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get system settings (create default if none exist)
    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      // Create default settings
      settings = await prisma.systemSettings.create({
        data: {
          siteName: "HS6Tools",
          siteDescription: "Industrial E-Commerce Platform",
          siteUrl: "http://localhost:3000",
          contactEmail: "support@hs6tools.com",
          contactPhone: "+98-21-12345678",
          businessAddress: "Tehran, Iran",
          currency: "IRR",
          language: "fa",
          timezone: "Asia/Tehran",
          maintenanceMode: false,
          allowRegistration: true,
          requireEmailVerification: false,
          requirePhoneVerification: false,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching system settings:", error);
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
      siteName,
      siteDescription,
      siteUrl,
      contactEmail,
      contactPhone,
      businessAddress,
      currency,
      language,
      timezone,
      maintenanceMode,
      allowRegistration,
      requireEmailVerification,
      requirePhoneVerification,
    } = body;

    // Validate required fields
    if (!siteName || !siteUrl || !contactEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: {
        siteName,
        siteDescription,
        siteUrl,
        contactEmail,
        contactPhone,
        businessAddress,
        currency,
        language,
        timezone,
        maintenanceMode,
        allowRegistration,
        requireEmailVerification,
        requirePhoneVerification,
      },
      create: {
        id: "default",
        siteName,
        siteDescription,
        siteUrl,
        contactEmail,
        contactPhone,
        businessAddress,
        currency,
        language,
        timezone,
        maintenanceMode,
        allowRegistration,
        requireEmailVerification,
        requirePhoneVerification,
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error updating system settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
