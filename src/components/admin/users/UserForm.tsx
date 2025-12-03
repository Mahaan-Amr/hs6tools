"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AdminUser, CreateUserData, UpdateUserData } from "@/types/admin";
import { UserRole } from "@prisma/client";
import { getMessages, Messages } from "@/lib/i18n";

interface UserFormProps {
  user?: AdminUser;
  onSave: (data: CreateUserData | UpdateUserData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  locale: string;
}

export default function UserForm({ user, onSave, onCancel, isSaving, locale }: UserFormProps) {
  const isEditing = !!user;
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleInputChange = (field: keyof (CreateUserData | UpdateUserData), value: string | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!messages || !messages.admin?.usersForm) {
    return null;
  }

  const t = messages.admin.usersForm;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEditing) {
      const createData = formData as CreateUserData;
      if (!createData.email) {
        newErrors.email = String(t.emailRequired);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createData.email)) {
        newErrors.email = String(t.emailInvalid);
      }

      if (!createData.password) {
        newErrors.password = String(t.passwordRequired);
      } else if (createData.password.length < 8) {
        newErrors.password = String(t.passwordMinLength);
      }

      if (createData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(createData.phone)) {
        newErrors.phone = String(t.phoneInvalid);
      }
    }

    if (!formData.firstName) {
      newErrors.firstName = String(t.firstNameRequired);
    }

    if (!formData.lastName) {
      newErrors.lastName = String(t.lastNameRequired);
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



  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '90vh',
          margin: 'auto'
        }}
      >
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? String(t.editUser) : String(t.createUser)}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{String(t.basicInfo)}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {String(t.firstName)} *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.firstName ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder={String(t.firstNamePlaceholder)}
                />
                {errors.firstName && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {String(t.lastName)} *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.lastName ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder={String(t.lastNamePlaceholder)}
                />
                {errors.lastName && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.lastName}</p>
                )}
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                    {String(t.email)} *
                  </label>
                  <input
                    type="email"
                    value={(formData as CreateUserData).email || ""}
                    onChange={(e) => {
                      const createData = formData as CreateUserData;
                      createData.email = e.target.value;
                      setFormData({ ...createData });
                    }}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                      errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder={String(t.emailPlaceholder)}
                  />
                  {errors.email && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.email}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {String(t.phone)}
                </label>
                <input
                  type="tel"
                  value={(formData as CreateUserData).phone || ""}
                  onChange={(e) => {
                    const createData = formData as CreateUserData;
                    createData.phone = e.target.value;
                    setFormData({ ...createData });
                  }}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.phone ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder={String(t.phonePlaceholder)}
                />
                {errors.phone && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{String(t.accountSettings)}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {String(t.role)} *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value as UserRole)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                >
                  <option value="CUSTOMER">{String(t.roleCustomer)}</option>
                  <option value="ADMIN">{String(t.roleAdmin)}</option>
                  <option value="SUPER_ADMIN">{String(t.roleSuperAdmin)}</option>
                </select>
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                    {String(t.password)} *
                  </label>
                  <input
                    type="password"
                    value={(formData as CreateUserData).password || ""}
                    onChange={(e) => {
                      const createData = formData as CreateUserData;
                      createData.password = e.target.value;
                      setFormData({ ...createData });
                    }}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                      errors.password ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder={String(t.passwordPlaceholder)}
                  />
                  {errors.password && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2 font-medium">{errors.password}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{String(t.companyInfo)}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {String(t.company)}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                  placeholder={String(t.companyPlaceholder)}
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {String(t.position)}
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all"
                  placeholder={String(t.positionPlaceholder)}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {String(t.cancel)}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
            >
              {isSaving ? String(t.saving) : (isEditing ? String(t.update) : String(t.create))}
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
