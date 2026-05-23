import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSystemSettings, normalizeSiteSeo } from "@/lib/site-settings";

export async function GET() {
  try {
    const settings = await getSystemSettings();

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
      siteSeo,
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

    const existingSettings = await prisma.systemSettings.findFirst({ select: { id: true } });
    const settingsData = {
      siteName,
      siteDescription,
      siteUrl,
      siteSeo: normalizeSiteSeo(siteSeo) as unknown as Prisma.InputJsonValue,
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
    };

    const settings = existingSettings
      ? await prisma.systemSettings.update({
          where: { id: existingSettings.id },
          data: settingsData,
        })
      : await prisma.systemSettings.create({
          data: {
            id: "default",
            ...settingsData,
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
