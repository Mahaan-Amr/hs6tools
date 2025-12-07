import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressType, Prisma } from "@prisma/client";

interface AddressFormData {
  type: AddressType;
  title: string;
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// GET /api/customer/addresses - Get all customer addresses
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/customer/addresses - Create new address
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let addressData: AddressFormData | null = null;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error("❌ Address Creation: Authentication required");
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify user exists in database before creating address
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, isActive: true }
    });

    if (!userExists) {
      console.error("❌ Address Creation: User not found in database with ID:", session.user.id);
      return NextResponse.json(
        { 
          success: false, 
          error: "User account not found. Please log out and log in again." 
        },
        { status: 404 }
      );
    }

    if (!userExists.isActive) {
      console.error("❌ Address Creation: User account is inactive:", session.user.id);
      return NextResponse.json(
        { 
          success: false, 
          error: "Your account has been deactivated. Please contact support." 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    addressData = {
      type: body.type,
      title: body.title?.trim(),
      firstName: body.firstName?.trim(),
      lastName: body.lastName?.trim(),
      company: body.company?.trim() || null,
      addressLine1: body.addressLine1?.trim(),
      addressLine2: body.addressLine2?.trim() || null,
      city: body.city?.trim(),
      state: body.state?.trim(),
      postalCode: body.postalCode?.trim(),
      country: body.country?.trim(),
      phone: body.phone?.trim(),
      isDefault: body.isDefault || false
    };

    // Comprehensive validation
    const validationErrors: string[] = [];

    // Required fields validation
    if (!addressData.type) validationErrors.push("Address type is required");
    if (!addressData.title) validationErrors.push("Title is required");
    if (!addressData.firstName) validationErrors.push("First name is required");
    if (!addressData.lastName) validationErrors.push("Last name is required");
    if (!addressData.addressLine1) validationErrors.push("Address line 1 is required");
    if (!addressData.city) validationErrors.push("City is required");
    if (!addressData.state) validationErrors.push("State/Province is required");
    if (!addressData.postalCode) validationErrors.push("Postal code is required");
    if (!addressData.country) validationErrors.push("Country is required");
    if (!addressData.phone) validationErrors.push("Phone number is required");

    // Field length validation
    if (addressData.title && addressData.title.length > 100) {
      validationErrors.push("Title must be 100 characters or less");
    }
    if (addressData.firstName && addressData.firstName.length > 50) {
      validationErrors.push("First name must be 50 characters or less");
    }
    if (addressData.lastName && addressData.lastName.length > 50) {
      validationErrors.push("Last name must be 50 characters or less");
    }
    if (addressData.company && addressData.company.length > 100) {
      validationErrors.push("Company name must be 100 characters or less");
    }
    if (addressData.addressLine1 && addressData.addressLine1.length > 200) {
      validationErrors.push("Address line 1 must be 200 characters or less");
    }
    if (addressData.addressLine2 && addressData.addressLine2.length > 200) {
      validationErrors.push("Address line 2 must be 200 characters or less");
    }
    if (addressData.city && addressData.city.length > 100) {
      validationErrors.push("City must be 100 characters or less");
    }
    if (addressData.state && addressData.state.length > 100) {
      validationErrors.push("State/Province must be 100 characters or less");
    }
    if (addressData.postalCode && addressData.postalCode.length > 20) {
      validationErrors.push("Postal code must be 20 characters or less");
    }
    if (addressData.country && addressData.country.length > 100) {
      validationErrors.push("Country must be 100 characters or less");
    }
    if (addressData.phone && addressData.phone.length > 20) {
      validationErrors.push("Phone number must be 20 characters or less");
    }

    // Format validation
    // Phone validation (Iranian format: +98 or 0 followed by 9 and 9 digits)
    if (addressData.phone) {
      const phoneRegex = /^(\+98|0)?9\d{9}$/;
      const cleanPhone = addressData.phone.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        validationErrors.push("Phone number must be a valid Iranian mobile number (e.g., 09123456789)");
      }
    }

    // Postal code validation (Iranian format: 10 digits)
    if (addressData.postalCode) {
      const postalCodeRegex = /^\d{10}$/;
      const cleanPostalCode = addressData.postalCode.replace(/\s/g, '');
      if (!postalCodeRegex.test(cleanPostalCode)) {
        validationErrors.push("Postal code must be exactly 10 digits");
      }
    }

    // Validate address type
    if (addressData.type && !Object.values(AddressType).includes(addressData.type)) {
      validationErrors.push(`Invalid address type. Must be one of: ${Object.values(AddressType).join(', ')}`);
    }

    if (validationErrors.length > 0) {
      console.error("❌ Address Creation: Validation failed for user:", session.user.id, {
        errors: validationErrors,
        addressData: addressData ? { ...addressData, phone: '***', postalCode: '***' } : null // Don't log sensitive data
      });
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed",
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // At this point, addressData is guaranteed to be non-null and all required fields are present
    if (!addressData) {
      return NextResponse.json(
        { success: false, error: "Address data is missing" },
        { status: 400 }
      );
    }

    // TypeScript type narrowing: addressData is now guaranteed to be AddressFormData after null check
    // After validation, all required fields are present, so we can safely assert the type
    const validatedAddressData = addressData as AddressFormData;

    // Create address in transaction to ensure atomicity
    // If setting as default, unset other defaults of the same type within the same transaction
    const address = await prisma.$transaction(async (tx) => {
    // If setting as default, unset other defaults of the same type
      if (validatedAddressData.isDefault) {
        await tx.address.updateMany({
        where: {
          userId: session.user.id,
            type: validatedAddressData.type,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

      // Create the new address
      const newAddress = await tx.address.create({
      data: {
        userId: session.user.id,
          type: validatedAddressData.type,
          title: validatedAddressData.title,
          firstName: validatedAddressData.firstName,
          lastName: validatedAddressData.lastName,
          company: validatedAddressData.company,
          addressLine1: validatedAddressData.addressLine1,
          addressLine2: validatedAddressData.addressLine2,
          city: validatedAddressData.city,
          state: validatedAddressData.state,
          postalCode: validatedAddressData.postalCode,
          country: validatedAddressData.country,
          phone: validatedAddressData.phone,
          isDefault: validatedAddressData.isDefault
        }
      });

      return newAddress;
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Address Creation: Success for user ${session.user.id} in ${duration}ms`, {
      addressId: address.id,
      type: address.type,
      isDefault: address.isDefault
    });

    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log detailed error information
    console.error("❌ Address Creation: Error occurred", {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      addressData: addressData ? {
        ...addressData,
        phone: '***',
        postalCode: '***'
      } : null
    });

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        console.error('❌ Address Creation: Foreign key constraint violation:', error.meta);
        return NextResponse.json(
          { 
            success: false, 
            error: "User account not found. Please log out and log in again." 
          },
          { status: 404 }
        );
      }
      
      if (error.code === 'P2002') {
        console.error('❌ Address Creation: Unique constraint violation:', error.meta);
        return NextResponse.json(
          { 
            success: false, 
            error: "An address with these details already exists." 
          },
          { status: 409 }
        );
      }

      if (error.code === 'P2025') {
        console.error('❌ Address Creation: Record not found:', error.meta);
        return NextResponse.json(
          { 
            success: false, 
            error: "Related record not found. Please try again." 
          },
          { status: 404 }
        );
      }
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error('❌ Address Creation: Prisma validation error:', error.message);
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid data provided. Please check your address details.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create address. Please try again.",
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
