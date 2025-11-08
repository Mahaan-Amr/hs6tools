import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OpportunityStage } from "@prisma/client";

// GET /api/crm/opportunities/pipeline - Get sales pipeline data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days
    const assignedTo = searchParams.get("assignedTo") || "";

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Build where clause
    const where: Record<string, unknown> = {
      createdAt: {
        gte: daysAgo
      }
    };

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    // Get opportunities grouped by stage
    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true
          }
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Group opportunities by stage
    const pipelineData = Object.values(OpportunityStage).map(stage => {
      const stageOpportunities = opportunities.filter(opp => opp.stage === stage);
      const totalValue = stageOpportunities.reduce((sum, opp) => sum + Number(opp.value), 0);
      const weightedValue = stageOpportunities.reduce((sum, opp) => 
        sum + (Number(opp.value) * (opp.probability / 100)), 0
      );

      return {
        stage,
        count: stageOpportunities.length,
        totalValue,
        weightedValue,
        opportunities: stageOpportunities
      };
    });

    // Calculate pipeline metrics
    const totalPipelineValue = opportunities.reduce((sum, opp) => sum + Number(opp.value), 0);
    const weightedPipelineValue = opportunities.reduce((sum, opp) => 
      sum + (Number(opp.value) * (opp.probability / 100)), 0
    );

    // Calculate conversion rates
    const totalOpportunities = opportunities.length;
    const wonOpportunities = opportunities.filter(opp => opp.stage === "CLOSED_WON").length;
    const lostOpportunities = opportunities.filter(opp => opp.stage === "CLOSED_LOST").length;
    const activeOpportunities = totalOpportunities - wonOpportunities - lostOpportunities;

    const winRate = totalOpportunities > 0 ? (wonOpportunities / totalOpportunities) * 100 : 0;
    const lossRate = totalOpportunities > 0 ? (lostOpportunities / totalOpportunities) * 100 : 0;

    // Calculate average deal size
    const averageDealSize = totalOpportunities > 0 ? totalPipelineValue / totalOpportunities : 0;

    // Calculate sales velocity (weighted pipeline value / days in period)
    const salesVelocity = weightedPipelineValue / parseInt(period);

    return NextResponse.json({
      success: true,
      data: {
        pipeline: pipelineData,
        metrics: {
          totalOpportunities,
          activeOpportunities,
          wonOpportunities,
          lostOpportunities,
          totalPipelineValue,
          weightedPipelineValue,
          averageDealSize,
          winRate,
          lossRate,
          salesVelocity
        },
        period: parseInt(period)
      }
    });

  } catch (error) {
    console.error("Error fetching pipeline data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pipeline data" },
      { status: 500 }
    );
  }
}
