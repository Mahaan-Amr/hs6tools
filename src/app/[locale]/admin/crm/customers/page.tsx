import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerList from "@/components/admin/crm/CustomerList";

interface CustomersPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    search?: string;
    tier?: string;
    stage?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({ params, searchParams }: CustomersPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/fa/auth/login");
  }

  const { locale } = await params;
  const { search, tier, stage, page } = await searchParams;
  
  const currentPage = parseInt(page || "1");
  const limit = 20;
  const skip = (currentPage - 1) * limit;

  // Build where clause for filtering
  const where: any = {
    isActive: true,
    deletedAt: null,
    role: "CUSTOMER"
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } }
    ];
  }

  if (tier) {
    where.customerTier = tier;
  }

  if (stage) {
    where.lifecycleStage = stage;
  }

  // Get customers with pagination
  const [customers, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true,
        position: true,
        lastLoginAt: true,
        createdAt: true,
        orders: {
          select: {
            totalAmount: true,
            paymentStatus: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  // Calculate customer metrics
  const customersWithMetrics = customers.map(customer => {
    const totalOrders = customer.orders?.length || 0;
    const totalSpent = customer.orders?.reduce((sum: number, order: any) => 
      sum + Number(order.totalAmount), 0) || 0;
    const paidOrders = customer.orders?.filter((order: any) => 
      order.paymentStatus === "PAID").length || 0;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Calculate days since last order
    const lastOrderDate = customer.orders && customer.orders.length > 0 
      ? Math.max(...customer.orders.map((o: any) => o.createdAt.getTime()))
      : null;
    const daysSinceLastOrder = lastOrderDate 
      ? Math.floor((Date.now() - lastOrderDate) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate days since last login
    const daysSinceLastLogin = customer.lastLoginAt
      ? Math.floor((Date.now() - customer.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      ...customer,
      phone: customer.phone || undefined,
      company: customer.company || undefined,
      position: customer.position || undefined,
      lastLoginAt: customer.lastLoginAt?.toISOString() || undefined,
      createdAt: customer.createdAt.toISOString(),
      // Add CRM fields with fallback values
      customerType: (customer as any).customerType || "B2C",
      industry: (customer as any).industry || undefined,
      companySize: (customer as any).companySize || undefined,
      customerTier: (customer as any).customerTier || "BRONZE",
      healthScore: (customer as any).healthScore || 0,
      tags: (customer as any).tags || [],
      lifecycleStage: (customer as any).lifecycleStage || "CUSTOMER",
      metrics: {
        totalOrders,
        totalSpent,
        paidOrders,
        averageOrderValue,
        daysSinceLastOrder: daysSinceLastOrder || undefined,
        daysSinceLastLogin: daysSinceLastLogin || undefined
      }
    };
  });

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black">
      <div className="space-y-6 pt-20 p-6">
      {/* Clean Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">مدیریت مشتریان</h1>
          <p className="text-gray-300 mt-2">
            مدیریت و تحلیل روابط مشتریان
          </p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{totalCount}</div>
            <div className="text-sm text-gray-300">کل مشتریان</div>
          </div>
          <div className="w-px h-12 bg-gray-600"></div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{customersWithMetrics.length}</div>
            <div className="text-sm text-gray-300">نمایش داده شده</div>
          </div>
        </div>
      </div>

      <CustomerList
        customers={customersWithMetrics}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        tier={tier}
        stage={stage}
        locale={locale}
      />
      </div>
    </div>
  );
}
