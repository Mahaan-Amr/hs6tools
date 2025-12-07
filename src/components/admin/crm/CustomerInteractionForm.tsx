"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getMessages, Messages } from "@/lib/i18n";

interface CustomerInteractionFormProps {
  customerId: string;
  onSuccess: () => void;
  onCancel: () => void;
  locale: string;
}

export default function CustomerInteractionForm({
  customerId,
  onSuccess,
  onCancel,
  locale
}: CustomerInteractionFormProps) {
  const [messages, setMessages] = useState<Messages | null>(null);
  const [formData, setFormData] = useState({
    type: "EMAIL",
    subject: "",
    content: "",
    outcome: "",
    nextAction: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getMessages(locale);
      setMessages(msgs);
    };
    loadMessages();
  }, [locale]);

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

  const interactionTypes = [
    { value: "EMAIL", label: "Email" },
    { value: "PHONE", label: "Phone Call" },
    { value: "MEETING", label: "Meeting" },
    { value: "DEMO", label: "Demo" },
    { value: "SUPPORT", label: "Support" },
    { value: "MARKETING", label: "Marketing" },
    { value: "SALES", label: "Sales" },
    { value: "FOLLOW_UP", label: "Follow Up" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (error) {
      setError(null);
    }
  };

  const interactions = messages?.admin?.crm?.customer360?.interactions as Record<string, unknown> | undefined;
  const validation = interactions?.validation as Record<string, string> | undefined;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type.trim()) {
      newErrors.type = validation?.typeRequired 
        ? String(validation.typeRequired) 
        : "Interaction type is required";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = validation?.subjectRequired 
        ? String(validation.subjectRequired) 
        : "Subject is required";
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = validation?.subjectMinLength 
        ? String(validation.subjectMinLength) 
        : "Subject must be at least 3 characters";
    } else if (formData.subject.trim().length > 200) {
      newErrors.subject = validation?.subjectMaxLength 
        ? String(validation.subjectMaxLength) 
        : "Subject must be at most 200 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = validation?.contentRequired 
        ? String(validation.contentRequired) 
        : "Content is required";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = validation?.contentMinLength 
        ? String(validation.contentMinLength) 
        : "Content must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/crm/customers/${customerId}/interactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to create interaction");
      }
    } catch (error) {
      console.error("Error creating interaction:", error);
      setError("Failed to create interaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!messages) {
    return null;
  }

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
            {(messages?.admin?.crm?.customer360?.interactions as Record<string, string> | undefined)?.addInteraction || "Add Interaction"}
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

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-lg">
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interaction Details */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {interactions?.title as string || "Interaction Details"}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {interactions?.type as string || "Type"} *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.type 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  {interactionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {interactions?.subject as string || "Subject"} *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  maxLength={200}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all ${
                    errors.subject 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {interactions?.content as string || "Content"} *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none ${
                    errors.content 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {interactions?.outcome as string || "Outcome"}
                </label>
                <textarea
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white font-semibold mb-3 text-sm">
                  {interactions?.nextAction as string || "Next Action"}
                </label>
                <textarea
                  name="nextAction"
                  value={formData.nextAction}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {messages?.common?.cancel || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/30"
            >
              {isSubmitting 
                ? (messages?.common?.saving || "Saving...") 
                : (interactions?.addInteraction as string || "Add Interaction")}
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
