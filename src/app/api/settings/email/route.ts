import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get email settings (create default if none exist)
    let settings = await prisma.emailSettings.findFirst();
    
    if (!settings) {
      // Create default settings
      settings = await prisma.emailSettings.create({
        data: {
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          smtpUser: "",
          smtpPassword: "",
          fromEmail: "noreply@hs6tools.com",
          fromName: "HS6Tools",
          enableSSL: true,
          isActive: false,
        },
      });
    }

    // Don't return the password in the response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { smtpPassword: _unused, ...safeSettings } = settings;
    return NextResponse.json({ success: true, data: safeSettings });
  } catch (error) {
    console.error("Error fetching email settings:", error);
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
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      fromEmail,
      fromName,
      enableSSL,
      isActive,
    } = body;

    // Validate required fields
    if (!smtpHost || !smtpPort || !fromEmail || !fromName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate port number
    if (smtpPort < 1 || smtpPort > 65535) {
      return NextResponse.json(
        { success: false, error: "Invalid port number" },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.emailSettings.upsert({
      where: { id: "default" },
      update: {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword: smtpPassword || undefined, // Only update if provided
        fromEmail,
        fromName,
        enableSSL,
        isActive,
      },
      create: {
        id: "default",
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        fromEmail,
        fromName,
        enableSSL,
        isActive,
      },
    });

    // Don't return the password in the response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { smtpPassword: _unused, ...safeSettings } = settings;
    return NextResponse.json({ success: true, data: safeSettings });
  } catch (error) {
    console.error("Error updating email settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
