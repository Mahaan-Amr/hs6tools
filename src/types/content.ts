import { ArticleStatus } from "@prisma/client";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: ArticleStatus;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  publishedAt?: string;
  categoryId?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  authorId?: string;
  deletedAt?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
  children: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    _count: {
      articles: number;
    };
  }>;
  _count: {
    articles: number;
    children: number;
  };
}
