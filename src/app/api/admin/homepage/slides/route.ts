import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, Locale, locales } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";
import { HomepageSlideInput } from "@/types/homepage";

function resolveLocale(value: string | null): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

function normalizeOptionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const locale = resolveLocale(searchParams.get("locale"));

    const slides = await prisma.homepageSlide.findMany({
      where: { locale },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ success: true, data: slides });
  } catch (error) {
    console.error("Error fetching homepage slides:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch homepage slides" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(["ADMIN", "SUPER_ADMIN"]);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const locale = resolveLocale(body.locale);

    const payload: HomepageSlideInput = {
      locale,
      title: String(body.title || "").trim(),
      subtitle: normalizeOptionalText(body.subtitle),
      desktopImage: String(body.desktopImage || "").trim(),
      mobileImage: normalizeOptionalText(body.mobileImage),
      bannerHref: normalizeOptionalText(body.bannerHref),
      buttonLabel: normalizeOptionalText(body.buttonLabel),
      buttonHref: normalizeOptionalText(body.buttonHref),
      isActive: body.isActive !== false,
    };

    if (!payload.title || !payload.desktopImage) {
      return NextResponse.json(
        { success: false, error: "Title and desktop image are required" },
        { status: 400 }
      );
    }

    if (!!payload.buttonLabel !== !!payload.buttonHref) {
      return NextResponse.json(
        { success: false, error: "Button label and button link must be provided together" },
        { status: 400 }
      );
    }

    const existingContent = await prisma.homepageContent.findUnique({
      where: { locale },
      select: { id: true },
    });

    const maxSort = await prisma.homepageSlide.aggregate({
      where: { locale },
      _max: { sortOrder: true },
    });

    const slide = await prisma.homepageSlide.create({
      data: {
        ...payload,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        homepageContentId: existingContent?.id || null,
      },
    });

    return NextResponse.json({ success: true, data: slide }, { status: 201 });
  } catch (error) {
    console.error("Error creating homepage slide:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create homepage slide" },
      { status: 500 }
    );
  }
}
