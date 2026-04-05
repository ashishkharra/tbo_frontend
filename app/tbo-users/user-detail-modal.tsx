"use client";

import React from "react";
import { X } from "lucide-react";

type UserDetailModalProps = {
  selectedUser: any;
  editedUser: any;
  setEditedUser: React.Dispatch<React.SetStateAction<any>>;
  dirtyFields: Set<string>;
  setDirtyFields: React.Dispatch<React.SetStateAction<Set<string>>>;
  onClose: () => void;
  onSave: () => Promise<void> | void;
};

export default function UserDetailModal({
  selectedUser,
  editedUser,
  setEditedUser,
  dirtyFields,
  setDirtyFields,
  onClose,
  onSave,
}: UserDetailModalProps) {
  if (!selectedUser || !editedUser) return null;

  const safeSelectedUser = {
    ...selectedUser,
    permissions: Array.isArray(selectedUser?.permissions) ? selectedUser.permissions : [],
    assignedModules: Array.isArray(selectedUser?.assignedModules) ? selectedUser.assignedModules : [],
    assignedSubModules: Array.isArray(selectedUser?.assignedSubModules) ? selectedUser.assignedSubModules : [],
    assignedDatasets: Array.isArray(selectedUser?.assignedDatasets) ? selectedUser.assignedDatasets : [],
    datasetAccess: Array.isArray(selectedUser?.datasetAccess) ? selectedUser.datasetAccess : [],
    team_ids: Array.isArray(selectedUser?.team_ids) ? selectedUser.team_ids : [],
    parents: Array.isArray(selectedUser?.parents) ? selectedUser.parents : [],
    children: Array.isArray(selectedUser?.children) ? selectedUser.children : [],
  };

  const safeEditedUser = {
    ...editedUser,
    permissions: Array.isArray(editedUser?.permissions) ? editedUser.permissions : [],
    assignedModules: Array.isArray(editedUser?.assignedModules) ? editedUser.assignedModules : [],
    assignedSubModules: Array.isArray(editedUser?.assignedSubModules) ? editedUser.assignedSubModules : [],
    assignedDatasets: Array.isArray(editedUser?.assignedDatasets) ? editedUser.assignedDatasets : [],
    datasetAccess: Array.isArray(editedUser?.datasetAccess) ? editedUser.datasetAccess : [],
    team_ids: Array.isArray(editedUser?.team_ids) ? editedUser.team_ids : [],
    parents: Array.isArray(editedUser?.parents) ? editedUser.parents : [],
    children: Array.isArray(editedUser?.children) ? editedUser.children : [],
  };

  const markDirty = (field: string, value: any) => {
    setEditedUser((prev: any) => ({ ...prev, [field]: value }));
    setDirtyFields((prev) => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                value={safeEditedUser.username || ""}
                onChange={(e) => markDirty("username", e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                value={safeEditedUser.email || ""}
                onChange={(e) => markDirty("email", e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Permissions</h3>
            <div className="flex flex-wrap gap-2">
              {safeEditedUser.permissions.length > 0 ? (
                safeEditedUser.permissions.map((perm: string, index: number) => (
                  <span
                    key={`${perm}-${index}`}
                    className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                  >
                    {perm}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No permissions assigned</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Assigned Modules</h3>
            <div className="flex flex-wrap gap-2">
              {safeEditedUser.assignedModules.length > 0 ? (
                safeEditedUser.assignedModules.map((module: string, index: number) => (
                  <span
                    key={`${module}-${index}`}
                    className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium"
                  >
                    {module}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No modules assigned</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Assigned Sub Modules</h3>
            <div className="flex flex-wrap gap-2">
              {safeEditedUser.assignedSubModules.length > 0 ? (
                safeEditedUser.assignedSubModules.map((module: string, index: number) => (
                  <span
                    key={`${module}-${index}`}
                    className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"
                  >
                    {module}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No sub modules assigned</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Assigned Datasets</h3>
            <div className="flex flex-wrap gap-2">
              {safeEditedUser.assignedDatasets.length > 0 ? (
                safeEditedUser.assignedDatasets.map((dataset: any, index: number) => (
                  <span
                    key={`${dataset?.id || dataset}-${index}`}
                    className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium"
                  >
                    {dataset?.name || dataset?.label || dataset?.id || String(dataset)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No datasets assigned</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Team IDs</h3>
            <div className="flex flex-wrap gap-2">
              {safeEditedUser.team_ids.length > 0 ? (
                safeEditedUser.team_ids.map((teamId: string | number, index: number) => (
                  <span
                    key={`${teamId}-${index}`}
                    className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                  >
                    {teamId}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No team assigned</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-sm font-medium text-white hover:bg-violet-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}