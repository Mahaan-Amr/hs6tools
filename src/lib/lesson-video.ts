export type LessonVideo = {
  kind: "upload" | "embed";
  url: string;
};

const VIDEO_ID = /^[A-Za-z0-9_-]{6,64}$/;
const LOCAL_VIDEO = /^\/(?:api\/)?uploads\/videos\/[A-Za-z0-9_./-]+\.(?:mp4|mov)$/i;

export function normalizeLessonVideo(value: string | null | undefined): LessonVideo | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  if (LOCAL_VIDEO.test(candidate) && !candidate.includes("..")) {
    return { kind: "upload", url: candidate };
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;

  const host = parsed.hostname.toLowerCase();
  let youtubeId: string | null = null;

  if (host === "youtu.be") {
    youtubeId = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (host === "youtube.com" || host === "www.youtube.com") {
    youtubeId = parsed.pathname === "/watch"
      ? parsed.searchParams.get("v")
      : parsed.pathname.match(/^\/embed\/([^/]+)$/)?.[1] ?? null;
  } else if (host === "youtube-nocookie.com" || host === "www.youtube-nocookie.com") {
    youtubeId = parsed.pathname.match(/^\/embed\/([^/]+)$/)?.[1] ?? null;
  }

  if (youtubeId && VIDEO_ID.test(youtubeId)) {
    return { kind: "embed", url: `https://www.youtube.com/embed/${youtubeId}` };
  }

  let vimeoId: string | null = null;
  if (host === "vimeo.com" || host === "www.vimeo.com") {
    vimeoId = parsed.pathname.match(/^\/(\d+)\/?$/)?.[1] ?? null;
  } else if (host === "player.vimeo.com") {
    vimeoId = parsed.pathname.match(/^\/video\/(\d+)\/?$/)?.[1] ?? null;
  }

  if (vimeoId) {
    return { kind: "embed", url: `https://player.vimeo.com/video/${vimeoId}` };
  }

  return null;
}
