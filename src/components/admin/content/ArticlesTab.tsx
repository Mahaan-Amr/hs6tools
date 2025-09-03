"use client";

import { useState, useEffect } from "react";
import { Article } from "@/types/content";
import ArticleForm from "./ArticleForm";
import ArticleList from "./ArticleList";

export default function ArticlesTab() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/content/articles");
      if (response.ok) {
        const data = await response.json();
        setArticles(data.data || []);
      } else {
        setError("خطا در دریافت مقالات");
      }
    } catch {
      setError("خطا در اتصال به سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  const handleArticleSaved = () => {
    fetchArticles();
    handleFormClose();
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm("آیا از حذف این مقاله اطمینان دارید؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/content/articles/${articleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchArticles();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در حذف مقاله");
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
          <p className="text-white">در حال بارگذاری...</p>
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
        <h3 className="text-xl font-semibold text-white mb-2">خطا</h3>
        <p className="text-gray-300 mb-4">{error}</p>
        <button
          onClick={fetchArticles}
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
          <h2 className="text-2xl font-bold text-white mb-2">مقالات</h2>
          <p className="text-gray-300">
            {articles.length} مقاله موجود است
          </p>
        </div>
        <button
          onClick={handleCreateArticle}
          className="px-6 py-3 bg-primary-orange text-white rounded-xl hover:bg-orange-600 transition-colors duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>مقاله جدید</span>
        </button>
      </div>

      {/* Articles List */}
      <ArticleList
        articles={articles}
        onEdit={handleEditArticle}
        onDelete={handleDeleteArticle}
      />

      {/* Article Form Modal */}
      {showForm && (
        <ArticleForm
          article={editingArticle}
          onClose={handleFormClose}
          onSaved={handleArticleSaved}
        />
      )}
    </div>
  );
}
