"use client";

import { useState, useEffect } from "react";

interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  price: number;
  estimatedDays: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ShippingMethodsFormProps {
  locale: string;
  onSaveSuccess: (message: string) => void;
  onSaveError: (message: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function ShippingMethodsForm({
  onSaveSuccess,
  onSaveError,
  setIsLoading,
}: ShippingMethodsFormProps) {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    estimatedDays: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchShippingMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/shipping-methods");
      const result = await response.json();

      if (result.success) {
        setShippingMethods(result.data);
      } else {
        onSaveError(result.error || "خطا در بارگذاری روش‌های ارسال");
      }
    } catch (error) {
      console.error("Error fetching shipping methods:", error);
      onSaveError("خطا در بارگذاری روش‌های ارسال");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: ShippingMethod) => {
    setEditingId(method.id);
    setFormData({
      name: method.name,
      description: method.description || "",
      price: String(method.price),
      estimatedDays: method.estimatedDays,
      isActive: method.isActive,
      sortOrder: method.sortOrder,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این روش ارسال اطمینان دارید؟")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/shipping-methods/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        onSaveSuccess("روش ارسال با موفقیت حذف شد");
        fetchShippingMethods();
      } else {
        onSaveError(result.error || "خطا در حذف روش ارسال");
      }
    } catch (error) {
      console.error("Error deleting shipping method:", error);
      onSaveError("خطا در حذف روش ارسال");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      onSaveError("نام روش ارسال الزامی است");
      return;
    }

    if (!formData.price || Number(formData.price) < 0) {
      onSaveError("قیمت معتبر الزامی است");
      return;
    }

    if (!formData.estimatedDays.trim()) {
      onSaveError("زمان تحویل الزامی است");
      return;
    }

    try {
      setIsLoading(true);
      const url = editingId
        ? `/api/admin/shipping-methods/${editingId}`
        : "/api/admin/shipping-methods";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: Number(formData.price),
          estimatedDays: formData.estimatedDays.trim(),
          isActive: formData.isActive,
          sortOrder: Number(formData.sortOrder),
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSaveSuccess(
          editingId
            ? "روش ارسال با موفقیت به‌روزرسانی شد"
            : "روش ارسال با موفقیت ایجاد شد"
        );
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: "",
          description: "",
          price: "",
          estimatedDays: "",
          isActive: true,
          sortOrder: 0,
        });
        fetchShippingMethods();
      } else {
        onSaveError(result.error || "خطا در ذخیره روش ارسال");
      }
    } catch (error) {
      console.error("Error saving shipping method:", error);
      onSaveError("خطا در ذخیره روش ارسال");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      estimatedDays: "",
      isActive: true,
      sortOrder: 0,
    });
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/shipping-methods/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        onSaveSuccess(
          !currentStatus
            ? "روش ارسال فعال شد"
            : "روش ارسال غیرفعال شد"
        );
        fetchShippingMethods();
      } else {
        onSaveError(result.error || "خطا در به‌روزرسانی وضعیت");
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
      onSaveError("خطا در به‌روزرسانی وضعیت");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">مدیریت روش‌های ارسال</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          + افزودن روش ارسال جدید
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            {editingId ? "ویرایش روش ارسال" : "افزودن روش ارسال جدید"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  نام روش ارسال *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  قیمت (ریال) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  زمان تحویل *
                </label>
                <input
                  type="text"
                  value={formData.estimatedDays}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedDays: e.target.value })
                  }
                  placeholder="مثال: 3-5 روز کاری"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  ترتیب نمایش
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                توضیحات
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-orange resize-none"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-primary-orange bg-white/10 border-white/20 rounded focus:ring-primary-orange focus:ring-2"
              />
              <label htmlFor="isActive" className="mr-2 text-sm text-white">
                فعال
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingId ? "ذخیره تغییرات" : "ایجاد"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                لغو
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {shippingMethods.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            هیچ روش ارسالی تعریف نشده است
          </div>
        ) : (
          shippingMethods.map((method) => (
            <div
              key={method.id}
              className="glass rounded-2xl p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {method.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      method.isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {method.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                {method.description && (
                  <p className="text-gray-400 text-sm mb-2">
                    {method.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span>قیمت: {Number(method.price).toLocaleString("fa-IR")} ریال</span>
                  <span>زمان تحویل: {method.estimatedDays}</span>
                  <span>ترتیب: {method.sortOrder}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(method.id, method.isActive)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    method.isActive
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  }`}
                >
                  {method.isActive ? "غیرفعال" : "فعال"}
                </button>
                <button
                  onClick={() => handleEdit(method)}
                  className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

