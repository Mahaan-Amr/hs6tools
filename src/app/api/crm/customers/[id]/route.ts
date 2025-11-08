import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/crm/customers/[id] - Get comprehensive customer 360 view
export async function GET(
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

    // Get comprehensive customer data
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: { isDefault: "desc" }
        },
        orders: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    nameEn: true,
                    nameAr: true,
                    sku: true,
                    price: true,
                    category: {
                      select: {
                        name: true,
                        nameEn: true,
                        nameAr: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        reviews: {
          include: {
            product: {
              select: {
                name: true,
                nameEn: true,
                nameAr: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        wishlistItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                nameAr: true,
                price: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        interactions: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        opportunities: {
          include: {
            activities: {
              orderBy: { createdAt: "desc" },
              take: 5
            }
          },
          orderBy: { createdAt: "desc" }
        },
        quotes: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        campaigns: {
          include: {
            campaign: {
              select: {
                name: true,
                type: true,
                status: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        settings: true
      }
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Calculate customer metrics
    const totalOrders = customer.orders?.length || 0;
    const totalSpent = customer.orders?.reduce((sum: number, order) => 
      sum + Number(order.totalAmount), 0) || 0;
    const paidOrders = customer.orders?.filter((order) => 
      order.paymentStatus === "PAID").length || 0;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Calculate days since last order
    const lastOrderDate = customer.orders && customer.orders.length > 0 
      ? Math.max(...customer.orders.map((o) => o.createdAt.getTime()))
      : null;
    const daysSinceLastOrder = lastOrderDate 
      ? Math.floor((Date.now() - lastOrderDate) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate days since last login
    const daysSinceLastLogin = customer.lastLoginAt
      ? Math.floor((Date.now() - customer.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate customer health score
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

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActivity = {
      orders: customer.orders?.filter((o) => o.createdAt >= thirtyDaysAgo).length || 0,
      interactions: customer.interactions?.filter((i) => i.createdAt >= thirtyDaysAgo).length || 0,
      reviews: customer.reviews?.filter((r) => r.createdAt >= thirtyDaysAgo).length || 0,
      wishlistItems: customer.wishlistItems?.filter((w) => w.createdAt >= thirtyDaysAgo).length || 0
    };

    // Get top categories purchased
    const categoryStats = new Map();
    customer.orders?.forEach((order) => {
      order.orderItems?.forEach((item) => {
        if (item.product?.category) {
          const categoryName = item.product.category.name;
          if (categoryStats.has(categoryName)) {
            categoryStats.set(categoryName, categoryStats.get(categoryName) + item.quantity);
          } else {
            categoryStats.set(categoryName, item.quantity);
          }
        }
      });
    });

    const topCategories = Array.from(categoryStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Transform customer data for response
    const customer360 = {
      // Basic Info
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      position: customer.position,
      avatar: customer.avatar,
      createdAt: customer.createdAt,
      lastLoginAt: customer.lastLoginAt,
      
      // CRM Fields
      customerType: customer.customerType || "B2C",
      industry: customer.industry || null,
      companySize: customer.companySize || null,
      customerTier: customer.customerTier || customerTier,
      healthScore: customer.healthScore || healthScore,
      tags: customer.tags || [],
      notes: customer.notes || null,
      assignedSalesRep: customer.assignedSalesRep || null,
      leadSource: customer.leadSource || null,
      lifecycleStage: customer.lifecycleStage || lifecycleStage,
      lastInteraction: customer.lastInteraction || null,
      nextFollowUp: customer.nextFollowUp || null,
      
      // Metrics
      metrics: {
        totalOrders,
        totalSpent,
        paidOrders,
        averageOrderValue,
        daysSinceLastOrder,
        daysSinceLastLogin,
        totalReviews: customer.reviews?.length || 0,
        totalWishlistItems: customer.wishlistItems?.length || 0,
        totalInteractions: customer.interactions?.length || 0,
        totalOpportunities: customer.opportunities?.length || 0,
        totalQuotes: customer.quotes?.length || 0
      },
      
      // Recent Activity
      recentActivity,
      
      // Top Categories
      topCategories,
      
      // Related Data
      addresses: customer.addresses || [],
      orders: customer.orders?.slice(0, 10) || [], // Last 10 orders
      reviews: customer.reviews?.slice(0, 5) || [], // Last 5 reviews
      wishlistItems: customer.wishlistItems?.slice(0, 10) || [], // Last 10 wishlist items
      interactions: customer.interactions || [],
      opportunities: customer.opportunities || [],
      quotes: customer.quotes || [],
      campaigns: customer.campaigns || [],
      settings: customer.settings
    };

    return NextResponse.json({
      success: true,
      data: customer360
    });

  } catch (error) {
    console.error("Error fetching customer 360 view:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/crm/customers/[id] - Update customer CRM data
export async function PUT(
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

    // Update customer CRM fields
    const updateData = {
      ...(body.customerType && { customerType: body.customerType }),
      ...(body.industry && { industry: body.industry }),
      ...(body.companySize && { companySize: body.companySize }),
      ...(body.customerTier && { customerTier: body.customerTier }),
      ...(body.healthScore !== undefined && { healthScore: body.healthScore }),
      ...(body.tags && { tags: body.tags }),
      ...(body.notes && { notes: body.notes }),
      ...(body.assignedSalesRep && { assignedSalesRep: body.assignedSalesRep }),
      ...(body.leadSource && { leadSource: body.leadSource }),
      ...(body.lifecycleStage && { lifecycleStage: body.lifecycleStage }),
      ...(body.lastInteraction && { lastInteraction: new Date(body.lastInteraction) }),
      ...(body.nextFollowUp && { nextFollowUp: new Date(body.nextFollowUp) })
    };

    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedCustomer
    });

  } catch (error) {
    console.error("Error updating customer:", error);
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
  if (totalSpent >= 10000000) score += 40; // 10M+ IRR
  else if (totalSpent >= 5000000) score += 30; // 5M+ IRR
  else if (totalSpent >= 1000000) score += 20; // 1M+ IRR
  else if (totalSpent >= 500000) score += 10; // 500K+ IRR
  
  // Order frequency score (0-25 points)
  if (totalOrders >= 10) score += 25;
  else if (totalOrders >= 5) score += 20;
  else if (totalOrders >= 3) score += 15;
  else if (totalOrders >= 1) score += 10;
  
  // Recency score (0-20 points)
  if (daysSinceLastOrder === null) score += 0; // No orders
  else if (daysSinceLastOrder <= 7) score += 20;
  else if (daysSinceLastOrder <= 30) score += 15;
  else if (daysSinceLastOrder <= 90) score += 10;
  else if (daysSinceLastOrder <= 180) score += 5;
  
  // Engagement score (0-15 points)
  if (interactions >= 10) score += 15;
  else if (interactions >= 5) score += 10;
  else if (interactions >= 1) score += 5;
  
  if (reviews >= 5) score += 10;
  else if (reviews >= 1) score += 5;
  
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
