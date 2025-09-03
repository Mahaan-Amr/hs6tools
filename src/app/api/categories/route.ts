import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get("includeProducts") === "true";
    const onlyActive = searchParams.get("onlyActive") !== "false";

    const whereClause = onlyActive ? { isActive: true } : {};

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        children: {
          where: onlyActive ? { isActive: true } : {},
          include: includeProducts ? {
            _count: {
              select: { products: true }
            }
          } : undefined
        },
        parent: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" }
      ]
    });

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: body.slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
        icon: body.icon,
        parentId: body.parentId || null,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords,
        isActive: body.isActive !== undefined ? body.isActive : true,
        sortOrder: body.sortOrder || 0,
        // Multilingual fields
        nameEn: body.nameEn,
        nameAr: body.nameAr,
        descriptionEn: body.descriptionEn,
        descriptionAr: body.descriptionAr
      },
      include: {
        parent: true,
        children: true
      }
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create category",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
