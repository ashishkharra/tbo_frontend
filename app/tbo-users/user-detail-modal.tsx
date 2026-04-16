"use client";

import React, { useMemo, useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  User,
  Shield,
  Settings,
  Link2,
  MapPin,
  KeyRound,
  CheckCircle2,
  Users,
  Unlink,
} from "lucide-react";
import { UnlinkUser } from '@/apis/api'

type UserDetailModalProps = {
  selectedUser: any;
  editedUser: any;
  setEditedUser: React.Dispatch<React.SetStateAction<any>>;
  dirtyFields: Set<string>;
  setDirtyFields: React.Dispatch<React.SetStateAction<Set<string>>>;
  onClose: () => void;
  onSave: () => Promise<void> | void;
};

type TabId =
  | "profile"
  | "security"
  | "access"
  | "assignments"
  | "team"
  | "other";

function normalizeArray(value: any) {
  return Array.isArray(value) ? value : [];
}

function parseCommaSeparated(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeLoginAccess(value: any, permissions: any[] = []) {
  const permissionList = normalizeArray(permissions)
    .map((item) => valueToDisplay(item).toLowerCase())
    .filter(Boolean);

  const safeValue =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};

  const webValue = safeValue.web;
  const appValue = safeValue.app ?? safeValue.mobile;

  return {
    web:
      typeof webValue === "boolean"
        ? webValue
        : permissionList.includes("web"),
    app:
      typeof appValue === "boolean"
        ? appValue
        : permissionList.includes("app") || permissionList.includes("mobile"),
  };
}

function valueToDisplay(item: any) {
  if (item == null) return "";
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (typeof item === "object") {
    return (
      item?.name ||
      item?.label ||
      item?.title ||
      item?.code ||
      item?.id ||
      JSON.stringify(item)
    );
  }
  return String(item);
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="w-18 shrink-0 text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      <label className="w-28 shrink-0 pt-2.5 text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </div>
  );
}

function PillList({
  title,
  items,
  emptyText = "No data available",
}: {
  title: string;
  items: any[];
  emptyText?: string;
}) {
  const safeItems = normalizeArray(items);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-800">{title}</h4>
      {safeItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {safeItems.map((item, index) => (
            <span
              key={`${valueToDisplay(item)}-${index}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              {valueToDisplay(item)}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-h-11 items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="break-all text-right text-sm text-slate-900">
        {value || "-"}
      </span>
    </div>
  );
}

export default function UserDetailModal({
  selectedUser,
  editedUser,
  setEditedUser,
  dirtyFields,
  setDirtyFields,
  onClose,
  onSave,
}: UserDetailModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [isUnlinking, setIsUnlinking] = useState(false);

  if (!selectedUser || !editedUser) return null;

  const safeSelectedUser = useMemo(
    () => ({
      ...selectedUser,
      permissions: normalizeArray(selectedUser?.permissions),
      assignedModules: normalizeArray(selectedUser?.assignedModules),
      assignedSubModules: normalizeArray(selectedUser?.assignedSubModules),
      assignedDatasets: normalizeArray(selectedUser?.assignedDatasets),
      datasetAccess: normalizeArray(selectedUser?.datasetAccess),
      team_ids: normalizeArray(selectedUser?.team_ids),
      parents: normalizeArray(selectedUser?.parents),
      children: normalizeArray(selectedUser?.children),
      login_access: normalizeLoginAccess(
        selectedUser?.login_access,
        selectedUser?.permissions
      ),
    }),
    [selectedUser]
  );

  const safeEditedUser = useMemo(
    () => ({
      ...editedUser,
      permissions: normalizeArray(editedUser?.permissions),
      assignedModules: normalizeArray(editedUser?.assignedModules),
      assignedSubModules: normalizeArray(editedUser?.assignedSubModules),
      assignedDatasets: normalizeArray(editedUser?.assignedDatasets),
      datasetAccess: normalizeArray(editedUser?.datasetAccess),
      team_ids: normalizeArray(editedUser?.team_ids),
      parents: normalizeArray(editedUser?.parents),
      children: normalizeArray(editedUser?.children),
      login_access: normalizeLoginAccess(
        editedUser?.login_access,
        editedUser?.permissions
      ),
    }),
    [editedUser]
  );

  const markDirty = (field: string, value: any) => {
    setEditedUser((prev: any) => ({ ...prev, [field]: value }));
    setDirtyFields((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  };

  const tabs = [
    { id: "profile" as TabId, label: "Profile", icon: User },
    { id: "security" as TabId, label: "Security", icon: KeyRound },
    { id: "access" as TabId, label: "Access", icon: Shield },
    { id: "assignments" as TabId, label: "Assignments", icon: Settings },
    { id: "team" as TabId, label: "Team", icon: Users },
    { id: "other" as TabId, label: "Other", icon: MapPin },
  ];

  const dirtyCount = dirtyFields?.size || 0;

  const handleUnlinkCurrentUser = async () => {
    const currentUserId =
      safeEditedUser?.id ||
      safeSelectedUser?.id ||
      safeEditedUser?.user_id ||
      safeSelectedUser?.user_id;

    if (!currentUserId) {
      alert("Current user id not found");
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to unlink ${safeEditedUser?.username || "this user"}?`
    );

    if (!isConfirmed) return;

    try {
      setIsUnlinking(true);
      const res = await UnlinkUser(currentUserId);

      if (res?.success) {
        alert(res?.message || "User unlinked successfully");
        onClose();
        return;
      }

      alert(res?.message || "Failed to unlink user");
    } catch (error) {
      console.error("Unlink user failed:", error);
      alert("Unable to unlink user right now");
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex gap-2">
              <h2 className="text-lg font-semibold text-slate-900 mt-1">
                User Details
              </h2>

              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  User: {safeEditedUser.username || "-"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  Role: {safeEditedUser.role || "-"}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${safeEditedUser.login_access?.web
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                    }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Web: {safeEditedUser.login_access?.web ? "On" : "Off"}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${safeEditedUser.login_access?.app
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                    }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  App: {safeEditedUser.login_access?.app ? "On" : "Off"}
                </span>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">
                  {dirtyCount} change{dirtyCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-white px-2">
          <div className="flex flex-wrap gap-2 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activeTab === "profile" && (
            <div className="space-y-3">
              <SectionCard
                title="Basic Profile"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Username"
                    value={safeEditedUser.username}
                    onChange={(value) => markDirty("username", value)}
                  />

                  <InputField
                    label="Email"
                    value={safeEditedUser.email}
                    onChange={(value) => markDirty("email", value)}
                  />

                  <InputField
                    label="Auth Email"
                    value={safeEditedUser.authenticated_email}
                    onChange={(value) =>
                      markDirty("authenticated_email", value)
                    }
                  />

                  <InputField
                    label="Mobile"
                    value={safeEditedUser.mobile_no}
                    onChange={(value) => {
                      const onlyDigits = value.replace(/\D/g, "");
                      if (onlyDigits.length <= 10) {
                        markDirty("mobile_no", onlyDigits);
                      }
                    }}
                    placeholder="e.g. 9876543210"
                    type="tel"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="w-18 shrink-0 text-sm font-medium text-slate-700">
                      Role
                    </label>
                    <select
                      value={safeEditedUser.role || ""}
                      onChange={(e) => markDirty("role", e.target.value)}
                      className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="">Select role...</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="leader">Leader</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="caller">Tele Caller</option>
                      <option value="data_entry_operator">
                        Data Entry Operator
                      </option>
                      <option value="driver">Driver</option>
                      <option value="survey">Surveyer</option>
                      <option value="printer">Printer</option>
                      <option value="mobile_user">Mobile User</option>
                      <option value="user">User</option>
                      <option value="volunteer">Volunteer</option>
                    </select>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-3">
              <SectionCard
                title="Security Controls"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="w-28 shrink-0 text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative min-w-0 flex-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={safeEditedUser.password || ""}
                        onChange={(e) => markDirty("password", e.target.value)}
                        placeholder="Enter new password"
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="w-28 shrink-0 text-sm font-medium text-slate-700">
                      Login Access
                    </label>
                    <div className="flex min-h-10 flex-1 flex-wrap items-center gap-4 rounded-lg border border-slate-300 bg-white px-3 py-2">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!safeEditedUser.login_access?.web}
                          onChange={(e) =>
                            markDirty("login_access", {
                              ...safeEditedUser.login_access,
                              web: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                        Web Login
                      </label>

                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!safeEditedUser.login_access?.app}
                          onChange={(e) =>
                            markDirty("login_access", {
                              ...safeEditedUser.login_access,
                              app: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                        App Login
                      </label>
                    </div>
                  </div>
                </div>
              </SectionCard>

            </div>
          )}

          {activeTab === "access" && (
            <div className="space-y-3">
              <SectionCard
                title="Permissions"
              >
                <PillList
                  title="Permission List"
                  items={safeEditedUser.permissions}
                  emptyText="No permissions assigned"
                />
              </SectionCard>

            </div>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-3">
              <SectionCard
                title="Module Assignment"
              >
                <div className="grid grid-cols-1 gap-4">
                  <TextareaField
                    label="Assigned Modules"
                    value={safeEditedUser.assignedModules
                      ?.map(valueToDisplay)
                      .join(", ")}
                    onChange={(value) =>
                      markDirty("assignedModules", parseCommaSeparated(value))
                    }
                    placeholder="Enter modules separated by commas"
                    rows={5}
                  />

                  <TextareaField
                    label="Assigned Sub Modules"
                    value={safeEditedUser.assignedSubModules
                      ?.map(valueToDisplay)
                      .join(", ")}
                    onChange={(value) =>
                      markDirty("assignedSubModules", parseCommaSeparated(value))
                    }
                    placeholder="Enter sub modules separated by commas"
                    rows={5}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Data Assignment"
                subtitle="Manage datasets, dataset access, and team mapping."
              >
                <div className="grid grid-cols-1 gap-4">
                  <TextareaField
                    label="Assigned Datasets"
                    value={safeEditedUser.assignedDatasets
                      ?.map(valueToDisplay)
                      .join(", ")}
                    onChange={(value) =>
                      markDirty("assignedDatasets", parseCommaSeparated(value))
                    }
                    placeholder="Enter datasets separated by commas"
                    rows={5}
                  />

                  <TextareaField
                    label="Dataset Access"
                    value={safeEditedUser.datasetAccess
                      ?.map(valueToDisplay)
                      .join(", ")}
                    onChange={(value) =>
                      markDirty("datasetAccess", parseCommaSeparated(value))
                    }
                    placeholder="Enter dataset access values separated by commas"
                    rows={5}
                  />

                  <InputField
                    label="Team IDs"
                    value={safeEditedUser.team_ids?.map(valueToDisplay).join(", ")}
                    onChange={(value) =>
                      markDirty("team_ids", parseCommaSeparated(value))
                    }
                    placeholder="Enter team IDs separated by commas"
                  />
                </div>
              </SectionCard>

            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-3">
              <SectionCard
                title="Linked Relations"
              >
                <div className="grid grid-cols-1 gap-4">
                  <PillList
                    title="Parents"
                    items={safeEditedUser.parents}
                    emptyText="No parent records"
                  />

                  <PillList
                    title="Children"
                    items={safeEditedUser.children}
                    emptyText="No child records"
                  />
                </div>
              </SectionCard>

            </div>
          )}

          {activeTab === "other" && (
            <div className="space-y-3">
              <SectionCard
                title="Address & Location"
              >
                <div className="grid grid-cols-1 gap-4">
                  <InputField
                    label="Address"
                    value={safeEditedUser.address}
                    onChange={(value) => markDirty("address", value)}
                  />

                  <InputField
                    label="Location"
                    value={safeEditedUser.location}
                    onChange={(value) => markDirty("location", value)}
                  />
                </div>
              </SectionCard>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {
                safeEditedUser.is_active && (
                  <button
                    type="button"
                    onClick={handleUnlinkCurrentUser}
                    disabled={isUnlinking}
                    className="flex gap-1.5 px-2 py-2.5 cursor-pointer rounded-lg bg-red-700 text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Unlink className="h-4 w-4 mt-0.5" />
                    {isUnlinking ? "Unlinking..." : "Unlink"}
                  </button>
                )
              }
              {/* <span>
                {dirtyCount > 0
                  ? `${dirtyCount} unsaved change${dirtyCount === 1 ? "" : "s"}`
                  : "No unsaved changes"}
              </span> */}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}