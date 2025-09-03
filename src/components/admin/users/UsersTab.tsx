"use client";
import { useState, useEffect, useCallback } from "react";
import { AdminUser, CreateUserData, UpdateUserData } from "@/types/admin";
import { UserRole } from "@prisma/client";
import UserList from "./UserList";
import UserForm from "./UserForm";



export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    isActive: "",
    dateRange: ""
  });
  const [sortBy] = useState("createdAt");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    adminUsers: 0
  });

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...filters
      });

      const response = await fetch(`/api/users?${params}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data.data);
        setPagination(result.data.pagination);
      } else {
        console.error("Error fetching users:", result.error);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/users");
      const result = await response.json();

      if (result.success) {
        const allUsers = result.data.data;
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        setStats({
          totalUsers: result.data.pagination.total,
          activeUsers: allUsers.filter((u: AdminUser) => u.isActive).length,
          newUsersThisMonth: allUsers.filter((u: AdminUser) => 
            new Date(u.createdAt) >= thisMonth
          ).length,
          adminUsers: allUsers.filter((u: AdminUser) => 
            ["ADMIN", "SUPER_ADMIN"].includes(u.role)
          ).length
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleUserCreate = async (data: CreateUserData) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        setShowUserForm(false);
        fetchUsers();
        fetchStats();
      } else {
        alert(`خطا در ایجاد کاربر: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("خطا در ایجاد کاربر");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserUpdate = async (data: UpdateUserData) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/users/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        setShowUserForm(false);
        setSelectedUser(null);
        fetchUsers();
        fetchStats();
      } else {
        alert(`خطا در بروزرسانی کاربر: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("خطا در بروزرسانی کاربر");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, isActive })
      });

      const result = await response.json();

      if (result.success) {
        fetchUsers();
        fetchStats();
      } else {
        alert(`خطا در تغییر وضعیت کاربر: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("خطا در تغییر وضعیت کاربر");
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role })
      });

      const result = await response.json();

      if (result.success) {
        fetchUsers();
        fetchStats();
      } else {
        alert(`خطا در تغییر نقش کاربر: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("خطا در تغییر نقش کاربر");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (result.success) {
        fetchUsers();
        fetchStats();
      } else {
        alert(`خطا در حذف کاربر: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("خطا در حذف کاربر");
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };



  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleCancelEdit = () => {
    setShowUserForm(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, sortBy, sortOrder, filters, fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کل کاربران</p>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کاربران فعال</p>
              <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کاربران جدید این ماه</p>
              <p className="text-3xl font-bold text-white">{stats.newUsersThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کاربران مدیریتی</p>
              <p className="text-3xl font-bold text-white">{stats.adminUsers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="جستجو در کاربران..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange"
            />
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">همه نقش‌ها</option>
              <option value="CUSTOMER">مشتری</option>
              <option value="ADMIN">مدیر</option>
              <option value="SUPER_ADMIN">مدیر ارشد</option>
            </select>

            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              className="px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>

            <button
              onClick={handleCreateUser}
              className="px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300"
            >
              + کاربر جدید
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">در حال بارگذاری کاربران...</p>
        </div>
      ) : (
        <UserList
          users={users}
          pagination={pagination}
          onPageChange={handlePageChange}
          onStatusChange={handleStatusChange}
          onRoleChange={handleRoleChange}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={selectedUser || undefined}
          onSave={async (data: CreateUserData | UpdateUserData) => {
            if (selectedUser) {
              await handleUserUpdate(data as UpdateUserData);
            } else {
              await handleUserCreate(data as CreateUserData);
            }
          }}
          onCancel={handleCancelEdit}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
