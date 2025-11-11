"use client";

import { useState, useEffect } from "react";
import { EducationLesson } from "@/types/education";
import EducationForm from "./EducationForm";
import EducationList from "./EducationList";

export default function EducationTab() {
  const [lessons, setLessons] = useState<EducationLesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<EducationLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/education/lessons");
      if (response.ok) {
        const data = await response.json();
        setLessons(data.data || []);
      } else {
        setError("خطا در دریافت دروس آموزشی");
      }
    } catch {
      setError("خطا در اتصال به سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLesson = () => {
    setEditingLesson(null);
    setShowForm(true);
  };

  const handleEditLesson = (lesson: EducationLesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLesson(null);
  };

  const handleLessonSaved = () => {
    fetchLessons();
    handleFormClose();
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("آیا از حذف این درس آموزشی اطمینان دارید؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/education/lessons/${lessonId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchLessons();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در حذف درس آموزشی");
      }
    } catch {
      alert("خطا در اتصال به سرور");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">خطا</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
        <button
          onClick={fetchLessons}
          className="px-6 py-3 bg-primary-orange text-white rounded-xl hover:bg-orange-600 transition-colors duration-200"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">دروس آموزشی</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {lessons.length} درس موجود است
          </p>
        </div>
        <button
          onClick={handleCreateLesson}
          className="px-6 py-3 bg-primary-orange text-white rounded-xl hover:bg-orange-600 transition-colors duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>درس جدید</span>
        </button>
      </div>

      {/* Lessons List */}
      <EducationList
        lessons={lessons}
        onEdit={handleEditLesson}
        onDelete={handleDeleteLesson}
      />

      {/* Lesson Form Modal */}
      {showForm && (
        <EducationForm
          lesson={editingLesson}
          onClose={handleFormClose}
          onSaved={handleLessonSaved}
        />
      )}
    </div>
  );
}

