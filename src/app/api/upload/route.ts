import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fileStorage } from "@/lib/file-storage";
import { rateLimitByIp } from "@/lib/rateLimit";
import { isAllowedOrigin } from "@/utils/origin";
import { hasRole } from "@/lib/authz";

export async function POST(request: NextRequest) {
  try {
    // Rate limit uploads to reduce abuse
    const forwarded = request.headers.get("x-forwarded-for");
    const ip =
      (forwarded && forwarded.split(",")[0]?.trim()) ||
      request.headers.get("x-real-ip") ||
      null;
    const limitResult = rateLimitByIp(ip, "upload", 10, 5 * 60 * 1000); // 10 uploads / 5 min
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please try again later." },
        { status: 429 }
      );
    }

    // CSRF: require same-origin requests
    const origin = request.headers.get("origin");
    const host = request.headers.get("host") || "";
    if (!isAllowedOrigin(origin, host)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    // Check authentication and admin access
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, ["ADMIN", "SUPER_ADMIN"])) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string || "general";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type - support both images and videos
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"]; // MP4, MOV, AVI
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images (JPEG, PNG, WebP, AVIF) and videos (MP4, MOV) are allowed" },
        { status: 400 }
      );
    }

    // Validate file size based on file type
    const isVideo = allowedVideoTypes.includes(file.type);
    const maxSize = isVideo ? 250 * 1024 * 1024 : 5 * 1024 * 1024; // 250MB for videos, 5MB for images
    const maxSizeLabel = isVideo ? "250MB" : "5MB";
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size too large. Maximum size is ${maxSizeLabel}` },
        { status: 400 }
      );
    }

    // Store the actual file and get real file information
    const storedFile = await fileStorage.storeFile(file, category);

    // Return the real file information
    const uploadResult = {
      success: true,
      file: {
        id: storedFile.id,
        name: storedFile.name,
        originalName: storedFile.originalName,
        url: storedFile.url,
        size: storedFile.size,
        type: storedFile.type,
        uploadedAt: storedFile.uploadedAt
      }
    };

    return NextResponse.json(uploadResult);

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
