import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const period = searchParams.get("period") || "30"; // Default to 30 days
    const type = searchParams.get("type") || "overview"; // overview, sales, users, products, customers, geographic

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "365":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    if (type === "overview") {
      // Get overview statistics
      const [
        totalProducts,
        totalCategories,
        totalUsers,
        totalOrders,
        totalRevenue,
        monthlyRevenue,
        pendingOrders,
        lowStockProducts,
        recentOrders,
        topProducts,
        topCategories
      ] = await Promise.all([
        // Total counts
        prisma.product.count({ where: { isActive: true, deletedAt: null } }),
        prisma.category.count({ where: { isActive: true, deletedAt: null } }),
        prisma.user.count({ where: { isActive: true, deletedAt: null } }),
        prisma.order.count({ where: { createdAt: { gte: startDate } } }),
        
        // Revenue calculations
        prisma.order.aggregate({
          where: { 
            createdAt: { gte: startDate },
            paymentStatus: "PAID"
          },
          _sum: { totalAmount: true }
        }),
        prisma.order.aggregate({
          where: { 
            createdAt: { 
              gte: new Date(now.getFullYear(), now.getMonth(), 1)
            },
            paymentStatus: "PAID"
          },
          _sum: { totalAmount: true }
        }),
        
        // Order status counts
        prisma.order.count({
          where: { 
            status: "PENDING",
            createdAt: { gte: startDate }
          }
        }),
        
        // Low stock products
        prisma.product.count({
          where: {
            isActive: true,
            deletedAt: null,
            stockQuantity: { lte: 10 }
          }
        }),

        // Recent orders for chart
        prisma.order.findMany({
          where: { createdAt: { gte: startDate } },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        }),

        // Top selling products
        prisma.orderItem.groupBy({
          by: ["productId"],
          where: {
            order: {
              createdAt: { gte: startDate },
              paymentStatus: "PAID"
            }
          },
          _sum: {
            quantity: true,
            totalPrice: true
          },
          orderBy: {
            _sum: {
              quantity: "desc"
            }
          },
          take: 5
        }),

        // Top categories
        prisma.orderItem.groupBy({
          by: ["productId"],
          where: {
            order: {
              createdAt: { gte: startDate },
              paymentStatus: "PAID"
            }
          },
          _sum: {
            totalPrice: true
          },
          orderBy: {
            _sum: {
              totalPrice: "desc"
            }
          },
          take: 5
        })
      ]);

      // Get product names for top products
      const topProductsWithNames = await Promise.all(
        topProducts.map(async (item) => {
          if (item.productId) {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
              select: { name: true, nameEn: true, nameAr: true }
            });
            return {
              id: item.productId,
              name: product?.name || "Unknown Product",
              sales: item._sum.quantity || 0,
              revenue: Number(item._sum.totalPrice || 0)
            };
          }
          return null;
        })
      );

      // Get category names for top categories
      const topCategoriesWithNames = await Promise.all(
        topCategories.map(async (item) => {
          if (item.productId) {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
              select: { 
                category: {
                  select: { name: true, nameEn: true, nameAr: true }
                }
              }
            });
            return {
              id: item.productId,
              name: product?.category?.name || "Unknown Category",
              revenue: Number(item._sum.totalPrice || 0)
            };
          }
          return null;
        })
      );

      // Get daily sales data for charts
      const dailySales = await prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: { gte: startDate },
          paymentStatus: "PAID"
        },
        _sum: {
          totalAmount: true
        },
        _count: {
          id: true
        }
      });

      const dailySalesFormatted = dailySales.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        revenue: Number(item._sum.totalAmount || 0),
        orders: item._count.id
      }));

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalProducts,
            totalCategories,
            totalUsers,
            totalOrders,
            totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
            monthlyRevenue: Number(monthlyRevenue._sum.totalAmount || 0),
            pendingOrders,
            lowStockProducts
          },
          recentOrders: recentOrders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: Number(order.totalAmount),
            createdAt: order.createdAt.toISOString(),
            customerName: `${order.user.firstName} ${order.user.lastName}`
          })),
          topProducts: topProductsWithNames.filter(Boolean),
          topCategories: topCategoriesWithNames.filter(Boolean),
          dailySales: dailySalesFormatted
        }
      });
    }

    if (type === "customers") {
      // Customer Segmentation Analytics
      const allUsers = await prisma.user.findMany({
        where: { 
          isActive: true, 
          deletedAt: null,
          role: "CUSTOMER"
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
          lastLoginAt: true,
          lifecycleStage: true,
          customerTier: true,
          healthScore: true,
          orders: {
            where: { createdAt: { gte: startDate } },
            select: {
              totalAmount: true,
              createdAt: true,
              paymentStatus: true
            }
          }
        }
      });

      // Calculate customer metrics
      const customersWithMetrics = allUsers.map(user => {
        const totalOrders = user.orders.length;
        const totalSpent = user.orders.reduce((sum, order) => 
          sum + Number(order.totalAmount), 0
        );
        const paidOrders = user.orders.filter(order => 
          order.paymentStatus === "PAID"
        ).length;
        const lastOrderDate = user.orders.length > 0 
          ? Math.max(...user.orders.map(o => o.createdAt.getTime()))
          : null;
        
        // Calculate days since last order
        const daysSinceLastOrder = lastOrderDate 
          ? Math.floor((now.getTime() - lastOrderDate) / (1000 * 60 * 60 * 24))
          : null;

        // Calculate days since last login
        const daysSinceLastLogin = user.lastLoginAt
          ? Math.floor((now.getTime() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          id: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          phone: user.phone || null,
          totalOrders,
          totalSpent,
          paidOrders,
          averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
          daysSinceLastOrder,
          daysSinceLastLogin,
          customerType: getCustomerType(totalSpent, totalOrders, daysSinceLastOrder),
          // Include CRM fields from user
          lifecycleStage: user.lifecycleStage || null,
          customerTier: user.customerTier || null,
          healthScore: user.healthScore || null
        };
      });

      // Segment customers
      const highValueCustomers = customersWithMetrics.filter(c => c.customerType === "high-value");
      const frequentCustomers = customersWithMetrics.filter(c => c.customerType === "frequent");
      const dormantCustomers = customersWithMetrics.filter(c => c.customerType === "dormant");
      const regularCustomers = customersWithMetrics.filter(c => c.customerType === "regular");

      return NextResponse.json({
        success: true,
        data: {
          customerSegments: {
            highValue: highValueCustomers,
            frequent: frequentCustomers,
            dormant: dormantCustomers,
            regular: regularCustomers
          },
          summary: {
            totalCustomers: customersWithMetrics.length,
            highValueCount: highValueCustomers.length,
            frequentCount: frequentCustomers.length,
            dormantCount: dormantCustomers.length,
            regularCount: regularCustomers.length
          },
          period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        }
      });
    }

    if (type === "products") {
      // Enhanced Product Performance Analytics
      const products = await prisma.product.findMany({
        where: { isActive: true, deletedAt: null },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stockQuantity: true,
          lowStockThreshold: true,
          isInStock: true,
          createdAt: true,
          category: {
            select: { name: true, nameEn: true, nameAr: true }
          },
          orderItems: {
            where: {
              order: {
                createdAt: { gte: startDate },
                paymentStatus: "PAID"
              }
            },
            select: {
              quantity: true,
              totalPrice: true,
              order: {
                select: {
                  createdAt: true,
                  status: true
                }
              }
            }
          },
          reviews: {
            select: {
              rating: true,
              createdAt: true
            }
          },
          wishlistItems: {
            select: {
              createdAt: true
            }
          }
        }
      });

      // Calculate product performance metrics
      const productsWithMetrics = products.map(product => {
        const totalSales = product.orderItems.reduce((sum, item) => 
          sum + item.quantity, 0
        );
        const totalRevenue = product.orderItems.reduce((sum, item) => 
          sum + Number(item.totalPrice), 0
        );
        const averageRating = product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0;
        const wishlistCount = product.wishlistItems.length;
        const conversionRate = wishlistCount > 0 
          ? (totalSales / wishlistCount) * 100 
          : 0;

        // Calculate sales velocity (sales per day)
        const salesVelocity = totalSales / Math.max(1, Math.floor((now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24)));

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: Number(product.price),
          stockQuantity: product.stockQuantity,
          lowStockThreshold: product.lowStockThreshold,
          isInStock: product.isInStock,
          category: product.category.name,
          totalSales,
          totalRevenue,
          averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: product.reviews.length,
          wishlistCount,
          conversionRate: Math.round(conversionRate * 100) / 100,
          salesVelocity: Math.round(salesVelocity * 100) / 100,
          stockStatus: product.stockQuantity <= product.lowStockThreshold ? "low" : "normal"
        };
      });

      // Sort by different metrics
      const topSellingProducts = [...productsWithMetrics].sort((a, b) => b.totalSales - a.totalSales).slice(0, 10);
      const topRevenueProducts = [...productsWithMetrics].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);
      const topRatedProducts = [...productsWithMetrics].filter(p => p.reviewCount > 0).sort((a, b) => b.averageRating - a.averageRating).slice(0, 10);
      const lowStockProducts = productsWithMetrics.filter(p => p.stockStatus === "low").sort((a, b) => a.stockQuantity - b.stockQuantity);

      return NextResponse.json({
        success: true,
        data: {
          products: productsWithMetrics,
          topSelling: topSellingProducts,
          topRevenue: topRevenueProducts,
          topRated: topRatedProducts,
          lowStock: lowStockProducts,
          summary: {
            totalProducts: productsWithMetrics.length,
            totalSales: productsWithMetrics.reduce((sum, p) => sum + p.totalSales, 0),
            totalRevenue: productsWithMetrics.reduce((sum, p) => sum + p.totalRevenue, 0),
            averageRating: productsWithMetrics.filter(p => p.reviewCount > 0).reduce((sum, p) => sum + p.averageRating, 0) / Math.max(1, productsWithMetrics.filter(p => p.reviewCount > 0).length),
            lowStockCount: lowStockProducts.length
          },
          period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        }
      });
    }

    if (type === "geographic") {
      // Geographic Analytics - Regional Sales Patterns
      const ordersWithAddresses = await prisma.order.findMany({
        where: { 
          createdAt: { gte: startDate },
          paymentStatus: "PAID"
        },
        select: {
          id: true,
          totalAmount: true,
          createdAt: true,
          shippingAddress: {
            select: {
              city: true,
              state: true,
              country: true
            }
          }
        }
      });

      // Group by city, state, and country
      const cityStats = new Map();
      const stateStats = new Map();
      const countryStats = new Map();

      ordersWithAddresses.forEach(order => {
        const city = order.shippingAddress.city;
        const state = order.shippingAddress.state;
        const country = order.shippingAddress.country;
        const amount = Number(order.totalAmount);

        // City stats
        if (cityStats.has(city)) {
          const stats = cityStats.get(city);
          stats.orderCount++;
          stats.totalRevenue += amount;
          stats.averageOrderValue = stats.totalRevenue / stats.orderCount;
        } else {
          cityStats.set(city, {
            city,
            orderCount: 1,
            totalRevenue: amount,
            averageOrderValue: amount
          });
        }

        // State stats
        if (stateStats.has(state)) {
          const stats = stateStats.get(state);
          stats.orderCount++;
          stats.totalRevenue += amount;
          stats.averageOrderValue = stats.totalRevenue / stats.orderCount;
        } else {
          stateStats.set(state, {
            state,
            orderCount: 1,
            totalRevenue: amount,
            averageOrderValue: amount
          });
        }

        // Country stats
        if (countryStats.has(country)) {
          const stats = countryStats.get(country);
          stats.orderCount++;
          stats.totalRevenue += amount;
          stats.averageOrderValue = stats.totalRevenue / stats.orderCount;
        } else {
          countryStats.set(country, {
            country,
            orderCount: 1,
            totalRevenue: amount,
            averageOrderValue: amount
          });
        }
      });

      // Convert to arrays and sort
      const cityAnalytics = Array.from(cityStats.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 20);

      const stateAnalytics = Array.from(stateStats.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 20);

      const countryAnalytics = Array.from(countryStats.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue);

      // Calculate geographic distribution percentages
      const totalRevenue = cityAnalytics.reduce((sum, city) => sum + city.totalRevenue, 0);
      const cityDistribution = cityAnalytics.map(city => ({
        ...city,
        percentage: Math.round((city.totalRevenue / totalRevenue) * 100 * 100) / 100
      }));

      return NextResponse.json({
        success: true,
        data: {
          cityAnalytics: cityDistribution,
          stateAnalytics,
          countryAnalytics,
          summary: {
            totalCities: cityAnalytics.length,
            totalStates: stateAnalytics.length,
            totalCountries: countryAnalytics.length,
            totalRevenue,
            averageOrderValue: totalRevenue / ordersWithAddresses.length
          },
          period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        }
      });
    }

    if (type === "sales") {
      // Get detailed sales analytics
      const salesData = await prisma.order.groupBy({
        by: ["status", "paymentStatus"],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        _sum: { totalAmount: true }
      });

      const salesByStatus = salesData.reduce((acc, item) => {
        acc[item.status] = {
          count: item._count.id,
          revenue: Number(item._sum.totalAmount || 0)
        };
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

      return NextResponse.json({
        success: true,
        data: {
          salesByStatus,
          period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        }
      });
    }

    if (type === "users") {
      // Get user analytics
      const newUsers = await prisma.user.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: { gte: startDate },
          isActive: true,
          deletedAt: null
        },
        _count: { id: true }
      });

      const userRoles = await prisma.user.groupBy({
        by: ["role"],
        where: { isActive: true, deletedAt: null },
        _count: { id: true }
      });

      return NextResponse.json({
        success: true,
        data: {
          newUsers: newUsers.map(item => ({
            date: item.createdAt.toISOString().split('T')[0],
            count: item._count.id
          })),
          userRoles: userRoles.map(item => ({
            role: item.role,
            count: item._count.id
          })),
          period,
          startDate: startDate.toISOString(),
          endDate: now.toISOString()
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid analytics type"
    }, { status: 400 });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to determine customer type
function getCustomerType(totalSpent: number, totalOrders: number, daysSinceLastOrder: number | null): string {
  if (totalSpent >= 10000000) return "high-value"; // 10M IRR or more
  if (totalOrders >= 5) return "frequent";
  if (daysSinceLastOrder && daysSinceLastOrder > 90) return "dormant";
  return "regular";
}
