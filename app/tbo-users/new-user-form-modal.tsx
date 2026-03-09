"use client";

import React, { useState } from "react";
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

export default function NewUserFormModal({
  onClose,
  onCreate,
  USER_ROLES,
}: {
  onClose: () => void;
  onCreate: (payload: NewUserPayload) => Promise<void> | void;
  USER_ROLES: RoleOption[];
}) {
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
  const user_info = localStorage.getItem("userInfo");
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
    form.mobile?.trim() &&
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
      const permissionsArray = [];
      if (form.webLogin) permissionsArray.push("web");
      if (form.appLogin) permissionsArray.push("mobile");

      if (permissionsArray.length === 0) permissionsArray.push("web");

      const permissionsString = permissionsArray.join(",");

      const payload: NewUserPayload = {
        username: form.username.trim(),
        email: form.email.trim(),
        authenticatedEmail: form.authenticatedEmail.trim() || form.email.trim(),
        password: form.password,
        mobile: form.mobile?.trim() || "",
        role: form.role as AppUserRole,
        permissions: permissionsString,
      };

      console.log("Sending payload:", payload);
      await onCreate(payload);
      onClose();
    } catch (err: any) {
      console.error("Error creating user:", err);
      setError(err.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg w-[720px] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg text-gray-800 font-semibold">
              Create New User
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="username"
                  required
                  placeholder="e.g., johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 text-gray-800 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="email"
                  required
                  placeholder="e.g., john@example.com"
                />
              </div>

              {/* Authenticated Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authenticated Email *
                </label>
                <input
                  type="email"
                  value={form.authenticatedEmail}
                  onChange={(e) =>
                    setForm({ ...form, authenticatedEmail: e.target.value })
                  }
                  className="w-full px-3 text-gray-800 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="email"
                  required
                  placeholder="e.g., authuser@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full text-gray-800 px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoComplete="new-password"
                    required
                    placeholder="Set a password"
                    minLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile *
                </label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="tel"
                  required
                  placeholder="e.g., 9876543210"
                  pattern="[0-9]{10}"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={form.role || ""}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as AppUserRole })
                  }
                  className="w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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

            {/* Login Access */}
            <div className="mt-4 border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login Access *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.webLogin}
                    onChange={(e) =>
                      setForm({ ...form, webLogin: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-800">Web Login</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appLogin}
                    onChange={(e) =>
                      setForm({ ...form, appLogin: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-800">App Login (Mobile)</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: At least one login access must be selected. Web access is
                selected by default.
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 p-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 text-gray-800 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                canSubmit && !saving
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
