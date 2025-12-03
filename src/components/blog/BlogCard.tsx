"use client";

import { useState, useEffect } from "react";
import { Article } from "@/types/content";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getMessages, Messages } from "@/lib/i18n";

interface BlogCardProps {
  article: Article;
}

export default function BlogCard({ article }: BlogCardProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "fa";
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msg = await getMessages(locale);
      setMessages(msg);
    };
    loadMessages();
  }, [locale]);

  const formatDate = (dateString: string) => {
    if (!messages) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Use customer.orders.timeAgo if available, otherwise use simple formatting
    const timeAgo = (messages.customer?.orders as Record<string, unknown>)?.timeAgo as {
      yesterday?: string;
      daysAgo?: string;
      weeksAgo?: string;
      monthsAgo?: string;
      yearsAgo?: string;
    } | undefined;
    if (timeAgo) {
      if (diffDays === 1) return timeAgo.yesterday || "Yesterday";
      if (diffDays === 2) return timeAgo.daysAgo?.replace("{days}", "2") || "2 days ago";
      if (diffDays <= 7) return timeAgo.daysAgo?.replace("{days}", diffDays.toString()) || `${diffDays} days ago`;
      if (diffDays <= 30) return timeAgo.weeksAgo?.replace("{weeks}", Math.ceil(diffDays / 7).toString()) || `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays <= 365) return timeAgo.monthsAgo?.replace("{months}", Math.ceil(diffDays / 30).toString()) || `${Math.ceil(diffDays / 30)} months ago`;
      return timeAgo.yearsAgo?.replace("{years}", Math.ceil(diffDays / 365).toString()) || `${Math.ceil(diffDays / 365)} years ago`;
    }
    
    // Fallback to simple date formatting
    return new Intl.DateTimeFormat(locale, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const getCategoryColor = (categoryName: string) => {
    const colors = {
      "ابزارهای صنعتی": "bg-primary-orange/20 text-primary-orange",
      "نجاری": "bg-primary-orange/20 text-primary-orange",
      "ایمنی": "bg-primary-orange/20 text-primary-orange",
      "نوآوری": "bg-primary-orange/20 text-primary-orange",
      "آموزش": "bg-primary-orange/20 text-primary-orange",
      "تست": "bg-primary-orange/20 text-primary-orange",
    };
    
    return colors[categoryName as keyof typeof colors] || "bg-gray-200 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400";
  };

  const getCategoryIcon = (categoryName: string) => {
    const icons = {
      "ابزارهای صنعتی": (
        <svg className="w-16 h-16 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      "نجاری": (
        <svg className="w-16 h-16 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      "ایمنی": (
        <svg className="w-16 h-16 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      "نوآوری": (
        <svg className="w-16 h-16 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      "آموزش": (
        <svg className="w-16 h-16 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      "تست": (
        <svg className="w-16 h-16 text-primary-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    };
    
    return icons[categoryName as keyof typeof icons] || (
      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <article className="glass rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-300">
                {/* Featured Image or Icon */}
          <div className="aspect-video bg-gradient-to-br from-primary-orange/20 to-orange-500/20 flex items-center justify-center">
            {article.featuredImage ? (
              <Image 
                src={article.featuredImage} 
                alt={article.title}
                width={400}
                height={225}
                className="w-full h-full object-cover"
              />
            ) : (
              getCategoryIcon(article.category?.name || "عمومی")
            )}
          </div>
      
      <div className="p-6">
        {/* Category and Date */}
        <div className="flex items-center space-x-2 mb-3">
          {article.category && (
            <span className={`px-3 py-1 ${getCategoryColor(article.category.name)} text-xs rounded-full`}>
              {article.category.name}
            </span>
          )}
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
          {article.title}
        </h3>
        
        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {article.excerpt}
          </p>
        )}
        
        {/* Read More Button */}
        <Link 
          href={`/blog/${article.slug}`}
          className="text-primary-orange hover:text-orange-400 font-medium text-sm transition-colors duration-200 inline-flex items-center"
        >
          {messages?.blog?.readMore || "Read More →"}
        </Link>
      </div>
    </article>
  );
}
