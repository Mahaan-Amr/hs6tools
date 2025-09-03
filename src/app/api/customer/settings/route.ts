import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/customer/settings - Get user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user settings from database
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    });

    // Return default settings if no settings found
    const defaultSettings = {
      language: 'fa',
      currency: 'IRR',
      timezone: 'Asia/Tehran',
      notifications: {
        orderUpdates: true,
        promotionalEmails: true,
        smsNotifications: false,
        newProductAlerts: false,
        priceDropAlerts: false,
      },
      privacy: {
        showOnlineStatus: false,
        allowDataSharing: false,
        showPurchaseHistory: true,
      },
      display: {
        itemsPerPage: 10,
        dateFormat: 'persian',
        theme: 'auto',
      },
    };

    const settings = userSettings ? {
      language: userSettings.language || defaultSettings.language,
      currency: userSettings.currency || defaultSettings.currency,
      timezone: userSettings.timezone || defaultSettings.timezone,
      notifications: userSettings.notifications || defaultSettings.notifications,
      privacy: userSettings.privacy || defaultSettings.privacy,
      display: userSettings.display || defaultSettings.display,
    } : defaultSettings;

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/customer/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { language, currency, timezone, notifications, privacy, display } = body;

    // Validate the settings data
    if (!language || !currency || !timezone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update or create user settings
    const userSettings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        language,
        currency,
        timezone,
        notifications,
        privacy,
        display,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        language,
        currency,
        timezone,
        notifications,
        privacy,
        display,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: userSettings,
      message: "Settings updated successfully" 
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
