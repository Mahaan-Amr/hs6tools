import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


// GET /api/customer/profile - Get current customer profile
export async function GET() {
  try {
    console.log('🔍 API: /api/customer/profile - Starting request');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 API: Session:', session ? 'exists' : 'null', 'User ID:', session?.user?.id);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      console.log('❌ API: No session or user ID');
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log('🔍 API: Fetching user with ID:', session.user.id);
    
    // First, let's check if the user exists at all
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    console.log('🔍 API: User exists check:', !!userExists, 'User data:', userExists);
    
    if (!userExists) {
      console.log('❌ API: User not found in database with ID:', session.user.id);
      
      // Let's check what users exist in the database
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, firstName: true, lastName: true }
      });
      console.log('🔍 API: All users in database:', allUsers);
      
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get user profile with addresses and recent orders
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    });

    console.log('🔍 API: Database query result - User found:', !!user, 'User ID:', user?.id);

    if (!user) {
      console.log('❌ API: User not found in database');
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log('🔍 API: User found, transforming data...');
    console.log('🔍 API: User details - Email:', user.email, 'Name:', user.firstName, user.lastName);
    console.log('🔍 API: Addresses count:', user.addresses.length);
    console.log('🔍 API: Orders count:', user.orders.length);

    // Transform user data for response
    const profileData = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      position: user.position,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      addresses: user.addresses.map(address => ({
        id: address.id,
        type: address.type,
        title: address.title,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault
      })),
      recentOrders: user.orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString(),
        items: order.orderItems.map(item => ({
          id: item.id,
          productName: item.name, // OrderItem has its own name field
          productImage: item.image, // OrderItem has its own image field
          quantity: item.quantity,
          price: item.unitPrice
        }))
      }))
    };

    console.log('🔍 API: Profile data transformed successfully');
    console.log('🔍 API: Sending response with profile data');

    return NextResponse.json({ success: true, data: profileData });

  } catch (error) {
    console.error("❌ API: Error fetching customer profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/customer/profile - Update customer profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, company, position } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        phone: phone || null,
        company: company || null,
        position: position || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        company: updatedUser.company,
        position: updatedUser.position,
        updatedAt: updatedUser.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error("Error updating customer profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
