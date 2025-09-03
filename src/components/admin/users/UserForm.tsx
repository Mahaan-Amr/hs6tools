"use client";
import { useState, useEffect } from "react";
import { AdminUser, CreateUserData, UpdateUserData } from "@/types/admin";
import { UserRole } from "@prisma/client";

interface UserFormProps {
  user?: AdminUser;
  onSave: (data: CreateUserData | UpdateUserData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export default function UserForm({ user, onSave, onCancel, isSaving }: UserFormProps) {
  const isEditing = !!user;
  const [formData, setFormData] = useState<CreateUserData | UpdateUserData>({
    firstName: "",
    lastName: "",
    role: "CUSTOMER",
    company: "",
    position: "",
    ...(isEditing ? {} : { email: "", phone: "", password: "" })
  } as CreateUserData | UpdateUserData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company || "",
        position: user.position || ""
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof (CreateUserData | UpdateUserData), value: string | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEditing) {
      const createData = formData as CreateUserData;
      if (!createData.email) {
        newErrors.email = "ایمیل الزامی است";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createData.email)) {
        newErrors.email = "فرمت ایمیل نامعتبر است";
      }

      if (!createData.password) {
        newErrors.password = "رمز عبور الزامی است";
      } else if (createData.password.length < 8) {
        newErrors.password = "رمز عبور باید حداقل 8 کاراکتر باشد";
      }

      if (createData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(createData.phone)) {
        newErrors.phone = "فرمت شماره تلفن نامعتبر است";
      }
    }

    if (!formData.firstName) {
      newErrors.firstName = "نام الزامی است";
    }

    if (!formData.lastName) {
      newErrors.lastName = "نام خانوادگی الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? "ویرایش کاربر" : "ایجاد کاربر جدید"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">اطلاعات پایه</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  نام *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                    errors.firstName ? "border-red-500" : "border-white/20"
                  }`}
                  placeholder="نام کاربر"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  نام خانوادگی *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                    errors.lastName ? "border-red-500" : "border-white/20"
                  }`}
                  placeholder="نام خانوادگی کاربر"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                )}
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    ایمیل *
                  </label>
                  <input
                    type="email"
                    value={(formData as CreateUserData).email || ""}
                    onChange={(e) => {
                      const createData = formData as CreateUserData;
                      createData.email = e.target.value;
                      setFormData({ ...createData });
                    }}
                    className={`w-full px-4 py-3 bg-white/10 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                      errors.email ? "border-red-500" : "border-white/20"
                    }`}
                    placeholder="ایمیل کاربر"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  شماره تلفن
                </label>
                <input
                  type="tel"
                  value={(formData as CreateUserData).phone || ""}
                  onChange={(e) => {
                    const createData = formData as CreateUserData;
                    createData.phone = e.target.value;
                    setFormData({ ...createData });
                  }}
                  className={`w-full px-4 py-3 bg-white/10 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                    errors.phone ? "border-red-500" : "border-white/20"
                  }`}
                  placeholder="شماره تلفن (اختیاری)"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">تنظیمات حساب</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  نقش *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value as UserRole)}
                  className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange"
                >
                  <option value="CUSTOMER">مشتری</option>
                  <option value="ADMIN">مدیر</option>
                  <option value="SUPER_ADMIN">مدیر ارشد</option>
                </select>
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    رمز عبور *
                  </label>
                  <input
                    type="password"
                    value={(formData as CreateUserData).password || ""}
                    onChange={(e) => {
                      const createData = formData as CreateUserData;
                      createData.password = e.target.value;
                      setFormData({ ...createData });
                    }}
                    className={`w-full px-4 py-3 bg-white/10 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange ${
                      errors.password ? "border-red-500" : "border-white/20"
                    }`}
                    placeholder="رمز عبور (حداقل 8 کاراکتر)"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">اطلاعات شرکت</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  نام شرکت
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange"
                  placeholder="نام شرکت (اختیاری)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  سمت
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-orange"
                  placeholder="سمت شغلی (اختیاری)"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-primary-orange to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "در حال ذخیره..." : (isEditing ? "ذخیره تغییرات" : "ایجاد کاربر")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
