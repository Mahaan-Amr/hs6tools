import { ArticleStatus, LessonContentType, LessonDifficulty } from "@prisma/client";

export interface EducationLesson {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  videoUrl?: string | null;
  videoDuration?: number | null;
  thumbnail?: string | null;
  contentType: LessonContentType;
  categoryId?: string | null;
  authorId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  status: ArticleStatus;
  publishedAt?: Date | null;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  difficulty: LessonDifficulty;
  estimatedTime?: number | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  category?: EducationCategory | null;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  } | null;
}

export interface EducationCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  parentId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  parent?: EducationCategory | null;
  children?: EducationCategory[];
  lessons?: EducationLesson[];
  _count?: {
    lessons: number;
  };
}

