"use client";

import Link from "next/link";
import Image from "next/image";
import { EducationLesson } from "@/types/education";
import { LessonDifficulty } from "@prisma/client";

interface LessonContentProps {
  lesson: EducationLesson;
  relatedLessons: EducationLesson[];
  locale: string;
}

export default function LessonContent({ lesson, relatedLessons, locale }: LessonContentProps) {
  const getDifficultyLabel = (difficulty: LessonDifficulty) => {
    const labels = {
      BEGINNER: "مبتدی",
      INTERMEDIATE: "متوسط",
      ADVANCED: "پیشرفته",
      EXPERT: "حرفه‌ای",
    };
    return labels[difficulty];
  };

  const getDifficultyColor = (difficulty: LessonDifficulty) => {
    const colors = {
      BEGINNER: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400",
      INTERMEDIATE: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
      ADVANCED: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400",
      EXPERT: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
    };
    return colors[difficulty];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    // Vimeo
    if (url.includes("vimeo.com/")) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
    // Return original URL if not recognized
    return url;
  };

  const isUploadedVideo = (url: string) => {
    return url.startsWith('/uploads/videos/') || url.startsWith('/api/uploads/videos/');
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href={`/${locale}`} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
          خانه
        </Link>
        <span>/</span>
        <Link href={`/${locale}/education`} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
          آموزش
        </Link>
        {lesson.category && (
          <>
            <span>/</span>
            <Link href={`/${locale}/education?category=${lesson.category.slug}`} className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
              {lesson.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{lesson.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            {lesson.category && (
              <div className="mb-4">
                <Link
                  href={`/${locale}/education?category=${lesson.category.slug}`}
                  className="inline-block bg-primary-orange/20 text-primary-orange px-3 py-1 rounded-full text-sm font-medium hover:bg-primary-orange/30 transition-colors duration-200"
                >
                  {lesson.category.name}
                </Link>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {lesson.title}
            </h1>

            {lesson.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                {lesson.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>
                  {lesson.author ? `${lesson.author.firstName} ${lesson.author.lastName}` : "نویسنده نامشخص"}
                </span>
              </div>
              {lesson.publishedAt && (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(lesson.publishedAt)}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{lesson.viewCount} بازدید</span>
              </div>
              {lesson.estimatedTime && (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{lesson.estimatedTime} دقیقه</span>
                </div>
              )}
            </div>
          </div>

          {/* Content Type Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-sm font-medium ${getDifficultyColor(lesson.difficulty)}`}>
              سطح: {getDifficultyLabel(lesson.difficulty)}
            </span>
            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-medium">
              {lesson.contentType === "TEXT" ? "📄 متنی" :
               lesson.contentType === "VIDEO" ? "🎥 ویدیویی" : "📹 ترکیبی"}
            </span>
          </div>

          {/* Video Content */}
          {lesson.videoUrl && (
            <div className="glass rounded-3xl overflow-hidden">
              <div className="aspect-video bg-black">
                {isUploadedVideo(lesson.videoUrl) ? (
                  // Direct video playback for uploaded videos
                  <video
                    src={lesson.videoUrl}
                    controls
                    className="w-full h-full"
                    preload="metadata"
                  >
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
                ) : (
                  // Embedded video for external URLs (YouTube, Vimeo, etc.)
                  <iframe
                    src={getVideoEmbedUrl(lesson.videoUrl)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                )}
              </div>
            </div>
          )}

          {/* Text Content */}
          {lesson.content && (
            <div className="glass rounded-3xl p-8">
              <div
                className="prose prose-lg dark:prose-invert max-w-none text-gray-900 dark:text-white"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
          )}

          {/* Thumbnail if no video */}
          {!lesson.videoUrl && lesson.thumbnail && (
            <div className="glass rounded-3xl overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={lesson.thumbnail}
                  alt={lesson.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lesson Info Card */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">اطلاعات درس</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">نوع محتوا:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {lesson.contentType === "TEXT" ? "متنی" :
                   lesson.contentType === "VIDEO" ? "ویدیویی" : "ترکیبی"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">سطح:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                  {getDifficultyLabel(lesson.difficulty)}
                </span>
              </div>
              {lesson.videoDuration && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">مدت زمان:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatDuration(lesson.videoDuration)}
                  </span>
                </div>
              )}
              {lesson.estimatedTime && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">زمان تخمینی:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {lesson.estimatedTime} دقیقه
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">بازدید:</span>
                <span className="text-gray-900 dark:text-white font-medium">{lesson.viewCount}</span>
              </div>
            </div>
          </div>

          {/* Related Lessons */}
          {relatedLessons.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">دروس مرتبط</h3>
              <div className="space-y-4">
                {relatedLessons.map((relatedLesson) => (
                  <Link
                    key={relatedLesson.id}
                    href={`/${locale}/education/${relatedLesson.slug}`}
                    className="block group"
                  >
                    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-200">
                      {relatedLesson.thumbnail ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={relatedLesson.thumbnail}
                            alt={relatedLesson.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">
                            {relatedLesson.contentType === "TEXT" ? "📄" :
                             relatedLesson.contentType === "VIDEO" ? "🎥" : "📹"}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-orange transition-colors duration-200">
                          {relatedLesson.title}
                        </h4>
                        {relatedLesson.excerpt && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {relatedLesson.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

