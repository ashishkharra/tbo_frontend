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
import { AdminOnly } from "../../components/ProtectedRoute";
import { apiService } from "../../services/api";
import apiClient from "../../services/apiClient";
import TBOUserNavbar from "../../components/TBOUserNavbar";
import { useAuth } from "../../contexts/AuthContext";

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
import { DeleteTboUsers, getTboModules, getTboTeams, getTboUsers, PostTboTeamMembers, PostTboUsers, TboUsersChangePassword, UpdateTboUsers } from "@/apis/api";
import TBOUsersHotTable from "./TBOUsersHotTable";

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
              <Copy className="w-3 h-3 text-gray-600" />
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
  handleUpdateRow,
  paginatedUsers,
  users,
  apiService,
  setMessage,
  setLoading,
  fetchUsers,
}: {
  user: any;
  modulesCodeMap: Record<string, string>;
  handleUpdateRow: (
    rowIndex: number,
    columnId: string,
    value: any
  ) => Promise<void>;
  paginatedUsers: any[];
  users: any[];
  apiService: any;
  setMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;
  fetchUsers: () => Promise<void>;
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPasteInput, setShowPasteInput] = useState<boolean>(false);
  const [pasteValue, setPasteValue] = useState<string>("");

  const handleCopyCode = async (code: string) => {
    try {
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

  const mods: string[] = (user.assignedModules ||
    user.assigned_modules ||
    []) as string[];
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
            <span
              className="text-xs text-gray-800 truncate block font-mono"
              title={dbCode}
            >
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
        if (titleNorm && normalizedMap[titleNorm])
          return normalizedMap[titleNorm];
        if (modObj?.subModules && modObj.subModules.length) {
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
              <span
                className="text-xs text-gray-800 truncate block font-mono"
                title={joined}
              >
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
  handleUpdateRow,
  paginatedUsers,
  users,
  apiService,
  setMessage,
  setLoading,
  fetchUsers,
}: {
  user: any;
  handleUpdateRow: (
    rowIndex: number,
    columnId: string,
    value: any
  ) => Promise<void>;
  paginatedUsers: any[];
  users: any[];
  apiService: any;
  setMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;
  fetchUsers: () => Promise<void>;
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPasteInput, setShowPasteInput] = useState<boolean>(false);
  const [pasteValue, setPasteValue] = useState<string>("");

  const handleCopyCode = async (code: string) => {
    try {
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
          setMessage(
            `Successfully copied permissions from ${sourceUser.username}`
          );
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

interface TBOUser {
  id: number;
  username: string;
  email: string;
  mobile?: string;
  role: AppUserRole;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  createdBy?: number;
  team_id?: number | null;
  team_ids?: number[];
  teams?: Array<{ team_id: number; team_name: string; team_code?: string }>;
  parent_id?: number | null;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationSentAt?: string;
  emailVerificationExpiresAt?: string;
  adminVerificationEmail?: string;
  assignedDatasets?: string[];
  datasetAccess?: {
    datasetId: string;
    datasetName: string;
    accessLevel: "read" | "write" | "admin";
    assignedAt: string;
  }[];
  selectedColumns?: {
    [datasetId: string]: string[];
  };
  mobileDevices?: Array<{
    deviceId: string;
    deviceInfo: any;
    lastSeen: string;
    isActive: boolean;
  }>;
  mobileFeatures?: {
    offlineMode: boolean;
    dataSync: boolean;
    locationTracking: boolean;
  };
  profilePicture?: string;
  department?: string;
  designation?: string;
  address?: string;
  location?: string;
  timezone?: string;
  language?: string;
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  hierarchicalDataAssignment?: any;
  userAssignments?: any;
  assignment_tokens?: string[];
  assignment_token?: string | null;
  modules_code?: string | null;
}

const PasswordCell = ({ row, rowIndex, onUpdate }: any) => {
  const user = row.original;
  if (user.id && String(user.id).startsWith("blank-")) {
    return <span className="text-gray-500 italic">Optional</span>;
  }

  const [val, setVal] = useState(user.password || "");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setVal(user.password || "");
  }, [user.password]);

  const handleBlur = () => {
    if (val !== user.password) {
      if (onUpdate) {
        onUpdate(rowIndex, "password", val);
      }
    }
  };

  return (
    <div className="relative flex items-center w-full h-full">
      <input
        type={showPassword ? "text" : "password"}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        className="w-full h-full p-1 bg-transparent focus:outline-none placeholder:text-gray-500 text-sm text-gray-800"
        placeholder={
          user.id &&
            !String(user.id).startsWith("new") &&
            !String(user.id).startsWith("blank") &&
            !showPassword
            ? "••••••••"
            : "Change (opt)"
        }
      />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setShowPassword(!showPassword);
        }}
        className="absolute right-0 p-1 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? (
          <EyeOff className="w-3 h-3" />
        ) : (
          <Eye className="w-3 h-3" />
        )}
      </button>
    </div>
  );
};

interface EditableUser {
  id: number | "new";
  username: string;
  email: string;
  mobile: string;
  password: string;
  role: AppUserRole;
  isEditing: boolean;
  isNew: boolean;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationSentAt?: string;
  emailVerificationExpiresAt?: string;
  adminVerificationEmail?: string;
  assignedDatasets?: string[];
  datasetAccess?: {
    datasetId: string;
    datasetName: string;
    accessLevel: "read" | "write" | "admin";
    assignedAt: string;
  }[];
  selectedColumns?: {
    [datasetId: string]: string[];
  };
  department?: string;
  designation?: string;
  address?: string;
  location?: string;
  timezone?: string;
  language?: string;
  permissions?: string[];
  team_id?: number | null;
  team_ids?: number[];
  parent_id?: number | null;
}

interface DataTablePermission {
  id: number;
  user_id: number;
  column_name: string;
  can_view: boolean;
  can_edit: boolean;
  can_mask?: boolean;
  created_at: string;
  updated_at: string;
}

interface UserActivity {
  id: number;
  userId: number;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

const AVAILABLE_PERMISSIONS = [
  "users:read",
  "users:create",
  "users:update",
  "users:delete",
  "voters:read",
  "voters:create",
  "voters:update",
  "voters:delete",
  "surnames:read",
  "surnames:create",
  "surnames:update",
  "surnames:delete",
  "reports:read",
  "reports:generate",
  "reports:export",
  "settings:read",
  "settings:update",
  "master_filters:read",
  "master_filters:update",
  "teams:read",
  "teams:create",
  "teams:update",
  "teams:delete",
  "mobile:access",
  "mobile:offline",
  "mobile:sync",
  "mobile:location",
  "data:import",
  "data:export",
  "data:backup",
  "data:restore",
  "system:logs",
  "system:maintenance",
  "system:config",
  "admin:dashboard",
  "admin:users",
  "admin:roles",
  "admin:permissions",
  "admin:settings",
  "admin:reports",
  "admin:audit",
];

const AVAILABLE_DATASETS = [
  { id: "dataset_1", name: "Dataset 1", description: "Primary voter dataset" },
  {
    id: "old_voter_data_22",
    name: "Old Voter Data - 22",
    description: "Legacy voter data from 2022",
  },
  {
    id: "assembly_constituency_data",
    name: "Assembly Constituency Data",
    description: "Assembly-wise voter information",
  },
  {
    id: "parliament_constituency_data",
    name: "Parliament Constituency Data",
    description: "Parliament-wise voter information",
  },
  {
    id: "booth_level_data",
    name: "Booth Level Data",
    description: "Booth-wise detailed voter data",
  },
  {
    id: "surname_data",
    name: "Surname Data",
    description: "Surname-wise voter categorization",
  },
  {
    id: "mobile_survey_data",
    name: "Mobile Survey Data",
    description: "Data collected via mobile surveys",
  },
  {
    id: "caller_data",
    name: "Caller Data",
    description: "Data collected by callers",
  },
  {
    id: "driver_data",
    name: "Driver Data",
    description: "Data collected by drivers",
  },
  {
    id: "printer_data",
    name: "Printer Data",
    description: "Data for printing operations",
  },
  {
    id: "coordinator_data",
    name: "Coordinator Data",
    description: "Data for coordinators",
  },
  {
    id: "admin_data",
    name: "Admin Data",
    description: "Administrative dataset",
  },
];

const DATASET_COLUMNS = {
  dataset_1: [
    "id",
    "name",
    "fname",
    "mname",
    "surname",
    "dob",
    "mobile1",
    "mobile2",
    "district",
    "block",
    "gp",
    "gram",
    "address",
    "category",
    "cast",
    "religion",
    "age",
    "ac_name",
    "ac_no",
    "pc_name",
    "pc_no",
    "cast_id",
    "cast_ida",
  ],
  old_voter_data_22: [
    "id",
    "name",
    "fname",
    "mname",
    "surname",
    "dob",
    "mobile1",
    "mobile2",
    "district",
    "block",
    "gp",
    "gram",
    "address",
    "category",
    "cast",
    "religion",
    "age",
    "ac_name",
    "ac_no",
    "pc_name",
    "pc_no",
    "cast_id",
    "cast_ida",
  ],
  assembly_constituency_data: [
    "id",
    "parliament",
    "assembly",
    "district",
    "block",
    "tehsil",
    "village",
    "name",
    "fname",
    "mname",
    "surname",
    "cast_id",
    "cast_ida",
    "age",
    "mobile1",
    "mobile2",
    "address",
    "category",
    "religion",
  ],
  parliament_constituency_data: [
    "id",
    "pc_no",
    "pc_name",
    "ac_no",
    "ac_name",
    "district",
    "block",
    "name",
    "fname",
    "mname",
    "surname",
    "cast_id",
    "cast_ida",
    "age",
    "mobile1",
    "mobile2",
    "address",
    "category",
    "religion",
  ],
  booth_level_data: [
    "id",
    "booth_no",
    "booth_name",
    "ac_no",
    "ac_name",
    "pc_no",
    "pc_name",
    "name",
    "fname",
    "mname",
    "surname",
    "cast_id",
    "cast_ida",
    "age",
    "mobile1",
    "mobile2",
    "address",
    "category",
    "religion",
    "voter_id",
  ],
  surname_data: [
    "id",
    "surname",
    "cast_id",
    "cast_ida",
    "count",
    "category",
    "sub_category",
  ],
  mobile_survey_data: [
    "id",
    "survey_id",
    "name",
    "mobile",
    "district",
    "block",
    "village",
    "survey_date",
    "surveyor",
    "status",
    "notes",
  ],
  caller_data: [
    "id",
    "call_id",
    "name",
    "mobile",
    "call_date",
    "caller_name",
    "call_duration",
    "call_status",
    "notes",
    "follow_up_required",
  ],
  driver_data: [
    "id",
    "driver_id",
    "name",
    "mobile",
    "vehicle_no",
    "route",
    "assigned_date",
    "status",
    "notes",
  ],
  printer_data: [
    "id",
    "print_id",
    "document_type",
    "print_date",
    "pages",
    "status",
    "printer_name",
    "file_path",
  ],
  coordinator_data: [
    "id",
    "coordinator_id",
    "name",
    "mobile",
    "assigned_area",
    "start_date",
    "end_date",
    "status",
    "performance_score",
  ],
  admin_data: [
    "id",
    "admin_id",
    "name",
    "email",
    "role",
    "permissions",
    "last_login",
    "created_at",
    "status",
  ],
};

export const USER_ROLES: Array<{ value: AppUserRole; label: string }> = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "coordinator", label: "Coordinator" },
  { value: "data_entry_operator", label: "Data Entry Operator" },
  { value: "caller", label: "Caller" },
  { value: "driver", label: "Driver" },
  { value: "survey", label: "Survey" },
  { value: "printer", label: "Printer" },
  { value: "mobile_user", label: "Mobile User" },
  { value: "leader", label: "Leader" },
  { value: "volunteer", label: "Volunteer" },
  { value: "user", label: "User" },
];

const ROLE_PERMISSIONS: Record<AppUserRole, string[]> = {
  super_admin: AVAILABLE_PERMISSIONS,
  admin: [
    "users:read",
    "users:create",
    "users:update",
    "voters:read",
    "voters:create",
    "voters:update",
    "voters:delete",
    "surnames:read",
    "surnames:create",
    "surnames:update",
    "surnames:delete",
    "reports:read",
    "reports:generate",
    "settings:read",
    "settings:update",
    "master_filters:read",
    "master_filters:update",
    "teams:read",
    "teams:create",
    "teams:update",
    "teams:delete",
    "mobile:access",
    "mobile:sync",
    "data:import",
    "data:export",
    "admin:dashboard",
    "admin:users",
    "admin:reports",
  ],
  coordinator: [
    "users:read",
    "voters:read",
    "voters:update",
    "surnames:read",
    "surnames:update",
    "reports:read",
    "reports:generate",
    "mobile:access",
    "mobile:sync",
  ],
  data_entry_operator: [
    "voters:read",
    "voters:create",
    "voters:update",
    "surnames:read",
    "surnames:update",
    "reports:read",
  ],
  caller: ["voters:read", "reports:read"],
  driver: ["reports:read"],
  survey: [
    "mobile:access",
    "mobile:offline",
    "mobile:sync",
    "mobile:location",
    "voters:read",
    "voters:update",
  ],
  printer: ["reports:read", "reports:export"],
  mobile_user: ["mobile:access", "mobile:offline", "mobile:sync"],
  leader: [
    "users:read",
    "voters:read",
    "voters:update",
    "surnames:read",
    "surnames:update",
    "reports:read",
    "reports:generate",
    "mobile:access",
    "mobile:sync",
    "master_filters:read",
    "data:import",
    "data:export",
    "teams:read",
  ],
  volunteer: [
    "voters:read",
    "surnames:read",
    "reports:read",
    "mobile:access",
    "mobile:offline",
    "mobile:sync",
    "master_filters:read",
  ],
  user: [
    "voters:read",
    "surnames:read",
    "reports:read",
    "master_filters:read",
    "mobile:access",
  ],
};

export default function TBOUsersPage() {
  const { user, hasRole, hasPermission, loading: authLoading } = useAuth();
  console.log('user ->>>>>>>>> ', typeof (user?.id))
  const modulesCodeMap = {}

  const [users, setUsers] = useState<TBOUser[]>([]);
  const [editableUsers, setEditableUsers] = useState<EditableUser[]>([]);
  const [dataTablePermissions, setDataTablePermissions] = useState<
    DataTablePermission[]
  >([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [generalSearch, setGeneralSearch] = useState("");
  const [usernameFilter, setUsernameFilter] = useState<string>("all");
  const [searchReadOnly, setSearchReadOnly] = useState(true);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    column: string;
  } | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TBOUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showModuleAssignModal, setShowModuleAssignModal] = useState(false);
  const [editedUser, setEditedUser] = useState<any | null>(null);
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [newRows, setNewRows] = useState<EditableUser[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignUser, setAssignUser] = useState<TBOUser | null>(null);
  const [assignForm, setAssignForm] = useState<{
    selectedDataset: string;
    filterCriteria: { field: string; value: string }[];
  }>({
    selectedDataset: "",
    filterCriteria: [],
  });
  const [showHierarchicalAssignModal, setShowHierarchicalAssignModal] =
    useState(false);
  const [hierarchicalAssignUser, setHierarchicalAssignUser] =
    useState<TBOUser | null>(null);
  const [showParentManagementModal, setShowParentManagementModal] =
    useState(false);
  const [parentManagementUser, setParentManagementUser] =
    useState<TBOUser | null>(null);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [bulkAssignRole, setBulkAssignRole] = useState<string>("");
  const [bulkAssignUsers, setBulkAssignUsers] = useState<TBOUser[]>([]);

  const [selectedBulkUsers, setSelectedBulkUsers] = useState<Set<number>>(
    new Set()
  );
  const [isBulkAssignmentMode, setIsBulkAssignmentMode] = useState(false);
  const [teams, setTeams] = useState<
    Array<{
      id: number;
      name: string;
      team_code?: string;
      parent_id?: number | null;
      user_count?: number;
      child_team_count?: number;
    }>
  >([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showTeamHierarchyModal, setShowTeamHierarchyModal] = useState(false);
  const [selectedTeamForHierarchy, setSelectedTeamForHierarchy] = useState<any>(null);
  const [teamHierarchyData, setTeamHierarchyData] = useState<any>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());
  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
    team_code: "",
  });
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [isModalSaving, setIsModalSaving] = useState(false);
  const [modalSaveMessage, setModalSaveMessage] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0,
  });
  const userSelectedItemsPerPageRef = useRef<number | null>(null);
  const [parentFilter, setParentFilter] = useState<"all" | number>("all");
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  useEffect(() => {
    console.log("TBO users page loaded");
    fetchUsers();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setGeneralSearch("");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (roleFilter !== "all") {
      setUsernameFilter("all");
    }
    if (newRows.length > 0) {
      setNewRows([]);
      setMessage(
        "Role changed. New user rows cleared. Please create new users with the selected role."
      );
    }
  }, [roleFilter]);

  const useAutoPageSize = true;

  const calculateRowsPerPage = () => {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    let headerHeight = 150;
    let paginationHeight = 80;
    let tablePadding = 40;
    const rowHeight = 40;

    if (screenHeight < 600) {
      headerHeight = 130;
      paginationHeight = 60;
      tablePadding = 30;
    } else if (screenHeight < 800) {
      headerHeight = 140;
      paginationHeight = 70;
      tablePadding = 35;
    } else if (screenHeight >= 1400) {
      headerHeight = 180;
      paginationHeight = 80;
      tablePadding = 40;
    }

    if (screenWidth < 768) {
      headerHeight += 20;
      paginationHeight += 10;
    }

    const availableHeight =
      screenHeight - headerHeight - paginationHeight - tablePadding;
    const calculatedRows = Math.floor(availableHeight / rowHeight);
    const minRows = 10;
    let maxRows = 50;
    if (screenHeight < 600) {
      maxRows = 15;
    } else if (screenHeight < 800) {
      maxRows = 25;
    } else if (screenHeight >= 1400) {
      maxRows = 60;
    }

    const finalRows = Math.max(minRows, Math.min(maxRows, calculatedRows));
    return finalRows;
  };

  useEffect(() => {
    if (!useAutoPageSize) return;
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (userSelectedItemsPerPageRef.current === null) {
          const newRowsPerPage = calculateRowsPerPage();
          if (newRowsPerPage !== pagination.itemsPerPage) {
            setPagination((prev) => ({
              ...prev,
              itemsPerPage: newRowsPerPage,
              currentPage: 1,
            }));
          }
        }
      }, 150);
    };
    const initialCalculation = () => {
      if (userSelectedItemsPerPageRef.current === null) {
        const initialRows = calculateRowsPerPage();
        setPagination((prev) => ({ ...prev, itemsPerPage: initialRows }));
      }
    };
    setTimeout(initialCalculation, 100);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [useAutoPageSize]);

  useEffect(() => {
    if (!useAutoPageSize) return;
    const handleVisibilityChange = () => {
      if (!document.hidden && userSelectedItemsPerPageRef.current === null) {
        setTimeout(() => {
          const newRowsPerPage = calculateRowsPerPage();
          setPagination((prev) => ({ ...prev, itemsPerPage: newRowsPerPage }));
        }, 200);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [useAutoPageSize]);

  useEffect(() => {
    const handleUserAction = async (e: any) => {
      try {
        const { rowIndex, action } = e.detail || {};
        const list: any[] = [...(newRows as any[]), ...(users as any[])];
        const row = list[rowIndex];
        if (!row) return;
        if (action === "manage") {
          setSelectedUser(row);
          setEditedUser({
            ...row,
            password: "",
            assignedDatasets: row.assignedDatasets || [],
            datasetAccess: row.datasetAccess || [],
            selectedColumns: row.selectedColumns || {},
            assignedModules: row.assignedModules || [],
            assignedSubModules: row.assignedSubModules || [],
            team_id: row.team_id || null,
            team_ids: row.team_ids || [],
            parent_id: row.parent_id || null,
            permissions: row.permissions || [],
          });
          setDirtyFields(new Set());
          setShowUserDetails(true);
        }
        if (action === "assign") {
          setAssignUser(row);
          setAssignForm({
            selectedDataset: "",
            filterCriteria: [],
          });
          setShowAssignModal(true);
        }
        if (action === "hierarchical-assign" || action === "data-assign") {
          try {
            const assignmentsResponse = await apiClient.getUserAssignments(
              row.id
            );
            if (assignmentsResponse && assignmentsResponse.success) {
              const userWithAssignments = {
                ...row,
                userAssignments: assignmentsResponse.data,
              };
              setHierarchicalAssignUser(userWithAssignments);
            } else {
              setHierarchicalAssignUser(row);
            }
          } catch (error) {
            setHierarchicalAssignUser(row);
          }
          setShowHierarchicalAssignModal(true);
        }
      } catch { }
    };
    window.addEventListener("userAction", handleUserAction as any);
    return () =>
      window.removeEventListener("userAction", handleUserAction as any);
  }, [users, newRows]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showBulkAssignModal) {
        setShowBulkAssignModal(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [showBulkAssignModal]);

  useEffect(() => {
    const editable = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      mobile: user.mobile || "",
      password: "",
      role: user.role,
      isEditing: false,
      isNew: false,
      department: user.department || "",
      designation: user.designation || "",
      location: user.location || "",
      timezone: user.timezone || "Asia/Kolkata",
      language: user.language || "hi",
      permissions: user.permissions || [],
      team_id: user.team_id || null,
      parent_id: user.parent_id || null,
    }));
    setEditableUsers(editable);
  }, [users]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchUsers();
      fetchDataTablePermissions();
      fetchUserActivities();
      fetchTeams();
    }
  }, [authLoading, user]);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await getTboTeams({ is_active: true });
      if (response.success && response.data) {
        setTeams(response.data);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      setMessage("Failed to load teams");
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamForm.name.trim()) {
      setMessage("Team name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await PostTboTeamMembers({
        name: teamForm.name,
        description: teamForm.description || undefined,
        parent_id: null,
        team_code: teamForm.team_code || undefined,
      });

      if (response.success) {
        setMessage("Team created successfully!");
        setShowCreateTeamModal(false);
        setTeamForm({ name: "", description: "", team_code: "" });
        await fetchTeams();
      } else {
        setMessage(response.message || "Failed to create team");
      }
    } catch (error: any) {
      setMessage(error.message || "Error creating team");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !teamForm.name.trim()) {
      setMessage("Team name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.updateTeam(editingTeam.id, {
        name: teamForm.name,
        description: teamForm.description || undefined,
        parent_id: null,
        team_code: teamForm.team_code || undefined,
      });

      if (response.success) {
        setMessage("Team updated successfully!");
        setEditingTeam(null);
        setShowCreateTeamModal(false);
        setTeamForm({ name: "", description: "", team_code: "" });
        await fetchTeams();
      } else {
        setMessage(response.message || "Failed to update team");
      }
    } catch (error: any) {
      setMessage(error.message || "Error updating team");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this team? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.deleteTeam(teamId);
      if (response.success) {
        setMessage("Team deleted successfully!");
        await fetchTeams();
      } else {
        setMessage(response.message || "Failed to delete team");
      }
    } catch (error: any) {
      setMessage(error.message || "Error deleting team");
    } finally {
      setLoading(false);
    }
  };

  const openTeamHierarchyModal = async (team: any) => {
    try {
      setLoadingHierarchy(true);
      setSelectedTeamForHierarchy(team);
      const response = await apiService.getTeamHierarchy(team.id);
      if (response.success && response.data) {
        setTeamHierarchyData(response.data);
        setShowTeamHierarchyModal(true);
      } else {
        setMessage(response.message || "Failed to load hierarchy");
      }
    } catch (error: any) {
      setMessage(error.message || "Error loading hierarchy");
    } finally {
      setLoadingHierarchy(false);
    }
  };

  const openEditTeamModal = (team: any) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name || "",
      description: team.description || "",
      team_code: team.team_code || "",
    });
    setShowCreateTeamModal(true);
  };

  const toggleTeamExpand = (teamId: number) => {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  const renderUserTree = (user: any, level: number) => {
    const indent = level * 24;
    return (
      <div key={user.id} style={{ marginLeft: `${indent}px` }}>
        <div className="flex items-center gap-2 py-2 border-b border-gray-100">
          {level > 0 && (
            <div className="text-gray-500 mr-2">
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{user.username}</span>
              <span className="text-xs text-gray-600">({user.email})</span>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-800">
                {user.role}
              </span>
              {user.child_count > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {user.child_count} child{user.child_count !== 1 ? "ren" : ""}
                </span>
              )}
            </div>
            {user.parent_username && level === 0 && (
              <div className="text-xs text-gray-600 mt-1">
                Parent: {user.parent_username}
              </div>
            )}
          </div>
        </div>
        {user.children && user.children.length > 0 && (
          <div className="mt-1">
            {user.children.map((child: any) =>
              renderUserTree(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const rootTeams = teams.filter((t) => !t.parent_id);
  const getChildTeams = (parentId: number) => {
    return teams.filter((t) => t.parent_id === parentId);
  };

  const renderTeamTree = (team: any, level: number = 0) => {
    const children = getChildTeams(team.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedTeams.has(team.id);

    return (
      <div key={team.id} className="mb-2">
        <div
          className={`flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleTeamExpand(team.id)}
              className="mr-2 text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          ) : (
            <div className="w-7" />
          )}

          <Building2 className="w-5 h-5 text-blue-600 mr-3" />

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">{team.name}</h3>
              {team.team_code && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {team.team_code}
                </span>
              )}
            </div>
            {team.description && (
              <p className="text-sm text-gray-600 mt-1">{team.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
              <span>👥 {team.user_count || 0} users</span>
              {hasChildren && <span>📁 {children.length} child teams</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openTeamHierarchyModal(team)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded"
              title="View Team Hierarchy"
            >
              <Network className="w-5 h-5" />
            </button>
            <button
              onClick={() => openEditTeamModal(team)}
              className="p-2 text-green-600 hover:bg-green-50 rounded"
              title="Edit Team"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteTeam(team.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete Team"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-2">
            {children.map((child) => renderTeamTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    setParentFilter("all");
  }, [roleFilter]);

  const usersByRole = useMemo(() => {
    if (roleFilter === "all") {
      return users;
    }
    return users.filter((user) => user.role === roleFilter);
  }, [users, roleFilter]);

  const parentOptions = useMemo(() => {
    const parentIds = new Set(
      users
        .map((u) => u.parent_id)
        .filter((id) => id !== null && id !== undefined)
        .map((id) => Number(id))
    );
    const base = roleFilter === "all" ? users : usersByRole;
    return (base || [])
      .filter((u) => parentIds.has(Number(u.id)))
      .map((u) => ({
        value: u.id,
        label: u.username || u.email || String(u.id),
      }));
  }, [usersByRole, users, roleFilter]);

  const filteredUsers = useMemo(() => {
    const combined: any[] = [...(newRows as any[]), ...(users as any[])];
    let filtered = combined;

    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (generalSearch) {
      const searchTerm = generalSearch.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          (user.mobile && user.mobile.includes(searchTerm)) ||
          user.role.toLowerCase().includes(searchTerm) ||
          (user.department &&
            user.department.toLowerCase().includes(searchTerm)) ||
          (user.designation &&
            user.designation.toLowerCase().includes(searchTerm)) ||
          (user.location && user.location.toLowerCase().includes(searchTerm))
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) =>
        statusFilter === "active" ? user.isActive : !user.isActive
      );
    }

    if (usernameFilter !== "all") {
      filtered = filtered.filter((user) => user.username === usernameFilter);
    }

    if (parentFilter !== "all") {
      filtered = filtered.filter(
        (user) => Number(user.parent_id) === Number(parentFilter)
      );
    }

    const actualUsers = filtered.filter(
      (user) => !user.id || !String(user.id).startsWith("blank-")
    );
    return actualUsers;
  }, [
    users,
    newRows,
    searchTerm,
    generalSearch,
    roleFilter,
    statusFilter,
    usernameFilter,
    parentFilter,
  ]);

  useEffect(() => {
    const totalFiltered = filteredUsers.length;
    setPagination((prev) => ({
      ...prev,
      totalItems: totalFiltered,
      totalPages: Math.max(1, Math.ceil(totalFiltered / prev.itemsPerPage)),
      currentPage:
        prev.currentPage >
          Math.max(1, Math.ceil(totalFiltered / prev.itemsPerPage))
          ? 1
          : prev.currentPage,
    }));
  }, [filteredUsers.length]);

  useEffect(() => {
    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [searchTerm, generalSearch, roleFilter, statusFilter, usernameFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const pageData = filteredUsers.slice(startIndex, endIndex);
    const minRows = Math.max(10, pagination.itemsPerPage);
    const blankRowsNeeded = Math.max(0, minRows - pageData.length);
    const blankRows = Array.from({ length: blankRowsNeeded }, (_, index) => ({
      id: `blank-${startIndex + pageData.length + index}`,
      username: "",
      email: "",
      mobile: "",
      role: roleFilter !== "all" ? roleFilter : "user",
      isActive: true,
      createdAt: "",
      updatedAt: "",
      permissions: [],
    }));

    return [...pageData, ...blankRows];
  }, [
    filteredUsers,
    pagination.currentPage,
    pagination.itemsPerPage,
    roleFilter,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as Element;
      const isInputField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          (target as HTMLElement).contentEditable === "true" ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest("select") ||
          target.closest('[contenteditable="true"]'));

      if (isInputField) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const saveButton = document.querySelector(
          'button[onclick*="Save Changes"]'
        ) as HTMLButtonElement;
        if (saveButton) {
          saveButton.click();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
      }

      if (e.key === "Escape") {
        setIsEditing(false);
        setEditingCell(null);
      }

      if (e.key === "F2" && selectedCells.size > 0) {
        e.preventDefault();
        setIsEditing(true);
        const firstCell = Array.from(selectedCells)[0];
        const [row, column] = firstCell.split("-");
        setEditingCell({ row: parseInt(row), column });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedCells, paginatedUsers]);

  const handleCopyAssignmentFromToken = async (
    userId: number,
    token: string
  ) => {
    try {
      if (!token || token.trim() === "") {
        setMessage("Please enter a valid token");
        return;
      }

      setLoading(true);
      setMessage("Copying assignment from token...");

      const result = await apiClient.getUserAssignmentsByToken(token.trim());

      if (result && result.success && result.data) {
        const saveResult = await apiClient.saveUserAssignments(
          userId,
          result.data
        );

        if (saveResult && saveResult.success) {
          setMessage(
            `Assignment copied successfully! ${saveResult.count || 0
            } assignment(s) saved.`
          );
          await fetchUsers();
        } else {
          setMessage(saveResult?.message || "Failed to save assignment");
        }
      } else {
        setMessage(
          result?.message || "No assignment found for the given token"
        );
      }
    } catch (error: any) {
      console.error("Error copying assignment from token:", error);
      setMessage(error?.message || "Failed to copy assignment from token");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRow = async (
    rowIndex: number,
    columnId: string,
    value: any
  ) => {
    try {
      const row = (paginatedUsers as any[])[rowIndex];
      if (!row) return;

      if (
        columnId === "assignmentCode" ||
        columnId === "assign_code" ||
        columnId === "assignment_token"
      ) {
        if (row.id && row.id > 0) {
          const tokenValue =
            value && typeof value === "string" ? value.trim() : "";
          if (tokenValue !== "") {
            await handleCopyAssignmentFromToken(row.id, tokenValue);
          } else {
            setMessage("Please enter a valid token to copy assignment");
          }
          return;
        }
      }

      if (columnId === "modulesCode" || columnId === "modules_code") {
        const code = value && typeof value === "string" ? value.trim() : "";
        if (code && users.length > 0) {
        }
        return;
      }

      if (columnId === "permission_code" || columnId === "permissionCode") {
        const code = value && typeof value === "string" ? value.trim() : "";
        if (code && users.length > 0) {
        }
        return;
      }

      if (row.id && String(row.id).startsWith("blank-")) {
        const selectedRole =
          columnId === "role"
            ? value
            : roleFilter !== "all"
              ? roleFilter
              : "user";
        const newUser: EditableUser = {
          id: "new",
          username: columnId === "username" ? value : "",
          email: columnId === "email" ? value : "",
          mobile: columnId === "mobile" ? value : "",
          password: columnId === "password" ? value : "",
          role: selectedRole,
          isEditing: false,
          isNew: true,
          permissions:
            ROLE_PERMISSIONS[selectedRole as AppUserRole] ||
            ROLE_PERMISSIONS.user,
        };

        setNewRows((prev) => [...prev, newUser]);
        return;
      }

      const isTempNew =
        String(row.id || "").startsWith("new") || (row as any).isNew;

      if (isTempNew) {
        setNewRows((prev) =>
          prev.map((r) => {
            if (String((r as any).id) === String(row.id)) {
              const updated = { ...(r as any), [columnId]: value };
              if (
                columnId === "role" &&
                (value as AppUserRole) in ROLE_PERMISSIONS
              ) {
                updated.permissions = ROLE_PERMISSIONS[value as AppUserRole];
              }
              return updated;
            }
            return r;
          })
        );
        return;
      }

      if (row.id && !String(row.id).startsWith("new")) {
        try {
          const fieldMapping: { [key: string]: string } = {
            mobile: "mobile",
            isActive: "isActive",
            username: "username",
            email: "email",
            role: "role",
            password: "password",
            parent_id: "parent_id",
          };

          const backendField = fieldMapping[columnId] || columnId;
          const res = await UpdateTboUsers(row.id, {
            [backendField]: value,
          });

          if (res.success) {
            setMessage(`Updated ${columnId} successfully!`);
            await fetchUsers();
          } else {
            setMessage(`Failed to update ${columnId}: ${res.message}`);
          }
        } catch (error) {
          setMessage(`Error updating ${columnId}. Please try again.`);
        }
      }
    } catch (error) {
      setMessage("Error updating cell. Please try again.");
    }
  };

  const addNewUserRow = () => {
    const selectedRole = roleFilter === "all" ? "user" : roleFilter;

    if (roleFilter === "all") {
      setMessage(
        'No role selected. Defaulting to "User" role. You can change it after creation.'
      );
    }

    const newUser: EditableUser = {
      id: "new" as any,
      username: "",
      email: "",
      mobile: "",
      password: "",
      role: selectedRole as AppUserRole,
      isEditing: true,
      isNew: true,
      department: "",
      designation: "",
      location: "",
      timezone: "Asia/Kolkata",
      language: "hi",
      permissions:
        ROLE_PERMISSIONS[selectedRole as AppUserRole] || ROLE_PERMISSIONS.user,
    };
    setNewRows((prev) => [newUser, ...prev]);
  };

  const updateEditableUser = (
    id: number | "new",
    field: keyof EditableUser,
    value: any
  ) => {
    setEditableUsers((prev) =>
      prev.map((user) => {
        if (user.id === id) {
          const updated = { ...user, [field]: value };
          if (field === "role" && (value as AppUserRole) in ROLE_PERMISSIONS) {
            updated.permissions = ROLE_PERMISSIONS[value as AppUserRole];
          }
          return updated;
        }
        return user;
      })
    );
  };

  const startEditing = (id: number | "new") => {
    setEditingId(id);
    setEditableUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, isEditing: true } : user))
    );
  };

  const cancelEditing = (id: number | "new") => {
    if (id === "new") {
      setEditableUsers((prev) => prev.filter((user) => user.id !== "new"));
    } else {
      setEditableUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isEditing: false } : user
        )
      );
    }
    setEditingId(null);
  };

  const checkSession = () => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");

    if (!token || !userInfo) {
      setMessage("No authentication token found. Please log in again.");
      return false;
    }

    return true;
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      setMessage("Refreshing session...");

      const isValid = await apiService.validateToken();
      if (isValid) {
        setMessage("Session refreshed successfully!");
        await fetchUsers();
      } else {
        setMessage("Session expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      setMessage("Failed to refresh session. Please log in again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (user: EditableUser) => {
    if (!user.username || !user.email) {
      setMessage("Username and email are required");
      return;
    }

    if (!user.role) {
      setMessage("Role is required for all users");
      return;
    }

    if (user.isNew && !user.password) {
      setMessage("Password is required for new users");
      return;
    }

    if (!checkSession()) {
      return;
    }

    setLoading(true);
    try {
      if (user.isNew) {
        const permissionsArray = user.permissions || [];

        const hasWebAccess = permissionsArray.includes("login:web");
        const hasMobileAccess = permissionsArray.includes("login:mobile");

        const webAccess = hasWebAccess || (!hasWebAccess && !hasMobileAccess);
        const mobileAccess = hasMobileAccess;

        const loginAccessStr = [
          webAccess ? 'web' : null,
          mobileAccess ? 'mobile' : null
        ].filter(Boolean).join(',');

        const payload = {
          username: user.username,
          email: user.email,
          authenticatedEmail: user.email,
          password: user.password || '123',
          mobile: user.mobile || '',
          role: user.role,
          permissions: loginAccessStr
        };



        const res = await PostTboUsers(payload as any);
        if (res.success) {
          setMessage("User created successfully!");
          setNewRows((prev) =>
            prev.filter((r) => String((r as any).id) !== String(user.id))
          );
          await fetchUsers();
          setEditingId(null);
        } else {
          setMessage(res.message || "Failed to create user");
        }
      } else {
        // Existing user update logic...
      }
    } catch (error: any) {
      console.error("Error saving user:", error);
      if (error?.message?.includes("session has expired")) {
        setMessage(
          "Your session has expired. Please refresh the page and try again."
        );
      } else {
        setMessage(error?.message || "Error saving user");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await DeleteTboUsers(id);
      if (res.success) {
        setMessage("User deleted successfully!");

        await activityLogger.logUserManagement(
          `Deleted user with ID: ${id}`,
          1,
          { userId: id }
        );

        await fetchUsers();
      } else {
        setMessage(res.message || "Failed to delete user");
      }
    } catch (error: any) {
      setMessage(error?.message || "Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssignByRole = (role: string) => {
    const usersWithRole = users.filter((user) => user.role === role);
    setBulkAssignRole(role);
    setBulkAssignUsers(usersWithRole);
    setSelectedBulkUsers(new Set(usersWithRole.map((user) => user.id)));
    setShowBulkAssignModal(true);
  };

  const handleBulkAssignSave = async (assignmentData: any) => {
    if (!checkSession()) {
      return;
    }

    try {
      setIsModalSaving(true);
      setModalSaveMessage("Saving bulk assignment...");

      const selectedUsers = bulkAssignUsers.filter((user) =>
        selectedBulkUsers.has(user.id)
      );

      for (const user of selectedUsers) {
        await UpdateTboUsers(Number(user.id), {
          hierarchicalDataAssignment: assignmentData,
        } as any);
      }

      setMessage(`Bulk assignment saved for ${selectedUsers.length} users!`);
      await fetchUsers();
      setShowBulkAssignModal(false);
      setModalSaveMessage(
        `✅ Bulk assignment saved for ${selectedUsers.length} users!`
      );

      setTimeout(() => {
        setModalSaveMessage("");
      }, 3000);
    } catch (error: any) {
      console.error("Error saving bulk assignment:", error);
      if (error?.message?.includes("session has expired")) {
        setModalSaveMessage(
          "❌ Your session has expired. Please refresh the page and try again."
        );
        setMessage(
          "Your session has expired. Please refresh the page and try again."
        );
      } else {
        setModalSaveMessage("❌ Failed to save bulk assignment");
        setMessage("Failed to save bulk assignment");
      }
    } finally {
      setIsModalSaving(false);
    }
  };

  const toggleUserStatus = async (id: number, isActive: boolean) => {
    setLoading(true);
    try {
      const res = await UpdateTboUsers(id, { isActive: !isActive });
      if (res.success) {
        setMessage(
          `User ${!isActive ? "activated" : "deactivated"} successfully!`
        );
        await fetchUsers();
      } else {
        setMessage(res.message || "Failed to update user status");
      }
    } catch (error: any) {
      console.error("Error updating user status:", error);
      if (error?.message?.includes("session has expired")) {
        setMessage(
          "Your session has expired. Please refresh the page and try again."
        );
      } else {
        setMessage(error?.message || "Error updating user status");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (id: number) => {
    const newPassword = prompt("Enter new password for this user:");
    if (!newPassword) return;

    setLoading(true);
    try {
      const res = await TboUsersChangePassword(id, newPassword);
      if (res.success) {
        setMessage("Password reset successfully!");
      } else {
        setMessage(res.message || "Failed to reset password");
      }
    } catch (error: any) {
      setMessage(error?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = async () => {
    try {
      const fileName = `tbo-users-${new Date().toISOString().split("T")[0]
        }.csv`;
      const exportId = await exportQueueService.addDataset1Export(
        fileName,
        "csv",
        {},
        {
          userType: "tbo_users",
          totalUsers: users.length,
        },
        [
          "id",
          "username",
          "email",
          "mobile",
          "role",
          "status",
          "createdAt",
          "lastLogin",
        ],
        true
      );

      if (exportId) {
        alert(
          `✅ Export request added to queue successfully!\n\nFile: ${fileName}\nUsers: ${users.length}\n\nYou can process it from the Export Table in Import/Export page.`
        );
      } else {
        alert("❌ Failed to add export to queue. Please try again.");
      }
    } catch (error) {
      setMessage("Error adding export to queue");
    }
  };

  const getColumns = () => [
    {
      accessorKey: "id",
      header: "ID",
      size: 30,
      readOnly: true,
      cell: ({ row }: any) => {
        const id = row.original.id;
        if (id && String(id).startsWith("blank-")) {
          return <span className="text-gray-500">-</span>;
        }
        return <span className="text-gray-800">{id}</span>;
      },
    },
    {
      accessorKey: "role",
      header: "Role *",
      size: 120,
      readOnly: false,
      type: "select",
      selectOptions: USER_ROLES,
      cell: ({ row }: any) => {
        const user = row.original;

        if (user.id && String(user.id).startsWith("blank-")) {
          return <span className="text-gray-500 italic">Select role</span>;
        }

        const roleLabel =
          USER_ROLES.find((r) => r.value === user.role)?.label || user.role;
        return <span className="text-gray-800 font-medium">{roleLabel}</span>;
      },
    },
    {
      accessorKey: "username",
      header: "Username",
      size: 100,
      readOnly: false,
      type: "text",
      cell: ({ row }: any) => {
        const user = row.original;

        if (user.id && String(user.id).startsWith("blank-")) {
          return (
            <span className="text-gray-500 italic">Click to add username</span>
          );
        }

        return (
          <span
            className="text-blue-700 hover:text-blue-900 hover:underline cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(user);
              setEditedUser({
                ...user,
                password: "",
                assignedDatasets: user.assignedDatasets || [],
                datasetAccess: user.datasetAccess || [],
                selectedColumns: user.selectedColumns || {},
                assignedModules: user.assignedModules || [],
                assignedSubModules: user.assignedSubModules || [],
                permissions: user.permissions || [],
                team_ids: user.team_ids || [],
              });
              setDirtyFields(new Set());
              setShowUserDetails(true);
            }}
          >
            {user.username}
          </span>
        );
      },
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
      size: 100,
      readOnly: false,
      type: "text",
      cell: ({ row }: any) => {
        const user = row.original;

        if (user.id && String(user.id).startsWith("blank-")) {
          return (
            <span className="text-gray-500 italic">Click to add mobile</span>
          );
        }

        return <span className="text-gray-800">{user.mobile}</span>;
      },
    },
    {
      accessorKey: "modulesCode",
      header: "Modules Code",
      size: 150,
      readOnly: false,
      editable: true,
      type: "text",
      cell: ({ row }: any) => (
        <ModulesCodeCell
          user={row.original}
          modulesCodeMap={modulesCodeMap}
          handleUpdateRow={handleUpdateRow}
          paginatedUsers={paginatedUsers}
          users={users}
          apiService={apiService}
          setMessage={setMessage}
          setLoading={setLoading}
          fetchUsers={fetchUsers}
        />
      ),
    },
    {
      accessorKey: "permission_code",
      header: "Permission Code",
      size: 120,
      readOnly: false,
      editable: true,
      type: "text",
      cell: ({ row }: any) => (
        <PermissionCodeCell
          user={row.original}
          handleUpdateRow={handleUpdateRow}
          paginatedUsers={paginatedUsers}
          users={users}
          apiService={apiService}
          setMessage={setMessage}
          setLoading={setLoading}
          fetchUsers={fetchUsers}
        />
      ),
    },
    {
      accessorKey: "assignmentCode",
      header: "Assign Code",
      size: 200,
      readOnly: false,
      editable: true,
      type: "text",
      cell: ({ row }: any) => {
        const user = row.original;
        if (user.id && String(user.id).startsWith("blank-"))
          return <span className="text-gray-500">-</span>;

        let primaryTokens: string[] = [];
        if (user.assignment_tokens) {
          if (Array.isArray(user.assignment_tokens)) {
            primaryTokens = user.assignment_tokens.filter(
              (t: string) => t && t.trim() !== "" && t !== "null"
            );
          } else if (typeof user.assignment_tokens === "string") {
            primaryTokens = user.assignment_tokens
              .split(",")
              .filter((t: string) => t && t.trim() !== "" && t !== "null");
          }
        }

        if (primaryTokens.length > 0) {
          return <AssignmentTokenCell tokens={primaryTokens} />;
        }

        const getAssignmentTokens = () => {
          if (
            user.userAssignments &&
            typeof user.userAssignments === "object" &&
            !Array.isArray(user.userAssignments)
          ) {
            const tokens: string[] = [];
            Object.entries(user.userAssignments).forEach(
              ([datasetId, datasetAssignments]: [string, any]) => {
                if (Array.isArray(datasetAssignments)) {
                  datasetAssignments.forEach((assignment: any) => {
                    const token = assignment?.assignment_token;
                    if (
                      token &&
                      typeof token === "string" &&
                      token.trim() !== "" &&
                      !tokens.includes(token)
                    ) {
                      tokens.push(token);
                    }
                  });
                }
              }
            );

            if (tokens.length > 0) {
              return tokens;
            }
          }

          if (
            user.hierarchicalDataAssignment &&
            typeof user.hierarchicalDataAssignment === "object" &&
            !Array.isArray(user.hierarchicalDataAssignment)
          ) {
            const tokens: string[] = [];
            Object.entries(user.hierarchicalDataAssignment).forEach(
              ([datasetId, datasetAssignments]: [string, any]) => {
                if (Array.isArray(datasetAssignments)) {
                  datasetAssignments.forEach((assignment: any) => {
                    const token = assignment?.assignment_token;
                    if (
                      token &&
                      typeof token === "string" &&
                      token.trim() !== "" &&
                      !tokens.includes(token)
                    ) {
                      tokens.push(token);
                    }
                  });
                }
              }
            );
            if (tokens.length > 0) {
              return tokens;
            }
          }

          return [];
        };

        const fallbackTokens = getAssignmentTokens();

        if (fallbackTokens.length === 0) {
          return (
            <span className="text-gray-600 text-xs">
              Paste token to copy assignment
            </span>
          );
        }

        return <AssignmentTokenCell tokens={fallbackTokens} />;
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      size: 230,
      readOnly: true,
      cell: ({ row }: any) => {
        const user = row.original;

        if (user.id && String(user.id).startsWith("blank-")) {
          return <span className="text-gray-500">-</span>;
        }

        return (
          <div
            className="flex items-center gap-1 flex-wrap"
            style={{ minWidth: "200px" }}
          >
            <button
              onClick={() => {
                if (!user || !user.id) {
                  return;
                }
                try {
                  setSelectedUser(user);
                  setEditedUser({
                    ...user,
                    assignedModules: user.assignedModules || [],
                    assignedSubModules: user.assignedSubModules || [],
                    assignedDatasets: user.assignedDatasets || [],
                    assignedNavbarPages: user.assignedNavbarPages || [],
                  });
                  setDirtyFields(new Set());
                  setShowModuleAssignModal(true);
                } catch (error) {
                  console.error("Error opening module modal:", error);
                }
              }}
              className="px-2 py-1 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded whitespace-nowrap shadow-sm"
              title="Assign Modules & Datasets"
            >
              Modules
            </button>

            {hasPermission("users:update") &&
              Number(user.id) && (

                <button
                  onClick={async () => {
                    if (!user || !user.id) {
                      return;
                    }
                    try {
                      const assignmentsResponse =
                        await apiClient.getUserAssignments(user.id);
                      if (assignmentsResponse && assignmentsResponse.success) {
                        setHierarchicalAssignUser({
                          ...user,
                          userAssignments: assignmentsResponse.data,
                        });
                      } else {
                        setHierarchicalAssignUser(user);
                      }
                      setShowHierarchicalAssignModal(true);
                    } catch (error) {
                      setHierarchicalAssignUser(user);
                      setShowHierarchicalAssignModal(true);
                    }
                  }}
                  className="px-2 py-1 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded whitespace-nowrap shadow-sm"
                  title="Assign Hierarchical Data (Constituency, Block, GP, Villages)"
                >
                  Data Assign
                </button>
              )}

            {user.id &&
              !String(user.id).startsWith("new") &&
              !String(user.id).startsWith("blank-") && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!user || !user.id) {
                      return;
                    }
                    try {
                      setParentManagementUser(user);
                      setShowParentManagementModal(true);
                    } catch (error) {
                      console.error(
                        "Error opening parent management modal:",
                        error
                      );
                    }
                  }}
                  className="px-2 py-1 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded whitespace-nowrap shadow-sm"
                  title="Manage User Parent (Hierarchy)"
                  style={{ display: "inline-block", minWidth: "50px" }}
                >
                  Team
                </button>
              )}

            <a href="/tbo-users/setting" className="px-2 py-1 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded whitespace-nowrap shadow-sm">Setting</a>
          </div>
        );
      },
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);

      try {
        const tokenGenRes =
          await apiClient.generateTokensForExistingAssignments();
        if (tokenGenRes && tokenGenRes.success && tokenGenRes.count > 0) {
          setMessage(
            `Generated tokens for ${tokenGenRes.count} existing assignments`
          );
        }
      } catch (tokenError: any) { }

      const res = await getTboUsers();
      if (res.success && res.data) {
        const usersArray = Array.isArray(res.data) ? res.data : [];

        if (usersArray.length === 0) {
          setUsers([]);
          return;
        }

        const usersWithAssignments = await Promise.all(
          usersArray.map(async (user: any) => {
            let assignmentTokensFromApi: string[] = [];
            if (user.assignment_tokens) {
              if (Array.isArray(user.assignment_tokens)) {
                assignmentTokensFromApi = user.assignment_tokens;
              } else if (typeof user.assignment_tokens === "string") {
                assignmentTokensFromApi = user.assignment_tokens
                  .split(",")
                  .filter((t: string) => t && t.trim() !== "" && t !== "null");
              }
            }
            const assignmentTokenFromApi =
              user.assignment_token ||
              (assignmentTokensFromApi.length > 0
                ? assignmentTokensFromApi[0]
                : null);

            const hierarchicalDataFromUsersTable =
              user.hierarchicalDataAssignment;

            try {
              const assignmentsRes = await apiClient.getUserAssignments(
                user.id
              );

              if (assignmentsRes && assignmentsRes.success) {
                if (
                  assignmentsRes.data &&
                  typeof assignmentsRes.data === "object" &&
                  !Array.isArray(assignmentsRes.data)
                ) {
                  const hasData = Object.keys(assignmentsRes.data).length > 0;

                  if (hasData) {
                    user.userAssignments = assignmentsRes.data;

                    if (
                      !hierarchicalDataFromUsersTable ||
                      (typeof hierarchicalDataFromUsersTable === "object" &&
                        Object.keys(hierarchicalDataFromUsersTable).length ===
                        0)
                    ) {
                      user.hierarchicalDataAssignment = assignmentsRes.data;
                    } else if (hierarchicalDataFromUsersTable) {
                      user.hierarchicalDataAssignment =
                        hierarchicalDataFromUsersTable;
                    }
                  } else {
                    user.userAssignments = {};

                    if (hierarchicalDataFromUsersTable) {
                      user.hierarchicalDataAssignment =
                        hierarchicalDataFromUsersTable;
                    } else {
                      user.hierarchicalDataAssignment = {};
                    }
                  }
                } else {
                  user.userAssignments = {};

                  if (hierarchicalDataFromUsersTable) {
                    user.hierarchicalDataAssignment =
                      hierarchicalDataFromUsersTable;
                  } else {
                    user.hierarchicalDataAssignment = {};
                  }
                }
              } else {
                user.userAssignments = {};

                if (hierarchicalDataFromUsersTable) {
                  user.hierarchicalDataAssignment =
                    hierarchicalDataFromUsersTable;
                } else {
                  user.hierarchicalDataAssignment = {};
                }
              }
            } catch (error) {
              console.error(
                `Error fetching assignments for user ${user.id}:`,
                error
              );
              user.userAssignments = {};
              if (hierarchicalDataFromUsersTable) {
                user.hierarchicalDataAssignment =
                  hierarchicalDataFromUsersTable;
              } else {
                user.hierarchicalDataAssignment = {};
              }
            }

            user.assignment_tokens = assignmentTokensFromApi;
            user.assignment_token = assignmentTokenFromApi;

            const mods = (user.assignedModules ||
              user.assigned_modules ||
              []) as unknown[];
            let derivedCode = (user.modules_code || "").trim();
            const hasAssignedModules = Array.isArray(mods) && mods.length > 0;

            if (!derivedCode && hasAssignedModules) {
              try {
                const normalize = (s: string) =>
                  s.toLowerCase().replace(/\s+/g, "_");
                const normalizedMap: Record<string, string> = {};
                if (modulesCodeMap && typeof modulesCodeMap === "object") {
                  Object.entries(modulesCodeMap).forEach(([payload, code]) => {
                    normalizedMap[normalize(payload)] = code || "";
                  });
                }

                const derivedCodes = mods
                  .map((moduleId: any) => {
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
                    if (titleNorm && normalizedMap[titleNorm])
                      return normalizedMap[titleNorm];

                    if (modObj?.subModules && modObj.subModules.length) {
                      for (const sm of modObj.subModules) {
                        const smIdNorm = normalize(sm.id);
                        const smTitleNorm = normalize(sm.title);
                        if (normalizedMap[smIdNorm])
                          return normalizedMap[smIdNorm];
                        if (normalizedMap[smTitleNorm])
                          return normalizedMap[smTitleNorm];
                      }
                    }
                    return "";
                  })
                  .filter(Boolean);

                if (derivedCodes.length > 0) {
                  derivedCode = derivedCodes.join(", ");
                }
              } catch (err) {
                console.warn("Error deriving modules code:", err);
              }
            }
            user.modulesCode = derivedCode;

            user.permissionCode = user.permission_code || "";

            let assignCodeValue = user.assign_code || "";
            if (
              !assignCodeValue &&
              user.assignment_tokens &&
              user.assignment_tokens.length > 0
            ) {
              assignCodeValue = user.assignment_tokens[0];
            }
            user.assignCode = assignCodeValue;
            user.assign_code = assignCodeValue;

            return user;
          })
        );

        setUsers(usersWithAssignments as unknown as TBOUser[]);
        setPagination((prev) => ({
          ...prev,
          totalItems: res.data.length,
          totalPages: Math.ceil(res.data.length / prev.itemsPerPage),
        }));
      } else {
        setMessage("No user data received");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Failed to fetch users. Please check if backend is running.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataTablePermissions = async () => {
    try {
      const res = await apiService.getUserColumnPermissions(user?.id || 0);
      const permissionsArray = Array.isArray(res) ? res : [];

      if (permissionsArray.length === 0) {
        setDataTablePermissions([]);
        return;
      }

      const transformedPermissions = permissionsArray.map(
        (perm: any, index: number) => ({
          id: perm.id || index,
          user_id: perm.user_id || user?.id || 0,
          column_name: perm.column_name,
          can_view: perm.can_view,
          can_edit: perm.can_edit,
          can_mask: perm.can_mask,
          created_at: perm.created_at || new Date().toISOString(),
          updated_at: perm.updated_at || new Date().toISOString(),
        })
      );
      setDataTablePermissions(transformedPermissions);
    } catch (error) {
      console.error("Error fetching data table permissions:", error);
      setDataTablePermissions([]);
    }
  };

  const fetchUserActivities = async () => {
    try {
      setUserActivities([]);
    } catch (error) {
      console.error("Error fetching user activities:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <TBOUserNavbar />
        <div className="bg-white rounded-lg shadow-lg p-8 mx-0 mt-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-700">Authenticating...</div>
            <div className="text-sm text-gray-600 mt-2">
              Please wait while we verify your credentials...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // if (loading && users.length === 0) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 overflow-x-hidden">
  //       <TBOUserNavbar />
  //       <div className="bg-white rounded-lg shadow-lg p-8 mx-0 mt-0">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //           <div className="text-gray-700">Loading TBO Users...</div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <TBOUserNavbar />

      <div className="p-0">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-0">
          <>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  <div>
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setUsernameFilter("all");
                      }}
                      className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${roleFilter === "all"
                        ? "border-gray-300 bg-white text-gray-800"
                        : "border-blue-500 bg-blue-50 text-blue-800"
                        }`}
                    >
                      <option value="all">All Roles</option>
                      {USER_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={parentFilter}
                      onChange={(e) => {
                        const val = e.target.value;
                        setParentFilter(val === "all" ? "all" : Number(val));
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
                    >
                      <option value="all">All Parents</option>
                      {parentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={usernameFilter}
                      onChange={(e) => setUsernameFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
                    >
                      <option value="all">
                        All Users ({usersByRole.length})
                      </option>
                      {usersByRole.map((user) => (
                        <option key={user.id} value={user.username}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="search"
                      id="user_general_search"
                      name="user_general_search_field_random_v2"
                      autoComplete="off"
                      data-lpignore="true"
                      list="mobile-options-list"
                      value={generalSearch}
                      onChange={(e) => setGeneralSearch(e.target.value)}
                      readOnly={searchReadOnly}
                      onFocus={() => setSearchReadOnly(false)}
                      placeholder="Search by name, mobile, role..."
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full text-gray-800"
                    />
                    <datalist id="mobile-options-list">
                      {users
                        .slice(0, 100)
                        .map((u, i) =>
                          u.mobile ? <option key={i} value={u.mobile} /> : null
                        )}
                    </datalist>
                  </div>

                  <div>
                    <button
                      onClick={async () => {
                        try {
                          setLoading(true);
                          setMessage("Saving changes...");

                          const usersToUpdate = filteredUsers.filter(
                            (user: any) => {
                              return (
                                user &&
                                user.id &&
                                !String(user.id).startsWith("new") &&
                                !String(user.id).startsWith("blank-")
                              );
                            }
                          );

                          const newUsersToCreate = newRows.filter(
                            (user: any) => {
                              return user && user.username && user.email;
                            }
                          );

                          let savedCount = 0;

                          for (const user of usersToUpdate) {
                            try {
                              const res = await UpdateTboUsers(user.id, {
                                username: user.username,
                                email: user.email,
                                mobile: user.mobile,
                                role: user.role,
                                isActive: user.isActive,
                              });

                              if (res.success) {
                                savedCount++;
                              }
                            } catch (error) {
                              console.error(
                                `Failed to save user ${user.id}:`,
                                error
                              );
                              const errorMessage =
                                error instanceof Error
                                  ? error.message
                                  : "Unknown error";
                              if (
                                errorMessage.includes("403") ||
                                errorMessage.includes("Forbidden")
                              ) {
                                console.warn(
                                  `Cannot modify user ${user.username}: Insufficient permissions. Only super admins can modify super admin users.`
                                );
                              }
                            }
                          }

                          for (const user of newUsersToCreate) {
                            try {
                              const permissionsArray = user.permissions || [];
                              const hasWebAccess = permissionsArray.includes("login:web");
                              const hasMobileAccess = permissionsArray.includes("login:mobile");

                              const webAccess = hasWebAccess || (!hasWebAccess && !hasMobileAccess);
                              const mobileAccess = hasMobileAccess;

                              const loginAccessStr = [
                                webAccess ? 'web' : null,
                                mobileAccess ? 'mobile' : null
                              ].filter(Boolean).join(',');

                              const payload = {
                                username: user.username,
                                email: user.email,
                                authenticatedEmail: user.email,
                                password: user.password || "123",
                                mobile: user.mobile,
                                role: user.role,
                                permissions: loginAccessStr // ✅ string format
                              };

                              console.log("Creating user payload:", payload);

                              const res = await PostTboUsers(payload as any);
                              if (res.success) {
                                savedCount++;
                              }
                            } catch (error) {
                              console.error(
                                `Failed to create user ${user.username}:`,
                                error
                              );
                            }
                          }

                          if (newUsersToCreate.length > 0) {
                            setNewRows([]);
                          }

                          setMessage(
                            `Successfully saved ${savedCount} user(s)!`
                          );
                          await fetchUsers();
                        } catch (error) {
                          console.error("Error saving changes:", error);
                          const errorMessage =
                            error instanceof Error
                              ? error.message
                              : "Unknown error";
                          if (
                            errorMessage.includes("403") ||
                            errorMessage.includes("Forbidden")
                          ) {
                            setMessage(
                              "Some users could not be updated due to permission restrictions. Only super admins can modify super admin users."
                            );
                          } else {
                            setMessage(
                              "Failed to save changes. Please try again."
                            );
                          }
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="py-2 px-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm cursor-pointer whitespace-nowrap"
                      title="Save all changes (Ctrl+S)"
                    >
                      💾 Save Changes
                    </button>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setGeneralSearch("");
                        setRoleFilter("all");
                        setStatusFilter("all");
                        setUsernameFilter("all");
                        setParentFilter("all");
                        fetchUsers();
                      }}
                      className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-sm cursor-pointer flex items-center space-x-1"
                      title="Clear all filters and refresh data"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-4 ml-auto">
                  <div className="flex items-center space-x-2 ">
                    <button
                      onClick={() => setShowNewUserModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                      title="Open form to create a new user"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    {newRows.length > 0 && (
                      <>
                        <button
                          onClick={() => saveUser(newRows[0] as any)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                          title="Save New User"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setNewRows([])}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                          title="Cancel New"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {user ? (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              localStorage.removeItem("token");
                              window.location.href = "/login";
                            }
                          }}
                          className="text-sm font-medium text-gray-900 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                          title="Click to logout"
                        >
                          {user.username || user.email}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => (window.location.href = "/login")}
                          className="px-4 py-2 text-sm text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200 font-medium"
                        >
                          Login
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = "/mobile-login")
                          }
                          className="px-4 py-2 text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-all duration-200 font-medium border border-blue-200"
                        >
                          Mobile App
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-lg shadow-lg mb-0 mt-6"
              style={{ padding: 0 }}
            >
              <div className="p-0" style={{ margin: 0, padding: 0 }}>
                <div
                  style={{
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <TBOUsersHotTable
                      data={paginatedUsers}
                      loading={loading}
                      onUpdateCell={handleUpdateRow}
                      onManageUser={(usr) => {
                        setSelectedUser(usr);
                        setEditedUser({
                          ...usr,
                          password: "",
                          assignedDatasets: usr.assignedDatasets || [],
                          datasetAccess: usr.datasetAccess || [],
                          selectedColumns: usr.selectedColumns || {},
                          assignedModules: usr.assignedModules || [],
                          assignedSubModules: usr.assignedSubModules || [],
                          permissions: usr.permissions || [],
                          team_ids: usr.team_ids || [],
                        });
                        setDirtyFields(new Set());
                        setShowUserDetails(true);
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
                          const assignmentsResponse = await apiClient.getUserAssignments(usr.id);
                          if (assignmentsResponse && assignmentsResponse.success) {
                            setHierarchicalAssignUser({ ...usr, userAssignments: assignmentsResponse.data });
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
                      hasPermission={hasPermission}
                    />
                  </div>

                  <div className="flex-shrink-0 mt-4">
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
                        // Convert "All" to a large number (e.g., 1000)
                        const numericValue = itemsPerPage === "All" ? 1000 : itemsPerPage;

                        userSelectedItemsPerPageRef.current = numericValue;
                        setPagination((prev) => ({
                          ...prev,
                          itemsPerPage: numericValue, // Always store as number
                          currentPage: 1,
                        }));
                      }}
                      loading={loading}
                      showRefreshButton={true}
                      onRefresh={fetchUsers}
                    />
                  </div>
                </div>

                {(hasPermission("users:create") ||
                  hasRole("super_admin") ||
                  hasRole("admin")) && (
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          setShowNewUserModal(true);
                        }}
                        className="px-3 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 text-sm flex items-center gap-2"
                        title="Create a new user"
                      >
                        <Plus className="w-4 h-4" /> Add New User
                      </button>
                    </div>
                  )}
              </div>
            </div>

            {message && (
              <div className="bg-white rounded-lg shadow-lg p-4 mb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {message.includes("session has expired") ? (
                      <X className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <span className="text-gray-800">{message}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {message.includes("session has expired") && (
                      <button
                        onClick={() => window.location.reload()}
                        className="px-3 py-1 bg-blue-700 text-white text-sm rounded hover:bg-blue-800"
                      >
                        Refresh Page
                      </button>
                    )}
                    <button
                      onClick={() => setMessage("")}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>

          {showNewUserModal && (
            <NewUserFormModal
              onClose={() => setShowNewUserModal(false)}
              onCreate={async (payload) => {
                try {
                  setLoading(true);
                  const res = await PostTboUsers(payload as any);
                  if (res.success) {
                    setMessage("User created successfully");
                    setShowNewUserModal(false);
                    await fetchUsers();
                  } else {
                    setMessage(res.message || "Failed to create user");
                  }
                } catch (e: any) {
                  setMessage(e?.message || "Error creating user");
                } finally {
                  setLoading(false);
                }
              }}
              USER_ROLES={USER_ROLES}
            />
          )}

          {showUserDetails && selectedUser && (
            <UserDetailModal
              selectedUser={selectedUser}
              editedUser={editedUser}
              setEditedUser={setEditedUser}
              dirtyFields={dirtyFields}
              setDirtyFields={setDirtyFields}
              setShowUserDetails={setShowUserDetails}
              onSave={async () => {
                if (!editedUser) return;
                const id = (editedUser as any).id;
                setIsModalSaving(true);
                setModalSaveMessage("");

                try {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    throw new Error(
                      "No authentication token found. Please log in again."
                    );
                  }

                  if (
                    dirtyFields.has("password") &&
                    editedUser.password &&
                    editedUser.password.trim()
                  ) {
                    const pwRes = await TboUsersChangePassword(
                      id,
                      editedUser.password.trim()
                    );
                    if (!pwRes.success)
                      throw new Error(
                        pwRes.message || "Failed to update password"
                      );
                  }
                  const allowed = [
                    "username",
                    "email",
                    "mobile",
                    "role",
                    "isActive",
                    "assignedModules",
                    "assignedSubModules",
                    "assignedDatasets",
                    "assignedNavbarPages",
                    "team_ids",
                    "parent_id",
                    "permissions",
                  ];
                  const payload: any = {};
                  allowed.forEach((k) => {
                    if (dirtyFields.has(k)) {
                      if (k === "team_ids") {
                        const teamIds = editedUser[k];
                        if (Array.isArray(teamIds)) {
                          payload[k] = teamIds
                            .map((id: any) =>
                              typeof id === "number"
                                ? id
                                : parseInt(String(id), 10)
                            )
                            .filter((id: number) => !isNaN(id) && id > 0);
                        } else {
                          payload[k] = [];
                        }
                      } else {
                        payload[k] = editedUser[k] || null;
                      }
                    }
                  });

                  if (Object.keys(payload).length > 0) {
                    const res = await UpdateTboUsers(id, payload);
                    if (!res.success)
                      throw new Error(res.message || "Failed to update user");
                  }

                  await fetchUsers();
                  const updater = (prev: TBOUser | null): TBOUser | null => {
                    if (!prev) return prev;
                    const merged: TBOUser = { ...prev, ...editedUser };
                    delete (merged as any).password;
                    return merged;
                  };
                  setSelectedUser(updater);
                  setDirtyFields(new Set());

                  setModalSaveMessage(
                    "✅ Module assignments updated successfully!"
                  );
                  setMessage("User module assignments updated successfully!");

                  setTimeout(() => {
                    setModalSaveMessage("");
                  }, 3000);
                } catch (e: any) {
                  console.error("Error saving user details:", e);
                  if (e?.message?.includes("session has expired")) {
                    setModalSaveMessage(
                      "❌ Your session has expired. Please refresh the page and try again."
                    );
                    setMessage(
                      "Your session has expired. Please refresh the page and try again."
                    );

                    setTimeout(() => {
                      setMessage("");
                      setModalSaveMessage("");
                    }, 8000);
                  } else {
                    setModalSaveMessage(
                      `❌ Error: ${e?.message || "Save failed"}`
                    );
                    setMessage(e?.message || "Save failed");
                  }
                } finally {
                  setIsModalSaving(false);
                }
              }}
              onDelete={async () => {
                const userId = (selectedUser as any).id;
                const username = (selectedUser as any).username;

                if (
                  !confirm(
                    `Are you sure you want to delete user "${username}"?\n\nThis action cannot be undone.`
                  )
                ) {
                  return;
                }

                setIsModalSaving(true);
                setModalSaveMessage("Deleting user...");

                try {
                  const res = await DeleteTboUsers(userId);

                  if (res.success) {
                    setMessage(`User "${username}" deleted successfully!`);
                    setShowUserDetails(false);

                    await activityLogger.logUserManagement(
                      `Deleted user: ${username} (ID: ${userId})`,
                      1,
                      { userId, username }
                    );

                    await fetchUsers();
                  } else {
                    setModalSaveMessage(res.message || "Failed to delete user");
                    setMessage(res.message || "Failed to delete user");
                  }
                } catch (error: any) {
                  console.error("❌ Delete error:", error);
                  const errorMessage =
                    error?.message ||
                    "An error occurred while deleting the user";
                  setModalSaveMessage(errorMessage);
                  setMessage(errorMessage);
                } finally {
                  setIsModalSaving(false);
                  setTimeout(() => setModalSaveMessage(""), 3000);
                }
              }}
              hasPermission={hasPermission}
              hasRole={hasRole}
              USER_ROLES={USER_ROLES}
              availableDatasets={AVAILABLE_DATASETS}
              datasetColumns={DATASET_COLUMNS}
              isSaving={isModalSaving}
              saveMessage={modalSaveMessage}
              availablePermissions={AVAILABLE_PERMISSIONS}
            />
          )}

          {showModuleAssignModal && selectedUser && (
            <ModuleAssignmentModal
              selectedUser={selectedUser}
              editedUser={editedUser}
              setEditedUser={setEditedUser}
              dirtyFields={dirtyFields}
              setDirtyFields={setDirtyFields}
              setShowModuleAssignModal={setShowModuleAssignModal}
              users={users}
              onUserChange={(newUser: any) => {
                if (dirtyFields.size > 0) {
                  if (
                    !confirm(
                      "You have unsaved changes. Are you sure you want to switch users? Changes will be lost."
                    )
                  ) {
                    return;
                  }
                }
                setSelectedUser(newUser);
                setEditedUser({
                  ...newUser,
                  assignedModules: newUser.assignedModules || [],
                  assignedDatasets: newUser.assignedDatasets || [],
                  permissions: newUser.permissions || [],
                  assignedNavbarPages: newUser.assignedNavbarPages || [],
                });
                setDirtyFields(new Set());
                setModalSaveMessage("");
              }}
              onSave={async () => {
                if (!editedUser) return;
                const id = (editedUser as any).id;
                setIsModalSaving(true);
                setModalSaveMessage("");

                try {
                  const token = localStorage.getItem("token");
                  if (!token) throw new Error("No authentication token found.");

                  const allowed = [
                    "assignedModules",
                    "assignedSubModules",
                    "assignedDatasets",
                    "assignedNavbarPages",
                  ];
                  const payload: any = {};

                  allowed.forEach((k) => {
                    if (dirtyFields.has(k)) {
                      payload[k] = editedUser[k] || null;
                    }
                  });

                  if (Object.keys(payload).length > 0) {
                    const res = await UpdateTboUsers(id, payload);
                    if (!res.success)
                      throw new Error(res.message || "Failed to update user");
                  }

                  await fetchUsers();

                  const updater = (prev: TBOUser | null): TBOUser | null => {
                    if (!prev) return prev;
                    return { ...prev, ...editedUser };
                  };
                  setSelectedUser(updater);

                  setDirtyFields(new Set());
                  setModalSaveMessage(
                    "✅ Module assignments updated successfully!"
                  );

                  setTimeout(() => {
                    setModalSaveMessage("");
                  }, 2000);
                } catch (e: any) {
                  setModalSaveMessage(
                    `❌ Error: ${e?.message || "Save failed"}`
                  );
                } finally {
                  setIsModalSaving(false);
                }
              }}
              isSaving={isModalSaving}
              saveMessage={modalSaveMessage}
            />
          )}

          {showAssignModal && assignUser && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-[700px] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Assign Dataset Data • {assignUser.username}
                  </h3>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">
                      User's Assigned Datasets
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {(assignUser.assignedDatasets &&
                        assignUser.assignedDatasets.length > 0) ||
                        (assignUser as any).assigned_datasets ? (
                        <div className="flex flex-wrap gap-2">
                          {(
                            assignUser.assignedDatasets ||
                            (assignUser as any).assigned_datasets ||
                            []
                          ).map((datasetId: string) => {
                            const dataset = AVAILABLE_DATASETS.find(
                              (d) => d.id === datasetId
                            );
                            return (
                              <span
                                key={datasetId}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {dataset?.name || datasetId}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">
                          No datasets assigned to this user. Please assign
                          datasets first.
                        </p>
                      )}
                    </div>
                  </div>

                  {((assignUser.assignedDatasets &&
                    assignUser.assignedDatasets.length > 0) ||
                    (assignUser as any).assigned_datasets) && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-800">
                          Assign Specific Data
                        </h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Dataset
                          </label>
                          <select
                            value={assignForm.selectedDataset}
                            onChange={(e) =>
                              setAssignForm({
                                ...assignForm,
                                selectedDataset: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                          >
                            <option value="">Choose a dataset...</option>
                            {(
                              assignUser.assignedDatasets ||
                              (assignUser as any).assigned_datasets ||
                              []
                            ).map((datasetId: string) => {
                              const dataset = AVAILABLE_DATASETS.find(
                                (d) => d.id === datasetId
                              );
                              return (
                                <option key={datasetId} value={datasetId}>
                                  {dataset?.name || datasetId}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {assignForm.selectedDataset && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Filter Criteria
                            </label>
                            <p className="text-sm text-gray-600 mb-3">
                              Select columns and values to filter the dataset data
                            </p>
                            <div className="space-y-3">
                              {assignForm.filterCriteria.map((filter, index) => (
                                <div
                                  key={index}
                                  className="flex gap-2 items-center"
                                >
                                  <select
                                    value={filter.field}
                                    onChange={(e) => {
                                      const newCriteria = [
                                        ...assignForm.filterCriteria,
                                      ];
                                      newCriteria[index].field = e.target.value;
                                      setAssignForm({
                                        ...assignForm,
                                        filterCriteria: newCriteria,
                                      });
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                  >
                                    <option value="">Select column...</option>
                                    {DATASET_COLUMNS[
                                      assignForm.selectedDataset as keyof typeof DATASET_COLUMNS
                                    ]?.map((column) => (
                                      <option key={column} value={column}>
                                        {column}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="text-gray-600">=</span>
                                  <input
                                    type="text"
                                    value={filter.value}
                                    onChange={(e) => {
                                      const newCriteria = [
                                        ...assignForm.filterCriteria,
                                      ];
                                      newCriteria[index].value = e.target.value;
                                      setAssignForm({
                                        ...assignForm,
                                        filterCriteria: newCriteria,
                                      });
                                    }}
                                    placeholder="Enter value"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                  />
                                  <button
                                    onClick={() => {
                                      const newCriteria =
                                        assignForm.filterCriteria.filter(
                                          (_, i) => i !== index
                                        );
                                      setAssignForm({
                                        ...assignForm,
                                        filterCriteria: newCriteria,
                                      });
                                    }}
                                    className="px-2 py-2 text-red-600 hover:bg-red-50 rounded"
                                    title="Remove filter"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() =>
                                  setAssignForm({
                                    ...assignForm,
                                    filterCriteria: [
                                      ...assignForm.filterCriteria,
                                      { field: "", value: "" },
                                    ],
                                  })
                                }
                                className="text-blue-700 hover:text-blue-900 text-sm flex items-center gap-1"
                              >
                                <span className="text-lg">+</span> Add Filter
                              </button>
                            </div>
                          </div>
                        )}

                        {assignForm.selectedDataset && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="font-medium text-blue-900 mb-2">
                              Assignment Summary
                            </h5>
                            <div className="text-sm text-blue-800 space-y-1">
                              <p>
                                <strong>Dataset:</strong>{" "}
                                {
                                  AVAILABLE_DATASETS.find(
                                    (d) => d.id === assignForm.selectedDataset
                                  )?.name
                                }
                              </p>
                              {assignForm.filterCriteria.length > 0 && (
                                <div>
                                  <p>
                                    <strong>Filters:</strong>{" "}
                                    {assignForm.filterCriteria.length} criteria
                                  </p>
                                  <div className="mt-1 space-y-1">
                                    {assignForm.filterCriteria.map(
                                      (filter, index) => (
                                        <p
                                          key={index}
                                          className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800"
                                        >
                                          {filter.field} = "{filter.value}"
                                        </p>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-800"
                  >
                    Close
                  </button>
                  {((assignUser.assignedDatasets &&
                    assignUser.assignedDatasets.length > 0) ||
                    (assignUser as any).assigned_datasets) && (
                      <button
                        onClick={async () => {
                          try {
                            const assignmentData = {
                              datasetId: assignForm.selectedDataset,
                              filterCriteria: assignForm.filterCriteria,
                              assignedAt: new Date().toISOString(),
                            };

                            await UpdateTboUsers(Number(assignUser.id), {
                              dataAssignment: assignmentData,
                            });

                            setMessage("Data assignment saved successfully!");
                            await fetchUsers();
                            setShowAssignModal(false);
                          } catch (error) {
                            setMessage("Failed to save data assignment");
                          }
                        }}
                        disabled={!assignForm.selectedDataset}
                        className={`px-4 py-2 rounded text-white ${assignForm.selectedDataset
                          ? "bg-blue-700 hover:bg-blue-800"
                          : "bg-gray-400 cursor-not-allowed"
                          }`}
                      >
                        Assign Data
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}

          {showHierarchicalAssignModal && hierarchicalAssignUser && (
            <div className="fixed inset-0 z-[100]">
              <HierarchicalDataAssignmentModal
                selectedUser={hierarchicalAssignUser}
                onClose={() => {
                  setShowHierarchicalAssignModal(false);
                  setIsBulkAssignmentMode(false);
                }}
                onSave={async (assignmentData) => {
                  try {
                    setIsModalSaving(true);
                    setModalSaveMessage(
                      "Saving hierarchical data assignment..."
                    );

                    if (isBulkAssignmentMode) {
                      const selectedUsers = bulkAssignUsers.filter((user) =>
                        selectedBulkUsers.has(user.id)
                      );

                      setMessage(
                        `Bulk assignment saved for ${selectedUsers.length} users!`
                      );
                      await fetchUsers();
                      setIsBulkAssignmentMode(false);
                      setModalSaveMessage(
                        `✅ Bulk assignment saved for ${selectedUsers.length} users!`
                      );
                    } else {
                      await fetchUsers();

                      await new Promise((resolve) => setTimeout(resolve, 500));

                      try {
                        const assignmentsRes =
                          await apiClient.getUserAssignments(
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
                            updatedUser.userAssignments = assignmentsRes.data;
                            updatedUser.hierarchicalDataAssignment =
                              assignmentsRes.data;
                          } else {
                            updatedUser.userAssignments = {};
                            updatedUser.hierarchicalDataAssignment = {};
                          }

                          setHierarchicalAssignUser(updatedUser);
                        }
                      } catch (error) {
                        console.error(
                          `Error fetching assignments for user ${hierarchicalAssignUser.id}:`,
                          error
                        );
                      }

                      setMessage(
                        "Hierarchical data assignment saved successfully!"
                      );
                      setModalSaveMessage(
                        "✅ Hierarchical data assignment saved successfully!"
                      );
                    }

                    setTimeout(() => {
                      setModalSaveMessage("");
                    }, 3000);
                  } catch (error) {
                    console.error(
                      "Error refreshing data after assignment save:",
                      error
                    );
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

          {showParentManagementModal && parentManagementUser && (
            <ParentManagementModal
              selectedUser={parentManagementUser}
              onClose={() => {
                setShowParentManagementModal(false);
                setParentManagementUser(null);
              }}
              onSave={async () => {
                await fetchUsers();
                setMessage("Parent assignment updated successfully!");
              }}
              hasPermission={hasPermission}
            />
          )}

          {showBulkAssignModal && (
            <div
              className="fixed inset-0 z-[100]"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowBulkAssignModal(false);
                }
              }}
            >
              <div
                className="fixed inset-0 bg-black/70 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div
                  className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <Users className="w-6 h-6 text-blue-600" />
                      Bulk Data Assignment •{" "}
                      {
                        USER_ROLES.find((r) => r.value === bulkAssignRole)
                          ?.label
                      }{" "}
                      Role
                    </h3>
                    <button
                      onClick={() => setShowBulkAssignModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-800 mb-4">
                        Select Users ({selectedBulkUsers.size} of{" "}
                        {bulkAssignUsers.length} selected)
                      </h4>

                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={() => {
                            if (
                              selectedBulkUsers.size === bulkAssignUsers.length
                            ) {
                              setSelectedBulkUsers(new Set());
                            } else {
                              setSelectedBulkUsers(
                                new Set(bulkAssignUsers.map((user) => user.id))
                              );
                            }
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          {selectedBulkUsers.size === bulkAssignUsers.length
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {bulkAssignUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center space-x-3 p-2 border border-gray-200 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBulkUsers.has(user.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedBulkUsers);
                                if (e.target.checked) {
                                  newSelected.add(user.id);
                                } else {
                                  newSelected.delete(user.id);
                                }
                                setSelectedBulkUsers(newSelected);
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-600">
                                {user.email}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {user.hierarchicalDataAssignment
                                ? "Has Assignment"
                                : "No Assignment"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-800 mb-4">
                        Data Assignment
                      </h4>
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                          Click the button below to set up data assignment for
                          selected users
                        </p>
                        <button
                          onClick={async () => {
                            if (bulkAssignUsers.length > 0) {
                              try {
                                const assignmentsResponse =
                                  await apiClient.getUserAssignments(
                                    bulkAssignUsers[0].id
                                  );
                                if (
                                  assignmentsResponse &&
                                  assignmentsResponse.success
                                ) {
                                  setHierarchicalAssignUser({
                                    ...bulkAssignUsers[0],
                                    userAssignments: assignmentsResponse.data,
                                  });
                                } else {
                                  setHierarchicalAssignUser(bulkAssignUsers[0]);
                                }
                              } catch (error) {
                                console.error(
                                  "Error fetching user assignments:",
                                  error
                                );
                                setHierarchicalAssignUser(bulkAssignUsers[0]);
                              }
                              setIsBulkAssignmentMode(true);
                              setShowHierarchicalAssignModal(true);
                              setShowBulkAssignModal(false);
                            }
                          }}
                          className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
                        >
                          Configure Data Assignment
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 space-x-3">
                    <button
                      onClick={() => setShowBulkAssignModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showCreateTeamModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  {editingTeam ? "Edit Team" : "Create New Team"}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={teamForm.name}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                      placeholder="Enter team name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={teamForm.description}
                      onChange={(e) =>
                        setTeamForm({
                          ...teamForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                      rows={3}
                      placeholder="Enter team description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={teamForm.team_code}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, team_code: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800"
                      placeholder="e.g., SALES001"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateTeamModal(false);
                      setEditingTeam(null);
                      setTeamForm({ name: "", description: "", team_code: "" });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingTeam ? handleUpdateTeam : handleCreateTeam}
                    disabled={loading || !teamForm.name.trim()}
                    className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                  >
                    {loading
                      ? editingTeam
                        ? "Updating..."
                        : "Creating..."
                      : editingTeam
                        ? "Update Team"
                        : "Create Team"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showTeamHierarchyModal && teamHierarchyData && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Team Hierarchy: {teamHierarchyData.team?.name}
                  </h2>
                  <button
                    onClick={() => setShowTeamHierarchyModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {loadingHierarchy ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading hierarchy...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <Building2 className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {teamHierarchyData.team?.name}
                          </h3>
                          {teamHierarchyData.team?.description && (
                            <p className="text-sm text-gray-600">
                              {teamHierarchyData.team?.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-600">
                              👥{" "}
                              <strong>
                                {teamHierarchyData.team?.user_count || 0}
                              </strong>{" "}
                              users
                            </span>
                            {teamHierarchyData.team?.child_team_count > 0 && (
                              <span className="text-gray-600">
                                📁{" "}
                                <strong>
                                  {teamHierarchyData.team?.child_team_count}
                                </strong>{" "}
                                child teams
                              </span>
                            )}
                            {teamHierarchyData.team?.team_code && (
                              <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                                {teamHierarchyData.team.team_code}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {(teamHierarchyData.user_hierarchy &&
                      teamHierarchyData.user_hierarchy.length > 0) ||
                      (teamHierarchyData.flat_users &&
                        teamHierarchyData.flat_users.length > 0) ? (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          User Hierarchy (
                          {teamHierarchyData.team?.user_count || 0} users)
                        </h3>
                        {teamHierarchyData.user_hierarchy &&
                          teamHierarchyData.user_hierarchy.length > 0 ? (
                          <div className="space-y-3">
                            {teamHierarchyData.user_hierarchy.map(
                              (rootUser: any) => (
                                <div
                                  key={rootUser.id}
                                  className="border border-gray-200 rounded-lg p-4 bg-white"
                                >
                                  {renderUserTree(rootUser, 0)}
                                </div>
                              )
                            )}
                          </div>
                        ) : teamHierarchyData.flat_users &&
                          teamHierarchyData.flat_users.length > 0 ? (
                          <div className="space-y-3">
                            {teamHierarchyData.flat_users.map((user: any) => (
                              <div
                                key={user.id}
                                className="border border-gray-200 rounded-lg p-4 bg-white"
                              >
                                {renderUserTree(user, 0)}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No users in this team yet</p>
                      </div>
                    )}

                    {teamHierarchyData.child_teams &&
                      teamHierarchyData.child_teams.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Child Teams ({teamHierarchyData.child_teams.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {teamHierarchyData.child_teams.map(
                              (childTeam: any) => (
                                <div
                                  key={childTeam.id}
                                  className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                                >
                                  <div className="font-medium text-gray-800">
                                    {childTeam.name}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    👥 {childTeam.user_count || 0} users
                                  </div>
                                  {childTeam.team_code && (
                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded mt-1 inline-block text-gray-800">
                                      {childTeam.team_code}
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}