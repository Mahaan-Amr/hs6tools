import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-auth";
import { fileStorage } from "@/lib/file-storage";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin access
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin(session.user.role)) {
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

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB" },
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
