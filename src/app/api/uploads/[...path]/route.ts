import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join("/");
    
    // Security: Only allow access to uploads directory
    if (filePath.includes("..") || filePath.startsWith("/")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const fullPath = join(process.cwd(), "public", "uploads", filePath);
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(fullPath);
    
    // Determine content type based on file extension
    const ext = filePath.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    
    switch (ext) {
      case "jpg":
      case "jpeg":
        contentType = "image/jpeg";
        break;
      case "png":
        contentType = "image/png";
        break;
      case "webp":
        contentType = "image/webp";
        break;
      case "avif":
        contentType = "image/avif";
        break;
      case "mp4":
        contentType = "video/mp4";
        break;
      case "mov":
        contentType = "video/quicktime";
        break;
      case "avi":
        contentType = "video/x-msvideo";
        break;
    }

    // Return file with appropriate headers
    const isVideo = contentType.startsWith('video/');
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000", // Cache for 1 year
    };
    
    // Enable range requests for video streaming
    if (isVideo) {
      headers["Accept-Ranges"] = "bytes";
    }
    
    return new Response(new Uint8Array(fileBuffer), { headers });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
