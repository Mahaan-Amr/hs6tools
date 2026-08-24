import { NextResponse } from "next/server";
import { normalizeLessonVideo } from "./lesson-video";

export function validateLessonVideoInput(value: string | null | undefined) {
  const video = normalizeLessonVideo(value);

  if (value?.trim() && !video) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "فقط ویدیوهای آپلودشده، YouTube و Vimeo پشتیبانی می‌شوند" },
        { status: 400 },
      ),
    };
  }

  return { ok: true as const, video };
}
