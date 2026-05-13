import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function normalizeOptionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.homepageSlide.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Slide not found" },
        { status: 404 }
      );
    }

    const nextButtonLabel =
      body.buttonLabel !== undefined ? normalizeOptionalText(body.buttonLabel) : existing.buttonLabel;
    const nextButtonHref =
      body.buttonHref !== undefined ? normalizeOptionalText(body.buttonHref) : existing.buttonHref;
    const nextTitle = body.title !== undefined ? String(body.title || "").trim() : existing.title;
    const nextDesktopImage =
      body.desktopImage !== undefined ? String(body.desktopImage || "").trim() : existing.desktopImage;

    if (!nextTitle || !nextDesktopImage) {
      return NextResponse.json(
        { success: false, error: "Title and desktop image are required" },
        { status: 400 }
      );
    }

    if (!!nextButtonLabel !== !!nextButtonHref) {
      return NextResponse.json(
        { success: false, error: "Button label and button link must be provided together" },
        { status: 400 }
      );
    }

    const slide = await prisma.homepageSlide.update({
      where: { id },
      data: {
        title: nextTitle,
        subtitle: body.subtitle !== undefined ? normalizeOptionalText(body.subtitle) : existing.subtitle,
        desktopImage: nextDesktopImage,
        mobileImage:
          body.mobileImage !== undefined ? normalizeOptionalText(body.mobileImage) : existing.mobileImage,
        bannerHref:
          body.bannerHref !== undefined ? normalizeOptionalText(body.bannerHref) : existing.bannerHref,
        buttonLabel: nextButtonLabel,
        buttonHref: nextButtonHref,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : existing.sortOrder,
      },
    });

    return NextResponse.json({ success: true, data: slide });
  } catch (error) {
    console.error("Error updating homepage slide:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update homepage slide" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const existing = await prisma.homepageSlide.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Slide not found" },
        { status: 404 }
      );
    }

    await prisma.homepageSlide.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting homepage slide:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete homepage slide" },
      { status: 500 }
    );
  }
}
