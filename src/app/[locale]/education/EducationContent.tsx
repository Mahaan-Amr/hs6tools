"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { EducationLesson, EducationCategory } from "@/types/education";
import { LessonContentType, LessonDifficulty } from "@prisma/client";

interface EducationContentProps {
  locale: string;
}

export default function EducationContent({ locale }: EducationContentProps) {
  const [categories, setCategories] = useState<EducationCategory[]>([]);
  const [lessons, setLessons] = useState<EducationLesson[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentTypeFilter, setContentTypeFilter] = useState<LessonContentType | "ALL">("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<LessonDifficulty | "ALL">("ALL");

  const fetchLessons = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        published: "true",
        limit: "20",
      });
      
      if (selectedCategory) {
        params.set("categoryId", selectedCategory);
      }
      
      if (contentTypeFilter !== "ALL") {
        params.set("contentType", contentTypeFilter);
      }
      
      if (difficultyFilter !== "ALL") {
        params.set("difficulty", difficultyFilter);
      }

      const response = await fetch(`/api/education/lessons?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLessons(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, contentTypeFilter, difficultyFilter]);

  useEffect(() => {
    fetchCategories();
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/education/categories?active=true&includeLessons=false");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getContentTypeIcon = (type: LessonContentType) => {
    switch (type) {
      case "TEXT":
        return "📄";
      case "VIDEO":
        return "🎥";
      case "MIXED":
        return "📹";
      default:
        return "📚";
    }
  };

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

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8" data-scroll-reveal>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              !selectedCategory
                ? "bg-primary-orange text-white"
                : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20"
            }`}
          >
            همه دسته‌بندی‌ها
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? "bg-primary-orange text-white"
                  : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20"
              }`}
            >
              {category.icon && <span className="ml-2">{category.icon}</span>}
              {category.name}
              {category._count && (
                <span className="mr-2 text-sm opacity-75">({category._count.lessons})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8" data-scroll-reveal style={{ transitionDelay: "0.05s" }}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع محتوا</label>
          <select
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value as LessonContentType | "ALL")}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer pr-12"
          >
            <option value="ALL" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">همه انواع</option>
            <option value="TEXT" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">متنی</option>
            <option value="VIDEO" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">ویدیویی</option>
            <option value="MIXED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">ترکیبی</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">سطح دشواری</label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as LessonDifficulty | "ALL")}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer pr-12"
          >
            <option value="ALL" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">همه سطوح</option>
            <option value="BEGINNER" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">مبتدی</option>
            <option value="INTERMEDIATE" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">متوسط</option>
            <option value="ADVANCED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">پیشرفته</option>
            <option value="EXPERT" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">حرفه‌ای</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12" data-scroll-reveal>
          <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white">در حال بارگذاری...</p>
        </div>
      )}

      {/* Lessons Grid */}
      {!isLoading && lessons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/${locale}/education/${lesson.slug}`}
              className="group glass rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300"
              data-scroll-reveal
              style={{ transitionDelay: `${index * 0.05}s` }}
            >
              {/* Thumbnail/Image */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                {lesson.thumbnail ? (
                  <Image
                    src={lesson.thumbnail}
                    alt={lesson.title}
                    fill
                    className="object-cover"
                  />
                ) : lesson.contentType === "VIDEO" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-primary-orange/20 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-primary-orange" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl">{getContentTypeIcon(lesson.contentType)}</div>
                  </div>
                )}
                
                {/* Content Type Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full flex items-center space-x-1">
                    <span>{getContentTypeIcon(lesson.contentType)}</span>
                    <span>
                      {lesson.contentType === "TEXT" ? "متنی" :
                       lesson.contentType === "VIDEO" ? "ویدیویی" : "ترکیبی"}
                    </span>
                  </span>
                </div>

                {/* Featured Badge */}
                {lesson.isFeatured && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-primary-orange text-white text-xs rounded-full">
                      ویژه
                    </span>
                  </div>
                )}

                {/* Video Duration */}
                {lesson.videoDuration && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded">
                      {formatDuration(lesson.videoDuration)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Category */}
                {lesson.category && (
                  <div className="mb-3">
                    <span className="inline-block bg-primary-orange/20 text-primary-orange px-2 py-1 rounded-full text-xs font-medium">
                      {lesson.category.name}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-orange transition-colors duration-200">
                  {lesson.title}
                </h3>

                {/* Excerpt */}
                {lesson.excerpt && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {lesson.excerpt}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                      {getDifficultyLabel(lesson.difficulty)}
                    </span>
                    {lesson.estimatedTime && (
                      <span className="text-gray-600 dark:text-gray-400">
                        ⏱ {lesson.estimatedTime} دقیقه
                      </span>
                    )}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    👁 {lesson.viewCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && lessons.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">درسی یافت نشد</h3>
          <p className="text-gray-600 dark:text-gray-300">
            متأسفانه درسی با این فیلترها پیدا نشد. لطفاً فیلترهای خود را تغییر دهید.
          </p>
        </div>
      )}
    </div>
  );
}

