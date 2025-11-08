import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerTier, LifecycleStage } from "@prisma/client";

// POST /api/crm/customers/health-scores - Update all customer health scores and lifecycle stages
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all customers with their orders and reviews
    const customers = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        role: "CUSTOMER"
      },
      include: {
        orders: {
          select: {
            totalAmount: true,
            paymentStatus: true,
            createdAt: true
          }
        },
        reviews: {
          select: {
            createdAt: true
          }
        },
        interactions: {
          select: {
            createdAt: true
          }
        }
      }
    });

    const now = new Date();
    let updatedCount = 0;

    // Update each customer's health score and lifecycle stage
    for (const customer of customers) {
      const totalOrders = customer.orders?.length || 0;
      const totalSpent = customer.orders?.reduce((sum: number, order) => 
        sum + Number(order.totalAmount), 0) || 0;
      
      // Calculate days since last order
      const lastOrderDate = customer.orders && customer.orders.length > 0 
        ? Math.max(...customer.orders.map((o) => o.createdAt.getTime()))
        : null;
      const daysSinceLastOrder = lastOrderDate 
        ? Math.floor((now.getTime() - lastOrderDate) / (1000 * 60 * 60 * 24))
        : null;

      // Calculate days since last login (currently unused but will be used in future)
      // const daysSinceLastLogin = customer.lastLoginAt
      //   ? Math.floor((now.getTime() - customer.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
      //   : null;

      // Calculate health score
      const healthScore = calculateHealthScore({
        totalSpent,
        totalOrders,
        daysSinceLastOrder,
        interactions: customer.interactions?.length || 0,
        reviews: customer.reviews?.length || 0
      });

      // Determine customer tier
      const customerTier = determineCustomerTier(totalSpent, totalOrders);

      // Determine lifecycle stage
      const lifecycleStage = determineLifecycleStage({
        totalOrders,
        daysSinceLastOrder,
        totalSpent
      });

      // Update customer
      await prisma.user.update({
        where: { id: customer.id },
        data: {
          healthScore,
          customerTier: customerTier as CustomerTier,
          lifecycleStage: lifecycleStage as LifecycleStage
        }
      });

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Updated health scores for ${updatedCount} customers`,
      data: {
        updatedCount,
        timestamp: now.toISOString()
      }
    });

  } catch (error) {
    console.error("Error updating customer health scores:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateHealthScore({
  totalSpent,
  totalOrders,
  daysSinceLastOrder,
  interactions,
  reviews
}: {
  totalSpent: number;
  totalOrders: number;
  daysSinceLastOrder: number | null;
  interactions: number;
  reviews: number;
}): number {
  let score = 0;
  
  // Spending score (0-40 points)
  if (totalSpent >= 20000000) score += 40; // 20M+ IRR
  else if (totalSpent >= 10000000) score += 35; // 10M+ IRR
  else if (totalSpent >= 5000000) score += 30; // 5M+ IRR
  else if (totalSpent >= 2000000) score += 25; // 2M+ IRR
  else if (totalSpent >= 1000000) score += 20; // 1M+ IRR
  else if (totalSpent >= 500000) score += 15; // 500K+ IRR
  else if (totalSpent >= 100000) score += 10; // 100K+ IRR
  else if (totalSpent >= 50000) score += 5; // 50K+ IRR
  
  // Order frequency score (0-25 points)
  if (totalOrders >= 20) score += 25;
  else if (totalOrders >= 15) score += 22;
  else if (totalOrders >= 10) score += 20;
  else if (totalOrders >= 7) score += 17;
  else if (totalOrders >= 5) score += 15;
  else if (totalOrders >= 3) score += 12;
  else if (totalOrders >= 2) score += 8;
  else if (totalOrders >= 1) score += 5;
  
  // Recency score (0-20 points)
  if (daysSinceLastOrder === null) score += 0; // No orders
  else if (daysSinceLastOrder <= 7) score += 20;
  else if (daysSinceLastOrder <= 14) score += 18;
  else if (daysSinceLastOrder <= 30) score += 15;
  else if (daysSinceLastOrder <= 60) score += 12;
  else if (daysSinceLastOrder <= 90) score += 8;
  else if (daysSinceLastOrder <= 180) score += 5;
  else if (daysSinceLastOrder <= 365) score += 2;
  
  // Engagement score (0-15 points)
  if (interactions >= 20) score += 15;
  else if (interactions >= 15) score += 12;
  else if (interactions >= 10) score += 10;
  else if (interactions >= 7) score += 8;
  else if (interactions >= 5) score += 6;
  else if (interactions >= 3) score += 4;
  else if (interactions >= 1) score += 2;
  
  // Review score (0-10 points)
  if (reviews >= 10) score += 10;
  else if (reviews >= 7) score += 8;
  else if (reviews >= 5) score += 6;
  else if (reviews >= 3) score += 4;
  else if (reviews >= 1) score += 2;
  
  return Math.min(100, Math.max(0, score));
}

function determineCustomerTier(totalSpent: number, totalOrders: number): string {
  if (totalSpent >= 20000000 || totalOrders >= 20) return "PLATINUM";
  if (totalSpent >= 10000000 || totalOrders >= 10) return "GOLD";
  if (totalSpent >= 5000000 || totalOrders >= 5) return "SILVER";
  return "BRONZE";
}

function determineLifecycleStage({
  totalOrders,
  daysSinceLastOrder,
  totalSpent
}: {
  totalOrders: number;
  daysSinceLastOrder: number | null;
  totalSpent: number;
}): string {
  if (totalOrders === 0) return "LEAD";
  if (totalOrders === 1) return "PROSPECT";
  if (totalOrders >= 5 && totalSpent >= 5000000) return "LOYAL_CUSTOMER";
  if (daysSinceLastOrder && daysSinceLastOrder > 180) return "AT_RISK";
  if (daysSinceLastOrder && daysSinceLastOrder > 365) return "CHURNED";
  return "CUSTOMER";
}
