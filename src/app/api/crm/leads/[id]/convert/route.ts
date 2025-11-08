import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerType, CompanySize, CustomerTier, LifecycleStage } from "@prisma/client";

// POST /api/crm/leads/[id]/convert - Convert lead to customer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { password, customerType = "B2C" } = body;

    // Validate required fields
    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Check if lead is already converted
    if (lead.status === "CONVERTED" && lead.convertedTo) {
      return NextResponse.json(
        { success: false, error: "Lead is already converted" },
        { status: 400 }
      );
    }

    // Check if user with same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lead.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user from lead data
    const user = await prisma.user.create({
      data: {
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        company: lead.company,
        position: lead.position,
        passwordHash,
        role: "CUSTOMER",
        isActive: true,
        emailVerified: false,
        phoneVerified: false,
        
        // CRM fields
        customerType: customerType as CustomerType,
        industry: lead.industry,
        companySize: lead.companySize as CompanySize,
        customerTier: "BRONZE" as CustomerTier,
        healthScore: 50, // Initial health score
        tags: lead.tags,
        notes: lead.notes,
        assignedSalesRep: lead.assignedTo,
        leadSource: lead.source,
        lifecycleStage: "CUSTOMER" as LifecycleStage,
        lastInteraction: new Date(),
        nextFollowUp: lead.nextFollowUp
      }
    });

    // Update lead status to converted
    await prisma.lead.update({
      where: { id },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
        convertedTo: user.id
      }
    });

    // Create initial customer interaction
    await prisma.customerInteraction.create({
      data: {
        customerId: user.id,
        type: "MARKETING",
        subject: "Lead Conversion",
        content: `Lead converted from ${lead.source} source. Original lead created on ${lead.createdAt.toISOString()}`,
        outcome: "CONVERTED",
        nextAction: "Welcome email and onboarding"
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        user,
        lead: {
          ...lead,
          status: "CONVERTED",
          convertedAt: new Date(),
          convertedTo: user.id
        }
      },
      message: "Lead successfully converted to customer"
    });

  } catch (error) {
    console.error("Error converting lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to convert lead" },
      { status: 500 }
    );
  }
}
