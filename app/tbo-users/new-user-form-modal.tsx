"use client";

import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";

type AppUserRole =
  | "super_admin"
  | "admin"
  | "coordinator"
  | "data_entry_operator"
  | "caller"
  | "driver"
  | "survey"
  | "printer"
  | "mobile_user"
  | "user"
  | "leader"
  | "volunteer";

interface RoleOption {
  value: AppUserRole;
  label: string;
}

interface NewUserPayload {
  username: string;
  email: string;
  authenticatedEmail: string;
  password: string;
  mobile?: string;
  role: AppUserRole;
  permissions: string;
}

interface NewUserFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: NewUserPayload) => Promise<void> | void;
  USER_ROLES: RoleOption[];
}

export default function NewUserFormModal({
  open,
  onClose,
  onCreate,
  USER_ROLES,
}: NewUserFormModalProps) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    authenticatedEmail: "",
    password: "",
    mobile: "",
    role: "" as AppUserRole | "",
    webLogin: true,
    appLogin: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  const user_info =
    typeof window !== "undefined" ? localStorage.getItem("userInfo") : null;

  let user_role = "";
  if (user_info) {
    const parsedUser = JSON.parse(user_info);
    user_role = parsedUser.role;
  }

  const filteredUserRoles = USER_ROLES.filter((r) => {
    if (user_role === "admin") {
      return r.value !== "super_admin";
    }

    if (user_role === "leader") {
      return r.value !== "admin" && r.value !== "super_admin";
    }

    return true;
  });

  const canSubmit =
    form.username.trim() &&
    form.email.trim() &&
    form.authenticatedEmail.trim() &&
    form.password.trim() &&
    form.mobile.trim() &&
    form.role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("All fields are required");
      return;
    }

    setSaving(true);

    try {
      const permissionsArray: string[] = [];
      if (form.webLogin) permissionsArray.push("web");
      if (form.appLogin) permissionsArray.push("mobile");

      if (permissionsArray.length === 0) permissionsArray.push("web");

      const payload: NewUserPayload = {
        username: form.username.trim(),
        email: form.email.trim(),
        authenticatedEmail: form.authenticatedEmail.trim() || form.email.trim(),
        password: form.password,
        mobile: form.mobile.trim(),
        role: form.role as AppUserRole,
        permissions: permissionsArray.join(","),
      };

      await onCreate(payload);

      setForm({
        username: "",
        email: "",
        authenticatedEmail: "",
        password: "",
        mobile: "",
        role: "" as AppUserRole | "",
        webLogin: true,
        appLogin: false,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900">Create New User</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                placeholder="e.g. johndoe"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mobile *
              </label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                placeholder="e.g. 9876543210"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Authenticated Email *
              </label>
              <input
                type="email"
                value={form.authenticatedEmail}
                onChange={(e) =>
                  setForm({ ...form, authenticatedEmail: e.target.value })
                }
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                placeholder="e.g. authuser@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-300 px-4 pr-11 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="Set a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                placeholder="e.g. john@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role *
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as AppUserRole })
                }
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              >
                <option value="">Select role...</option>
                {filteredUserRoles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Login Access
            </label>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={form.webLogin}
                  onChange={(e) =>
                    setForm({ ...form, webLogin: e.target.checked })
                  }
                />
                Web Login
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={form.appLogin}
                  onChange={(e) =>
                    setForm({ ...form, appLogin: e.target.checked })
                  }
                />
                App Login
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}