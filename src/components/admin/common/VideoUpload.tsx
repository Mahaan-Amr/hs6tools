"use client";

import { useState, useRef } from "react";

interface VideoFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  duration?: number; // Duration in seconds (will be extracted client-side)
  thumbnail?: string; // Thumbnail URL (will be generated later)
}

interface VideoUploadProps {
  video: VideoFile | null;
  onVideoChange: (video: VideoFile | null) => void;
  className?: string;
  label?: string;
  required?: boolean;
  category?: string;
}

export default function VideoUpload({
  video,
  onVideoChange,
  className = "",
  label = "ویدیو",
  required = false,
  category = "videos"
}: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Validate file type
      const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("فرمت ویدیو نامعتبر است. فقط MP4 و MOV مجاز است");
      }

      // Validate file size (250MB)
      const maxSize = 250 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("حجم فایل بیش از حد مجاز است. حداکثر 250MB");
      }

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      const uploadPromise = new Promise<VideoFile>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              // Extract video duration
              const videoElement = document.createElement("video");
              videoElement.preload = "metadata";
              videoElement.src = URL.createObjectURL(file);
              
              videoElement.addEventListener("loadedmetadata", () => {
                const duration = Math.floor(videoElement.duration);
                resolve({
                  ...result.file,
                  duration,
                });
                URL.revokeObjectURL(videoElement.src);
              });

              videoElement.addEventListener("error", () => {
                // If duration extraction fails, still resolve with the file
                resolve(result.file);
              });
            } else {
              reject(new Error(result.error || "خطا در آپلود ویدیو"));
            }
          } else {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || "خطا در آپلود ویدیو"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("خطا در اتصال به سرور"));
        });

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      const uploadedVideo = await uploadPromise;
      onVideoChange(uploadedVideo);

    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "خطا در آپلود ویدیو");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeVideo = () => {
    onVideoChange(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>

      {/* Upload Area */}
      {!video && (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-full p-8 border-2 border-dashed rounded-xl text-center transition-all duration-200 ${
              isUploading
                ? "border-gray-500 dark:border-gray-500 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed"
                : "border-gray-300 dark:border-gray-600 hover:border-primary-orange hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
            }`}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-gray-900 dark:text-white font-medium">در حال آپلود...</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{Math.round(uploadProgress)}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold">برای آپلود ویدیو کلیک کنید</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    یا فایل را اینجا بکشید و رها کنید
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                    فرمت‌های مجاز: MP4, MOV (حداکثر 250MB)
                  </p>
                </div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {uploadError && (
        <div className="p-3 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Video Preview */}
      {video && (
        <div className="relative group">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={video.url}
              controls
              className="w-full h-full"
              preload="metadata"
            />
          </div>

          {/* Video Info */}
          <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-900 dark:text-white font-medium text-sm truncate">{video.originalName}</p>
              <button
                onClick={removeVideo}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                title="حذف ویدیو"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <span>{formatFileSize(video.size)}</span>
              {video.duration && (
                <span>مدت زمان: {formatDuration(video.duration)}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

