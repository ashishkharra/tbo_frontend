"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Home,
  Settings,
  ChevronDown,
  Check,
  Copy,
  X,
  ChevronRight,
  Shield,
  Database,
  RotateCcw,
  Save,
  UserPlus,
  Search,
  Users,
  Phone,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  getPermissionModulesApi,
  getTableColumns,
  getUserPermissions,
  UserPermissionsAssign,
  getDataIdAllRow
} from "@/apis/api";
import { apiService } from "@/services/api";

interface SubMenu {
  id: string;
  title: string;
}

interface MenuItem {
  id: string;
  title: string;
  isDropdown?: boolean;
  subMenus?: SubMenu[];
}

interface Module {
  module_id: string;
  module_name: string;
  icon: string;
  menus: MenuItem[];
}

// API response interfaces
interface ApiAction {
  id: number;
  name: string;
  code: string;
  sort_order: number;
}

interface ApiModule {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  level_no: number;
  sort_order: number;
  icon: string | null;
  route_path: string | null;
}

// Map icon strings to emoji/icons
const getIconForModule = (
  iconName: string | null,
  moduleName: string
): string => {
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

  if (iconName && iconMap[iconName]) {
    return iconMap[iconName];
  }

  // Default icons based on name
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

const TBOUsersSetting = () => {
  const params = useParams();
  const userId = params?.id ? Number(params.id) : null;
  const [activeTab, setActiveTab] = useState("module_permissions");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [assignedModules, setAssignedModules] = useState<string[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [actions, setActions] = useState<ApiAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for permissions (item_id -> array of strings)
  const [permissionsState, setPermissionsState] = useState<
    Record<string, string[]>
  >({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [moduleCodeMap, setModuleCodeMap] = useState<Record<number, string>>({});

  // Raw permissions from API (stored separately until module tree is ready)
  const [rawPermissions, setRawPermissions] = useState<any[] | null>(null);

  // States for Data Assign tab
  const [isAddingData, setIsAddingData] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  interface DataAssignFormData {
    dbSelect: string;
    wiseType: string;
    dataid: string;
    block: string;
    gp: string;
    gram: string;
    ac: string;
    bhag: string;
    section: string;
    mandal: string;
    kendra: string;
    district: string;
    ageFrom: string;
    ageTo: string;
    cast: string;
    check1: boolean;
    check2: boolean;
  }

  const [formData, setFormData] = useState<DataAssignFormData>({
    dbSelect: "",
    wiseType: "",
    dataid: "",
    block: "",
    gp: "",
    gram: "",
    ac: "",
    bhag: "",
    section: "",
    mandal: "",
    kendra: "",
    district: "",
    ageFrom: "",
    ageTo: "",
    cast: "",
    check1: false,
    check2: false,
  });

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

  // Fetch Data IDs when the Data Assign tab is active
  useEffect(() => {
    if (activeTab === "data_assign") {
      const fetchDataIds = async () => {
        try {
          const response = await getDataIdAllRow();
          if (response.success && response.data) {
            setDataIdOptions(response.data);
          }
        } catch (error) {
          console.error("Error fetching data IDs:", error);
        }
      };
      fetchDataIds();
    }
  }, [activeTab]);

  // Fetch Hierarchical Master Options (Blocks, ACs) when Data ID changes
  useEffect(() => {
    const fetchMasterOptions = async () => {
      if (formData.dataid && ["block", "gp_ward", "gram", "bhag", "section", "mandal", "kendra"].includes(formData.wiseType)) {
        setLoadingDataOptions(true);
        try {
          const selectedData = dataIdOptions.find(d => d.data_id === formData.dataid);
          const district = selectedData?.district || "";

          const response = await apiService.fetchLiveVoterListMasterFilterOptions({
            dataId: formData.dataid,
            district: district
          });

          if (response) {
            setBlockOptions(response.blockOptions?.map(b => ({ id: b, name: b })) || []);
            setAcOptions(response.assemblyOptions?.map(a => ({ id: a, name: a })) || []);
          }
        } catch (error) {
          console.error("Error fetching master options:", error);
        } finally {
          setLoadingDataOptions(false);
        }
      } else {
        setBlockOptions([]);
        setAcOptions([]);
      }
    };
    fetchMasterOptions();
  }, [formData.dataid, formData.wiseType, dataIdOptions]);

  // Fetch GPs based on Block
  useEffect(() => {
    const fetchGPs = async () => {
      if (formData.block && ["gp_ward", "gram"].includes(formData.wiseType)) {
        try {
          const selectedData = dataIdOptions.find(d => d.data_id === formData.dataid);
          const response = await apiService.getLiveVoterListFilterOptions({
            block: formData.block,
            district: selectedData?.district || ""
          });
          setGpOptions(response.gps || []);
        } catch (error) {
          console.error("Error fetching GPs:", error);
        }
      } else {
        setGpOptions([]);
      }
    };
    fetchGPs();
  }, [formData.block, formData.wiseType, formData.dataid, dataIdOptions]);

  // Fetch Grams based on GP
  useEffect(() => {
    const fetchGrams = async () => {
      if (formData.gp && formData.wiseType === "gram") {
        try {
          const selectedData = dataIdOptions.find(d => d.data_id === formData.dataid);
          const response = await apiService.getLiveVoterListFilterOptions({
            gp: formData.gp,
            block: formData.block,
            district: selectedData?.district || ""
          });
          setGramOptions(response.grams || []);
        } catch (error) {
          console.error("Error fetching grams:", error);
        }
      } else {
        setGramOptions([]);
      }
    };
    fetchGrams();
  }, [formData.gp, formData.wiseType, formData.block, formData.dataid, dataIdOptions]);

  // Fetch Mandals based on AC
  useEffect(() => {
    const fetchMandals = async () => {
      if (formData.ac && ["mandal", "kendra"].includes(formData.wiseType)) {
        try {
          const res = await apiService.fetchLiveVoterListMasterFilterOptions({
            assembly: formData.ac
          });
          setMandalOptions(res.mandalOptions?.map(m => ({ id: m, name: m })) || []);
        } catch (error) {
          console.error("Error fetching mandals:", error);
        }
      } else {
        setMandalOptions([]);
      }
    };
    fetchMandals();
  }, [formData.ac, formData.wiseType]);

  // Fetch Kendras based on Mandal
  useEffect(() => {
    const fetchKendras = async () => {
      if (formData.mandal && formData.wiseType === "kendra") {
        try {
          const res = await apiService.fetchLiveVoterListMasterFilterOptions({
            assembly: formData.ac,
            mandal: formData.mandal
          });
          setKendraOptions(res.kendraOptions?.map(k => ({ id: k, name: k })) || []);
        } catch (error) {
          console.error("Error fetching kendras:", error);
        }
      } else {
        setKendraOptions([]);
      }
    };
    fetchKendras();
  }, [formData.mandal, formData.wiseType, formData.ac]);

  // Fetch Bhags based on AC
  useEffect(() => {
    const fetchBhags = async () => {
      if (formData.ac && ["bhag", "section"].includes(formData.wiseType)) {
        try {
          const response = await apiService.getLiveVoterListFilterOptions({
            assembly: formData.ac
          });
          setBhagOptions(response.bhagNos || []);
        } catch (error) {
          console.error("Error fetching bhags:", error);
        }
      } else {
        setBhagOptions([]);
      }
    };
    fetchBhags();
  }, [formData.ac, formData.wiseType]);

  // Fetch Sections based on Bhag
  useEffect(() => {
    const fetchSections = async () => {
      if (formData.bhag && formData.wiseType === "section") {
        try {
          const response = await apiService.getLiveVoterListFilterOptions({
            assembly: formData.ac,
            bhagNo: formData.bhag
          });
          setSectionOptions(response.sectionNos || []);
        } catch (error) {
          console.error("Error fetching sections:", error);
        }
      } else {
        setSectionOptions([]);
      }
    };
    fetchSections();
  }, [formData.bhag, formData.wiseType, formData.ac]);

  // States for Column Permissions tab
  const [selectedColumnDB, setSelectedColumnDB] = useState("");
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [columnPermissions, setColumnPermissions] = useState<
    Record<
      string,
      { view: boolean; mask: boolean; edit: boolean; copy: boolean }
    >
  >({});

  const mockColumns = [
    "Voter ID",
    "Name",
    "Age",
    "Gender",
    "Relation Name",
    "House No",
    "Section Name",
    "Assembly Name",
    "District",
    "Parliament",
    "Cast",
    "Profession",
  ];

  // Fetch modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await getPermissionModulesApi();
        console.log("mmmm", response)
        if (response.success && response.data) {
          const { modules: apiModules, actions: apiActions } = response.data;

          // Store actions
          setActions(apiActions);

          const codeMap: Record<number, string> = {};
          apiModules.forEach((mod: ApiModule) => {
            codeMap[mod.id] = mod.code;
          });
          setModuleCodeMap(codeMap);

          // Build hierarchical structure
          const moduleMap = new Map<number, ApiModule>();
          apiModules.forEach((mod: ApiModule) => moduleMap.set(mod.id, mod));

          // Group by parent_id
          const childrenMap = new Map<number | null, ApiModule[]>();
          apiModules.forEach((mod: ApiModule) => {
            const parentId = mod.parent_id;
            if (!childrenMap.has(parentId)) {
              childrenMap.set(parentId, []);
            }
            childrenMap.get(parentId)!.push(mod);
          });

          // Sort by sort_order
          const sortModules = (mods: ApiModule[]) => {
            return mods.sort((a, b) => a.sort_order - b.sort_order);
          };

          // Get root modules (parent_id is null)
          const rootModules = sortModules(childrenMap.get(null) || []);

          // Build the tree structure
          const buildModuleTree = (parentId: number | null): any[] => {
            const modules = sortModules(childrenMap.get(parentId) || []);

            return modules.map((mod) => {
              const children = buildModuleTree(mod.id);

              if (mod.level_no === 3) {
                // This is a sub-menu item (deep nested)
                return {
                  id: `m${mod.id}`,
                  title: mod.name,
                };
              } else if (mod.level_no === 2) {
                // This is a menu item
                const subMenus = children.map((child) => ({
                  id: child.id,
                  title: child.title,
                }));

                return {
                  id: `m${mod.id}`,
                  title: mod.name,
                  isDropdown: subMenus.length > 0,
                  subMenus: subMenus.length > 0 ? subMenus : undefined,
                };
              } else {
                // This is a module (level 1)
                return {
                  module_id: `m${mod.id}`,
                  module_name: mod.name,
                  icon: getIconForModule(mod.icon, mod.name),
                  menus: children,
                };
              }
            });
          };

          const structuredModules = buildModuleTree(null);

          // Filter out modules (they should be at root level)
          const finalModules = structuredModules.filter(
            (item) => item.module_id
          );

          setModules(finalModules);

          // Set initial expanded state for modules with children
          const initialExpanded = new Set<string>();
          finalModules.forEach((module) => {
            if (module.menus && module.menus.length > 0) {
              initialExpanded.add(module.module_id);

              // Expand dropdown menus that have submenus
              module.menus.forEach((menu: any) => {
                if (
                  menu.isDropdown &&
                  menu.subMenus &&
                  menu.subMenus.length > 0
                ) {
                  initialExpanded.add(menu.id);
                }
              });
            }
          });
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
  // Fetch raw permissions from API whenever userId changes
  useEffect(() => {
    if (!userId) return;

    const fetchGetUserPermissions = async () => {
      const res = await getUserPermissions(userId);
      if (res?.success && Array.isArray(res?.data?.permissions)) {
        setRawPermissions(res.data.permissions);
      }
    };

    fetchGetUserPermissions();
  }, [userId]);

  // Map raw permissions onto the module tree once both are ready
  useEffect(() => {
    if (!rawPermissions || modules.length === 0) return;

    // Build a map: module_id -> set of action codes
    const moduleActionMap: Record<number, Set<string>> = {};
    rawPermissions.forEach((p: any) => {
      if (!moduleActionMap[p.module_id]) {
        moduleActionMap[p.module_id] = new Set();
      }
      if (p.action_code) {
        moduleActionMap[p.module_id].add(p.action_code);
      }
    });

    // Collect all unique module_ids that have at least one permission
    const permittedModuleIds = new Set(
      rawPermissions.map((p: any) => p.module_id)
    );

    const newAssigned: string[] = [];
    const newPermissions: Record<string, string[]> = {};

    modules.forEach((mod) => {
      mod.menus?.forEach((menu: any) => {
        const menuRawId = Number(menu.id.replace('m', ''));
        if (menu.isDropdown && menu.subMenus) {
          menu.subMenus.forEach((sub: any) => {
            const subRawId = Number(sub.id.replace('m', ''));
            const compositeKey = `${mod.module_id}_${menu.id}_${sub.id}`;
            if (permittedModuleIds.has(subRawId)) {
              newAssigned.push(compositeKey);
              const acts = moduleActionMap[subRawId];
              if (acts) newPermissions[compositeKey] = Array.from(acts);
            }
          });
        } else {
          const compositeKey = `${mod.module_id}_${menu.id}`;
          if (permittedModuleIds.has(menuRawId)) {
            newAssigned.push(compositeKey);
            const acts = moduleActionMap[menuRawId];
            if (acts) newPermissions[compositeKey] = Array.from(acts);
          }
        }
      });
    });

    setAssignedModules(newAssigned);
    setPermissionsState(newPermissions);
  }, [rawPermissions, modules]);

  useEffect(() => {
    const fetchTableColumns = async () => {
      if (!selectedColumnDB) {
        setTableColumns([]);
        return;
      }

      try {
        setLoadingColumns(true);
        const res = await getTableColumns(selectedColumnDB);
        console.log(`Fetched columns for ${selectedColumnDB}:`, res);

        if (res.success && res.data) {
          // Extract column names from the response
          const columns = res.data.map((item: any) => item.column_name);
          setTableColumns(columns);
        } else {
          // If API fails, use mock data as fallback
          console.log("Using mock columns as fallback");
          setTableColumns(mockColumns);
        }
      } catch (err) {
        console.error("Error fetching columns:", err);
        // Fallback to mock columns on error
        setTableColumns(mockColumns);
      } finally {
        setLoadingColumns(false);
      }
    };

    fetchTableColumns();
  }, [selectedColumnDB]);

  const handleAddAssignment = () => {
    if (!formData.dbSelect || !formData.wiseType) return;
    setAssignments([...assignments, { ...formData, id: Date.now() }]);
    setIsAddingData(false);
    setFormData({
      dbSelect: "",
      wiseType: "",
      dataid: "",
      block: "",
      gp: "",
      gram: "",
      ac: "",
      bhag: "",
      section: "",
      mandal: "",
      kendra: "",
      district: "",
      ageFrom: "",
      ageTo: "",
      cast: "",
      check1: false,
      check2: false,
    });
  };

  const handlePermissionToggle = (
    col: string,
    perm: "view" | "mask" | "edit" | "copy"
  ) => {
    setColumnPermissions((prev) => ({
      ...prev,
      [col]: {
        ...(prev[col] || {
          view: false,
          mask: false,
          edit: false,
          copy: false,
        }),
        [perm]: !(prev[col]?.[perm] || false),
      },
    }));
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expandedModules);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedModules(next);
  };

  const toggleAssign = (id: string, checked: boolean) => {
    if (checked) setAssignedModules([...assignedModules, id]);
    else setAssignedModules(assignedModules.filter((mId) => mId !== id));
  };

  const togglePermission = (
    itemId: string,
    permId: string,
    checked: boolean
  ) => {
    setPermissionsState((prev) => {
      const current = prev[itemId] || [];
      const updated = checked
        ? [...current, permId]
        : current.filter((p) => p !== permId);
      return { ...prev, [itemId]: updated };
    });
  };

  const handleSavePermissions = async () => {
    if (!userId) return;
    try {
      setIsSavingPermissions(true);

      const modulesPayload: any[] = [];

      assignedModules.forEach((assignedKey) => {
        const parts = assignedKey.split('_');
        const lastPart = parts[parts.length - 1];
        const rawId = Number(lastPart.replace('m', ''));

        const module_code = moduleCodeMap[rawId];

        console.log(`Processing: assignedKey=${assignedKey}, rawId=${rawId}, module_code=${module_code}`);

        if (!module_code) {
          console.warn(`No module code found for rawId: ${rawId}`);
          return;
        }

        const actions = permissionsState[assignedKey] || [];

        console.log(`Actions for ${module_code}:`, actions);

        if (actions.length > 0) {
          modulesPayload.push({
            module_code,
            actions
          });
        }
      });

      console.log("Final modules payload:", modulesPayload);

      const payload = {
        user_id: Number(userId),
        modules: modulesPayload
      };

      const res = await UserPermissionsAssign(payload);
      if (res?.success || res?.message?.toLowerCase().includes("success") || res?.message === undefined) {
        alert("Permissions saved successfully!");
      } else {
        alert(res?.message || "Failed to save permissions.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving permissions.");
    } finally {
      setIsSavingPermissions(false);
    }
  };

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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="px-6 py-2">
        <div className="bg-white rounded-xl shadow-sm border px-6 py-2">
          <div className="grid grid-cols-3 items-center">
            {/* Left: Home Icon */}
            <div className="flex justify-start">
              <div className="text-gray-600 hover:text-blue-600 cursor-pointer p-1.5 bg-gray-50 rounded-lg transition-colors">
                <Link href="/">
                  <Home size={20} />
                </Link>
              </div>
            </div>

            {/* Center: Dropdown Menus */}
            <div className="flex items-center justify-center gap-3">
              <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 outline-none bg-white font-medium">
                <option value="all">All Roles</option>
              </select>
              <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 outline-none bg-white font-medium">
                <option value="all">All Parents</option>
              </select>
              <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 outline-none bg-white font-medium">
                <option value="all">All Users</option>
              </select>
              <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 outline-none bg-white font-medium">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Right: Empty for Balance */}
            <div className="working-empty"></div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-4 px-6 overflow-x-auto no-scrollbar">
          <div
            onClick={() => setActiveTab("module_permissions")}
            className={`px-4 py-1 text-[13px] font-medium rounded whitespace-nowrap shadow-sm cursor-pointer ${activeTab === "module_permissions"
              ? "text-white bg-black"
              : "text-white bg-gray-700 hover:bg-gray-800"
              }`}
          >
            Module & Permissions
          </div>
          <div
            onClick={() => setActiveTab("data_assign")}
            className={`px-4 py-1 text-[13px] font-medium rounded whitespace-nowrap shadow-sm cursor-pointer ${activeTab === "data_assign"
              ? "text-white bg-black"
              : "text-white bg-gray-700 hover:bg-gray-800"
              }`}
          >
            Data Assign & Column Permission
          </div>
          <div
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-1 text-[13px] font-medium rounded whitespace-nowrap shadow-sm cursor-pointer ${activeTab === "teams"
              ? "text-white bg-black"
              : "text-white bg-gray-700 hover:bg-gray-800"
              }`}
          >
            Teams Management
          </div>
          <div
            onClick={() => setActiveTab("coming_soon")}
            className={`px-4 py-1 text-[13px] font-medium rounded whitespace-nowrap shadow-sm cursor-pointer ${activeTab === "coming_soon"
              ? "text-white bg-black"
              : "text-white bg-gray-700 hover:bg-gray-800"
              }`}
          >
            Coming Soon
          </div>
        </div>
      </div>

      {activeTab === "module_permissions" && (
        <div className="px-6 mt-3 pb-2">
          <div className="bg-white rounded-xl shadow-lg border w-full h-[calc(100vh-165px)] flex flex-col overflow-hidden uppercase">
            {/* Fixed Table Header */}
            <div className="px-6 py-3 border-b bg-gray-50 flex items-center flex-shrink-0">
              <div className="w-[30%] min-w-[200px]">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Modules / Menus
                </h4>
              </div>
              <div className="flex-1">
                {/* Header permissions removed as requested */}
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="bg-white">
                {modules.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-500">No modules found</p>
                  </div>
                ) : (
                  modules.map((m) => {
                    const isAssigned = assignedModules.includes(m.module_id);
                    const isExpanded = expandedModules.has(m.module_id);

                    return (
                      <div key={m.module_id} className="bg-white">
                        {/* Module Row */}
                        <div
                          className={`flex items-center px-6 py-2.5 border-b border-gray-100 transition-all cursor-pointer hover:bg-gray-50/50`}
                          onClick={(e) =>
                            m.menus.length > 0 && toggleExpand(m.module_id, e)
                          }
                        >
                          <div className="w-[30%] min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{m.icon}</span>
                              <span className="text-[13px] font-bold text-gray-800 uppercase">
                                {m.module_name}
                              </span>
                              {m.menus.length > 0 && (
                                <ChevronDown
                                  className={`w-4 h-4 text-blue-400 transition-transform ${isExpanded ? "" : "-rotate-90"
                                    }`}
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex-1"></div>
                        </div>

                        {/* Sub Menu Items Container */}
                        {isExpanded && m.menus.length > 0 && (
                          <div className="bg-gray-50/40 border-t border-gray-50">
                            {m.menus.map((menu: any) => {
                              const isMenuDropdown = menu.isDropdown;
                              const isMenuExpanded = expandedModules.has(
                                menu.id
                              );
                              const menuId = `${m.module_id}_${menu.id}`;
                              const isMenuAssigned =
                                assignedModules.includes(menuId);

                              return (
                                <React.Fragment key={menu.id}>
                                  <div
                                    className={`flex items-center px-6 py-2 border-b border-gray-100 transition-colors ${isMenuAssigned
                                      ? "bg-blue-50/10"
                                      : "hover:bg-gray-100/30"
                                      }`}
                                  >
                                    <div className="w-[30%] min-w-[200px] flex items-center gap-3 pl-6">
                                      {!isMenuDropdown && (
                                        <input
                                          type="checkbox"
                                          checked={isMenuAssigned}
                                          onChange={(e) =>
                                            toggleAssign(
                                              menuId,
                                              e.target.checked
                                            )
                                          }
                                          className="h-3.5 w-3.5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                        />
                                      )}
                                      <div
                                        className={`flex items-center gap-2 cursor-pointer ${isMenuDropdown
                                          ? "font-bold text-gray-800"
                                          : "text-gray-600 font-semibold"
                                          }`}
                                        onClick={(e) =>
                                          isMenuDropdown &&
                                          toggleExpand(menu.id, e)
                                        }
                                      >
                                        <span className="text-[12px]">
                                          {menu.title}
                                        </span>
                                        {isMenuDropdown && (
                                          <ChevronDown
                                            className={`w-4 h-4 text-blue-400 transition-transform ${isMenuExpanded ? "" : "-rotate-90"
                                              }`}
                                          />
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex justify-between w-full">
                                      {!isMenuDropdown &&
                                        actions.map((perm) => (
                                          <div
                                            key={perm.id}
                                            className="flex items-center gap-2"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={(
                                                permissionsState[menuId] || []
                                              ).includes(perm.code)}
                                              onChange={(e) =>
                                                togglePermission(
                                                  menuId,
                                                  perm.code,
                                                  e.target.checked
                                                )
                                              }
                                              className="h-3.5 w-3.5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">
                                              {perm.name}
                                            </span>
                                          </div>
                                        ))}
                                      {isMenuDropdown && (
                                        <div className="col-span-6"></div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Deep Nested Sub Menus (like for Master) */}
                                  {isMenuDropdown &&
                                    isMenuExpanded &&
                                    menu.subMenus && (
                                      <div className="bg-gray-100/20">
                                        {menu.subMenus.map((subMenu: any) => {
                                          const subMenuId = `${m.module_id}_${menu.id}_${subMenu.id}`;
                                          const isSubMenuAssigned =
                                            assignedModules.includes(subMenuId);
                                          return (
                                            <div
                                              key={subMenu.id}
                                              className={`flex items-center px-6 py-1 border-b border-gray-100 transition-colors ${isSubMenuAssigned
                                                ? "bg-blue-50/5"
                                                : "hover:bg-gray-100/20"
                                                }`}
                                            >
                                              <div className="w-[30%] min-w-[200px] flex items-center gap-3 pl-12">
                                                <input
                                                  type="checkbox"
                                                  checked={isSubMenuAssigned}
                                                  onChange={(e) =>
                                                    toggleAssign(
                                                      subMenuId,
                                                      e.target.checked
                                                    )
                                                  }
                                                  className="h-3.5 w-3.5 text-blue-400 rounded border-gray-300 focus:ring-blue-400 cursor-pointer"
                                                />
                                                <span className="text-[11px] text-gray-500 font-semibold">
                                                  {subMenu.title}
                                                </span>
                                              </div>
                                              <div className="flex justify-between w-full">
                                                {actions.map(
                                                  (perm) => (
                                                    <div
                                                      key={perm.id}
                                                      className="flex items-center gap-2"
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        checked={(
                                                          permissionsState[
                                                          subMenuId
                                                          ] || []
                                                        ).includes(perm.code)}
                                                        onChange={(e) =>
                                                          togglePermission(
                                                            subMenuId,
                                                            perm.code,
                                                            e.target.checked
                                                          )
                                                        }
                                                        className="h-3 w-3 text-blue-400 rounded border-gray-300 focus:ring-blue-400 cursor-pointer"
                                                      />
                                                      <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">
                                                        {perm.name}
                                                      </span>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="py-2.5 px-6 border-t bg-white flex items-center justify-end flex-shrink-0 gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button className="px-6 py-1.5 text-[14px] font-bold text-white bg-[#405169] hover:bg-[#344458] shadow-sm rounded-lg transition-all flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Default
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={isSavingPermissions}
                className="px-6 py-1.5 text-[14px] font-bold text-white bg-[#405169] hover:bg-[#344458] shadow-sm rounded-lg transition-all flex items-center gap-2 disabled:opacity-50">
                {isSavingPermissions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                {isSavingPermissions ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "data_assign" && (
        <div className="px-6 mt-3 pb-6">
          <div className="flex gap-6 h-[calc(100vh-165px)]">
            {/* Left Column: Data Assign */}
            <div className="w-1/2 bg-white rounded-xl shadow-lg border flex flex-col overflow-hidden uppercase w-[600px]">
              {/* Header */}
              <div className="px-6 py-3 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
                <h4 className="text-xs font-bold text-black uppercase tracking-widest">
                  Data Assign
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { }}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                    title="Save All"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => setIsAddingData(!isAddingData)}
                    className="px-2 py-1.4 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
                    title="Add New"
                  >
                    <span className="text-xl leading-none">+</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {isAddingData && (
                  <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 py-1 px-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-black">
                          DB SELECT
                        </label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                          value={formData.dbSelect}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dbSelect: e.target.value,
                            })
                          }
                        >
                          <option value="">Select DB</option>
                          <option value="dataset">Dataset</option>
                          <option value="voterlist">Voter List</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-black">
                          WISE TYPE
                        </label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                          value={formData.wiseType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              wiseType: e.target.value,
                              dataid: "",
                              block: "",
                              gp: "",
                              gram: "",
                              ac: "",
                              bhag: "",
                              section: "",
                              mandal: "",
                              kendra: "",
                              district: "",
                              ageFrom: "",
                              ageTo: "",
                              cast: "",
                            })
                          }
                        >
                          <option value="">Select Type</option>
                          <option value="district">District Wise</option>
                          <option value="ac">AC Wise</option>
                          <option value="pc">PC Wise</option>
                          <option value="dataid">DataId Wise</option>
                          <option value="partyjilla">Party Jilla Wise</option>
                          <option value="block">Block Wise</option>
                          <option value="gp_ward">GP ward Wise</option>
                          <option value="gram">Gram Wise</option>
                          <option value="mandal">Mandal Wise</option>
                          <option value="kendra">Kendra Wise</option>
                          <option value="section">Section Wise</option>
                          <option value="bhag">Bhag Wise</option>
                        </select>
                      </div>

                      {/* Hierarchical Fields */}
                      {["block", "gp_ward", "gram", "bhag", "section", "mandal", "kendra"].includes(formData.wiseType) && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black uppercase">Data ID</label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                            value={formData.dataid}
                            onChange={(e) => setFormData({
                              ...formData, dataid: e.target.value,
                              block: "", gp: "", gram: "", ac: "", bhag: "", section: "", mandal: "", kendra: ""
                            })}
                          >
                            <option value="">Select Data ID</option>
                            {dataIdOptions.map((opt) => (
                              <option key={opt.data_id} value={opt.data_id}>{opt.data_id} - {opt.ac_name || opt.district}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Block/AC selection */}
                      {["block", "gp_ward", "gram"].includes(formData.wiseType) && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black uppercase">Block</label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                            value={formData.block}
                            disabled={loadingDataOptions || !formData.dataid}
                            onChange={(e) => setFormData({ ...formData, block: e.target.value, gp: "", gram: "" })}
                          >
                            <option value="">{loadingDataOptions ? "Loading..." : "Select Block"}</option>
                            {blockOptions.map((opt) => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                          </select>
                        </div>
                      )}

                      {["bhag", "section", "mandal", "kendra"].includes(formData.wiseType) && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black uppercase">Assembly (AC)</label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                            value={formData.ac}
                            disabled={loadingDataOptions || !formData.dataid}
                            onChange={(e) => setFormData({ ...formData, ac: e.target.value, bhag: "", section: "", mandal: "", kendra: "" })}
                          >
                            <option value="">{loadingDataOptions ? "Loading..." : "Select AC"}</option>
                            {acOptions.map((opt) => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                          </select>
                        </div>
                      )}

                      {/* GP/Bhag/Mandal selection */}
                      {["gp_ward", "gram"].includes(formData.wiseType) && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black uppercase">GP / Ward</label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                            value={formData.gp}
                            disabled={!formData.block}
                            onChange={(e) => setFormData({ ...formData, gp: e.target.value, gram: "" })}
                          >
                            <option value="">Select GP</option>
                            {gpOptions.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      )}

                      {["bhag", "section"].includes(formData.wiseType) && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black uppercase">Bhag</label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                            value={formData.bhag}
                            disabled={!formData.ac}
                            onChange={(e) => setFormData({ ...formData, bhag: e.target.value, section: "" })}
                          >
                            <option value="">Select Bhag</option>
                            {bhagOptions.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      )}

                      {["mandal", "kendra"].includes(formData.wiseType) && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black uppercase">Mandal</label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                            value={formData.mandal}
                            disabled={!formData.ac}
                            onChange={(e) => setFormData({ ...formData, mandal: e.target.value, kendra: "" })}
                          >
                            <option value="">Select Mandal</option>
                            {mandalOptions.map((opt: any) => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                          </select>
                        </div>
                      )}

                      {/* Final hierarchical level (Gram/Section/Kendra) */}
                      {formData.wiseType === "gram" && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black uppercase">Village / Gram</label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                            value={formData.gram}
                            disabled={!formData.gp}
                            onChange={(e) => setFormData({ ...formData, gram: e.target.value })}
                          >
                            <option value="">Select Gram</option>
                            {gramOptions.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      )}

                      {formData.wiseType === "section" && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black uppercase">Section</label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                            value={formData.section}
                            disabled={!formData.bhag}
                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                          >
                            <option value="">Select Section</option>
                            {sectionOptions.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      )}

                      {formData.wiseType === "kendra" && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-black uppercase">Kendra</label>
                          <select
                            className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                            value={formData.kendra}
                            disabled={!formData.mandal}
                            onChange={(e) => setFormData({ ...formData, kendra: e.target.value })}
                          >
                            <option value="">Select Kendra</option>
                            {kendraOptions.map((opt: any) => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                          </select>
                        </div>
                      )}

                      {formData.wiseType === 'district' && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-black uppercase">District</label>
                            <select
                              className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                              value={formData.district}
                              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                            >
                              <option value="">Select District</option>
                              <option value="d1">District 1</option>
                              <option value="d2">District 2</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-4 gap-4 mt-4 items-end col-span-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-black uppercase">Age From</label>
                              <input
                                type="number"
                                placeholder="0"
                                className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                                value={formData.ageFrom}
                                onChange={(e) => setFormData({ ...formData, ageFrom: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-black uppercase">Age To</label>
                              <input
                                type="number"
                                placeholder="100"
                                className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                                value={formData.ageTo}
                                onChange={(e) => setFormData({ ...formData, ageTo: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-black uppercase">Cast</label>
                              <select
                                className="w-full px-3 py-2 border rounded-lg text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                                value={formData.cast}
                                onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                              >
                                <option value="">Select Cast</option>
                                <option value="c1">Cast A</option>
                                <option value="c2">Cast B</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="mt-5 flex justify-end">
                        <button
                          onClick={handleAddAssignment}
                          className="px-6 bg-blue-600 py-2 text-white text-[12px] font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 "
                        >
                          <Check size={14} /> Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of existing assignments */}
                <div className="space-y-3">
                  {assignments.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 rounded-xl border border-dashed flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-black mb-3">
                        <Settings size={24} />
                      </div>
                      <p className="text-sm font-bold text-black uppercase tracking-wider">
                        No assignments yet
                      </p>
                      <p className="text-[11px] text-black mt-1 uppercase">
                        Click the + button to add your first data assignment
                      </p>
                    </div>
                  ) : (
                    assignments.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group relative"
                      >
                        <div className="grid grid-cols-2 gap-y-3">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-black uppercase">
                              DB / Type
                            </span>
                            <span className="text-xs font-bold text-black capitalize">
                              {item.dbSelect} / {item.wiseType} Wise
                              {item.dataid && ` (${item.dataid})`}
                              {item.block && ` - ${item.block}`}
                              {item.ac && ` - ${item.ac}`}
                              {item.gp && ` - ${item.gp}`}
                              {item.gram && ` - ${item.gram}`}
                              {item.bhag && ` - Bhag ${item.bhag}`}
                              {item.section && ` - Sec ${item.section}`}
                              {item.mandal && ` - ${item.mandal}`}
                              {item.kendra && ` - ${item.kendra}`}
                              {item.wiseType === 'district' && (
                                <span className="block mt-0.5 text-[10px]">
                                  {item.district && `Dist: ${item.district}`}
                                  {item.ageFrom && ` | Age: ${item.ageFrom}-${item.ageTo || '100'}`}
                                  {item.cast && ` | Cast: ${item.cast}`}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-black uppercase">
                              District
                            </span>
                            <span className="text-xs font-bold text-black">
                              {item.district || "ALL"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-black uppercase">
                              Age Range
                            </span>
                            <span className="text-xs font-bold text-black">
                              {item.ageFrom || "0"} - {item.ageTo || "100"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-black uppercase">
                              Cast
                            </span>
                            <span className="text-xs font-bold text-black">
                              {item.cast || "ALL"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setAssignments(
                              assignments.filter((a) => a.id !== item.id)
                            )
                          }
                          className="absolute top-4 right-4 text-black hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {/* Right Column: Data Assign */}
            {/* Right Column: Column Permissions */}
            <div className="w-1/2 bg-white rounded-xl shadow-lg border flex flex-col overflow-hidden uppercase w-[60%]">
              <div className="px-6 py-3 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
                <h4 className="text-xs font-bold text-black uppercase tracking-widest text-center w-full">
                  Column Permissions
                </h4>
                {loadingColumns && (
                  <div className="text-xs text-blue-600 animate-pulse">
                    Loading...
                  </div>
                )}
              </div>

              <div className="bg-white border-b">
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <select
                      className="w-[50%] px-3 py-2 border rounded-lg text-xs font-bold bg-white text-black data-assign-input outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={selectedColumnDB}
                      onChange={(e) => setSelectedColumnDB(e.target.value)}
                    >
                      <option value="">Select Database</option>
                      <option value="eroll_db">eroll_db</option>
                      <option value="db_table">db_table</option>
                    </select>
                  </div>
                  <button
                    className="px-4 flex gap-1 py-2 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-gray-700 transition-all shadow-md"
                    onClick={() => {
                      // Reset all permissions for current table
                      const resetPermissions: Record<string, { view: boolean; mask: boolean; edit: boolean; copy: boolean }> = {};
                      tableColumns.forEach(col => {
                        resetPermissions[col] = { view: false, mask: false, edit: false, copy: false };
                      });
                      setColumnPermissions(resetPermissions);
                    }}
                  >
                    <RotateCcw size={16} /> Default
                  </button>
                  <button
                    className="px-4 flex gap-1 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md"
                    onClick={() => {
                      // Apply logic here
                      console.log("Applied permissions:", columnPermissions);
                    }}
                  >
                    <Check size={16} />
                    Apply
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!selectedColumnDB ? (
                  <div className="text-center py-20 bg-gray-50/50 flex flex-col items-center">
                    <Shield className="w-12 h-12 text-black mb-3" />
                    <p className="text-sm font-bold text-black uppercase tracking-wider">
                      Select Database
                    </p>
                    <p className="text-[11px] text-black mt-1 uppercase">
                      Choose a database to configure column permissions
                    </p>
                  </div>
                ) : loadingColumns ? (
                  <div className="text-center py-20 bg-gray-50/50 flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-sm font-bold text-black uppercase tracking-wider">
                      Loading Columns...
                    </p>
                    <p className="text-[11px] text-black mt-1 uppercase">
                      Please wait while we fetch table columns
                    </p>
                  </div>
                ) : tableColumns.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50/50 flex flex-col items-center">
                    <Database className="w-12 h-12 text-black mb-3" />
                    <p className="text-sm font-bold text-black uppercase tracking-wider">
                      No Columns Found
                    </p>
                    <p className="text-[11px] text-black mt-1 uppercase">
                      This table has no columns or is empty
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Table Header */}
                    <div className="sticky top-0 z-10 bg-white border-b border-t">
                      <div className="px-6 py-2 grid grid-cols-2 gap-4 text-[9px] font-bold text-black">
                        {/* First Column Header */}
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-1 text-left pl-2">
                            COLUMN NAME
                          </div>
                          <div className="col-span-3 grid grid-cols-3 text-center relative">
                            <span>VIEW</span>
                            <span className="relative">MASK</span>
                            <span className="relative">EDIT</span>
                          </div>
                        </div>

                        {/* Second Column Header */}
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-1 text-left pl-2">
                            COLUMN NAME
                          </div>
                          <div className="col-span-3 grid grid-cols-3 text-center relative">
                            <span>VIEW</span>
                            <span className="relative">MASK</span>
                            <span className="relative">EDIT</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table Body - Two columns per row */}
                    <div className="divide-y divide-gray-200">
                      {Array.from({
                        length: Math.ceil(tableColumns.length / 2),
                      }).map((_, rowIndex) => {
                        const firstCol = tableColumns[rowIndex * 2];
                        const secondCol = tableColumns[rowIndex * 2 + 1];

                        // Initialize permissions for new columns if not already set
                        if (firstCol && !columnPermissions[firstCol]) {
                          setColumnPermissions(prev => ({
                            ...prev,
                            [firstCol]: { view: false, mask: false, edit: false, copy: false }
                          }));
                        }
                        if (secondCol && !columnPermissions[secondCol]) {
                          setColumnPermissions(prev => ({
                            ...prev,
                            [secondCol]: { view: false, mask: false, edit: false, copy: false }
                          }));
                        }

                        return (
                          <div
                            key={rowIndex}
                            className="px-6 py-2 grid grid-cols-2 gap-4 hover:bg-gray-50/50 transition-colors"
                          >
                            {/* First Column in the row */}
                            {firstCol && (
                              <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-1 pl-2">
                                  <span className="text-[11px] font-bold text-black uppercase">
                                    {firstCol.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div className="col-span-3 grid grid-cols-3 items-center justify-items-center relative">
                                  <div className="flex items-center justify-center w-full">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[firstCol]?.view || false}
                                      onChange={() =>
                                        handlePermissionToggle(firstCol, "view")
                                      }
                                    />
                                  </div>
                                  <div className="flex items-center justify-center w-full relative">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[firstCol]?.mask || false}
                                      onChange={() =>
                                        handlePermissionToggle(firstCol, "mask")
                                      }
                                    />
                                  </div>
                                  <div className="flex items-center justify-center w-full relative">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[firstCol]?.edit || false}
                                      onChange={() =>
                                        handlePermissionToggle(firstCol, "edit")
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Second Column in the row */}
                            {secondCol ? (
                              <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-1 pl-2">
                                  <span className="text-[11px] font-bold text-black uppercase">
                                    {secondCol.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div className="col-span-3 grid grid-cols-3 items-center justify-items-center relative">
                                  <div className="flex items-center justify-center w-full">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[secondCol]?.view || false}
                                      onChange={() =>
                                        handlePermissionToggle(secondCol, "view")
                                      }
                                    />
                                  </div>
                                  <div className="flex items-center justify-center w-full relative">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[secondCol]?.mask || false}
                                      onChange={() =>
                                        handlePermissionToggle(secondCol, "mask")
                                      }
                                    />
                                  </div>
                                  <div className="flex items-center justify-center w-full relative">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={columnPermissions[secondCol]?.edit || false}
                                      onChange={() =>
                                        handlePermissionToggle(secondCol, "edit")
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Empty second column placeholder for odd number of columns
                              <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-1 pl-2">
                                  <span className="text-[11px] font-bold text-black opacity-0">
                                    Empty
                                  </span>
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

                    {/* Style for vertical divider between columns */}
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

      {activeTab === "teams" && (
        <div className="px-6 mt-3 pb-2">
          <div className="bg-white rounded-xl shadow-lg border w-full h-[calc(100vh-165px)] flex flex-col overflow-hidden">
            {/* Header Section */}
            <div className="p-6 flex items-start justify-between border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <Users size={24} strokeWidth={2.5} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xl font-bold text-gray-800 tracking-tight">
                    Team Management
                  </h3>
                  <div className="flex items-center gap-4 text-[13px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      Parent:{" "}
                      <span className="text-gray-700 font-semibold">
                        anuj (leader)
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-700">8877887788</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-gray-400" />
                      Total Members:{" "}
                      <span className="text-gray-700 font-semibold">0</span>
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Filter Section */}
            <div className="px-8 py-5 bg-gray-50/30 flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Login Role
                </label>
                <div className="relative">
                  <select className="w-full h-11 px-4 pr-10 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-800 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer">
                    <option value="admin">Admin</option>
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
                    placeholder="Search users..."
                    className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-800 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-[240px] space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Select User
                </label>
                <div className="relative">
                  <select className="w-full h-11 px-4 pr-10 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-800 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none transition-all cursor-pointer">
                    <option value="ganesh">GANESH (admin) - ga</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[14px] shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-w-[160px]">
                <UserPlus size={18} /> Add Member
              </button>
            </div>

            {/* Content Area */}
            <div className="px-8 py-10 flex-1">
              <div className="min-h-[220px] border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-4 bg-gray-50/20">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm border border-gray-100">
                  <Users size={32} strokeWidth={1.5} />
                </div>
                <p className="text-[15px] font-bold text-gray-400 tracking-wide">
                  No members yet
                </p>
              </div>
            </div>

            {/* Footer Section */}
            <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-end">
              <button className="px-8 py-2.5 text-[14px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "coming_soon" && (
        <div className="px-6 mt-4 pb-6">
          <div className="bg-white rounded-xl shadow border w-full flex flex-col p-6 items-center justify-center min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-600">Coming Soon</h3>
            <p className="text-gray-400 mt-2">
              Future features will appear here.
            </p>
          </div>
        </div>
      )}

      {/* Style for custom scrollbar */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 20px;
}
`,
        }}
      />
    </div>
  );
};

export default TBOUsersSetting;
