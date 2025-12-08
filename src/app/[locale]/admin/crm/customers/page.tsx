import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerList from "@/components/admin/crm/CustomerList";
import { Prisma } from "@prisma/client";
import { getMessages } from "@/lib/i18n";

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
  
  // Load messages with error handling - don't block rendering
  let messages;
  try {
    messages = await getMessages(locale);
  } catch (error) {
    console.error('Error loading messages in customers page:', error);
    messages = null;
  }
  
  // Use fallback if messages or customersPage is missing
  const t = messages?.admin?.customersPage || {
    title: "مدیریت مشتریان",
    subtitle: "مشاهده و مدیریت تمام مشتریان سیستم",
    totalCustomers: "کل مشتریان",
    showing: "نمایش"
  };
  
  const currentPage = parseInt(page || "1");
  const limit = 20;
  const skip = (currentPage - 1) * limit;

  // Build where clause for filtering
  const where: Prisma.UserWhereInput = {
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
    where.customerTier = { equals: tier as "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" } as Prisma.EnumCustomerTierNullableFilter<"User">;
  }

  if (stage) {
    where.lifecycleStage = { equals: stage as "LEAD" | "PROSPECT" | "CUSTOMER" | "LOYAL_CUSTOMER" | "AT_RISK" | "CHURNED" } as Prisma.EnumLifecycleStageNullableFilter<"User">;
  }

  // Get customers with pagination - with error handling
  let customers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    company: string | null;
    position: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    customerType: string | null;
    industry: string | null;
    companySize: string | null;
    customerTier: string | null;
    healthScore: number | null;
    tags: string[];
    lifecycleStage: string | null;
    orders: Array<{
      totalAmount: { toString(): string; toNumber(): number } | number;
      paymentStatus: string;
      createdAt: Date;
    }>;
  }> = [];
  let totalCount = 0;
  
  try {
    // Add timeout to prevent hanging
    const customersPromise = prisma.user.findMany({
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
        customerType: true,
        industry: true,
        companySize: true,
        customerTier: true,
        healthScore: true,
        tags: true,
        lifecycleStage: true,
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
    });
    
    const countPromise = prisma.user.count({ where });
    
    // Race with timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 10000);
    });
    
    const result = await Promise.race([
      Promise.all([customersPromise, countPromise]),
      timeoutPromise
    ]);
    
    if (Array.isArray(result) && result.length === 2) {
      // Type assertion needed because Prisma returns Decimal for totalAmount
      customers = result[0] as typeof customers;
      totalCount = result[1] as number;
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    // Continue with empty arrays - don't block rendering
    customers = [];
    totalCount = 0;
  }

  // Calculate customer metrics
  const customersWithMetrics = customers.map(customer => {
    const orders = customer.orders || [];
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum: number, order) => {
      // Handle Prisma Decimal type
      const amount = typeof order.totalAmount === 'object' && 'toNumber' in order.totalAmount 
        ? order.totalAmount.toNumber() 
        : Number(order.totalAmount);
      return sum + amount;
    }, 0);
    const paidOrders = orders.filter((order) => 
      String(order.paymentStatus) === "PAID").length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Calculate days since last order
    const lastOrderDate = orders.length > 0 
      ? Math.max(...orders.map((o) => o.createdAt.getTime()))
      : null;
    const daysSinceLastOrder = lastOrderDate 
      ? Math.floor((Date.now() - lastOrderDate) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate days since last login
    const daysSinceLastLogin = customer.lastLoginAt
      ? Math.floor((Date.now() - customer.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Convert customer data, excluding orders array (which contains Decimal objects)
    // We only use orders for calculations, not for passing to client component
    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || undefined,
      company: customer.company || undefined,
      position: customer.position || undefined,
      lastLoginAt: customer.lastLoginAt?.toISOString() || undefined,
      createdAt: customer.createdAt.toISOString(),
      // Add CRM fields with fallback values
      customerType: customer.customerType || "B2C",
      industry: customer.industry || undefined,
      companySize: customer.companySize || undefined,
      customerTier: customer.customerTier || "BRONZE",
      healthScore: customer.healthScore || 0,
      tags: customer.tags || [],
      lifecycleStage: customer.lifecycleStage || "CUSTOMER",
      metrics: {
        totalOrders,
        totalSpent,
        paidOrders,
        averageOrderValue,
        daysSinceLastOrder: daysSinceLastOrder || undefined,
        daysSinceLastLogin: daysSinceLastLogin || undefined
      }
      // Explicitly exclude orders array - it contains Decimal objects that can't be serialized
    };
  });

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black via-gray-900 to-primary-black">
      <div className="space-y-6 pt-20 p-6">
      {/* Clean Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{String(t.title)}</h1>
          <p className="text-gray-300 mt-2">
            {String(t.subtitle)}
          </p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{totalCount}</div>
            <div className="text-sm text-gray-300">{String(t.totalCustomers)}</div>
          </div>
          <div className="w-px h-12 bg-gray-600"></div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{customersWithMetrics.length}</div>
            <div className="text-sm text-gray-300">{String(t.showing)}</div>
          </div>
        </div>
      </div>

      <CustomerList
        customers={customersWithMetrics as Array<{
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          phone?: string;
          company?: string;
          position?: string;
          customerType?: string;
          industry?: string;
          companySize?: string;
          customerTier?: string;
          healthScore?: number;
          tags: string[];
          lifecycleStage?: string;
          lastLoginAt?: string;
          createdAt: string;
          metrics: {
            totalOrders: number;
            totalSpent: number;
            paidOrders: number;
            averageOrderValue: number;
            daysSinceLastOrder?: number;
            daysSinceLastLogin?: number;
          };
        }>}
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
