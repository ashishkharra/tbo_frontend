"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  UserPlus,
  Plus,
  Copy,
  Check,
  Wifi,
  WifiOff,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Eye,
  EyeOff,
  Edit3,
  Edit,
  Database,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Save,
  X,
  Key,
  Mail,
  Phone,
  Calendar,
  Activity,
  AlertTriangle,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Crown,
  Zap,
  LogOut,
  Building2,
  Network,
  ChevronRight,
  ChevronDown,
  ClipboardPaste,
} from "lucide-react";
import Link from "next/link";
import TBOUserNavbar from "../../components/TBOUserNavbar";

import exportQueueService from "../../services/exportQueueService";
import AdvancedExcelDataTable from "../../components/AdvancedExcelDataTable";
import CommonPagination from "../../components/CommonPagination";
import { activityLogger } from "../../utils/activityLogger";
import UserDetailModal from "./user-detail-modal";
import HierarchicalDataAssignmentModal from "./hierarchical-data-assignment-modal";
import ParentManagementModal from "./parent-management-modal";
import { MODULES } from "../../constants/modules";
import NewUserFormModal from "./new-user-form-modal";
import ModuleAssignmentModal from "./module-assignment-modal";
import {
  BulkUpdateTboUsers,
  DeleteTboUsers,
  getProfile,
  getTboModules,
  getTboTeams,
  getTboUserDetails,
  getTboUsers,
  PostTboTeamMembers,
  PostTboUsers,
  TboUsersChangePassword,
  UpdateTboUsers,
} from "@/apis/api";
import TBOUsersHotTable from "./TBOUsersHotTable";
import { getUserAssignmentsByToken } from "../../apis/api";

const useModulesCodeMap = () => {
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await getTboModules();
        const rows = (res?.data || []) as Array<{
          payload: string;
          code: string;
        }>;

        const next: Record<string, string> = {};
        rows.forEach((r) => {
          if (r.payload) next[r.payload] = r.code || "";
        });

        if (active) setMap(next);
      } catch (e) {
        console.warn("Failed to load modules-code mapping:", e);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return map;
};

const AssignmentTokenCell = ({ tokens }: { tokens: string[] }) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopyToken = async (token: string) => {
    try {
      if (typeof window === "undefined" || !navigator?.clipboard) return;
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error("Failed to copy token:", err);
    }
  };

    return (
      <div className="flex flex-wrap gap-1 items-center max-w-full">
        {tokens.map((token, index) => (
          <div key={index} className="flex items-center gap-1 text-xs shrink-0">
            <span
              title={token}
              className="truncate max-w-[100px] font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-800"
            >
              {token}
            </span>
            <button
              className="p-0.5 hover:bg-gray-200 rounded transition-colors shrink-0"
              title="Copy token"
              onClick={() => handleCopyToken(token)}
            >
              {copiedToken === token ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-red-500" />
                
              )}
            </button>
            
          </div>
        ))}
      </div>
    );
};

const ModulesCodeCell = ({
  user,
  modulesCodeMap,
  users,
  setMessage,
  setLoading,
  fetchUsers,
}: {
  user: any;
  modulesCodeMap: Record<string, string>;
  users: any[];
  setMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;
  fetchUsers: () => Promise<void>;
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPasteInput, setShowPasteInput] = useState<boolean>(false);
  const [pasteValue, setPasteValue] = useState<string>("");

  const handleCopyCode = async (code: string) => {
    try {
      if (typeof window === "undefined" || !navigator?.clipboard) return;
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handlePasteCode = async () => {
    if (!pasteValue.trim()) {
      setMessage("Please enter a valid code to paste");
      return;
    }

    const code = pasteValue.trim();
    const sourceUser = users.find((u: any) => {
      const userModulesCode = u.modules_code || u.modulesCode || "";
      return userModulesCode === code;
    });

    if (sourceUser) {
      try {
        setLoading(true);

        const src = sourceUser as any;
        const payload = {
          assignedModules: src.assignedModules || [],
          assignedSubModules: src.assignedSubModules || [],
          assignedDatasets: src.assignedDatasets || [],
          assignedNavbarPages: src.assignedNavbarPages || [],
        };

        const res = await UpdateTboUsers(user.id, payload);

        if (res.success) {
          setMessage(`Successfully copied modules from ${sourceUser.username}`);
          await fetchUsers();
        } else {
          setMessage(res.message || "Failed to copy modules");
        }
      } catch (e: any) {
        setMessage(e.message || "Error copying modules");
      } finally {
        setLoading(false);
      }
    } else {
      setMessage(`No user found with module code: ${code}`);
    }

    setShowPasteInput(false);
    setPasteValue("");
  };

  if (user.id && String(user.id).startsWith("blank-")) {
    return <span className="text-gray-500">-</span>;
  }

  const mods: string[] = (user.assignedModules || user.assigned_modules || []) as string[];
  const dbCode = (user.modules_code || "").trim();
  const hasAssignedModules = Array.isArray(mods) && mods.length > 0;

  if (dbCode && (hasAssignedModules || user.role === "super_admin")) {
    return (
      <div className="flex items-center gap-1">
        {showPasteInput ? (
          <>
            <input
              type="text"
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasteCode();
                if (e.key === "Escape") {
                  setShowPasteInput(false);
                  setPasteValue("");
                }
              }}
              placeholder="Enter code..."
              autoFocus
              className="text-xs border border-blue-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
            <button
              onClick={handlePasteCode}
              className="p-0.5 hover:bg-green-100 rounded transition-colors"
              title="Apply"
            >
              <Check className="w-3 h-3 text-green-600" />
            </button>
            <button
              onClick={() => {
                setShowPasteInput(false);
                setPasteValue("");
              }}
              className="p-0.5 hover:bg-red-100 rounded transition-colors"
              title="Cancel"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-800 truncate block font-mono" title={dbCode}>
              {dbCode}
            </span>
            <button
              onClick={() => handleCopyCode(dbCode)}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors shrink-0"
              title="Copy code"
            >
              {copiedCode === dbCode ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setShowPasteInput(true)}
              className="p-0.5 hover:bg-blue-100 rounded transition-colors shrink-0"
              title="Paste code"
            >
              <ClipboardPaste className="w-3 h-3 text-blue-600" />
            </button>
          </>
        )}
      </div>
    );
  }

  if (Array.isArray(mods) && mods.length > 0) {
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "_");
    const normalizedMap: Record<string, string> = {};

    Object.entries(modulesCodeMap).forEach(([payload, code]) => {
      normalizedMap[normalize(payload)] = code || "";
    });

    const codes = mods
      .map((moduleId) => {
        const idNorm = normalize(String(moduleId));
        if (normalizedMap[idNorm]) return normalizedMap[idNorm];

        const modObj = MODULES.find(
          (m) =>
            m.id === moduleId ||
            normalize(m.id) === idNorm ||
            normalize(m.title) === idNorm
        );

        const title = modObj?.title || "";
        const titleNorm = title ? normalize(title) : "";

        if (titleNorm && normalizedMap[titleNorm]) return normalizedMap[titleNorm];

        if (modObj?.subModules?.length) {
          for (const sm of modObj.subModules) {
            const smIdNorm = normalize(sm.id);
            const smTitleNorm = normalize(sm.title);
            if (normalizedMap[smIdNorm]) return normalizedMap[smIdNorm];
            if (normalizedMap[smTitleNorm]) return normalizedMap[smTitleNorm];
          }
        }

        return "";
      })
      .filter(Boolean);

    if (codes.length > 0) {
      const joined = codes.join(", ");

      return (
        <div className="flex items-center gap-1">
          {showPasteInput ? (
            <>
              <input
                type="text"
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePasteCode();
                  if (e.key === "Escape") {
                    setShowPasteInput(false);
                    setPasteValue("");
                  }
                }}
                placeholder="Enter code..."
                autoFocus
                className="text-xs border border-blue-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
              />
              <button
                onClick={handlePasteCode}
                className="p-0.5 hover:bg-green-100 rounded transition-colors"
                title="Apply"
              >
                <Check className="w-3 h-3 text-green-600" />
              </button>
              <button
                onClick={() => {
                  setShowPasteInput(false);
                  setPasteValue("");
                }}
                className="p-0.5 hover:bg-red-100 rounded transition-colors"
                title="Cancel"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-800 truncate block font-mono" title={joined}>
                {joined}
              </span>
              <button
                onClick={() => handleCopyCode(joined)}
                className="p-0.5 hover:bg-gray-200 rounded transition-colors shrink-0"
                title="Copy code"
              >
                {copiedCode === joined ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => setShowPasteInput(true)}
                className="p-0.5 hover:bg-blue-100 rounded transition-colors shrink-0"
                title="Paste code"
              >
                <ClipboardPaste className="w-3 h-3 text-blue-600" />
              </button>
            </>
          )}
        </div>
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      {showPasteInput ? (
        <>
          <input
            type="text"
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePasteCode();
              if (e.key === "Escape") {
                setShowPasteInput(false);
                setPasteValue("");
              }
            }}
            placeholder="Enter code..."
            autoFocus
            className="text-xs border border-blue-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
          <button
            onClick={handlePasteCode}
            className="p-0.5 hover:bg-green-100 rounded transition-colors"
            title="Apply"
          >
            <Check className="w-3 h-3 text-green-600" />
          </button>
          <button
            onClick={() => {
              setShowPasteInput(false);
              setPasteValue("");
            }}
            className="p-0.5 hover:bg-red-100 rounded transition-colors"
            title="Cancel"
          >
            <X className="w-3 h-3 text-red-600" />
          </button>
        </>
      ) : (
        <>
          <span className="text-gray-600 text-xs">No code</span>
          <button
            onClick={() => setShowPasteInput(true)}
            className="p-0.5 hover:bg-blue-100 rounded transition-colors shrink-0"
            title="Paste code"
          >
            <ClipboardPaste className="w-3 h-3 text-blue-600" />
          </button>
        </>
      )}
    </div>
  );
};

const PermissionCodeCell = ({
  user,
  users,
  setMessage,
  setLoading,
  fetchUsers,
}: {
  user: any;
  users: any[];
  setMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;
  fetchUsers: () => Promise<void>;
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPasteInput, setShowPasteInput] = useState<boolean>(false);
  const [pasteValue, setPasteValue] = useState<string>("");

  const handleCopyCode = async (code: string) => {
    try {
      if (typeof window === "undefined" || !navigator?.clipboard) return;
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handlePasteCode = async () => {
    if (!pasteValue.trim()) {
      setMessage("Please enter a valid code to paste");
      return;
    }

    const code = pasteValue.trim();
    const sourceUser = users.find((u: any) => {
      const userPermissionCode = u.permission_code || u.permissionCode || "";
      return userPermissionCode === code;
    });

    if (sourceUser) {
      try {
        setLoading(true);

        const payload = {
          permissions: sourceUser.permissions || [],
        };

        const res = await UpdateTboUsers(user.id, payload);

        if (res.success) {
          setMessage(`Successfully copied permissions from ${sourceUser.username}`);
          await fetchUsers();
        } else {
          setMessage(res.message || "Failed to copy permissions");
        }
      } catch (e: any) {
        setMessage(e.message || "Error copying permissions");
      } finally {
        setLoading(false);
      }
    } else {
      setMessage(`No user found with permission code: ${code}`);
    }

    setShowPasteInput(false);
    setPasteValue("");
  };

  if (user.id && String(user.id).startsWith("blank-")) {
    return <span className="text-gray-500">-</span>;
  }

  const code = user.permission_code || user.permissionCode;

  if (!code) {
    return (
      <div className="flex items-center gap-1">
        {showPasteInput ? (
          <>
            <input
              type="text"
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasteCode();
                if (e.key === "Escape") {
                  setShowPasteInput(false);
                  setPasteValue("");
                }
              }}
              placeholder="Enter code..."
              autoFocus
              className="text-xs border border-blue-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
            <button
              onClick={handlePasteCode}
              className="p-0.5 hover:bg-green-100 rounded transition-colors"
              title="Apply"
            >
              <Check className="w-3 h-3 text-green-600" />
            </button>
            <button
              onClick={() => {
                setShowPasteInput(false);
                setPasteValue("");
              }}
              className="p-0.5 hover:bg-red-100 rounded transition-colors"
              title="Cancel"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </>
        ) : (
          <>
            <span className="text-gray-600 text-xs">-</span>
            <button
              onClick={() => setShowPasteInput(true)}
              className="p-0.5 hover:bg-blue-100 rounded transition-colors shrink-0"
              title="Paste code"
            >
              <ClipboardPaste className="w-3 h-3 text-blue-600" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {showPasteInput ? (
        <>
          <input
            type="text"
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePasteCode();
              if (e.key === "Escape") {
                setShowPasteInput(false);
                setPasteValue("");
              }
            }}
            placeholder="Enter code..."
            autoFocus
            className="text-xs border border-blue-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
          <button
            onClick={handlePasteCode}
            className="p-0.5 hover:bg-green-100 rounded transition-colors"
            title="Apply"
          >
            <Check className="w-3 h-3 text-green-600" />
          </button>
          <button
            onClick={() => {
              setShowPasteInput(false);
              setPasteValue("");
            }}
            className="p-0.5 hover:bg-red-100 rounded transition-colors"
            title="Cancel"
          >
            <X className="w-3 h-3 text-red-600" />
          </button>
        </>
      ) : (
        <>
          <span className="font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs font-semibold">
            {code}
          </span>
          <button
            onClick={() => handleCopyCode(code)}
            className="p-0.5 hover:bg-gray-200 rounded transition-colors shrink-0"
            title="Copy code"
          >
            {copiedCode === code ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setShowPasteInput(true)}
            className="p-0.5 hover:bg-blue-100 rounded transition-colors shrink-0"
            title="Paste code"
          >
            <ClipboardPaste className="w-3 h-3 text-blue-600" />
          </button>
        </>
      )}
    </div>
  );
};

export default function TBOUsersPage() {
  const modulesCodeMap = useModulesCodeMap();

  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  console.log('user ->>> ', users)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [usernameFilter, setUsernameFilter] = useState<string>("all");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showModuleAssignModal, setShowModuleAssignModal] = useState(false);
  const [editedUser, setEditedUser] = useState<any | null>(null);
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [showHierarchicalAssignModal, setShowHierarchicalAssignModal] = useState(false);
  const [hierarchicalAssignUser, setHierarchicalAssignUser] = useState<any | null>(null);
  const [showParentManagementModal, setShowParentManagementModal] = useState(false);
  const [parentManagementUser, setParentManagementUser] = useState<any | null>(null);
  const [isBulkAssignmentMode, setIsBulkAssignmentMode] = useState(false);
  const [bulkAssignUsers, setBulkAssignUsers] = useState<any[]>([]);
  const [selectedBulkUsers, setSelectedBulkUsers] = useState<Set<number>>(new Set());
  const [isModalSaving, setIsModalSaving] = useState(false);
  const [modalSaveMessage, setModalSaveMessage] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 1000,
    totalItems: 0,
    totalPages: 0,
  });

  const userSelectedItemsPerPageRef = useRef<number | null>(1000);
  const [parentFilter, setParentFilter] = useState<"all" | number>("all");
  const [editedRows, setEditedRows] = useState<Record<number, any>>({});
  const [dirtyRowIds, setDirtyRowIds] = useState<Set<number>>(new Set());

  const USER_ROLES: any = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "leader", label: "Leader" },
    { value: "coordinator", label: "Coordinator" },
    { value: "caller", label: "Tele Caller" },
    { value: "data_entry_operator", label: "Data Entry Operator" },
    { value: "driver", label: "Driver" },
    { value: "survey", label: "Surveyer" },
    { value: "printer", label: "Printer" },
    { value: "mobile_user", label: "Mobile User" },
    { value: "user", label: "User" },
    { value: "volunteer", label: "Volunteer" },
  ] as const;

  const handleCreateUser = async (payload: any) => {
    try {
      setLoading(true);
      const res = await PostTboUsers(payload);

      if (res?.success) {
        setMessage("User created successfully");
        setOpenModal(false);
        await fetchUsers();
      } else {
        throw new Error(res?.message || "Failed to create user");
      }
    } catch (error: any) {
      setMessage(error?.message || "Failed to create user");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCell = async (userId: number, field: string, value: any): Promise<void> => {
    const numericUserId = Number(userId);

    if (!numericUserId) {
      console.warn("Invalid user id received in handleUpdateCell:", userId, field, value);
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        Number(u.id) === numericUserId
          ? { ...u, [field]: value }
          : u
      )
    );

    setEditedRows((prev) => ({
      ...prev,
      [numericUserId]: {
        ...(prev[numericUserId] || {}),
        id: numericUserId,
        [field]: value,
      },
    }));

    setDirtyRowIds((prev) => {
      const next = new Set(prev);
      next.add(numericUserId);
      return next;
    });
  };

  const handleSaveChanges = async () => {
    try {
      const changedUsers = Object.values(editedRows).filter(
        (row: any) => row && row.id && Number(row.id)
      );

      if (!changedUsers.length) {
        setMessage("No changes to save");
        return;
      }

      setLoading(true);

      const res = await BulkUpdateTboUsers(changedUsers as any[]);

      if (res?.success) {
        setMessage("Changes saved successfully");
        setEditedRows({});
        setDirtyRowIds(new Set());
        await fetchUsers();
      } else {
        setMessage(res?.message || "Failed to save changes");
      }
    } catch (error) {
      console.error("Save changes error:", error);
      setMessage("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (
    customPage = pagination.currentPage,
    customLimit = pagination.itemsPerPage
  ) => {
    try {
      setLoading(true);

      const params = {
        role: roleFilter,
        parent_id: parentFilter,
        username: usernameFilter,
        status: statusFilter,
        search: searchTerm,
        page: customPage,
        limit: customLimit,
      };

      const res = await getTboUsers(params);

      if (res?.success) {
        const rows = Array.isArray(res?.data) ? res.data : [];
        setUsers(rows);

        setPagination((prev) => ({
          ...prev,
          currentPage: res?.pagination?.currentPage || customPage,
          itemsPerPage: res?.pagination?.itemsPerPage || customLimit,
          totalItems: res?.pagination?.totalItems || 0,
          totalPages: res?.pagination?.totalPages || 0,
        }));
      } else {
        setUsers([]);
        setPagination((prev) => ({
          ...prev,
          totalItems: 0,
          totalPages: 0,
        }));
        setMessage(res?.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(pagination.currentPage, pagination.itemsPerPage);
    }, 400);

    return () => clearTimeout(timer);
  }, [
    roleFilter,
    parentFilter,
    usernameFilter,
    statusFilter,
    searchTerm,
    pagination.currentPage,
    pagination.itemsPerPage
  ]);


  const paginatedUsers = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return users.slice(start, end);
  }, [users, pagination.currentPage, pagination.itemsPerPage]);

  // Get unique usernames for the filter
  const uniqueUsernames = useMemo(() => {
    const usernames = users.map((u) => u.username).filter(Boolean);
    return Array.from(new Set(usernames)).sort();
  }, [users]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TBOUserNavbar />

      {/* Filter Bar */}
      <div className="bg-white border-b text-black border-gray-200 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left side filters */}
          <div className="flex items-center gap-3 flex-1">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="leader">Leader</option>
              <option value="coordinator">Coordinator</option>
              <option value="caller">Tele Caller</option>
              <option value="data_entry_operator">Data Entry Operator</option>
              <option value="mobile_user">Mobile User</option>
              <option value="volunteer">Volunteer</option>
              <option value="survey">Surveyer</option>
            </select>

            {/* Parent Filter */}
            <select
              value={parentFilter === "all" ? "all" : parentFilter}
              onChange={(e) => {
                const val = e.target.value;
                setParentFilter(val === "all" ? "all" : Number(val));
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="all">All Parents</option>
              {users
                .filter((u) => u.role === "leader" || u.role === "coordinator")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
            </select>

            {/* Username Filter */}
            <select
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
            >
              <option value="all">All Users ({users.length})</option>
              {uniqueUsernames.map((username) => (
                <option key={username} value={username}>
                  {username}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, m..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 cursor-pointer text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-violet-700 hover:shadow-lg active:scale-[0.97]"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>

            <NewUserFormModal
              open={openModal}
              onClose={() => setOpenModal(false)}
              onCreate={handleCreateUser}
              USER_ROLES={USER_ROLES}
            />

            <button
              onClick={handleSaveChanges}
              disabled={loading || dirtyRowIds.size === 0}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save
            </button>

            <button
              onClick={() => fetchUsers}
              disabled={loading}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            <span className="text-sm font-medium text-gray-700">admin</span>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mx-5 mt-3">
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      )}

      {/* Table */}
      <div className="px-5 py-4">
        <TBOUsersHotTable
          data={paginatedUsers}
          loading={loading}
          onUpdateCell={handleUpdateCell}
          onManageUser={async (usr: any) => {
            if (!usr?.id) {
              setMessage("Invalid user selected");
              return;
            }

            try {
              setLoading(true);
              setMessage("");

              const res = await getTboUserDetails(usr.id);

              if (!res?.success || !res?.data) {
                setMessage(res?.message || "Failed to fetch user details");
                return;
              }

              const fullUser = res.data;

              const normalizedUser = {
                ...fullUser,
                permissions: Array.isArray(fullUser?.permissions) ? fullUser.permissions : [],
                assignedDatasets: Array.isArray(fullUser?.assignedDatasets) ? fullUser.assignedDatasets : [],
                datasetAccess: Array.isArray(fullUser?.datasetAccess) ? fullUser.datasetAccess : [],
                assignedModules: Array.isArray(fullUser?.assignedModules) ? fullUser.assignedModules : [],
                assignedSubModules: Array.isArray(fullUser?.assignedSubModules) ? fullUser.assignedSubModules : [],
                team_ids: Array.isArray(fullUser?.team_ids)
                  ? fullUser.team_ids
                  : Array.isArray(fullUser?.teams)
                    ? fullUser.teams.map((t: any) => t.id)
                    : [],
                parents: Array.isArray(fullUser?.parents)
                  ? fullUser.parents
                  : fullUser?.parent
                    ? [fullUser.parent]
                    : [],
                children: Array.isArray(fullUser?.children) ? fullUser.children : [],
                selectedColumns:
                  fullUser?.selectedColumns && typeof fullUser.selectedColumns === "object"
                    ? fullUser.selectedColumns
                    : {},
                password: "",
              };

              setSelectedUser(normalizedUser);
              setEditedUser(normalizedUser);
              setDirtyFields(new Set());
              setShowUserDetails(true);
            } catch (error: any) {
              console.error("User detail fetch error:", error);
              setMessage(error?.message || "Failed to fetch user details");
            } finally {
              setLoading(false);
            }
          }}
          onModulesClick={(usr) => {
            if (!usr || !usr.id) return;

            setSelectedUser(usr);
            setEditedUser({
              ...usr,
              assignedModules: usr.assignedModules || [],
              assignedSubModules: usr.assignedSubModules || [],
              assignedDatasets: usr.assignedDatasets || [],
              assignedNavbarPages: usr.assignedNavbarPages || [],
            });
            setDirtyFields(new Set());
            setShowModuleAssignModal(true);
          }}
          onDataAssignClick={async (usr) => {
            if (!usr || !usr.id) return;

            try {
              const assignmentsResponse = await getUserAssignmentsByToken(usr.id);

              if (assignmentsResponse?.success) {
                setHierarchicalAssignUser({
                  ...usr,
                  userAssignments: assignmentsResponse.data,
                });
              } else {
                setHierarchicalAssignUser(usr);
              }
            } catch {
              setHierarchicalAssignUser(usr);
            }

            setShowHierarchicalAssignModal(true);
          }}
          onParentClick={(usr) => {
            if (!usr || !usr.id) return;
            setParentManagementUser(usr);
            setShowParentManagementModal(true);
          }}
        />
      </div>

      {/* Pagination */}
      <CommonPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        currentPageItemCount={paginatedUsers.length}
        onPageChange={(page: number) => {
          setPagination((prev) => ({
            ...prev,
            currentPage: page,
          }));
        }}
        onItemsPerPageChange={(itemsPerPage: number | "All") => {
          const numericValue = itemsPerPage === "All" ? 1000 : itemsPerPage;

          userSelectedItemsPerPageRef.current = numericValue;
          setPagination((prev) => ({
            ...prev,
            itemsPerPage: numericValue,
            currentPage: 1,
          }));
        }}
        loading={loading}
        showRefreshButton={true}
        onRefresh={fetchUsers}
      />

      {/* Modals */}
      {showHierarchicalAssignModal && hierarchicalAssignUser && (
        <div className="fixed inset-0 z-[100]">
          <HierarchicalDataAssignmentModal
            selectedUser={hierarchicalAssignUser}
            onClose={() => {
              setShowHierarchicalAssignModal(false);
              setIsBulkAssignmentMode(false);
            }}
            onSave={async () => {
              try {
                setIsModalSaving(true);
                setModalSaveMessage("Saving hierarchical data assignment.");

                if (isBulkAssignmentMode) {
                  const selectedUsers = bulkAssignUsers.filter((u) =>
                    selectedBulkUsers.has(u.id)
                  );

                  setMessage(`Bulk assignment saved for ${selectedUsers.length} users!`);
                  await fetchUsers();
                  setIsBulkAssignmentMode(false);
                  setModalSaveMessage(
                    `✅ Bulk assignment saved for ${selectedUsers.length} users!`
                  );
                } else {
                  await fetchUsers();
                  await new Promise((resolve) => setTimeout(resolve, 500));

                  try {
                    const assignmentsRes = await getUserAssignmentsByToken(
                      hierarchicalAssignUser.id
                    );

                    if (assignmentsRes && assignmentsRes.success) {
                      const updatedUser = { ...hierarchicalAssignUser };

                      if (
                        assignmentsRes.data &&
                        typeof assignmentsRes.data === "object" &&
                        !Array.isArray(assignmentsRes.data) &&
                        Object.keys(assignmentsRes.data).length > 0
                      ) {
                        (updatedUser as any).userAssignments = assignmentsRes.data;
                        (updatedUser as any).hierarchicalDataAssignment =
                          assignmentsRes.data;
                      } else {
                        (updatedUser as any).userAssignments = {};
                        (updatedUser as any).hierarchicalDataAssignment = {};
                      }

                      setHierarchicalAssignUser(updatedUser);
                    }
                  } catch (error) {
                    console.error(
                      `Error fetching assignments for user ${hierarchicalAssignUser.id}:`,
                      error
                    );
                  }

                  setMessage("Hierarchical data assignment saved successfully!");
                  setModalSaveMessage(
                    "✅ Hierarchical data assignment saved successfully!"
                  );
                }

                setTimeout(() => {
                  setModalSaveMessage("");
                }, 3000);
              } catch (error) {
                console.error("Error refreshing data after assignment save:", error);
                setModalSaveMessage("❌ Failed to refresh data after save");
                setMessage(
                  "Assignment saved but failed to refresh data. Please refresh the page."
                );
              } finally {
                setIsModalSaving(false);
              }
            }}
            isSaving={isModalSaving}
            saveMessage={modalSaveMessage}
          />
        </div>
      )}

      {showUserDetails && selectedUser && editedUser && (
        <UserDetailModal
          selectedUser={selectedUser}
          editedUser={editedUser}
          setEditedUser={setEditedUser}
          dirtyFields={dirtyFields}
          setDirtyFields={setDirtyFields}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
            setEditedUser(null);
            setDirtyFields(new Set());
          }}
          onSave={async () => {
            try {
              setLoading(true);
              setMessage("");

              const payload = {
                username: editedUser.username || "",
                email: editedUser.email || "",
                authenticated_email:
                  editedUser.authenticated_email ||
                  editedUser.authenticatedEmail ||
                  "",
                mobile_no: editedUser.mobile_no || editedUser.mobile || "",
                role: editedUser.role || "",
                is_active:
                  typeof editedUser.is_active === "boolean"
                    ? editedUser.is_active
                    : true,
                permissions: Array.isArray(editedUser.permissions)
                  ? editedUser.permissions
                  : [],
                assignedModules: Array.isArray(editedUser.assignedModules)
                  ? editedUser.assignedModules
                  : [],
                assignedSubModules: Array.isArray(editedUser.assignedSubModules)
                  ? editedUser.assignedSubModules
                  : [],
                assignedDatasets: Array.isArray(editedUser.assignedDatasets)
                  ? editedUser.assignedDatasets
                  : [],
                datasetAccess: Array.isArray(editedUser.datasetAccess)
                  ? editedUser.datasetAccess
                  : [],
                selectedColumns:
                  editedUser.selectedColumns &&
                    typeof editedUser.selectedColumns === "object"
                    ? editedUser.selectedColumns
                    : {},
                team_ids: Array.isArray(editedUser.team_ids)
                  ? editedUser.team_ids
                  : [],
                password: editedUser.password || "",
              };

              const res = await UpdateTboUsers(selectedUser.id, payload);

              if (res?.success) {
                setMessage("User updated successfully");
                setShowUserDetails(false);
                setSelectedUser(null);
                setEditedUser(null);
                setDirtyFields(new Set());
                await fetchUsers();
              } else {
                setMessage(res?.message || "Failed to update user");
              }
            } catch (error: any) {
              console.error("Update user error:", error);
              setMessage(error?.message || "Failed to update user");
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      {showModuleAssignModal && selectedUser && (
        <ModuleAssignmentModal
          selectedUser={selectedUser}
          editedUser={editedUser}
          setEditedUser={setEditedUser}
          dirtyFields={dirtyFields}
          setDirtyFields={setDirtyFields}
          setShowModuleAssignModal={(show) => {
            setShowModuleAssignModal(show);
            if (!show) {
              setSelectedUser(null);
              setEditedUser(null);
            }
          }}
          onSave={async () => {
            await fetchUsers();
            setShowModuleAssignModal(false);
            setSelectedUser(null);
            setEditedUser(null);
          }}
          users={users}
          onUserChange={(user) => {
            setSelectedUser(user);
            setEditedUser(user);
          }}
          isSaving={isModalSaving}
          saveMessage={modalSaveMessage}
        />
      )}

      {showParentManagementModal && parentManagementUser && (
        <ParentManagementModal
          selectedUser={parentManagementUser}
          onClose={() => {
            setShowParentManagementModal(false);
            setParentManagementUser(null);
          }}
          onSave={async () => {
            await fetchUsers();
            setShowParentManagementModal(false);
            setParentManagementUser(null);
          }}
          hasPermission={() => true}
        />
      )}
    </div>
  );
}