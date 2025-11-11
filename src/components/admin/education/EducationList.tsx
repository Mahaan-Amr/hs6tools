"use client";

import { useState } from "react";
import { ArticleStatus, LessonContentType, LessonDifficulty } from "@prisma/client";
import { EducationLesson } from "@/types/education";

interface EducationListProps {
  lessons: EducationLesson[];
  onEdit: (lesson: EducationLesson) => void;
  onDelete: (lessonId: string) => void;
}

export default function EducationList({ lessons, onEdit, onDelete }: EducationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "ALL">("ALL");
  const [contentTypeFilter, setContentTypeFilter] = useState<LessonContentType | "ALL">("ALL");

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lesson.excerpt && lesson.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || lesson.status === statusFilter;
    const matchesContentType = contentTypeFilter === "ALL" || lesson.contentType === contentTypeFilter;
    return matchesSearch && matchesStatus && matchesContentType;
  });

  const getStatusBadge = (status: ArticleStatus) => {
    const statusConfig = {
      DRAFT: { label: "پیش‌نویس", color: "bg-gray-500" },
      PUBLISHED: { label: "منتشر شده", color: "bg-green-500" },
      ARCHIVED: { label: "آرشیو شده", color: "bg-yellow-500" },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs rounded-full text-white ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getContentTypeBadge = (type: LessonContentType) => {
    const typeConfig = {
      TEXT: { label: "متنی", color: "bg-blue-500", icon: "📄" },
      VIDEO: { label: "ویدیویی", color: "bg-purple-500", icon: "🎥" },
      MIXED: { label: "ترکیبی", color: "bg-indigo-500", icon: "📹" },
    };

    const config = typeConfig[type];
    return (
      <span className={`px-2 py-1 text-xs rounded-full text-white ${config.color} flex items-center space-x-1`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: LessonDifficulty) => {
    const diffConfig = {
      BEGINNER: { label: "مبتدی", color: "bg-green-500" },
      INTERMEDIATE: { label: "متوسط", color: "bg-yellow-500" },
      ADVANCED: { label: "پیشرفته", color: "bg-orange-500" },
      EXPERT: { label: "حرفه‌ای", color: "bg-red-500" },
    };

    const config = diffConfig[difficulty];
    return (
      <span className={`px-2 py-1 text-xs rounded-full text-white ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fa-IR");
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">هیچ درسی یافت نشد</h3>
        <p className="text-gray-600 dark:text-gray-300">برای شروع، درس جدیدی ایجاد کنید</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="جستجو در دروس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ArticleStatus | "ALL")}
            className="w-full pl-4 pr-12 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer"
          >
            <option value="ALL" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">همه وضعیت‌ها</option>
            <option value="DRAFT" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">پیش‌نویس</option>
            <option value="PUBLISHED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">منتشر شده</option>
            <option value="ARCHIVED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">آرشیو شده</option>
          </select>
        </div>
        <div className="sm:w-48">
          <select
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value as LessonContentType | "ALL")}
            className="w-full pl-4 pr-12 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all appearance-none cursor-pointer"
          >
            <option value="ALL" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">همه انواع</option>
            <option value="TEXT" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">متنی</option>
            <option value="VIDEO" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">ویدیویی</option>
            <option value="MIXED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">ترکیبی</option>
          </select>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <div key={lesson.id} className="glass rounded-2xl p-6 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {lesson.title}
                </h3>
                {lesson.excerpt && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                    {lesson.excerpt}
                  </p>
                )}
              </div>
              {lesson.isFeatured && (
                <span className="px-2 py-1 bg-primary-orange text-white text-xs rounded-full ml-2">
                  ویژه
                </span>
              )}
            </div>

            {/* Meta Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">نوع محتوا:</span>
                {getContentTypeBadge(lesson.contentType)}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">سطح:</span>
                {getDifficultyBadge(lesson.difficulty)}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">وضعیت:</span>
                {getStatusBadge(lesson.status)}
              </div>
              
              {lesson.category && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">دسته‌بندی:</span>
                  <span className="text-gray-900 dark:text-white">{lesson.category.name}</span>
                </div>
              )}
              
              {lesson.videoDuration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">مدت زمان:</span>
                  <span className="text-gray-900 dark:text-white">{formatDuration(lesson.videoDuration)}</span>
                </div>
              )}
              
              {lesson.estimatedTime && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">زمان تخمینی:</span>
                  <span className="text-gray-900 dark:text-white">{lesson.estimatedTime} دقیقه</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">تاریخ ایجاد:</span>
                <span className="text-gray-900 dark:text-white">{formatDate(lesson.createdAt)}</span>
              </div>
              
              {lesson.publishedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">تاریخ انتشار:</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(lesson.publishedAt)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">بازدید:</span>
                <span className="text-gray-900 dark:text-white">{lesson.viewCount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(lesson)}
                  className="px-3 py-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 text-sm"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => onDelete(lesson.id)}
                  className="px-3 py-2 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200 text-sm"
                >
                  حذف
                </button>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {lesson.author && `${lesson.author.firstName} ${lesson.author.lastName}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLessons.length === 0 && lessons.length > 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">نتیجه‌ای یافت نشد</h3>
          <p className="text-gray-600 dark:text-gray-300">لطفاً فیلترهای جستجو را تغییر دهید</p>
        </div>
      )}
    </div>
  );
}

