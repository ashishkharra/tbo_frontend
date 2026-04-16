"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Home,
  Settings,
  ChevronDown,
  Check,
  X,
  Shield,
  Database,
  RotateCcw,
  Save,
  UserPlus,
  Search,
  Users,
  Phone,
  Loader2,
  Copy,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import {
  ApplyAccessCodesToUser,
  ApplyModuleCodeToUser,
  ApplyPermissionCodeToUser,
  getPermissionModulesApi,
  getTableColumns,
  getTboUsers,
  getUserPermissions,
  UserPermissionsAssign,
  GetDataAssignmentOptions,
  SaveUserAssignments,
  GetUserAssignments,
  getUsersRolesApi,
  addParentChildApi,
} from "@/apis/api";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";


// ---------- Types ----------
interface ModuleAction {
  id: number;
  name: string;
  code: string;
  sort_order: number;
}

interface PermissionNode {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  level_no: number;
  sort_order: number;
  icon: string | null;
  route_path: string | null;
  is_menu_visible?: boolean;
  actions: ModuleAction[];
  children: PermissionNode[];
}

interface ApiAction {
  id: number;
  name: string;
  code: string;
  sort_order: number;
}

interface UIModuleNode {
  id: string;
  rawId: number;
  title: string;
  code: string;
  icon?: string;
  level_no: number;
  actions: ApiAction[];
  children: UIModuleNode[];
}

type MultiSelectValue = string[];

interface DataAssignFormData {
  dbSelect: string;
  wiseType: string;
  dataid: MultiSelectValue;
  block: MultiSelectValue;
  gp: MultiSelectValue;
  gram: MultiSelectValue;
  ac: MultiSelectValue;
  bhag: MultiSelectValue;
  section: MultiSelectValue;
  mandal: MultiSelectValue;
  kendra: MultiSelectValue;
  ageFrom: string;
  ageTo: string;
  cast: MultiSelectValue;
  check1: boolean;
  check2: boolean;
}

interface AssignmentItem {
  id: number;
  dbSelect: string;
  wiseType: string;
  dataid: MultiSelectValue;
  block: MultiSelectValue;
  gp: MultiSelectValue;
  gram: MultiSelectValue;
  ac: MultiSelectValue;
  bhag: MultiSelectValue;
  section: MultiSelectValue;
  mandal: MultiSelectValue;
  kendra: MultiSelectValue;
  ageFrom: string;
  ageTo: string;
  cast: MultiSelectValue;
  check1: boolean;
  check2: boolean;
  selectedColumnDB: string;
  columnPermissions: Record<
    string,
    { view: boolean; mask: boolean; edit: boolean; copy: boolean }
  >;
  // display labels (comma separated if multiple)
  dataidLabel: string;
  blockLabel: string;
  gpLabel: string;
  gramLabel: string;
  acLabel: string;
  bhagLabel: string;
  sectionLabel: string;
  mandalLabel: string;
  kendraLabel: string;
  castLabel: string;
  // name fields from backend
  data_id_name_hi: string;
  data_id_label: string;
  ac_names: string | null;
  block_names: string | null;
  gp_ward_names: string | null;
  village_names: string | null;
  mandal_names: string | null;
  kendra_names: string | null;
  bhag_names: string | null;
  section_names: string | null;
}


const UserDropdown = ({
  allUsers,
  optionUsers,
  userId,
  onUserChange,
}: {
  allUsers: any[];
  optionUsers?: any[];
  userId: number | string | null;
  onUserChange: (userId: string) => void;
}) => {
  const usersForOptions =
    Array.isArray(optionUsers) && optionUsers.length ? optionUsers : allUsers;

  const selectedUser = usersForOptions.find(
    (u: any) => String(u.id) === String(userId)
  );

  const optionMap = new Map<string, any>();

  if (selectedUser?.id !== undefined && selectedUser?.id !== null) {
    optionMap.set(String(selectedUser.id), selectedUser);
  }

  usersForOptions.forEach((u: any) => {
    if (u?.id !== undefined && u?.id !== null) {
      optionMap.set(String(u.id), u);
    }
  });

  const finalOptions = Array.from(optionMap.values());

  const options: FilterOption[] = [
    {
      value: "",
      label: "All Users",
      searchText: "all users",
    },
    ...finalOptions.map((user: any) => {
      const username = capitalizeFirst(String(user?.username || "").trim());
      const mobile = String(user?.mobile_no || "").trim();
      const id = String(user?.id || "").trim();

      return {
        value: id,
        label: mobile ? `${username} - ${mobile}` : username || id,
        searchText: `${username} ${mobile} ${id}`.trim(),
      };
    }),
  ];

  return (
    <SearchableFilterSelect
      value={String(userId || "")}
      onChange={onUserChange}
      options={options}
      placeholder="All Users"
      className="min-w-[220px]"
    />
  );
};

const SearchableFilterSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const lower = searchTerm.toLowerCase().trim();
    if (!lower) return options;

    return options.filter((option) =>
      `${option.label} ${option.searchText || ""}`.toLowerCase().includes(lower)
    );
  }, [options, searchTerm]);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        className="min-w-[180px] px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-700 outline-none flex items-center justify-between gap-2"
      >
        <span className="truncate text-left">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 top-full z-[1000] mt-1 w-full min-w-[240px] rounded border border-gray-300 bg-white shadow-lg">
          <div className="border-b border-gray-200 p-2">
            <div className="relative">
              <Search className="absolute text-black left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username or number"
                className="w-full rounded border text-black border-gray-300 py-1.5 pl-8 pr-2 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                  className={`block w-full px-3 py-2 text-left text-xs text-black hover:bg-gray-100 ${option.value === value ? "bg-gray-100 font-semibold" : ""
                    }`}
                  title={option.label}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500">
                No matching option
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- MultiSelect Component ----------
const MultiSelect = ({
  label,
  options,
  selected,
  onChange,
  idKey,
  nameKey,
  loading,
  disabled,
  placeholder,
  showAllOption,
}: {
  label: string;
  options: any[];
  selected: string[];
  onChange: (value: string) => void;
  idKey: string;
  nameKey: string | ((item: any) => string);
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showAllOption?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayName = (item: any): string => {
    if (typeof nameKey === "function") return nameKey(item);
    return item[nameKey] || "";
  };

  const selectedLabels = selected
    .map((value) => {
      const option = options.find((opt) => String(opt[idKey]) === value);
      return option ? getDisplayName(option) : value;
    })
    .filter(Boolean);

  const selectedDisplayText =
    selected.length === 0
      ? placeholder || `Select ${label}`
      : `${selectedLabels.slice(0, 2).join(", ")}${selectedLabels.length > 2 ? ` +${selectedLabels.length - 2} more` : ""}`;

  return (
    <div className="space-y-0.5" ref={ref}>
      <label className="text-[8px] font-bold text-gray-700 uppercase tracking-wider">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          className={`flex h-6 w-full items-center justify-between rounded border bg-white px-2 py-1 text-[10px] font-medium text-left outline-none transition-all focus:ring-2 focus:ring-blue-500/20 ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "hover:border-gray-300"
            }`}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
        >
          <span className="truncate">{selectedDisplayText}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && !disabled && (
          <div className="absolute z-[1000] fixed mt-1 w-80 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-2 text-center text-gray-500 text-xs">Loading...</div>
            ) : options.length === 0 ? (
              <div className="p-2 text-center text-gray-500 text-xs">No options</div>
            ) : (
              <>
                {showAllOption && (
                  <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-200">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selected.length === options.length && options.length > 0}
                      onChange={() => {
                        if (selected.length === options.length) {
                          // Deselect all
                          options.forEach((opt) => {
                            const value = String(opt[idKey]);
                            if (selected.includes(value)) onChange(value);
                          });
                        } else {
                          // Select all
                          options.forEach((opt) => {
                            const value = String(opt[idKey]);
                            if (!selected.includes(value)) onChange(value);
                          });
                        }
                      }}
                    />
                    <span className="text-xs font-bold text-gray-700">All</span>
                  </label>
                )}
                {options.map((opt) => {
                  const value = String(opt[idKey]);
                  const checked = selected.includes(value);
                  return (
                    <label
                      key={value}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={checked}
                        onChange={() => onChange(value)}
                      />
                      <span className="text-xs font-medium text-gray-700">
                        {getDisplayName(opt)} - {value}
                      </span>
                    </label>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Helper Functions ----------
const getIconForModule = (iconName: string | null, moduleName: string): string => {
  const iconMap: Record<string, string> = {
    dataset: "📋",
    mobile_settings: "⚙️",
    users: "👥",
    callers: "📞",
    data_entry: "📝",
    settings: "⚙️",
    volunteers: "🤝",
    analysis: "📈",
    map: "🗺️",
    leader: "👑",
  };
  if (iconName && iconMap[iconName]) return iconMap[iconName];
  if (moduleName.includes("DATA SET")) return "📋";
  if (moduleName.includes("MOBILE")) return "⚙️";
  if (moduleName.includes("TBO")) return "👥";
  if (moduleName.includes("CALLER")) return "📞";
  if (moduleName.includes("DATA ENTRY")) return "📝";
  if (moduleName.includes("MASTER")) return "⚙️";
  if (moduleName.includes("VOLUNTEER")) return "🤝";
  if (moduleName.includes("RESULT")) return "📈";
  if (moduleName.includes("MAP")) return "🗺️";
  if (moduleName.includes("LEADER")) return "👑";
  return "📁";
};

const formatRoleLabel = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

type FilterOption = {
  value: string;
  label: string;
  searchText?: string;
};

const capitalizeFirst = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const normalizeStatusValue = (value: any) =>
  String(value ?? "").trim().toLowerCase();

const getUserParentIds = (user: any): string[] => {
  if (Array.isArray(user?.parents)) {
    return user.parents
      .map((parent: any) => String(parent?.id ?? parent?.parent_id ?? "").trim())
      .filter(Boolean);
  }

  const directParentId = user?.parent_id ?? user?.p_id;
  if (directParentId !== undefined && directParentId !== null) {
    const normalizedParentId = String(directParentId).trim();
    if (normalizedParentId) {
      return [normalizedParentId];
    }
  }

  return [];
};

const getParentDisplayName = (user: any) =>
  String(
    user?.name ||
    user?.username ||
    user?.parent_name ||
    user?.label ||
    user?.mobile_no ||
    user?.id ||
    ""
  ).trim();

const capitalizeFirstLetter = (str: any) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------- Main Component ----------
const TBOUsersSetting = () => {
  const params = useParams();
  const userId: any = params?.id ? Number(params.id) : null;
  const { user } = useAuthContext()

  const [activeTab, setActiveTab] = useState("module_permissions");

  const router = useRouter();
  const handleUserChange = (
    valueOrEvent: React.ChangeEvent<HTMLSelectElement> | string
  ) => {
    const newUserId =
      typeof valueOrEvent === "string"
        ? valueOrEvent
        : valueOrEvent.target.value;

    if (!newUserId) return;

    router.push(`/tbo-users/setting/${newUserId}`);
  };

  // Module & permissions state
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [assignedModules, setAssignedModules] = useState<string[]>([]);
  const [modules, setModules] = useState<UIModuleNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionsState, setPermissionsState] = useState<Record<string, string[]>>({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [moduleCodeMap, setModuleCodeMap] = useState<Record<number, string>>({});
  const [rawPermissions, setRawPermissions] = useState<any[] | null>(null);

  const [userModulesCode, setUserModulesCode] = useState<any>(null);
  const [permissionsLoadedFromAssignments, setPermissionsLoadedFromAssignments] = useState(false);

  // Data Assign & Column Permission state
  const [isAddingData, setIsAddingData] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [selectedColumnDB, setSelectedColumnDB] = useState("");
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [columnPermissions, setColumnPermissions] = useState<
    Record<string, { view: boolean; mask: boolean; edit: boolean; copy: boolean }>
  >({});

  const selectedAssignment =
    assignments.find((item) => item.id === selectedAssignmentId) || null;
  const editingAssignment =
    assignments.find((item) => item.id === editingAssignmentId) || null;

  const createEmptyAssignmentForm = (): DataAssignFormData => ({
    dbSelect: "",
    wiseType: "",
    dataid: [],
    block: [],
    gp: [],
    gram: [],
    ac: [],
    bhag: [],
    section: [],
    mandal: [],
    kendra: [],
    ageFrom: "",
    ageTo: "",
    cast: [],
    check1: false,
    check2: false,
  });

  const [teamRoles, setTeamRoles] = useState<any[]>([]);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [teamRole, setTeamRole] = useState("");
  const [teamUser, setTeamUser] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [teamRolesLoading, setTeamRolesLoading] = useState(false);
  const [teamUsersLoading, setTeamUsersLoading] = useState(false);

  const [formData, setFormData] = useState<DataAssignFormData>(createEmptyAssignmentForm());


  const [teamLoading, setTeamLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [moduleCode, setModuleCode] = useState("");
  const [permissionCode, setPermissionCode] = useState("");
  const [dataIdOptions, setDataIdOptions] = useState<any[]>([]);
  const [blockOptions, setBlockOptions] = useState<any[]>([]);
  const [gpOptions, setGpOptions] = useState<any[]>([]);
  const [gramOptions, setGramOptions] = useState<any[]>([]);
  const [acOptions, setAcOptions] = useState<any[]>([]);
  const [bhagOptions, setBhagOptions] = useState<any[]>([]);
  const [sectionOptions, setSectionOptions] = useState<any[]>([]);
  const [mandalOptions, setMandalOptions] = useState<any[]>([]);
  const [kendraOptions, setKendraOptions] = useState<any[]>([]);
  const [loadingDataOptions, setLoadingDataOptions] = useState(false);
  const [castOptions, setCastOptions] = useState<any[]>([]);
  const [loadingCastOptions, setLoadingCastOptions] = useState(false);
  const [masterTables, setMasterTables] = useState<{ table_name: string; label?: string }[]>([]);
  const [copiedField, setCopiedField] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserFilter, setSelectedUserFilter] = useState("");
  const [selectedParentFilter, setSelectedParentFilter] = useState("all");

  const [copiedCodeMeta, setCopiedCodeMeta] = useState<null | {
    type: "module" | "permission";
    code: string;
    sourceUserId: number | string;
    sourceUsername: string;
    copiedAt: string;
  }>(null);

  const resetAssignmentEditor = () => {
    setIsAddingData(false);
    setEditingAssignmentId(null);
    setFormData(createEmptyAssignmentForm());
  };

  const handleCopy = async (value: string, field: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      const type = field === "module" ? "module" : "permission";

      const sourceUser = allUsers.find((u: any) => u.id === userId);

      const username = sourceUser?.username || `User ${userId}`;

      saveCopiedCodeMeta({
        type,
        code: value,
        sourceUserId: userId,
        sourceUsername: username,
      });

      setCopiedCodeMeta({
        type,
        code: value,
        sourceUserId: userId,
        sourceUsername: username,
        copiedAt: new Date().toISOString(),
      });

      setCopiedField(field);

      setTimeout(() => setCopiedField(""), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const mockColumns = [
    "Voter ID", "Name", "Age", "Gender", "Relation Name",
    "House No", "Section Name", "Assembly Name", "District",
    "Parliament", "Cast", "Profession",
  ];

  const COPY_META_KEY = "tbo_copied_code_meta";

  const saveCopiedCodeMeta = (payload: {
    type: "module" | "permission";
    code: string;
    sourceUserId: number | string;
    sourceUsername: string;
  }) => {
    try {
      localStorage.setItem(
        COPY_META_KEY,
        JSON.stringify({
          ...payload,
          copiedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Failed to save copied code meta:", error);
    }
  };

  const getCopiedCodeMeta = () => {
    try {
      const raw = localStorage.getItem(COPY_META_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Failed to read copied code meta:", error);
      return null;
    }
  };

  const clearCopiedCodeMeta = () => {
    try {
      localStorage.removeItem(COPY_META_KEY);
    } catch (error) {
      console.error("Failed to clear copied code meta:", error);
    }
  };

  useEffect(() => {
    const meta = getCopiedCodeMeta();
    if (meta) {
      setCopiedCodeMeta(meta);
    }
  }, []);

  const TABLE_NAME_ALIAS: Record<string, string> = {
    cast_id_master: "eroll_castmaster",
    other_master: "eroll_dropdown",
    yojna_master: "eroll_yojna_master",
    booth_mapping: "eroll_mapping",
  };

  const normalizeTableName = (tableName: string) => TABLE_NAME_ALIAS[tableName] || tableName;

  const MODULE_TABLE_MAPPING: Record<string, string> = {
    "VOTER LIST": "eroll_db",
    "DATA ID MASTER": "dataid_importmaster",
    "CAST ID MASTER": "eroll_castmaster",
    "OTHER MASTER": "eroll_dropdown",
    "YOJNA MASTER": "eroll_yojna_master",
    "BOOTH MAPPING": "eroll_mapping",
    "DATA SET": "db_table"
  };

  const filteredUsers = allUsers.filter((user) => {
    if (selectedRole) {
      const matchedRole = roles.find(
        (r: any) =>
          String(r.id) === String(user?.role_id) ||
          String(r.id) === String(user?.role) ||
          String(r.name).toLowerCase() === String(user?.role || "").toLowerCase() ||
          String(r.code).toLowerCase() === String(user?.role || "").toLowerCase()
      );

      const userRoleId = matchedRole?.id ?? user?.role_id ?? user?.role;

      if (String(userRoleId) !== String(selectedRole)) {
        return false;
      }
    }

    if (selectedUserFilter && selectedUserFilter !== "all") {
      const normalizedStatus = normalizeStatusValue(user?.status ?? user?.is_active);
      const isActive = ["active", "1", "true"].includes(normalizedStatus);
      const isInactive = ["inactive", "0", "false"].includes(normalizedStatus);

      if (selectedUserFilter === "active" && !isActive) return false;
      if (selectedUserFilter === "inactive" && !isInactive) return false;
    }

    if (selectedParentFilter !== "all") {
      const parentIds = getUserParentIds(user);
      if (!parentIds.includes(String(selectedParentFilter))) {
        return false;
      }
    }

    return true;
  });

  const availableRoles = useMemo(() => {
    if (roles.length > 0) {
      return roles.map((role: any) => ({
        id: String(role.id),
        name: String(role.name || role.label || role.code || role.id),
      }));
    }

    const roleMap = new Map<string, { id: string; name: string }>();
    allUsers.forEach((user: any) => {
      const roleValue = String(user?.role_id ?? user?.role ?? "").trim();
      if (!roleValue || roleMap.has(roleValue)) return;

      roleMap.set(roleValue, {
        id: roleValue,
        name: formatRoleLabel(String(user?.role ?? roleValue)),
      });
    });

    return Array.from(roleMap.values());
  }, [roles, allUsers]);

  const parentOptions = useMemo<FilterOption[]>(() => {
    const parentMap = new Map<string, { label: string; mobile: string; role: string }>();

    allUsers.forEach((user: any) => {
      const roleValue = String(user?.role || "").toLowerCase();
      if (!["leader", "coordinator"].includes(roleValue)) return;

      const id = String(user?.id ?? "").trim();
      const label = capitalizeFirst(getParentDisplayName(user));
      const mobile = String(user?.mobile_no || "").trim();

      if (id && label && !parentMap.has(id)) {
        parentMap.set(id, {
          label,
          mobile,
          role: roleValue,
        });
      }
    });

    return [
      {
        value: "all",
        label: "All Parents",
        searchText: "all parents",
      },
      ...Array.from(parentMap.entries())
        .sort((a, b) => a[1].label.localeCompare(b[1].label))
        .map(([id, meta]) => ({
          value: id,
          label: meta.mobile ? `${meta.label} - ${meta.mobile}` : meta.label,
          searchText: `${meta.label} ${meta.mobile} ${id} ${meta.role}`.trim(),
        })),
    ];
  }, [allUsers]);

  useEffect(() => {
    setMasterTables([
      { table_name: "eroll_db", label: "Voter List" },
      { table_name: "dataid_importmaster", label: "Data ID Master" },
      { table_name: "eroll_castmaster", label: "Cast ID Master" },
      { table_name: "eroll_dropdown", label: "Other Master" },
      { table_name: "eroll_yojna_master", label: "Yojna Master" },
      { table_name: "eroll_mapping", label: "Booth Mapping" },
      { table_name: "db_table", label: "DATA SET" }
    ]);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchTopBarOptions = async () => {
      try {
        const res = await getTboUsers({ page: 1, limit: 1000 });
        const usersData = Array.isArray(res?.data) ? res.data : [];

        if (usersData.length === 0) return;

        setAllUsers(usersData);

        const currentUser = usersData.find(
          (user: any) => String(user?.id) === String(userId)
        );

        if (!selectedRole && currentUser) {
          const nextRole = String(currentUser?.role_id ?? currentUser?.role ?? "").trim();
          if (nextRole) {
            setSelectedRole(nextRole);
          }
        }

        if (!selectedUserFilter && currentUser) {
          const normalizedStatus = normalizeStatusValue(
            currentUser?.status ?? currentUser?.is_active
          );
          if (["active", "1", "true"].includes(normalizedStatus)) {
            setSelectedUserFilter("active");
          } else if (["inactive", "0", "false"].includes(normalizedStatus)) {
            setSelectedUserFilter("inactive");
          }
        }
      } catch (error) {
        console.error("Error fetching top bar options:", error);
      }
    };

    fetchTopBarOptions();
  }, [userId, selectedRole, selectedUserFilter]);

  const getSelectedDataIds = (dataid: MultiSelectValue) => {
    if (!Array.isArray(dataid)) return [];
    return dataid
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v));
  };

  // ---------- Data Fetching Hooks ----------
  useEffect(() => {
    const fetchDataIds = async () => {
      if (activeTab !== "data_assign" || !formData.dbSelect || !formData.wiseType) {
        setDataIdOptions([]);
        setBlockOptions([]);
        setGpOptions([]);
        setGramOptions([]);
        setAcOptions([]);
        setBhagOptions([]);
        setSectionOptions([]);
        setMandalOptions([]);
        setKendraOptions([]);
        return;
      }

      try {
        setLoadingDataOptions(true);
        const selectedDataIds = getSelectedDataIds(formData.dataid);

        console.log('[fetchBlocks] selectedDataIds =>', selectedDataIds);

        const response = await GetDataAssignmentOptions({
          table: formData.dbSelect,
          wise_type: formData.wiseType,
          data_id: selectedDataIds.length ? selectedDataIds.join(",") : undefined,
        });
        if (response?.success && response?.data) {
          setDataIdOptions(response.data.data_ids || []);
        } else {
          setDataIdOptions([]);
        }
        setBlockOptions([]);
        setGpOptions([]);
        setGramOptions([]);
        setAcOptions([]);
        setBhagOptions([]);
        setSectionOptions([]);
        setMandalOptions([]);
        setKendraOptions([]);
      } catch (error) {
        console.error("Error fetching data ids:", error);
        setDataIdOptions([]);
      } finally {
        setLoadingDataOptions(false);
      }
    };
    fetchDataIds();
  }, [activeTab, formData.dbSelect, formData.wiseType]);

  useEffect(() => {
    const fetchBlocks = async () => {
      if (
        activeTab !== "data_assign" ||
        !formData.dbSelect ||
        !formData.wiseType ||
        !formData.dataid
      ) {
        setBlockOptions([]);
        return;
      }
      if (!["block", "gp_ward", "gram"].includes(formData.wiseType)) {
        setBlockOptions([]);
        return;
      }
      try {
        setLoadingDataOptions(true);
        const response = await GetDataAssignmentOptions({
          table: formData.dbSelect,
          wise_type: formData.wiseType,
          data_id: formData.dataid.length ? formData.dataid.join(",") : undefined,
        });
        if (response?.success && response?.data) {
          setBlockOptions(response.data.options || []);
        } else {
          setBlockOptions([]);
        }
        setGpOptions([]);
        setGramOptions([]);
      } catch (error) {
        console.error("Error fetching blocks:", error);
        setBlockOptions([]);
      } finally {
        setLoadingDataOptions(false);
      }
    };
    fetchBlocks();
  }, [activeTab, formData.dbSelect, formData.wiseType, formData.dataid]);

  useEffect(() => {
    const fetchGps = async () => {
      if (
        activeTab !== "data_assign" ||
        !formData.dbSelect ||
        !formData.wiseType ||
        !formData.dataid ||
        formData.block.length !== 1
      ) {
        setGpOptions([]);
        return;
      }
      if (!["gp_ward", "gram"].includes(formData.wiseType)) {
        setGpOptions([]);
        return;
      }
      try {
        setLoadingDataOptions(true);
        const response = await GetDataAssignmentOptions({
          table: formData.dbSelect,
          wise_type: formData.wiseType,
          data_id: formData.dataid.length ? formData.dataid.join(",") : undefined,
          block_id: formData.block[0],
        });
        if (response?.success && response?.data) {
          setGpOptions(response.data.options || []);
        } else {
          setGpOptions([]);
        }
        setGramOptions([]);
      } catch (error) {
        console.error("Error fetching gp wards:", error);
        setGpOptions([]);
      } finally {
        setLoadingDataOptions(false);
      }
    };
    fetchGps();
  }, [activeTab, formData.dbSelect, formData.wiseType, formData.dataid, formData.block]);

  useEffect(() => {
    const fetchGrams = async () => {
      if (
        activeTab !== "data_assign" ||
        formData.wiseType !== "gram" ||
        !formData.dbSelect ||
        !formData.dataid ||
        formData.block.length !== 1 ||
        formData.gp.length !== 1
      ) {
        setGramOptions([]);
        return;
      }
      try {
        setLoadingDataOptions(true);
        const selectedDataIds = getSelectedDataIds(formData.dataid);

        const response = await GetDataAssignmentOptions({
          table: formData.dbSelect,
          wise_type: formData.wiseType,
          data_id: selectedDataIds.length ? selectedDataIds.join(",") : undefined,
          block_id: formData.block[0],
          gp_ward_id: formData.gp[0],
        });
        if (response?.success && response?.data) {
          setGramOptions(response.data.options || []);
        } else {
          setGramOptions([]);
        }
      } catch (error) {
        console.error("Error fetching grams:", error);
        setGramOptions([]);
      } finally {
        setLoadingDataOptions(false);
      }
    };
    fetchGrams();
  }, [activeTab, formData.dbSelect, formData.wiseType, formData.dataid, formData.block, formData.gp]);

  useEffect(() => {
    const fetchAcs = async () => {
      if (
        activeTab !== "data_assign" ||
        !formData.dbSelect ||
        !formData.wiseType ||
        !formData.dataid
      ) {
        setAcOptions([]);
        return;
      }

      if (!["bhag", "section", "mandal", "kendra"].includes(formData.wiseType)) {
        setAcOptions([]);
        return;
      }

      try {
        setLoadingDataOptions(true);
        const selectedDataIds = getSelectedDataIds(formData.dataid);

        const response = await GetDataAssignmentOptions({
          table: formData.dbSelect,
          wise_type: "ac",
          data_id: selectedDataIds.length ? selectedDataIds.join(",") : undefined,
        });

        if (response?.success && response?.data) {
          setAcOptions(response.data.options || []);
        } else {
          setAcOptions([]);
        }

        if (!["bhag", "section"].includes(formData.wiseType)) {
          setBhagOptions([]);
          setSectionOptions([]);
        }

        if (!["mandal", "kendra"].includes(formData.wiseType)) {
          setMandalOptions([]);
          setKendraOptions([]);
        }
      } catch (error) {
        console.error("Error fetching ACs:", error);
        setAcOptions([]);
      } finally {
        setLoadingDataOptions(false);
      }
    };

    fetchAcs();
  }, [activeTab, formData.dbSelect, formData.wiseType, formData.dataid]);

  useEffect(() => {
    const fetchBhags = async () => {
      if (
        activeTab !== "data_assign" ||
        !formData.dbSelect ||
        !formData.wiseType ||
        !formData.dataid.length
      ) {
        setBhagOptions([]);
        return;
      }

      if (!["bhag", "section"].includes(formData.wiseType)) {
        setBhagOptions([]);
        return;
      }

      try {
        setLoadingDataOptions(true);
        const selectedDataIds = getSelectedDataIds(formData.dataid);

        const response = await GetDataAssignmentOptions({
          table: formData.dbSelect,
          wise_type: formData.wiseType === "section" ? "section" : "bhag",
          data_id: selectedDataIds.length ? selectedDataIds.join(",") : undefined,
        });

        const payload =
          response?.data?.data ||
          response?.data ||
          response ||
          {};

        const bhagList = Array.isArray(payload?.options) ? payload.options : [];

        setBhagOptions(bhagList);
        setSectionOptions([]);
      } catch (error) {
        console.error("Error fetching bhags:", error);
        setBhagOptions([]);
      } finally {
        setLoadingDataOptions(false);
      }
    };

    fetchBhags();
  }, [activeTab, formData.dbSelect, formData.wiseType, formData.dataid]);

  useEffect(() => {
    const fetchSections = async () => {
      if (
        activeTab !== "data_assign" ||
        formData.wiseType !== "section" ||
        !formData.dbSelect ||
        !formData.dataid.length ||
        formData.bhag.length !== 1
      ) {
        setSectionOptions([]);
        return;
      }

      try {
        setLoadingDataOptions(true);

        const selectedDataIds = getSelectedDataIds(formData.dataid);

        const response = await GetDataAssignmentOptions({
          table: formData.dbSelect,
          wise_type: "section",
          data_id: selectedDataIds.length ? selectedDataIds.join(",") : undefined,
          bhag_no: formData.bhag[0],
        });

        const payload =
          response?.data?.data ||
          response?.data ||
          response ||
          {};

        const sectionList = Array.isArray(payload?.options) ? payload.options : [];

        setSectionOptions(sectionList);
      } catch (error) {
        console.error("Error fetching sections:", error);
        setSectionOptions([]);
      } finally {
        setLoadingDataOptions(false);
      }
    };

    fetchSections();
  }, [activeTab, formData.dbSelect, formData.wiseType, formData.dataid, formData.bhag]);

  useEffect(() => {
    const fetchMandals = async () => {
      if (
        activeTab !== "data_assign" ||
        !formData.dbSelect ||
        !formData.wiseType ||
        !formData.dataid.length
      ) {
        setMandalOptions([]);
        return;
      }
      if (!["mandal", "kendra"].includes(formData.wiseType)) {
        setMandalOptions([]);
        return;
      }
      try {
        setLoadingDataOptions(true);
        const selectedDataIds = getSelectedDataIds(formData.dataid);

        const response = await GetDataAssignmentOptions({
          table: formData.dbSelect,
          wise_type: "mandal",
          data_id: selectedDataIds.length ? selectedDataIds.join(",") : undefined,
        });
        if (response?.success && response?.data) {
          setMandalOptions(response.data.options || []);
        } else {
          setMandalOptions([]);
        }
        setKendraOptions([]);
      } catch (error) {
        console.error("Error fetching mandals:", error);
        setMandalOptions([]);
      } finally {
        setLoadingDataOptions(false);
      }
    };
    fetchMandals();
  }, [activeTab, formData.dbSelect, formData.wiseType, formData.dataid]);

  useEffect(() => {
    const fetchKendras = async () => {
      if (
        activeTab !== "data_assign" ||
        formData.wiseType !== "kendra" ||
        !formData.dbSelect ||
        !formData.dataid.length ||
        formData.mandal.length !== 1
      ) {
        setKendraOptions([]);
        return;
      }
      try {
        setLoadingDataOptions(true);
        const selectedDataIds = getSelectedDataIds(formData.dataid);

        const response = await GetDataAssignmentOptions({
          table: formData.dbSelect,
          wise_type: "kendra",
          data_id: selectedDataIds.length ? selectedDataIds.join(",") : undefined,
          mandal_id: formData.mandal[0],
        });
        if (response?.success && response?.data) {
          setKendraOptions(response.data.options || []);
        } else {
          setKendraOptions([]);
        }
      } catch (error) {
        console.error("Error fetching kendras:", error);
        setKendraOptions([]);
      } finally {
        setLoadingDataOptions(false);
      }
    };
    fetchKendras();
  }, [activeTab, formData.dbSelect, formData.wiseType, formData.dataid, formData.mandal]);

  // Fetch Cast Options from Backend
  useEffect(() => {
    const fetchCastOptions = async () => {
      if (activeTab !== "data_assign" || !formData.dbSelect || !formData.wiseType) {
        setCastOptions([]);
        return;
      }

      try {
        setLoadingCastOptions(true);

        const selectedDataIds = getSelectedDataIds(formData.dataid);

        const response = await GetDataAssignmentOptions({
          table: formData.dbSelect,
          wise_type: formData.wiseType,
          data_id: selectedDataIds.length ? selectedDataIds.join(",") : undefined,
          block_id: formData.block[0] || undefined,
          gp_ward_id: formData.gp[0] || undefined,
          ac_id: formData.ac[0] || undefined,
          bhag_no: formData.bhag[0] || undefined,
          mandal_id: formData.mandal[0] || undefined,
        });

        const payload =
          response?.data?.data ||
          response?.data ||
          response ||
          {};

        const castList = Array.isArray(payload?.cast_options) ? payload.cast_options : [];
        setCastOptions(castList);
      } catch (error) {
        console.error("Error fetching cast options:", error);
        setCastOptions([]);
      } finally {
        setLoadingCastOptions(false);
      }
    };

    fetchCastOptions();
  }, [
    activeTab,
    formData.dbSelect,
    formData.wiseType,
    formData.dataid,
    formData.block,
    formData.gp,
    formData.ac,
    formData.bhag,
    formData.mandal
  ]);

  // ---------- Fetch modules and permissions ----------
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await getPermissionModulesApi();
        if (response.success && response.data) {
          const apiTree: PermissionNode[] = response.data;
          const codeMap: Record<number, string> = {};
          const convertTree = (nodes: PermissionNode[]): UIModuleNode[] => {
            return nodes.map((node) => {
              codeMap[node.id] = node.code;
              return {
                id: `m${node.id}`,
                rawId: node.id,
                title: node.name,
                code: node.code,
                icon: node.level_no === 1 ? getIconForModule(node.icon, node.name) : undefined,
                level_no: node.level_no,
                actions: node.actions || [],
                children: convertTree(node.children || []),
              };
            });
          };
          const uiTree = convertTree(apiTree);
          setModuleCodeMap(codeMap);
          setModules(uiTree);
          const initialExpanded = new Set<string>();
          const expandAllParents = (nodes: UIModuleNode[]) => {
            nodes.forEach((node) => {
              if (node.children.length > 0) {
                initialExpanded.add(node.id);
                expandAllParents(node.children);
              }
            });
          };
          expandAllParents(uiTree);
          setExpandedModules(initialExpanded);
        } else {
          setError(response.message || "Failed to fetch modules");
        }
      } catch (err) {
        setError("Error loading modules");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  useEffect(() => {
    if (!userId || permissionsLoadedFromAssignments) return;
    const fetchGetUserPermissions = async () => {
      const res = await getUserPermissions(userId);
      if (res?.success && Array.isArray(res?.data?.permissions)) {
        setRawPermissions(res.data.permissions);
      }
    };
    fetchGetUserPermissions();
  }, [userId, permissionsLoadedFromAssignments]);

  useEffect(() => {
    if (!userId) return;
    fetchSavedAssignments();
  }, [userId]);

  const fetchSavedAssignments = async () => {
    try {
      const res = await GetUserAssignments(userId, "");
      console.log('res ', res)
      if (!res?.success || !res?.data) return;

      const rolesData = Array.isArray(res.data.roles) ? res.data.roles : [];
      if (rolesData.length > 0) {
        setRoles(rolesData);
      }
      const allUsersData = Array.isArray(res.data.all_users) ? res.data.all_users : [];
      if (allUsersData.length > 0) {
        setAllUsers(allUsersData);
      }
      const currentUser = allUsersData.find((u: any) => u.id === userId);
      if (!selectedRole) {
        if (currentUser?.role) {
          const matchedRole = rolesData.find(
            (r: any) =>
              String(r.name).toLowerCase() === String(currentUser.role).toLowerCase() ||
              String(r.code).toLowerCase() === String(currentUser.role).toLowerCase() ||
              String(r.id) === String(currentUser.role)
          );
          if (matchedRole) {
            setSelectedRole(String(matchedRole.id));
          } else if (currentUser?.role_id || currentUser?.role) {
            setSelectedRole(String(currentUser?.role_id ?? currentUser?.role));
          }
        }
      }
      if (!selectedUserFilter) {
        const normalizedStatus = normalizeStatusValue(
          currentUser?.status ?? currentUser?.is_active
        );
        if (["active", "1", "true"].includes(normalizedStatus)) {
          setSelectedUserFilter("active");
        } else if (["inactive", "0", "false"].includes(normalizedStatus)) {
          setSelectedUserFilter("inactive");
        }
      }
      setModuleCode(res.data.modules_code ? String(res.data.modules_code) : "");
      setPermissionCode(
        res.data.permission_code ? String(res.data.permission_code) : ""
      );

      let modulesLoaded = false;
      setPermissionsLoadedFromAssignments(modulesLoaded);

      const savedColumnPermissions = res.data.column_permissions || [];
      const savedDataAssignments = res.data.data_assignments || [];

      const permissionsByAssignment: Record<
        string,
        Record<string, { view: boolean; mask: boolean; edit: boolean; copy: boolean }>
      > = {};
      savedColumnPermissions.forEach((item: any) => {
        const key = String(item.assignment_id || "");
        if (!key) return;
        if (!permissionsByAssignment[key]) permissionsByAssignment[key] = {};
        permissionsByAssignment[key][item.column_name] = {
          view: Number(item.can_view) === 1,
          mask: Number(item.can_mask) === 1,
          edit: Number(item.can_edit) === 1,
          copy: Number(item.can_copy) === 1,
        };
      });

      const savedAssignments = savedDataAssignments.map((item: any) => ({
        id: item.id,
        dbSelect: item.db_table || "",
        wiseType: item.wise_type || "",
        dataid: item.data_id ? String(item.data_id).split(",") : [],
        dataidLabel: item.data_id_name_hi
          ? `${item.data_id_name_hi} - ${item.data_id}`
          : item.data_id ? String(item.data_id) : "",

        // Use the array versions if available, otherwise split the string
        block: item.block_ids || (item.block_id ? item.block_id.split(',') : []),
        gp: item.gp_ward_ids || (item.gp_ward_id ? item.gp_ward_id.split(',') : []),
        gram: item.village_ids || (item.village_id ? item.village_id.split(',') : []),
        ac: item.ac_ids || (item.ac_id ? item.ac_id.split(',') : []),
        bhag: item.bhag_nos || (item.bhag_no ? item.bhag_no.split(',') : []),
        section: item.sec_nos || (item.sec_no ? item.sec_no.split(',') : []),
        mandal: item.mandal_ids || (item.mandal_id ? item.mandal_id.split(',') : []),
        kendra: item.kendra_ids || (item.kendra_id ? item.kendra_id.split(',') : []),

        // Use the labels directly (they are already comma-separated with names)
        blockLabel: item.block_label || "",
        gpLabel: item.gp_ward_label || "",
        gramLabel: item.village_label || "",
        acLabel: item.ac_label || "",
        bhagLabel: item.bhag_label || "",
        sectionLabel: item.section_label || "",
        mandalLabel: item.mandal_label || "",
        kendraLabel: item.kendra_label || "",
        castLabel: item.cast_label || "",

        // Name fields from backend
        data_id_name_hi: item.data_id_name_hi || "",
        data_id_label: item.data_id_label || "",
        ac_names: item.ac_names || null,
        block_names: item.block_names || null,
        gp_ward_names: item.gp_ward_names || null,
        village_names: item.village_names || null,
        mandal_names: item.mandal_names || null,
        kendra_names: item.kendra_names || null,
        bhag_names: item.bhag_names || null,
        section_names: item.section_names || null,

        ageFrom: item.age_from ? String(item.age_from) : "",
        ageTo: item.age_to ? String(item.age_to) : "",
        cast: (item.cast_filter || item.cast || "")
          .toString()
          .split(",")
          .map((v: string) => v.trim())
          .filter((v: string) => v !== ""),
        check1: false,
        check2: false,
        selectedColumnDB: normalizeTableName(item.db_table || ""),
        columnPermissions: permissionsByAssignment[String(item.id)] || {},
      }));

      setAssignments(savedAssignments);
      if (savedAssignments.length > 0) {
        setSelectedAssignmentId(savedAssignments[0].id);
        setSelectedColumnDB(savedAssignments[0].selectedColumnDB || "");
        setColumnPermissions(savedAssignments[0].columnPermissions || {});
      }
    } catch (error) {
      console.error("Error fetching saved assignments:", error);
    }
  };

  const refreshModulePermissionTree = async () => {
    if (!userId) return;

    try {
      const res = await getUserPermissions(userId);

      if (res?.success && Array.isArray(res?.data?.permissions)) {
        setRawPermissions(res.data.permissions);
      } else {
        setRawPermissions([]);
      }
    } catch (error) {
      console.error("refreshModulePermissionTree error:", error);
      setRawPermissions([]);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchSavedAssignments();
  }, [userId, modules]);

  useEffect(() => {
    if (!rawPermissions || modules.length === 0) return;
    const moduleActionMap: Record<number, Set<string>> = {};
    rawPermissions.forEach((p: any) => {
      if (!moduleActionMap[p.module_id]) moduleActionMap[p.module_id] = new Set();
      if (p.action_code) moduleActionMap[p.module_id].add(p.action_code);
    });
    const newAssigned: string[] = [];
    const newPermissions: Record<string, string[]> = {};
    Object.entries(moduleActionMap).forEach(([moduleId, actionsSet]) => {
      const nodeId = `m${moduleId}`;
      newAssigned.push(nodeId);
      newPermissions[nodeId] = Array.from(actionsSet);
    });
    setAssignedModules(newAssigned);
    setPermissionsState(newPermissions);
  }, [rawPermissions, modules]);

  useEffect(() => {
    const fetchTableColumns = async () => {
      if (!selectedColumnDB) {
        setTableColumns([]);
        setColumnPermissions({});
        return;
      }

      try {
        setLoadingColumns(true);

        const res = await getTableColumns(selectedColumnDB);

        if (res?.success && Array.isArray(res?.data)) {
          const cols = res.data.map((item: any) =>
            typeof item === "string" ? item : item.column_name
          );

          setTableColumns(cols);

          setColumnPermissions((prev) => {
            const updatedPermissions = buildDefaultColumnPermissions(cols, prev);

            if (selectedAssignmentId !== null) {
              setAssignments((prevAssignments) =>
                prevAssignments.map((item) =>
                  item.id === selectedAssignmentId
                    ? {
                      ...item,
                      selectedColumnDB,
                      columnPermissions: buildDefaultColumnPermissions(
                        cols,
                        item.columnPermissions || {}
                      ),
                    }
                    : item
                )
              );
            }

            return updatedPermissions;
          });
        } else {
          setTableColumns([]);
          setColumnPermissions({});
        }
      } catch (error) {
        console.error("Error fetching columns:", error);
        setTableColumns([]);
        setColumnPermissions({});
      } finally {
        setLoadingColumns(false);
      }
    };
    fetchTableColumns();
  }, [selectedColumnDB]);

  useEffect(() => {
    if (activeTab !== "data_assign") return;
    if (!formData.dbSelect) return;

    const normalized = normalizeTableName(formData.dbSelect);

    if (selectedAssignmentId === null) {
      setSelectedColumnDB(normalized);
    }
  }, [activeTab, formData.dbSelect, selectedAssignmentId]);

  useEffect(() => {
    if (activeTab !== "teams") return;

    const timer = setTimeout(async () => {
      try {
        setTeamLoading(true);

        const res = await getUsersRolesApi({
          search: teamSearch || "",
          role: teamRole || "",
          limit: 50,
        });

        if (res?.success) {
          setTeamRoles(Array.isArray(res?.data?.roles) ? res.data.roles : []);
          setTeamUsers(Array.isArray(res?.data?.users) ? res.data.users : []);
        } else {
          setTeamRoles([]);
          setTeamUsers([]);
        }
      } catch (error) {
        console.error("Error fetching team roles/users:", error);
        setTeamRoles([]);
        setTeamUsers([]);
      } finally {
        setTeamLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, teamSearch, teamRole]);

  const getAllLeafNodes = (nodes: UIModuleNode[]): UIModuleNode[] => {
    let result: UIModuleNode[] = [];

    nodes.forEach((node) => {
      if (node.children?.length) {
        result = result.concat(getAllLeafNodes(node.children));
      } else {
        result.push(node);
      }
    });

    return result;
  };

  const allowedTables = useMemo(() => {
    const tables = new Set<string>();
    const leafNodes = getAllLeafNodes(modules);

    leafNodes.forEach((node) => {
      const isAssigned = assignedModules.includes(node.id);
      const nodePermissions = permissionsState[node.id] || [];
      const hasRead = nodePermissions.includes("read");
      const title = node.title?.trim().toUpperCase();

      if (isAssigned && hasRead && MODULE_TABLE_MAPPING[title]) {
        tables.add(MODULE_TABLE_MAPPING[title]);
      }
    });

    modules.forEach((node) => {
      const isAssigned = assignedModules.includes(node.id);
      const nodePermissions = permissionsState[node.id] || [];
      const hasRead = nodePermissions.includes("read");
      const title = node.title?.trim().toUpperCase();

      if (isAssigned && hasRead && MODULE_TABLE_MAPPING[title]) {
        tables.add(MODULE_TABLE_MAPPING[title]);
      }
    });

    return Array.from(tables);
  }, [modules, assignedModules, permissionsState]);

  const filteredTableOptions = useMemo(() => {
    return masterTables.filter((item: any) =>
      allowedTables.includes(item.table_name)
    );
  }, [masterTables, allowedTables]);

  const columnTableOptions = useMemo(() => {
    const optionMap = new Map<string, { table_name: string; label?: string }>();

    filteredTableOptions.forEach((item) => {
      optionMap.set(item.table_name, item);
    });

    const activeSelection = selectedColumnDB ? normalizeTableName(selectedColumnDB) : "";
    if (activeSelection && !optionMap.has(activeSelection)) {
      const fallback = masterTables.find((item) => normalizeTableName(item.table_name) === activeSelection);
      optionMap.set(activeSelection, fallback || { table_name: activeSelection, label: activeSelection });
    }

    // Preserve order from filteredTableOptions first, then any fallback selected value.
    return Array.from(optionMap.values());
  }, [filteredTableOptions, masterTables, selectedColumnDB]);

  useEffect(() => {
    const allowedDbNames = filteredTableOptions.map((item) => item.table_name);
    if (formData.dbSelect && !allowedDbNames.includes(formData.dbSelect)) {
      setFormData((prev) => ({ ...prev, dbSelect: "" }));
    }

    if (selectedColumnDB && !allowedDbNames.includes(selectedColumnDB)) {
      setSelectedColumnDB("");
    }
  }, [filteredTableOptions, formData.dbSelect, selectedColumnDB]);

  // ---------- Helper functions for multi‑select ----------
  const toggleMultiSelectOption = (field: keyof DataAssignFormData, value: string) => {
    setFormData((prev) => {
      const current = prev[field] as MultiSelectValue;
      const newArray = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: newArray };
    });
  };

  // Helper function to get names for selected IDs
  const getNamesForIds = (ids: string[], options: any[], idKey: string, nameKey: string): string => {
    if (!ids.length) return "";
    const names = ids.map(id => {
      const option = options.find(opt => String(opt[idKey]) === id);
      return option ? option[nameKey] || id : id;
    });
    return names.join(", ");
  };

  // Helper function to show dataid name and id together
  const getDataIdLabel = (item: AssignmentItem): string => {
    const ids: string[] = Array.isArray(item.dataid) ? item.dataid : (item.dataid ? [item.dataid] : []);
    if (item.dataidLabel && item.dataidLabel.trim() !== "") return item.dataidLabel;
    if (ids.length === 0) return "";

    const labels = ids.map((id) => {
      const matched = dataIdOptions.find((opt) => String(opt.data_id) === id);
      if (matched) {
        const name = matched.data_id_name_hi || matched.data_id_name || "";
        return name ? `${name} - ${id}` : id;
      }
      return id;
    });
    return labels.join(", ");
  };

  const getDataIdOptionLabel = (opt: any): string => {
    const id = opt?.data_id ?? opt?.id ?? "";
    const name = opt?.data_id_name_hi || opt?.data_id_name || opt?.name || "";
    return name ? `${name} - ${id}` : String(id);
  };

  const getEditingDataIdFallbackLabel = (): string => {
    const currentDataId = formData.dataid?.[0];
    if (!currentDataId) return "";

    const matched = dataIdOptions.find(
      (opt) => String(opt.data_id) === String(currentDataId)
    );
    if (matched) return getDataIdOptionLabel(matched);

    if (editingAssignment?.dataidLabel?.trim()) {
      return editingAssignment.dataidLabel;
    }

    if (editingAssignment?.data_id_name_hi?.trim()) {
      return `${editingAssignment.data_id_name_hi} - ${currentDataId}`;
    }

    return String(currentDataId);
  };

  // Generate display label for multiple selected items (comma-separated)
  const getMultiSelectLabel = (
    selectedIds: string[],
    options: any[],
    idKey: string,
    nameKeys: string[]
  ): string => {
    if (!selectedIds.length) return "";
    const labels = selectedIds.map((id) => {
      const opt = options.find((o) => String(o[idKey]) === id);
      if (!opt) return id;
      const name = nameKeys.map((k) => opt[k]).find((v) => v !== undefined && v !== null && String(v).trim() !== "") || "";
      return name ? `${name} - ${id}` : id;
    });
    return labels.join(", ");
  };

  // Generate display labels for an assignment (with comma-separated values for multi-select fields)
  const generateAssignmentLabels = (form: DataAssignFormData) => {
    const selectedIds = form.dataid || [];
    const dataidLabel = selectedIds
      .map((id) => {
        const selectedDataId = dataIdOptions.find((o) => String(o.data_id) === id);
        if (selectedDataId) {
          const name = selectedDataId.data_id_name_hi || selectedDataId.data_id_name || "";
          return name ? `${name} - ${id}` : id;
        }
        return id;
      })
      .join(", ");

    let blockLabel = "", gpLabel = "", gramLabel = "", acLabel = "", bhagLabel = "",
      sectionLabel = "", mandalLabel = "", kendraLabel = "", castLabel = "";

    const wiseType = form.wiseType;

    if (wiseType === "block") {
      blockLabel = getMultiSelectLabel(form.block, blockOptions, "id", ["name"]);
    } else if (wiseType === "gp_ward") {
      gpLabel = getMultiSelectLabel(form.gp, gpOptions, "id", ["name"]);
    } else if (wiseType === "gram") {
      gramLabel = getMultiSelectLabel(form.gram, gramOptions, "id", ["name"]);
    } else if (wiseType === "ac") {
      acLabel = getMultiSelectLabel(form.ac, acOptions, "id", ["name"]);
    } else if (wiseType === "bhag") {
      bhagLabel = getMultiSelectLabel(form.bhag, bhagOptions, "id", ["name"]);
    } else if (wiseType === "section") {
      sectionLabel = getMultiSelectLabel(form.section, sectionOptions, "id", ["name"]);
    } else if (wiseType === "mandal") {
      mandalLabel = getMultiSelectLabel(form.mandal, mandalOptions, "id", ["name"]);
    } else if (wiseType === "kendra") {
      kendraLabel = getMultiSelectLabel(form.kendra, kendraOptions, "id", ["name"]);
    }

    // Generate cast label for all wise types
    castLabel = getMultiSelectLabel(form.cast, castOptions, "id", ["name"]);

    return {
      dataidLabel,
      blockLabel,
      gpLabel,
      gramLabel,
      acLabel,
      bhagLabel,
      sectionLabel,
      mandalLabel,
      kendraLabel,
      castLabel,
    };
  };

  const handleAddAssignment = () => {
    if (!formData.dbSelect || !formData.wiseType || !formData.dataid.length) {
      alert("Please select DB, wise type and data id");
      return;
    }

    // Check if at least one item is selected for the leaf field
    let leafField: keyof DataAssignFormData | null = null;
    switch (formData.wiseType) {
      case "dataid":
      case "data_id":
        leafField = "dataid";
        break;
      case "block":
        leafField = "block";
        break;
      case "gp_ward":
        leafField = "gp";
        break;
      case "gram":
        leafField = "gram";
        break;
      case "ac":
        leafField = "ac";
        break;
      case "bhag":
        leafField = "bhag";
        break;
      case "section":
        leafField = "section";
        break;
      case "mandal":
        leafField = "mandal";
        break;
      case "kendra":
        leafField = "kendra";
        break;
      default:
        alert("Unsupported wise type");
        return;
    }

    const selectedLeafIds = leafField ? (formData[leafField] as MultiSelectValue) : [];
    if (selectedLeafIds.length === 0) {
      alert(`Please select at least one ${formData.wiseType}`);
      return;
    }

    // Generate labels with all selected items (comma-separated)
    const labels = generateAssignmentLabels(formData);

    const newAssignment: AssignmentItem = {
      id: editingAssignmentId !== null ? editingAssignmentId : Date.now(),
      dbSelect: formData.dbSelect,
      wiseType: formData.wiseType,
      dataid: formData.dataid,
      block: formData.block,
      gp: formData.gp,
      gram: formData.gram,
      ac: formData.ac,
      bhag: formData.bhag,
      section: formData.section,
      mandal: formData.mandal,
      kendra: formData.kendra,
      ageFrom: formData.ageFrom,
      ageTo: formData.ageTo,
      cast: formData.cast,
      check1: formData.check1,
      check2: formData.check2,
      selectedColumnDB: normalizeTableName(selectedColumnDB || formData.dbSelect),
      columnPermissions: { ...columnPermissions },
      data_id_name_hi: "",
      data_id_label: "",
      ac_names: null,
      block_names: null,
      gp_ward_names: null,
      village_names: null,
      mandal_names: null,
      kendra_names: null,
      bhag_names: null,
      section_names: null,
      ...labels,
    };

    if (editingAssignmentId !== null) {
      setAssignments((prev) =>
        prev.map((item) => (item.id === editingAssignmentId ? newAssignment : item))
      );
      setEditingAssignmentId(null);
    } else {
      setAssignments((prev) => [...prev, newAssignment]);
      setSelectedAssignmentId(newAssignment.id);
    }

    // Reset form
    resetAssignmentEditor();
  };

  const handleSaveUserAssignments = async () => {
    try {
      if (!userId) {
        alert("User ID not found");
        return;
      }
      if (!assignments.length) {
        alert("Please add at least one data assignment");
        return;
      }

      const data_assignments = assignments.map((item) => ({
        temp_id: String(item.id),
        id: item.id,
        db_table: item.dbSelect,
        wise_type: item.wiseType,
        data_id: item.dataid.length ? item.dataid.join(",") : null,
        block_id: item.block.length ? item.block.join(",") : null,
        gp_ward_id: item.gp.length ? item.gp.join(",") : null,
        village_id: item.gram.length ? item.gram.join(",") : null,
        ac_id: item.ac.length ? item.ac.join(",") : null,
        bhag_no: item.bhag.length ? item.bhag.join(",") : null,
        sec_no: item.section.length ? item.section.join(",") : null,
        mandal_id: item.mandal.length ? item.mandal.join(",") : null,
        kendra_id: item.kendra.length ? item.kendra.join(",") : null,
        age_from: item.ageFrom || null,
        age_to: item.ageTo || null,
        cast_filter: item.cast.length ? item.cast.join(",") : null,
      }));

      console.log('option s->>>>> ', data_assignments)

      const column_permissions = assignments.flatMap((item) => {
        const dbTable = item.selectedColumnDB || item.dbSelect;
        return Object.entries(item.columnPermissions || {}).map(
          ([column_name, perms]) => ({
            temp_id: String(item.id),
            db_table: dbTable,
            column_name,
            can_view: perms.view ? 1 : 0,
            can_mask: perms.mask ? 1 : 0,
            can_edit: perms.edit ? 1 : 0,
            can_copy: perms.copy ? 1 : 0,
          })
        );
      });

      const payload = { user_id: Number(userId), data_assignments, column_permissions };
      const result = await SaveUserAssignments(payload);
      if (result?.success) {
        alert(result.message || "User assignments saved successfully");
      } else {
        alert(result?.message || "Failed to save user assignments");
      }
    } catch (error) {
      console.error("handleSaveUserAssignments error:", error);
      alert("Something went wrong while saving");
    }
  };

  const handleEditAssignment = (item: AssignmentItem) => {
    if (item.dataid?.length) {
      setDataIdOptions((prev) => {
        const next = [...prev];

        item.dataid.forEach((id) => {
          const exists = next.some(
            (opt) => String(opt.data_id) === String(id)
          );

          if (!exists) {
            next.push({
              data_id: id,
              data_id_name_hi: item.data_id_name_hi || "",
            });
          }
        });

        return next;
      });
    }

    setEditingAssignmentId(item.id);
    setIsAddingData(true);
    setFormData({
      dbSelect: item.dbSelect,
      wiseType: item.wiseType,
      dataid: item.dataid,
      block: item.block,
      gp: item.gp,
      gram: item.gram,
      ac: item.ac,
      bhag: item.bhag,
      section: item.section,
      mandal: item.mandal,
      kendra: item.kendra,
      ageFrom: item.ageFrom,
      ageTo: item.ageTo,
      cast: item.cast,
      check1: false,
      check2: false,
    });
    setSelectedAssignmentId(item.id);
    setSelectedColumnDB(normalizeTableName(item.selectedColumnDB || item.dbSelect));
    setColumnPermissions(item.columnPermissions || {});
  };

  // Permission toggles for modules
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expandedModules);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedModules(next);
  };

  const toggleAssign = (id: string, checked: boolean) => {
    setAssignedModules((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((mId) => mId !== id);
    });
  };

  const togglePermission = (itemId: string, permId: string, checked: boolean) => {
    setPermissionsState((prev) => {
      const current = prev[itemId] || [];
      const updated = checked ? [...current, permId] : current.filter((p) => p !== permId);
      return { ...prev, [itemId]: updated };
    });
  };

  const handleSavePermissions = async () => {
    if (!userId) return;

    try {
      setIsSavingPermissions(true);

      const modulesPayload: any[] = [];
      assignedModules.forEach((assignedKey) => {
        const rawId = Number(assignedKey.replace("m", ""));
        const module_code = moduleCodeMap[rawId];
        if (!module_code) return;

        const actions = permissionsState[assignedKey] || [];
        if (actions.length > 0) {
          modulesPayload.push({ module_code, actions });
        }
      });

      // IMPORTANT FIX:
      // agar edit/add form open hai to current formData ko assignments me merge karo
      let assignmentsToSave = [...assignments];

      if (isAddingData && formData.dbSelect && formData.wiseType && formData.dataid.length) {
        const currentAssignment = {
          id: editingAssignmentId !== null ? editingAssignmentId : Date.now(),
          dbSelect: formData.dbSelect,
          wiseType: formData.wiseType,
          dataid: formData.dataid,
          block: formData.block,
          gp: formData.gp,
          gram: formData.gram,
          ac: formData.ac,
          bhag: formData.bhag,
          section: formData.section,
          mandal: formData.mandal,
          kendra: formData.kendra,
          ageFrom: formData.ageFrom,
          ageTo: formData.ageTo,
          cast: formData.cast,
          check1: formData.check1,
          check2: formData.check2,
          selectedColumnDB: normalizeTableName(selectedColumnDB || formData.dbSelect),
          columnPermissions: { ...columnPermissions },
        };

        if (editingAssignmentId !== null) {
          assignmentsToSave = assignmentsToSave.map((item) =>
            item.id === editingAssignmentId
              ? { ...item, ...currentAssignment }
              : item
          );
        } else {
          assignmentsToSave.push(currentAssignment as any);
        }
      }

      const data_assignments = assignmentsToSave.map((item) => ({
        temp_id: String(item.id),
        id: item.id,
        db_table: item.dbSelect,
        wise_type: item.wiseType,
        data_id: Array.isArray(item.dataid) && item.dataid.length ? item.dataid.join(",") : null,
        block_id: item.block.length ? item.block.join(",") : null,
        gp_ward_id: item.gp.length ? item.gp.join(",") : null,
        village_id: item.gram.length ? item.gram.join(",") : null,
        ac_id: item.ac.length ? item.ac.join(",") : null,
        bhag_no: item.bhag.length ? item.bhag.join(",") : null,
        sec_no: item.section.length ? item.section.join(",") : null,
        mandal_id: item.mandal.length ? item.mandal.join(",") : null,
        kendra_id: item.kendra.length ? item.kendra.join(",") : null,
        age_from: item.ageFrom || null,
        age_to: item.ageTo || null,
        cast_filter: Array.isArray(item.cast) && item.cast.length ? item.cast.join(",") : null,
      }));

      const column_permissions = assignmentsToSave.flatMap((item) => {
        const dbTable = item.selectedColumnDB || item.dbSelect;
        return Object.entries(item.columnPermissions || {}).map(
          ([column_name, perms]: any) => ({
            temp_id: String(item.id),
            db_table: dbTable,
            column_name,
            can_view: perms.view ? 1 : 0,
            can_mask: perms.mask ? 1 : 0,
            can_edit: perms.edit ? 1 : 0,
            can_copy: perms.copy ? 1 : 0,
          })
        );
      });

      console.log("modulesPayload =>", modulesPayload);
      console.log("data_assignments =>", data_assignments);

      const assignmentPayload = {
        user_id: Number(userId),
        data_assignments,
        column_permissions,
      };

      const assignmentRes = await SaveUserAssignments(assignmentPayload);

      if (!assignmentRes?.success) {
        alert(assignmentRes?.message || "Failed to save assignments");
        return;
      }

      const permissionPayload = {
        user_id: Number(userId),
        modules: modulesPayload,
      };

      const permissionRes = await UserPermissionsAssign(permissionPayload);

      if (
        permissionRes?.success ||
        permissionRes?.message?.toLowerCase().includes("success") ||
        permissionRes?.message === undefined
      ) {
        alert("Permissions and cast filter saved successfully!");
      } else {
        alert(permissionRes?.message || "Failed to save permissions.");
      }
    } catch (err) {
      console.error("handleSavePermissions error =>", err);
      alert("Error saving permissions.");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const autoCheckIdAndDataIdColumns = (checked: boolean) => {
    const targetColumns = ["id", "data_id"];

    const applyOnPermissions = (
      perms: Record<string, { view: boolean; mask: boolean; edit: boolean; copy: boolean }>
    ) => {
      const updated = { ...perms };

      targetColumns.forEach((col) => {
        updated[col] = {
          ...(updated[col] || {
            view: false,
            mask: false,
            edit: false,
            copy: false,
          }),
          view: checked,
        };
      });

      return updated;
    };

    setColumnPermissions((prev) => applyOnPermissions(prev));

    setAssignments((prev) =>
      prev.map((item) => ({
        ...item,
        columnPermissions: applyOnPermissions(item.columnPermissions || {}),
      }))
    );
  };


  const ALWAYS_READ_COLUMNS = ["id", "data_id"];

  const buildDefaultColumnPermissions = (
    columns: string[],
    existing: Record<string, { view: boolean; mask: boolean; edit: boolean; copy: boolean }> = {}
  ) => {
    const next: Record<
      string,
      { view: boolean; mask: boolean; edit: boolean; copy: boolean }
    > = {};

    columns.forEach((col) => {
      const isAlwaysRead = ALWAYS_READ_COLUMNS.includes(String(col).toLowerCase());

      next[col] = {
        view: isAlwaysRead ? true : existing[col]?.view || false,
        mask: existing[col]?.mask || false,
        edit: existing[col]?.edit || false,
        copy: existing[col]?.copy || false,
      };
    });

    return next;
  };

  const handlePermissionToggle = (
    col: string,
    perm: "view" | "mask" | "edit" | "copy"
  ) => {
    const isAlwaysReadColumn = ALWAYS_READ_COLUMNS.includes(String(col).toLowerCase());

    if (isAlwaysReadColumn && perm === "view") {
      return;
    }

    const updatedPermissions = {
      ...columnPermissions,
      [col]: {
        ...(columnPermissions[col] || { view: false, mask: false, edit: false, copy: false }),
        [perm]: !(columnPermissions[col]?.[perm] || false),
      },
    };

    if (isAlwaysReadColumn) {
      updatedPermissions[col].view = true;
    }

    setColumnPermissions(updatedPermissions);

    if (selectedAssignmentId !== null) {
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === selectedAssignmentId
            ? { ...item, selectedColumnDB, columnPermissions: updatedPermissions }
            : item
        )
      );
    }
  };

  const isNodeAssigned = (nodeId: string) => assignedModules.includes(nodeId);

  const getNodePermissions = (nodeId: string) => permissionsState[nodeId] || [];

  const handleAssignWithRead = (nodeId: string, checked: boolean) => {
    toggleAssign(nodeId, checked);

    if (checked) {
      if (!getNodePermissions(nodeId).includes("read")) {
        togglePermission(nodeId, "read", true);
      }
    } else {
      const currentPermissions = getNodePermissions(nodeId);

      currentPermissions.forEach((permCode) => {
        togglePermission(nodeId, permCode, false);
      });
    }
  };

  const handlePermissionWithAssign = (
    nodeId: string,
    permCode: string,
    checked: boolean
  ) => {
    const currentPermissions = permissionsState[nodeId] || [];

    let updatedPermissions = [...currentPermissions];

    if (checked) {
      // add current permission
      if (!updatedPermissions.includes(permCode)) {
        updatedPermissions.push(permCode);
      }

      // 🔥 AUTO ADD READ (IMPORTANT FIX)
      if (
        permCode !== "read" &&
        !updatedPermissions.includes("read")
      ) {
        updatedPermissions.push("read");
      }

      // assign module if not assigned
      if (!assignedModules.includes(nodeId)) {
        toggleAssign(nodeId, true);
      }
    } else {
      // remove permission
      updatedPermissions = updatedPermissions.filter((p) => p !== permCode);

      // ❗ if only read left OR nothing left → handle
      const hasOtherPermissions = updatedPermissions.some((p) => p !== "read");

      if (!hasOtherPermissions) {
        updatedPermissions = [];
        toggleAssign(nodeId, false);
      }
    }

    // 🔥 IMPORTANT: update all permissions at once
    // clear old
    currentPermissions.forEach((perm) => {
      togglePermission(nodeId, perm, false);
    });

    // set new
    updatedPermissions.forEach((perm) => {
      togglePermission(nodeId, perm, true);
    });

    // ✅ AUTO CHECK id and data_id in data assign column permissions
    if (permCode === "edit" || permCode === "update") {
      const activeAssignmentId =
        selectedAssignmentId !== null ? selectedAssignmentId : editingAssignmentId;

      const applyAutoColumns = (
        prev: Record<
          string,
          { view: boolean; mask: boolean; edit: boolean; copy: boolean }
        >
      ) => {
        const next = { ...prev };

        next["id"] = {
          ...(next["id"] || {
            view: false,
            mask: false,
            edit: false,
            copy: false,
          }),
          view: checked,
        };

        next["data_id"] = {
          ...(next["data_id"] || {
            view: false,
            mask: false,
            edit: false,
            copy: false,
          }),
          view: checked,
        };

        return next;
      };

      setColumnPermissions((prev) => applyAutoColumns(prev));

      if (activeAssignmentId !== null) {
        setAssignments((prev) =>
          prev.map((item) =>
            item.id === activeAssignmentId
              ? {
                ...item,
                selectedColumnDB,
                columnPermissions: applyAutoColumns(item.columnPermissions || {}),
              }
              : item
          )
        );
      }
    }
  };

  const readClipboardWithFallback = async (
    expectedType?: "module" | "permission"
  ): Promise<string> => {
    // 1) try browser clipboard API
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text?.trim()) return text.trim();
      }
    } catch (error) {
      console.warn("Clipboard API read failed:", error);
    }

    // 2) fallback: read from localStorage copied meta
    try {
      const raw = localStorage.getItem(COPY_META_KEY);
      if (raw) {
        const meta = JSON.parse(raw);
        if (
          meta?.code &&
          (!expectedType || meta?.type === expectedType)
        ) {
          return String(meta.code).trim();
        }
      }
    } catch (error) {
      console.warn("LocalStorage fallback failed:", error);
    }

    // 3) final fallback: manual prompt
    const manual = window.prompt("Paste code here:");
    return manual?.trim() || "";
  };

  // Render module permission tree
  const renderPermissionNode = (node: UIModuleNode, depth = 0) => {
    const isExpanded = expandedModules.has(node.id);
    const isAssigned = assignedModules.includes(node.id);
    const hasChildren = node.children.length > 0;
    const leftPadding = 24 + depth * 24;
    const actionCount = node.actions.length;
    const actionContainerClass =
      actionCount < 10
        ? "flex flex-wrap items-center gap-10"
        : "flex flex-wrap items-center justify-between";

    return (
      <div key={node.id} className="bg-white">
        <div className="flex items-center px-6 py-2 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
          <div
            className="w-[30%] min-w-[200px] flex items-center gap-3"
            style={{ paddingLeft: `${leftPadding}px` }}
          >
            {!hasChildren && (
              <input
                type="checkbox"
                checked={isAssigned}
                onChange={(e) => handleAssignWithRead(node.id, e.target.checked)}
                className="h-3.5 w-3.5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
            )}

            <div
              className={`flex items-center gap-2 ${hasChildren
                ? "cursor-pointer font-bold text-gray-800"
                : "text-gray-600 font-semibold"
                }`}
              onClick={(e) => hasChildren && toggleExpand(node.id, e)}
            >
              {depth === 0 && node.icon && <span className="text-lg">{node.icon}</span>}
              <span className={`${depth === 0 ? "text-[13px]" : "text-[12px]"} uppercase`}>
                {node.title}
              </span>
              {hasChildren && (
                <ChevronDown
                  className={`w-4 h-4 text-blue-400 transition-transform ${isExpanded ? "" : "-rotate-90"
                    }`}
                />
              )}
            </div>
          </div>

          <div className="flex-1">
            {!hasChildren && (
              <div className={actionContainerClass}>
                {node.actions.map((perm: any) => (
                  <div key={perm.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(permissionsState[node.id] || []).includes(perm.code)}
                      onChange={(e) =>
                        handlePermissionWithAssign(node.id, perm.code, e.target.checked)
                      }
                      className="h-3.5 w-3.5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-gray-400 uppercase leading-none whitespace-nowrap">
                      {perm.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="bg-gray-50/30">
            {node.children.map((child) => renderPermissionNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const [modulePermissions, setModulePermissions] = useState<Record<
    string,
    {
      checked: boolean;
      read: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    }
  >>({});

  const getPermissionState = (nodeId: string) => {
    return (
      modulePermissions[nodeId] || {
        checked: false,
        read: false,
        create: false,
        edit: false,
        delete: false,
      }
    );
  };

  const handlePasteModuleCode = async () => {
    try {
      const pastedCode = await readClipboardWithFallback("module");

      if (!pastedCode) {
        alert("No module code found to paste");
        return;
      }

      setModuleCode(String(pastedCode).trim());
      setCopiedField("module_paste");

      setTimeout(() => setCopiedField(""), 1200);
    } catch (err) {
      console.error("Paste module error:", err);
      alert("Unable to paste module code");
    }
  };

  const handlePastePermissionCode = async () => {
    try {
      const pastedCode = await readClipboardWithFallback("permission");

      if (!pastedCode) {
        alert("No permission code found to paste");
        return;
      }

      setPermissionCode(String(pastedCode).trim());
      setCopiedField("permission_paste");

      setTimeout(() => setCopiedField(""), 1200);
    } catch (err) {
      console.error("Paste permission error:", err);
      alert("Unable to paste permission code");
    }
  };


  const bothCodesReady = !!moduleCode?.trim() && !!permissionCode?.trim();
  const handleApplyBothCodes = async () => {
    try {
      if (!userId) return;

      if (!moduleCode || !permissionCode) {
        alert("Please paste both module code and permission code.");
        return;
      }

      setSaving(true);

      const res = await ApplyAccessCodesToUser({
        user_id: userId,
        modules_code: moduleCode,
        permission_code: permissionCode,
      });

      if (!res?.success) {
        alert(res?.message || "Failed to apply access codes");
        return;
      }

      await fetchSavedAssignments();
      alert("Both codes applied successfully");
    } catch (error) {
      console.error("handleApplyBothCodes error:", error);
      alert("Unable to apply access codes");
    } finally {
      setSaving(false);
    }
  };


  // Loading / Error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading modules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading modules</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main JSX
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Top Bar */}
      <div className="px-6 py-1">
        <div className="bg-white rounded shadow-sm border px-6 py-1">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <div className="text-gray-600 hover:text-blue-600 cursor-pointer p-1.5 bg-gray-50 rounded transition-colors">
                <Link href="/tbo-users">
                  <ArrowLeft size={20} />
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="min-w-[160px] px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-700 outline-none"
              >
                <option value="">All Roles</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <SearchableFilterSelect
                value={selectedParentFilter}
                onChange={setSelectedParentFilter}
                options={parentOptions}
                placeholder="All Parents"
                className="min-w-[220px]"
              />
              <UserDropdown
                allUsers={allUsers}
                optionUsers={filteredUsers.length ? filteredUsers : allUsers}
                userId={userId}
                onUserChange={handleUserChange}
              />
              <select
                className="min-w-[160px] px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-700 outline-none"
                value={selectedUserFilter || "all"}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="working-empty"></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-between px-6 mt-1">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: "module_permissions", label: "Module & Permissions" },
            { id: "data_assign", label: "Data Assign & Column Permission" },
            { id: "teams", label: "Teams Management" },
            { id: "coming_soon", label: "Coming Soon" },
          ].map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[14px] font-medium rounded whitespace-nowrap shadow-sm cursor-pointer transition-all ${activeTab === tab.id
                ? "text-white bg-black"
                : "text-white bg-gray-700 hover:bg-gray-800"
                }`}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Module */}
          <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <span className="text-[11px] font-medium text-slate-600">M</span>
            <input
              value={moduleCode || ""}
              readOnly
              placeholder="Module code"
              className="h-7 w-[120px] bg-transparent text-[14px] font-mono text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={() => handleCopy(moduleCode, "module")}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              title="Copy module code"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handlePasteModuleCode}
              className={`h-7 rounded border px-2 text-[11px] font-medium transition-all
            ${copiedField === "module_paste"
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
                }`}
            >
              Paste
            </button>
          </div>

          {/* Permission */}
          <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1">
            <span className="text-[11px] font-medium text-slate-600">P</span>
            <input
              value={permissionCode || ""}
              readOnly
              placeholder="Permission code"
              className="h-7 w-[100px] bg-transparent text-[14px] font-mono text-slate-700 outline-none"
            />
            <button
              type="button"
              onClick={() => handleCopy(permissionCode, "permission")}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              title="Copy permission code"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handlePastePermissionCode}
              className={`h-7 rounded border px-2 text-[11px] font-medium transition-all
            ${copiedField === "permission_paste"
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
                }`}
            >
              Paste
            </button>
          </div>

          {/* Apply Both */}
          <button
            type="button"
            onClick={handleApplyBothCodes}
            disabled={!bothCodesReady || saving}
            className={`h-8 rounded px-3 text-[14px] transition-all
    ${!bothCodesReady || saving
                ? "cursor-not-allowed bg-purple-100-100 text-slate-400"
                : "bg-purple-600 cursor-pointer text-white hover:bg-purple-800"
              }`}
          >
            {saving ? "Applying..." : "Apply Both Codes"}
          </button>
        </div>
      </div>


      {/* Module & Permissions Tab */}
      {activeTab === "module_permissions" && (
        <div className="px-6 mt-3 pb-2">
          <div className="bg-white rounded shadow-lg border w-full h-[calc(100vh-130px)] flex flex-col overflow-hidden uppercase">
            <div className="px-6 py-2 border-b bg-gray-50 flex items-center flex-shrink-0">
              <div className="w-[100%] min-w-[200px] flex justify-between">
                <h4 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest">
                  Modules / Menus
                </h4>

                <div className="border-t bg-transparent flex items-center justify-end flex-shrink-0 gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <button className="px-6 py-1.5 text-[13px] font-bold text-white bg-yellow-600 hover:bg-yellow-800 cursor-pointer shadow-sm rounded transition-all flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Default
                  </button>

                  <button
                    onClick={handleSavePermissions}
                    disabled={isSavingPermissions}
                    className="px-6 py-1.5 text-[13px] font-bold text-white bg-green-600 hover:bg-green-800 cursor-pointer shadow-sm rounded transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingPermissions ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4" />
                    )}
                    {isSavingPermissions ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
              <div className="flex-1"></div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="bg-white">
                {modules.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-500">No modules found</p>
                  </div>
                ) : (
                  modules.map((node) => renderPermissionNode(node))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Assign & Column Permission Tab */}
      {activeTab === "data_assign" && (
        <div className="px-6 mt-2 pb-3">
          <div className="flex gap-6 h-[calc(100vh-118.9px)]">
            {/* Left Column: Data Assign */}
            <div className="w-1/2 bg-white rounded shadow-lg border flex flex-col overflow-hidden w-[600px]">
              <div className="px-6 py-1 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
                <h4 className="text-xs font-bold text-black uppercase tracking-widest">Data Assign</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddingData(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-1 text-[16px] cursor-pointer bg-green-600 text-white rounded hover:bg-green-800 transition shadow-sm"
                    title="Add Permission"
                  >
                    <span className="text-lg font-semibold">+</span>
                    <span className="font-medium">Data Assign</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {isAddingData && (
                  <div className="mb-1 rounded border border-dashed border-gray-200 bg-gray-50 px-2 text-black animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-3">
                      {/* DB SELECT */}
                      <div className="space-y-0.3">
                        <label className="text-[8px] font-bold text-gray-700 uppercase tracking-wider">
                          DB SELECT
                        </label>
                        <select
                          className="h-6 w-full rounded border bg-white px-2 py-1 text-[10px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={formData.dbSelect}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dbSelect: e.target.value,
                            })
                          }
                        >
                          <option value="">Select DB</option>
                          {filteredTableOptions.map((item) => (
                            <option key={item.table_name} value={item.table_name}>
                              {item.label || item.table_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* WISE TYPE */}
                      <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-gray-700 uppercase tracking-wider">WISE TYPE</label>
                        <select
                          className="h-6 w-full rounded border bg-white px-2 py-1 text-[10px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={formData.wiseType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              wiseType: e.target.value,
                              dataid: [],
                              block: [],
                              gp: [],
                              gram: [],
                              ac: [],
                              bhag: [],
                              section: [],
                              mandal: [],
                              kendra: [],
                              ageFrom: "",
                              ageTo: "",
                              cast: [],
                            })
                          }
                        >
                          <option value="">Select Type</option>
                          <option value="dataid">DataId Wise</option>
                          <option value="block">Block Wise</option>
                          <option value="gp_ward">GP ward Wise</option>
                          <option value="gram">Gram Wise</option>
                          <option value="mandal">Mandal Wise</option>
                          <option value="kendra">Kendra Wise</option>
                          <option value="section">Section Wise</option>
                          <option value="bhag">Bhag Wise</option>
                        </select>
                      </div>

                      {/* DATA ID */}
                      {formData.dbSelect && formData.wiseType && (
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-700 uppercase tracking-wider">DATA ID</label>
                          {formData.wiseType === "dataid" ? (
                            <MultiSelect
                              label="Data ID"
                              options={dataIdOptions}
                              selected={formData.dataid}
                              onChange={(val) => toggleMultiSelectOption("dataid", val)}
                              idKey="data_id"
                              nameKey="data_id_name_hi"
                              loading={loadingDataOptions}
                              placeholder="Select Data IDs"
                              showAllOption={true}
                            />
                          ) : (
                            <select
                              className="w-full rounded border bg-white px-2.5 py-1 text-[11px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                              value={formData.dataid[0] || ""}
                              disabled={loadingDataOptions || !formData.dbSelect || !formData.wiseType}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dataid: e.target.value ? [e.target.value] : [],
                                  block: [],
                                  gp: [],
                                  gram: [],
                                  ac: [],
                                  bhag: [],
                                  section: [],
                                  mandal: [],
                                  kendra: [],
                                })
                              }
                            >
                              <option className="w-80 z-[1000]" value="">{loadingDataOptions ? "Loading..." : "Select Data ID"}</option>
                              {formData.dataid[0] && !dataIdOptions.some((opt) => String(opt.data_id) === String(formData.dataid[0])) && (
                                <option value={formData.dataid[0]}>
                                  {getEditingDataIdFallbackLabel()}
                                </option>
                              )}
                              {dataIdOptions.map((opt) => (
                                <option key={opt.data_id} value={opt.data_id}>
                                  {getDataIdOptionLabel(opt)}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      {/* BLOCK WISE */}
                      {formData.wiseType === "block" && (
                        <MultiSelect
                          label="Block"
                          options={blockOptions}
                          selected={formData.block}
                          onChange={(val) => toggleMultiSelectOption("block", val)}
                          idKey="id"
                          nameKey="name"
                          loading={loadingDataOptions}
                          disabled={!formData.dataid.length}
                          placeholder="Select Blocks"
                          showAllOption={true}
                        />
                      )}

                      {/* GP WARD WISE */}
                      {formData.wiseType === "gp_ward" && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Block</label>
                            <select
                              className="w-full px-3 py-2 border rounded text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
                              value={formData.block[0] || ""}
                              disabled={loadingDataOptions || !formData.dataid.length}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  block: e.target.value ? [e.target.value] : [],
                                  gp: [],
                                })
                              }
                            >
                              <option value="">Select Block</option>
                              {blockOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.name || opt.id}
                                </option>
                              ))}
                            </select>
                          </div>

                          <MultiSelect
                            label="GP / Ward"
                            options={gpOptions}
                            selected={formData.gp}
                            onChange={(val) => toggleMultiSelectOption("gp", val)}
                            idKey="id"
                            nameKey="name"
                            loading={loadingDataOptions}
                            disabled={!formData.dataid.length || formData.block.length !== 1}
                            placeholder="Select GP / Wards"
                            showAllOption={true}
                          />
                        </>
                      )}

                      {/* GRAM WISE */}
                      {formData.wiseType === "gram" && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Block</label>
                            <select
                              className="w-full px-3 py-2 border rounded text-xs font-medium bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
                              value={formData.block[0] || ""}
                              disabled={loadingDataOptions || !formData.dataid.length}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  block: e.target.value ? [e.target.value] : [],
                                  gp: [],
                                })
                              }
                            >
                              <option value="">Select Block</option>
                              {blockOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.name || opt.id}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">GP / Ward</label>
                            <select
                              className="w-full rounded border bg-white px-2.5 py-1 text-[11px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                              value={formData.gp[0] || ""}
                              disabled={loadingDataOptions || !formData.dataid.length || formData.block.length !== 1}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  gp: e.target.value ? [e.target.value] : [],
                                })
                              }
                            >
                              <option value="">Select GP / Ward</option>
                              {gpOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.name || opt.id}
                                </option>
                              ))}
                            </select>
                          </div>

                          <MultiSelect
                            label="Gram / Village"
                            options={gramOptions}
                            selected={formData.gram}
                            onChange={(val) => toggleMultiSelectOption("gram", val)}
                            idKey="id"
                            nameKey="name"
                            loading={loadingDataOptions}
                            disabled={!formData.dataid.length || formData.block.length !== 1 || formData.gp.length !== 1}
                            placeholder="Select Grams"
                            showAllOption={true}
                          />
                        </>
                      )}

                      {/* BHAG WISE */}
                      {formData.wiseType === "bhag" && (
                        <MultiSelect
                          label="Bhag"
                          options={bhagOptions}
                          selected={formData.bhag}
                          onChange={(val) => toggleMultiSelectOption("bhag", val)}
                          idKey="id"
                          nameKey="name"
                          loading={loadingDataOptions}
                          disabled={!formData.dataid.length}
                          placeholder="Select Bhag"
                          showAllOption={true}
                        />
                      )}

                      {/* SECTION WISE */}
                      {formData.wiseType === "section" && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Bhag</label>
                            <select
                              className="w-full rounded border bg-white px-2.5 py-1 text-[11px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                              value={formData.bhag[0] || ""}
                              disabled={loadingDataOptions || !formData.dataid.length}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bhag: e.target.value ? [e.target.value] : [],
                                  section: [],
                                })
                              }
                            >
                              <option value="">Select Bhag</option>
                              {bhagOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.name || opt.id}
                                </option>
                              ))}
                            </select>
                          </div>

                          <MultiSelect
                            label="Section"
                            options={sectionOptions}
                            selected={formData.section}
                            onChange={(val) => toggleMultiSelectOption("section", val)}
                            idKey="id"
                            nameKey="name"
                            loading={loadingDataOptions}
                            disabled={!formData.dataid.length || formData.bhag.length !== 1}
                            placeholder="Select Sections"
                            showAllOption={true}
                          />
                        </>
                      )}

                      {/* MANDAL WISE */}
                      {formData.wiseType === "mandal" && (
                        <MultiSelect
                          label="Mandal"
                          options={mandalOptions}
                          selected={formData.mandal}
                          onChange={(val) => toggleMultiSelectOption("mandal", val)}
                          idKey="id"
                          nameKey="name"
                          loading={loadingDataOptions}
                          disabled={!formData.dataid.length}
                          placeholder="Select Mandals"
                          showAllOption={true}
                        />
                      )}

                      {/* KENDRA WISE */}
                      {formData.wiseType === "kendra" && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Mandal</label>
                            <select
                              className="w-full rounded border bg-white px-2.5 py-1 text-[11px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                              value={formData.mandal[0] || ""}
                              disabled={loadingDataOptions || !formData.dataid.length}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  mandal: e.target.value ? [e.target.value] : [],
                                  kendra: [],
                                })
                              }
                            >
                              <option value="">Select Mandal</option>
                              {mandalOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.name || opt.id}
                                </option>
                              ))}
                            </select>
                          </div>

                          <MultiSelect
                            label="Kendra"
                            options={kendraOptions}
                            selected={formData.kendra}
                            onChange={(val) => toggleMultiSelectOption("kendra", val)}
                            idKey="id"
                            nameKey="name"
                            loading={loadingDataOptions}
                            disabled={!formData.dataid.length || formData.mandal.length !== 1}
                            placeholder="Select Kendras"
                            showAllOption={true}
                          />
                        </>
                      )}

                      {/* AGE & CAST FILTERS - Available for All Wise Types */}
                      {formData.dbSelect && formData.wiseType && formData.dataid.length && (
                        <div className="rounded border border-blue-200 bg-blue-50 p-1 md:col-span-2 xl:col-span-3">
                          <div className="grid grid-cols-1 gap-1.5 md:grid-cols-3">
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-gray-700 uppercase tracking-wider">Age From</label>
                              <input
                                type="number"
                                placeholder="0"
                                className="h-6 w-full rounded border bg-white px-2 text-[10px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={formData.ageFrom}
                                onChange={(e) => setFormData({ ...formData, ageFrom: e.target.value })}
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-gray-700 uppercase tracking-wider">Age To</label>
                              <input
                                type="number"
                                placeholder="100"
                                className="h-6 w-full rounded border bg-white px-2 py-1 text-[10px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={formData.ageTo}
                                onChange={(e) => setFormData({ ...formData, ageTo: e.target.value })}
                              />
                            </div>
                            <div>
                              <MultiSelect
                                label="Cast"
                                options={castOptions}
                                selected={formData.cast}
                                onChange={(val) => toggleMultiSelectOption("cast", val)}
                                idKey="id"
                                nameKey="name"
                                loading={loadingCastOptions}
                                placeholder="Select Cast(s)"
                                showAllOption={true}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-0.5 col-span-full flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={resetAssignmentEditor}
                          className="rounded border border-gray-300 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-gray-700 transition-all hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddAssignment}
                          className="flex items-center gap-1.5 rounded bg-green-600 px-3 py-1 text-[11px] font-bold text-white transition-all hover:bg-green-700 shadow-sm"
                        >
                          <Check size={13} /> {editingAssignmentId !== null ? "Update" : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of existing assignments */}
                <div className="space-y-2">
                  {assignments.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 rounded border border-dashed flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-500 mb-3">
                        <Settings size={24} />
                      </div>
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">No assignments yet</p>
                      <p className="text-[11px] text-gray-500 mt-1 uppercase">Click the + button to add your first data assignment</p>
                    </div>
                  ) : (
                    assignments.map((item) => {
                      // Build summary rows using the name fields from backend
                      const summaryRows: { label: string; value: string }[] = [];
                      summaryRows.push({ label: "DB / Type", value: `${item.dbSelect} / ${item.wiseType} Wise` });

                      // Data ID should show both name and id
                      const dataIdDisplay = getDataIdLabel(item);
                      if (dataIdDisplay) {
                        summaryRows.push({ label: "Data ID", value: dataIdDisplay });
                      }

                      // Show wise type specific details using backend names
                      if (item.wiseType === "block" && item.block_names) {
                        summaryRows.push({ label: "Block", value: item.block_names });
                      } else if (item.wiseType === "gp_ward" && item.gp_ward_names) {
                        summaryRows.push({ label: "GP / Ward", value: item.gp_ward_names });
                      } else if (item.wiseType === "gram" && item.village_names) {
                        summaryRows.push({ label: "Gram / Village", value: item.village_names });
                      } else if (item.wiseType === "bhag" && item.bhag_names) {
                        summaryRows.push({ label: "Bhag", value: item.bhag_names });
                      } else if (item.wiseType === "section" && item.section_names) {
                        summaryRows.push({ label: "Section", value: item.section_names });
                      } else if (item.wiseType === "mandal" && item.mandal_names) {
                        summaryRows.push({ label: "Mandal", value: item.mandal_names });
                      } else if (item.wiseType === "kendra" && item.kendra_names) {
                        summaryRows.push({ label: "Kendra", value: item.kendra_names });
                      }

                      // Age and Cast filters (available for all wise types)
                      if (item.ageFrom || item.ageTo) {
                        summaryRows.push({ label: "Age Range", value: `${item.ageFrom || "0"} - ${item.ageTo || "100"}` });
                      }
                      if (item.castLabel && item.castLabel.trim()) {
                        summaryRows.push({ label: "Cast", value: item.castLabel });
                      } else if (item.cast && item.cast.length > 0) {
                        const castNames = getNamesForIds(item.cast, castOptions, "id", "name");
                        if (castNames) summaryRows.push({ label: "Cast", value: castNames });
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedAssignmentId(item.id);
                            setSelectedColumnDB(item.selectedColumnDB || item.dbSelect);
                            setColumnPermissions(item.columnPermissions || {});
                          }}
                          className={`relative cursor-pointer rounded border bg-white px-3 py-2 shadow-sm transition-all duration-200 group hover:shadow-md ${selectedAssignmentId === item.id
                            ? "border-blue-500 ring-2 ring-blue-100"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2 pr-16">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                                  {item.wiseType} Wise Assignment
                                </span>
                              </div>

                              <h3 className="mt-1 text-[13px] font-semibold text-gray-900 truncate">
                                {getDataIdLabel(item) || "Assignment"}
                              </h3>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                                Database
                              </p>
                              <span className="mt-0.5 inline-flex rounded bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-700 border border-gray-200">
                                {item.dbSelect || "-"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 grid grid-cols-2 lg:grid-cols-3 gap-1.5">
                            {summaryRows.map((row, idx) => (
                              <div
                                key={idx}
                                className="min-w-0 rounded border border-gray-200 bg-gray-50 px-2 py-1.5"
                              >
                                <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-500">
                                  {row.label}
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium text-gray-800 leading-3.5 break-words line-clamp-2">
                                  {row.value || "-"}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAssignment(item);
                              }}
                              className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssignments(assignments.filter((a) => a.id !== item.id));
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Column Permissions */}
            <div className="w-1/2 bg-white rounded border border-gray-200 shadow-sm flex flex-col overflow-hidden w-[60%]">
              <div className="px-5 py-1 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between flex-shrink-0">
                <div className="min-w-0">
                  <h4 className="text-[11px] font-semibold text-gray-800 uppercase tracking-[0.18em]">
                    Column Permissions
                  </h4>

                  {selectedAssignment && (
                    <p className="mt-1 text-xs font-medium text-gray-600 truncate">
                      {selectedAssignment.dataidLabel || selectedAssignment.dataid || "-"}
                    </p>
                  )}
                  {!selectedAssignment && (
                    <p className="mt-1 text-xs text-gray-400">
                      Select an assignment
                    </p>
                  )}
                </div>

                <div className="flex-1 ml-8">
                  <label className="block text-[10px] font-medium mb-0.5 text-gray-800">
                    Select Database
                  </label>
                  <select
                    className="w-48 max-w-xs px-3 py-1.5 border border-gray-200 rounded text-xs font-medium bg-white text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    value={selectedColumnDB}
                    onChange={(e) => setSelectedColumnDB(e.target.value)}
                  >
                    <option value="">Select Database</option>
                    {columnTableOptions.map((item) => (
                      <option
                        key={item.table_name}
                        value={normalizeTableName(item.table_name)}
                      >
                        {item.label || item.table_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveUserAssignments}
                  className="p-1.5 text-white mr-2 bg-green-600 rounded hover:bg-green-800 transition-colors shadow-sm cursor-pointer"
                  title="Save All"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Save size={18} />
                    <p>Save</p>
                  </span>
                </button>

                <button
                  className="px-3 py-1.5 flex items-center gap-2 rounded border border-gray-200 bg-yellow-600 text-white text-[16px] hover:bg-black transition-all shadow-sm"
                  onClick={() => {
                    const resetPermissions: Record<
                      string,
                      { view: boolean; mask: boolean; edit: boolean; copy: boolean }
                    > = {};
                    tableColumns.forEach((col) => {
                      resetPermissions[col] = { view: false, mask: false, edit: false, copy: false };
                    });
                    setColumnPermissions(resetPermissions);
                    if (selectedAssignmentId !== null) {
                      setAssignments((prev) =>
                        prev.map((item) =>
                          item.id === selectedAssignmentId
                            ? { ...item, selectedColumnDB, columnPermissions: resetPermissions }
                            : item
                        )
                      );
                    }
                  }}
                >
                  <RotateCcw size={14} />
                  Default
                </button>

                {loadingColumns && (
                  <div className="text-[11px] font-medium text-blue-600 whitespace-nowrap animate-pulse">
                    Loading...
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!selectedColumnDB ? (
                  <div className="text-center py-16 bg-gray-50/60 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded bg-white border border-gray-200 shadow-sm mb-3">
                      <Shield className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Select Database</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Choose a database to configure column permissions
                    </p>
                  </div>
                ) : loadingColumns ? (
                  <div className="text-center py-16 bg-gray-50/60 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Loading Columns...</p>
                    <p className="text-[11px] text-gray-500 mt-1">Please wait while we fetch table columns</p>
                  </div>
                ) : tableColumns.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50/60 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm mb-3">
                      <Database className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">No Columns Found</p>
                    <p className="text-[11px] text-gray-500 mt-1">This table has no columns or is empty</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-t border-gray-200">
                      <div className="px-5 py-2.5 grid grid-cols-2 gap-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-1 text-left pl-2">Column Name</div>
                          <div className="col-span-3 grid grid-cols-3 text-center">
                            <span>View</span>
                            <span>Mask</span>
                            <span>Edit</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-1 text-left pl-2">Column Name</div>
                          <div className="col-span-3 grid grid-cols-3 text-center">
                            <span>View</span>
                            <span>Mask</span>
                            <span>Edit</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {Array.from({ length: Math.ceil(tableColumns.length / 2) }).map((_, rowIndex) => {
                        const firstCol = tableColumns[rowIndex * 2];
                        const secondCol = tableColumns[rowIndex * 2 + 1];
                        return (
                          <div
                            key={rowIndex}
                            className="px-5 py-2.5 grid grid-cols-2 gap-4 hover:bg-blue-50/30 transition-colors"
                          >
                            {firstCol && (
                              <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-1 pl-2 flex items-center">
                                  <span className="text-[11px] font-medium text-gray-700 uppercase leading-4 break-words">
                                    {firstCol.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <div className="col-span-3 grid grid-cols-3 items-center justify-items-center">
                                  <div className="flex items-center justify-center w-full">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[firstCol]?.view || false}
                                      onChange={() => handlePermissionToggle(firstCol, "view")}
                                    />
                                  </div>
                                  <div className="flex items-center justify-center w-full">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[firstCol]?.mask || false}
                                      onChange={() => handlePermissionToggle(firstCol, "mask")}
                                    />
                                  </div>
                                  <div className="flex items-center justify-center w-full">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[firstCol]?.edit || false}
                                      onChange={() => handlePermissionToggle(firstCol, "edit")}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {secondCol ? (
                              <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-1 pl-2 flex items-center">
                                  <span className="text-[11px] font-medium text-gray-700 uppercase leading-4 break-words">
                                    {secondCol.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <div className="col-span-3 grid grid-cols-3 items-center justify-items-center">
                                  <div className="flex items-center justify-center w-full">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[secondCol]?.view || false}
                                      onChange={() => handlePermissionToggle(secondCol, "view")}
                                    />
                                  </div>
                                  <div className="flex items-center justify-center w-full">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[secondCol]?.mask || false}
                                      onChange={() => handlePermissionToggle(secondCol, "mask")}
                                    />
                                  </div>
                                  <div className="flex items-center justify-center w-full">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[secondCol]?.edit || false}
                                      onChange={() => handlePermissionToggle(secondCol, "edit")}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-1 pl-2">
                                  <span className="text-[11px] font-medium text-gray-700 opacity-0">Empty</span>
                                </div>
                                <div className="col-span-3 grid grid-cols-3 items-center justify-items-center">
                                  <div></div>
                                  <div></div>
                                  <div></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <style jsx>{`
          .grid-cols-2 {
            position: relative;
          }
          .grid-cols-2 > :first-child {
            position: relative;
          }
          .grid-cols-2 > :first-child::after {
            content: "";
            position: absolute;
            right: -8px;
            top: 0;
            height: 100%;
            width: 1px;
            background-color: #e5e7eb;
          }
        `}</style>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teams Management Tab */}
      {activeTab === "teams" && (
        <div className="px-6 mt-3 pb-2">
          <div className="bg-white rounded shadow-lg border w-full h-[calc(100vh-165px)] flex flex-col overflow-hidden">
            <div className="p-6 flex items-start justify-between border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <Users size={24} strokeWidth={2.5} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xl font-bold text-gray-800 tracking-tight">Team Management</h3>
                  <div className="flex items-center gap-4 text-[13px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      Parent: <span className="text-gray-700 font-semibold">
                        {capitalizeFirstLetter(user?.username)}
                        <span className="text-blue-600"> ({user?.role})</span>
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-700">{user?.mobile_no}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-gray-400" />
                      Total Members: <span className="text-gray-700 font-semibold">0</span>
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>


            <div className="px-8 py-5 bg-gray-50/30 flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Login Role
                </label>
                <div className="relative">
                  <select
                    value={teamRole}
                    onChange={(e) => {
                      setTeamRole(e.target.value);
                      setTeamUser("");
                    }}
                    className="w-full h-11 px-4 pr-10 border border-gray-200 rounded text-[13px] font-semibold text-gray-800 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer"
                  >
                    <option value="">All Roles</option>

                    {teamRoles.map((role: any) => (
                      <option key={role.id} value={String(role.id)}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1 min-w-[220px] space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded text-[13px] font-medium text-gray-800 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[240px] space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Select User
                </label>
                <div className="relative">
                  <select
                    value={teamUser}
                    onChange={(e) => setTeamUser(e.target.value)}
                    className="w-full h-11 px-4 pr-10 border border-gray-200 rounded text-[13px] font-semibold text-gray-800 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer"
                  >
                    <option value="">Select User</option>

                    {teamUsers.map((member: any) => (
                      <option key={member.id} value={String(member.id)}>
                        {`${capitalizeFirstLetter(member.username || member.name || "")} (${member.role || "-"})`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!teamUser) {
                    alert("Please select user");
                    return;
                  }

                  const res = await addParentChildApi({
                    parent_user_id: userId,
                    child_user_id: Number(teamUser),
                    role: teamRole || "",
                  });

                  if (res?.success) {
                    alert(res?.message || "Member added successfully");

                    const refreshRes = await getUsersRolesApi({
                      search: teamSearch || "",
                      role: teamRole || "",
                      limit: 50,
                    });

                    if (refreshRes?.success) {
                      setTeamRoles(Array.isArray(refreshRes?.data?.roles) ? refreshRes.data.roles : []);
                      setTeamUsers(Array.isArray(refreshRes?.data?.users) ? refreshRes.data.users : []);
                    }
                  } else {
                    alert(res?.message || "Failed to add member");
                  }
                }}
                className="h-11 px-6 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[14px] shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-w-[160px]"
              >
                <UserPlus size={18} /> Add Member
              </button>
            </div>


            <div className="px-8 py-10 flex-1">
              <div className="min-h-[220px] border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-4 bg-gray-50/20">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm border border-gray-100">
                  <Users size={32} strokeWidth={1.5} />
                </div>
                <p className="text-[15px] font-bold text-gray-400 tracking-wide">No members yet</p>
              </div>
            </div>
            <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-end">
              <button className="px-8 py-2.5 text-[14px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded transition-all shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Tab */}
      {activeTab === "coming_soon" && (
        <div className="px-6 mt-4 pb-6">
          <div className="bg-white rounded shadow border w-full flex flex-col p-6 items-center justify-center min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-600">Coming Soon</h3>
            <p className="text-gray-400 mt-2">Future features will appear here.</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 10px; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `
      }} />
    </div>
  );
};

export default TBOUsersSetting;
