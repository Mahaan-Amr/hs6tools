import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeLessonVideo } from "../src/lib/lesson-video";

test("lesson videos normalize supported uploads and video providers", () => {
  assert.deepEqual(normalizeLessonVideo("/uploads/videos/safety.mp4"), {
    kind: "upload",
    url: "/uploads/videos/safety.mp4",
  });
  assert.deepEqual(normalizeLessonVideo("/api/uploads/videos/legacy.mov"), {
    kind: "upload",
    url: "/api/uploads/videos/legacy.mov",
  });
  assert.deepEqual(
    normalizeLessonVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    { kind: "embed", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  );
  assert.deepEqual(normalizeLessonVideo("https://vimeo.com/123456"), {
    kind: "embed",
    url: "https://player.vimeo.com/video/123456",
  });
});

test("lesson videos reject deceptive hosts, scripts, and arbitrary embeds", () => {
  assert.equal(normalizeLessonVideo("https://youtube.com.evil.example/watch?v=x"), null);
  assert.equal(normalizeLessonVideo("javascript:alert(1)"), null);
  assert.equal(normalizeLessonVideo("data:text/html;base64,eA=="), null);
  assert.equal(normalizeLessonVideo("https://evil.example/embed/tracker"), null);
  assert.equal(normalizeLessonVideo("/uploads/videos/../evil.html"), null);
});
