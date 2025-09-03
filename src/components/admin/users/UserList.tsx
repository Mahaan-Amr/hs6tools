"use client";
import { useState } from "react";
import { AdminUser } from "@/types/admin";
import { UserRole } from "@prisma/client";
import { formatDate } from "@/utils/format";

interface UserListProps {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
  onStatusChange: (userId: string, isActive: boolean) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UserList({
  users,
  pagination,
  onPageChange,
  onStatusChange,
  onRoleChange,
  onEditUser,
  onDeleteUser
}: UserListProps) {
  const [deletingUser, setDeletingUser] = useState<string | null>(null);



  const handleDelete = async (userId: string) => {
    if (confirm("آیا از حذف این کاربر اطمینان دارید؟")) {
      setDeletingUser(userId);
      try {
        await onDeleteUser(userId);
      } finally {
        setDeletingUser(null);
      }
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">هیچ کاربری یافت نشد</h3>
        <p className="text-gray-400">کاربر جدیدی ایجاد کنید یا فیلترهای جستجو را تغییر دهید</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Users Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">کاربر</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">اطلاعات تماس</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">نقش</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">وضعیت</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">آخرین ورود</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">آمار</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => {
                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-orange to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.company && (
                            <div className="text-sm text-gray-400">{user.company}</div>
                          )}
                          {user.position && (
                            <div className="text-sm text-gray-400">{user.position}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-white">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-gray-400">{user.phone}</div>
                        )}
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {user.emailVerified && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">تایید ایمیل</span>
                          )}
                          {user.phoneVerified && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">تایید تلفن</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
                        className="px-3 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
                      >
                        <option value="CUSTOMER">مشتری</option>
                        <option value="ADMIN">مدیر</option>
                        <option value="SUPER_ADMIN">مدیر ارشد</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.isActive.toString()}
                        onChange={(e) => onStatusChange(user.id, e.target.value === "true")}
                        className="px-3 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
                      >
                        <option value="true">فعال</option>
                        <option value="false">غیرفعال</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : "هرگز"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.createdAt && formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-white font-semibold">{user._count.orders}</div>
                          <div className="text-gray-400">سفارش</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{user._count.addresses}</div>
                          <div className="text-gray-400">آدرس</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{user._count.reviews}</div>
                          <div className="text-gray-400">نظر</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{user._count.articles}</div>
                          <div className="text-gray-400">مقاله</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => onEditUser(user)}
                          className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingUser === user.id}
                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
                        >
                          {deletingUser === user.id ? "حذف..." : "حذف"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            نمایش {((pagination.page - 1) * pagination.limit) + 1} تا {Math.min(pagination.page * pagination.limit, pagination.total)} از {pagination.total} کاربر
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              قبلی
            </button>
            <span className="px-4 py-2 text-white">
              صفحه {pagination.page} از {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
