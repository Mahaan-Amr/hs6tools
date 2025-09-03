"use client";

import { useState } from "react";
import { ArticleStatus } from "@prisma/client";
import { Article } from "@/types/content";

interface ArticleListProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (articleId: string) => void;
}

export default function ArticleList({ articles, onEdit, onDelete }: ArticleListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "ALL">("ALL");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || article.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">هیچ مقاله‌ای یافت نشد</h3>
        <p className="text-gray-300">برای شروع، مقاله جدیدی ایجاد کنید</p>
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
            placeholder="جستجو در مقالات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ArticleStatus | "ALL")}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="DRAFT">پیش‌نویس</option>
            <option value="PUBLISHED">منتشر شده</option>
            <option value="ARCHIVED">آرشیو شده</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div key={article.id} className="glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                )}
              </div>
              {article.isFeatured && (
                <span className="px-2 py-1 bg-primary-orange text-white text-xs rounded-full ml-2">
                  ویژه
                </span>
              )}
            </div>

            {/* Meta Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">وضعیت:</span>
                {getStatusBadge(article.status)}
              </div>
              
              {article.category && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">دسته‌بندی:</span>
                  <span className="text-white">{article.category.name}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">تاریخ ایجاد:</span>
                <span className="text-white">{formatDate(article.createdAt)}</span>
              </div>
              
              {article.publishedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">تاریخ انتشار:</span>
                  <span className="text-white">{formatDate(article.publishedAt)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">بازدید:</span>
                <span className="text-white">{article.viewCount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(article)}
                  className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-200 text-sm"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => onDelete(article.id)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200 text-sm"
                >
                  حذف
                </button>
              </div>
              
              <div className="text-xs text-gray-400">
                {article.author && `${article.author.firstName} ${article.author.lastName}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && articles.length > 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">نتیجه‌ای یافت نشد</h3>
          <p className="text-gray-300">لطفاً فیلترهای جستجو را تغییر دهید</p>
        </div>
      )}
    </div>
  );
}
