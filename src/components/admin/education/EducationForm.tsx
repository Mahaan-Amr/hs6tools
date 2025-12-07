"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArticleStatus, LessonContentType, LessonDifficulty } from "@prisma/client";
import ImageUpload from "@/components/admin/common/ImageUpload";
import VideoUpload from "@/components/admin/common/VideoUpload";
import { EducationLesson, EducationCategory } from "@/types/education";
import { getMessages, Messages } from "@/lib/i18n";

interface ImageFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface EducationFormProps {
  lesson?: EducationLesson | null;
  onClose: () => void;
  onSaved: () => void;
  locale: string;
}

export default function EducationForm({ lesson, onClose, onSaved, locale }: EducationFormProps) {
  const [messages, setMessages] = useState<Messages | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    videoUrl: "",
    videoDuration: "",
    contentType: "TEXT" as LessonContentType,
    categoryId: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    status: "DRAFT" as ArticleStatus,
    isFeatured: false,
    difficulty: "BEGINNER" as LessonDifficulty,
    estimatedTime: "",
    sortOrder: "0",
  });

  const [images, setImages] = useState<ImageFile[]>([]);
  const [videoFile, setVideoFile] = useState<{ id: string; name: string; originalName: string; url: string; size: number; type: string; uploadedAt: string; duration?: number } | null>(null);
  const [videoInputMethod, setVideoInputMethod] = useState<"upload" | "url">("url");
  const [categories, setCategories] = useState<EducationCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

  const isEditing = !!lesson;

  useEffect(() => {
    fetchCategories();
    if (lesson) {
      setFormData({
        title: lesson.title,
        slug: lesson.slug,
        excerpt: lesson.excerpt || "",
        content: lesson.content || "",
        videoUrl: lesson.videoUrl || "",
        videoDuration: lesson.videoDuration?.toString() || "",
        contentType: lesson.contentType,
        categoryId: lesson.categoryId || "",
        metaTitle: lesson.metaTitle || "",
        metaDescription: lesson.metaDescription || "",
        metaKeywords: lesson.metaKeywords || "",
        status: lesson.status,
        isFeatured: lesson.isFeatured,
        difficulty: lesson.difficulty,
        estimatedTime: lesson.estimatedTime?.toString() || "",
        sortOrder: lesson.sortOrder.toString(),
      });
      
      // Convert thumbnail to images array if it exists
      if (lesson.thumbnail) {
        setImages([{
          id: 'existing',
          name: 'thumbnail',
          originalName: 'تصویر موجود',
          url: lesson.thumbnail,
          size: 0,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString()
        }]);
      }

      // Check if videoUrl is an uploaded video (starts with /uploads/videos/)
      if (lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/videos/')) {
        setVideoFile({
          id: 'existing',
          name: lesson.videoUrl.split('/').pop() || 'video',
          originalName: 'ویدیوی موجود',
          url: lesson.videoUrl,
          size: 0,
          type: 'video/mp4',
          uploadedAt: new Date().toISOString(),
          duration: lesson.videoDuration || undefined
        });
        setVideoInputMethod("upload");
      } else if (lesson.videoUrl) {
        setVideoInputMethod("url");
      }
    }
  }, [lesson]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/education/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === "title" && typeof value === "string") {
      const slug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug }));
    }
    
    // Auto-generate meta title from title
    if (field === "title" && typeof value === "string") {
      setFormData(prev => ({ ...prev, metaTitle: value }));
    }
    
    // Auto-generate meta description from excerpt
    if (field === "excerpt" && typeof value === "string") {
      setFormData(prev => ({ ...prev, metaDescription: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const validation = (messages?.admin as Record<string, unknown> | undefined)?.educationForm as Record<string, string> | undefined;

    if (!formData.title.trim()) {
      newErrors.title = validation?.titleRequired 
        ? String(validation.titleRequired) 
        : "Lesson title is required";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = validation?.titleMaxLength 
        ? String(validation.titleMaxLength) 
        : "Lesson title must be at most 200 characters";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = validation?.slugRequired 
        ? String(validation.slugRequired) 
        : "Slug is required";
    } else if (formData.slug.trim().length > 100) {
      newErrors.slug = validation?.slugMaxLength 
        ? String(validation.slugMaxLength) 
        : "Slug must be at most 100 characters";
    }

    // Validate content based on type
    if (formData.contentType === "TEXT" && !formData.content.trim()) {
      newErrors.content = validation?.contentRequired 
        ? String(validation.contentRequired) 
        : "Content is required for text lessons";
    }

    if (formData.contentType === "VIDEO") {
      const hasVideo = videoInputMethod === "upload" ? !!videoFile : formData.videoUrl.trim();
      if (!hasVideo) {
        newErrors.videoUrl = validation?.videoRequired 
          ? String(validation.videoRequired) 
          : "For video lessons, you must upload a video or enter a video URL";
      } else if (formData.videoUrl && !/^https?:\/\/.+/.test(formData.videoUrl)) {
        newErrors.videoUrl = validation?.videoUrlInvalid 
          ? String(validation.videoUrlInvalid) 
          : "Video URL must be a valid URL";
      }
    }

    if (formData.contentType === "MIXED") {
      const hasVideo = videoInputMethod === "upload" ? !!videoFile : formData.videoUrl.trim();
      const hasContent = formData.content.trim();
      if (!hasContent && !hasVideo) {
        newErrors.content = validation?.contentOrVideoRequired 
          ? String(validation.contentOrVideoRequired) 
          : "For mixed lessons, at least one of content or video is required";
      }
      if (formData.videoUrl && !/^https?:\/\/.+/.test(formData.videoUrl)) {
        newErrors.videoUrl = validation?.videoUrlInvalid 
          ? String(validation.videoUrlInvalid) 
          : "Video URL must be a valid URL";
      }
    }

    if (formData.excerpt && formData.excerpt.trim().length > 500) {
      newErrors.excerpt = validation?.descriptionMaxLength 
        ? String(validation.descriptionMaxLength) 
        : "Description must be at most 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Get the thumbnail URL from the images array
      const thumbnail = images.length > 0 ? images[0].url : '';

      // Determine video URL - use uploaded video if available, otherwise use URL input
      const finalVideoUrl = videoInputMethod === "upload" && videoFile 
        ? videoFile.url 
        : formData.videoUrl.trim() || null;

      // Get video duration from uploaded video or form input
      const finalVideoDuration = videoInputMethod === "upload" && videoFile?.duration
        ? videoFile.duration
        : formData.videoDuration ? parseInt(formData.videoDuration) : null;

      const url = isEditing 
        ? `/api/education/lessons/${lesson!.id}`
        : "/api/education/lessons";
      
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          videoUrl: finalVideoUrl,
          thumbnail,
          videoDuration: finalVideoDuration,
          estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null,
          sortOrder: parseInt(formData.sortOrder),
        }),
      });

      if (response.ok) {
        onSaved();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در ذخیره درس آموزشی");
      }
    } catch {
      alert("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (true) { // Modal is always shown when component is rendered
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, []);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Use portal to render modal at document body level
  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '90vh',
          margin: 'auto'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "ویرایش درس آموزشی" : "درس آموزشی جدید"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">اطلاعات پایه</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">عنوان درس *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  maxLength={200}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.title ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder={((messages?.admin as Record<string, unknown> | undefined)?.educationForm as Record<string, string> | undefined)?.titleRequired || "Lesson Title"}
                />
                {errors.title && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.slug ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="slug-lesson"
                />
                {errors.slug && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.slug}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                {((messages?.admin as Record<string, unknown> | undefined)?.educationForm as Record<string, string> | undefined)?.descriptionMaxLength || "Lesson Description"}
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                rows={3}
                maxLength={500}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none ${
                  errors.excerpt ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder={((messages?.admin as Record<string, unknown> | undefined)?.educationForm as Record<string, string> | undefined)?.descriptionMaxLength || "Lesson Description"}
              />
              {errors.excerpt && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.excerpt}</p>
              )}
            </div>
          </div>

          {/* Content Type Selection */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">نوع محتوا</h3>
            <div>
              <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">نوع محتوا *</label>
              <select
                value={formData.contentType}
                onChange={(e) => handleInputChange("contentType", e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
              >
                <option value="TEXT">متنی</option>
                <option value="VIDEO">ویدیویی</option>
                <option value="MIXED">ترکیبی (متن + ویدیو)</option>
              </select>
            </div>
          </div>

          {/* Text Content */}
          {(formData.contentType === "TEXT" || formData.contentType === "MIXED") && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">محتوای متنی</h3>
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  محتوای متنی {formData.contentType === "TEXT" ? "*" : ""}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={12}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none font-mono text-sm ${
                    errors.content ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="محتوای درس را وارد کنید..."
                />
                {errors.content && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.content}</p>
                )}
              </div>
            </div>
          )}

          {/* Video Content */}
          {(formData.contentType === "VIDEO" || formData.contentType === "MIXED") && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">محتوای ویدیویی</h3>
              
              {/* Video Input Method Toggle */}
              <div className="flex items-center gap-4 mb-6">
                <label className="block text-gray-900 dark:text-white font-semibold text-sm">روش ورود ویدیو:</label>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-300 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoInputMethod("upload");
                      if (videoInputMethod === "url") {
                        handleInputChange("videoUrl", "");
                      }
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      videoInputMethod === "upload"
                        ? "bg-primary-orange text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    آپلود ویدیو
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoInputMethod("url");
                      if (videoInputMethod === "upload") {
                        setVideoFile(null);
                      }
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      videoInputMethod === "url"
                        ? "bg-primary-orange text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    آدرس ویدیو
                  </button>
                </div>
              </div>

              {/* Video Upload */}
              {videoInputMethod === "upload" && (
                <div>
                  <VideoUpload
                    video={videoFile}
                    onVideoChange={(video) => {
                      setVideoFile(video);
                      if (video?.duration) {
                        handleInputChange("videoDuration", video.duration.toString());
                      }
                      if (errors.videoUrl) {
                        setErrors(prev => ({ ...prev, videoUrl: "" }));
                      }
                    }}
                    category="videos"
                    required={formData.contentType === "VIDEO"}
                  />
                  {errors.videoUrl && videoInputMethod === "upload" && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.videoUrl}</p>
                  )}
                </div>
              )}

              {/* Video URL Input */}
              {videoInputMethod === "url" && (
                <div>
                  <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                    آدرس ویدیو {formData.contentType === "VIDEO" ? "*" : ""}
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                      errors.videoUrl ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="https://example.com/video.mp4 یا embed URL"
                  />
                  {errors.videoUrl && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.videoUrl}</p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    می‌توانید از YouTube، Vimeo یا هر سرویس ویدیویی دیگر استفاده کنید
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                    مدت زمان ویدیو (ثانیه)
                    {videoInputMethod === "upload" && videoFile?.duration && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs mr-2">
                        (خودکار: {Math.floor(videoFile.duration / 60)}:{(videoFile.duration % 60).toString().padStart(2, "0")})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={formData.videoDuration}
                    onChange={(e) => handleInputChange("videoDuration", e.target.value)}
                    disabled={videoInputMethod === "upload" && !!videoFile?.duration}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                      videoInputMethod === "upload" && videoFile?.duration ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    placeholder="3600"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">زمان تخمینی مطالعه (دقیقه)</label>
                  <input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => handleInputChange("estimatedTime", e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">تصویر بندانگشتی (Thumbnail)</label>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={1}
                />
              </div>
            </div>
          )}

          {/* Additional Fields */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">تنظیمات اضافی</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">دسته‌بندی</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange("categoryId", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                >
                  <option value="">بدون دسته‌بندی</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">سطح دشواری</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange("difficulty", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                >
                  <option value="BEGINNER">مبتدی</option>
                  <option value="INTERMEDIATE">متوسط</option>
                  <option value="ADVANCED">پیشرفته</option>
                  <option value="EXPERT">حرفه‌ای</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">ترتیب نمایش</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange("sortOrder", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">وضعیت</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                >
                  <option value="DRAFT">پیش‌نویس</option>
                  <option value="PUBLISHED">منتشر شده</option>
                  <option value="ARCHIVED">آرشیو شده</option>
                </select>
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange("isFeatured", e.target.checked)}
                  className="w-5 h-5 text-primary-orange bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-orange focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="mr-3 text-gray-900 dark:text-white font-semibold cursor-pointer">
                  درس ویژه
                </label>
              </div>
            </div>
          </div>

          {/* SEO Fields */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">تنظیمات SEO</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">Meta Title</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                  placeholder="عنوان SEO"
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                  placeholder="توضیحات SEO"
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">Meta Keywords</label>
                <input
                  type="text"
                  value={formData.metaKeywords}
                  onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                  placeholder="کلمات کلیدی (با کاما جدا کنید)"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
            >
              {loading ? "در حال ذخیره..." : isEditing ? "به‌روزرسانی" : "ایجاد"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render modal using portal to document.body
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

