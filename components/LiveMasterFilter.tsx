"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Search,
  RefreshCw,
  LogOut,
  Power,
} from "lucide-react";
import { volterListMasterFilter, volterMasterFilterGo } from "@/apis/api";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | number | null)[];
  placeholder: string;
  label: string;
  disabled?: boolean;
  id: string;
  activeDropdown: string | null;
  onDropdownToggle: (id: string | null) => void;
}

interface MenuChildItem {
  label: string;
  path?: string;
  children?: MenuChildItem[];
}

interface MenuItem {
  id: string;
  label: string;
  path?: string;
  defaultPath?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: MenuChildItem[];
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
  disabled,
  id,
  activeDropdown,
  onDropdownToggle,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const isOpen = activeDropdown === id;

  const filteredOptions = options.filter((option) => {
    if (option === null || option === undefined) return false;
    return String(option).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggle = () => {
    if (!disabled) {
      onDropdownToggle(isOpen ? null : id);
      setSearchTerm("");
    }
  };

  const handleSelect = (option: string) => {
    onChange(option);
    onDropdownToggle(null);
    setSearchTerm("");
  };

  return (
    <div className="relative" data-dropdown-id={id}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-0.5">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-left flex items-center justify-between min-w-0"
        >
          <span
            className={`${value ? "text-gray-900" : "text-gray-500"
              } truncate flex-1 min-w-0`}
          >
            {value || placeholder}
          </span>

          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ml-1 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {isOpen && (
          <div className="absolute w-full bg-white rounded-lg shadow-2xl max-h-60 overflow-visible min-w-[160px] z-[99999] mt-1">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const optionStr = String(option);
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelect(optionStr)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${value === optionStr ? "bg-gray-200 font-semibold" : ""
                        }`}
                    >
                      {optionStr}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No matching options
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------- Custom Icons ------------------------- */

const ChevronRightIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const DashboardIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="5" rx="2" />
    <rect x="13" y="10" width="8" height="11" rx="2" />
    <rect x="3" y="13" width="8" height="8" rx="2" />
  </svg>
);

const VoterListIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </svg>
);

const MasterIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.07V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1-.33 1.7 1.7 0 0 0-1.08.39l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.07-.4H2.9a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.6-1.33 1.7 1.7 0 0 0-.39-1.08l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.07V2.9a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 1.33 1.6 1.7 1.7 0 0 0 1.08-.39l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c0 .38.12.74.33 1 .25.3.4.68.4 1.08V11a2 2 0 1 1 0 4h-.1c-.4 0-.78.15-1.07.4Z" />
  </svg>
);

const ImportExportIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M12 3v12" />
    <path d="M8 7l4-4 4 4" />
    <path d="M12 21V9" />
    <path d="M16 17l-4 4-4-4" />
  </svg>
);

const PrintIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M6 9V4h12v5" />
    <rect x="6" y="14" width="12" height="6" rx="2" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2h-2" />
  </svg>
);

const SettingsIconSvg = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3" />
    <path d="M12 19v3" />
    <path d="M4.93 4.93l2.12 2.12" />
    <path d="M16.95 16.95l2.12 2.12" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
    <path d="M4.93 19.07l2.12-2.12" />
    <path d="M16.95 7.05l2.12-2.12" />
  </svg>
);

const ReportIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h8" />
    <path d="M8 9h2" />
  </svg>
);

/* ------------------------- Quick Menu ------------------------- */

function FlyoutList({
  items,
  onNavigate,
  level = 0,
}: {
  items: MenuChildItem[];
  onNavigate: (path: string) => void;
  level?: number;
}) {
  const [openChild, setOpenChild] = useState<string | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenChild(null);
    }, 220);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, x: level === 0 ? 0 : -6 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.96, x: level === 0 ? 0 : -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`
        ${level === 0 ? "relative" : "absolute left-full top-0"}
        min-w-[240px] rounded-2xl border border-white/50 bg-white/95 p-2 backdrop-blur-xl
        shadow-[0_24px_70px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70
        z-[1000000]
      `}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      {items.map((child) => {
        const hasChildren = !!child.children?.length;
        const childKey = `${level}-${child.label}`;

        return (
          <div
            key={childKey}
            className="relative"
            onMouseEnter={() => {
              clearCloseTimer();
              setOpenChild(childKey);
            }}
          >
            <button
              onClick={() => {
                if (hasChildren) return;
                if (child.path) onNavigate(child.path);
              }}
              className="group relative flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              <span className="truncate">{child.label}</span>
              {hasChildren && (
                <ChevronRightIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
              )}
            </button>

            {hasChildren && openChild === childKey && child.children && (
              <>
                <div className="absolute left-full top-0 h-full w-4" />
                <div
                  className="absolute left-full top-0 pl-2"
                  onMouseEnter={clearCloseTimer}
                  onMouseLeave={scheduleClose}
                >
                  <FlyoutList
                    items={child.children}
                    onNavigate={onNavigate}
                    level={level + 1}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

function QuickMenuPopup({
  isOpen,
  onClose,
  anchorRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}) {
  const router = useRouter();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [panelHovered, setPanelHovered] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/live-voter-list/dashboard",
        icon: DashboardIcon,
      },
      {
        id: "voterlist",
        label: "Voterlist",
        path: "/voter-list",
        icon: VoterListIcon,
      },
      {
        id: "master",
        label: "Master",
        defaultPath: "/voter-list",
        icon: MasterIcon,
        children: [
          { label: "Master Data", path: "/voter-list/master" },
          { label: "Booth Mapping", path: "/voter-list/booth-maping" },
          { label: "Live Cast ID Master", path: "/live-voter-list/master/cast-id" },
        ],
      },
      {
        id: "importExport",
        label: "Import / Export",
        defaultPath: "/voter-list/import-data",
        icon: ImportExportIcon,
        children: [
          { label: "Import Data", path: "/voter-list/import-data" },
          { label: "Export Data", path: "/voter-list/import-data" },
          { label: "Export Process", path: "/voter-list/import-data" },
        ],
      },
      {
        id: "print",
        label: "Print",
        defaultPath: "/live-voter-list/print-1",
        icon: PrintIcon,
        children: [
          { label: "Print 1", path: "/live-voter-list/print-1" },
          { label: "Print 2", path: "/live-voter-list/print-2" },
          { label: "Print 3", path: "/live-voter-list/print-3" },
        ],
      },
      {
        id: "settings",
        label: "Settings",
        path: "/live-voter-list/settings",
        icon: SettingsIconSvg,
      },
      {
        id: "report",
        label: "Report",
        path: "/live-voter-list/report",
        icon: ReportIcon,
      },
      {
        id: "cast_by_surname",
        label: "Cast By Surname",
        path: "/voter-list/castidbysurname",
        icon: ReportIcon,
      },
    ],
    []
  );

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      if (!panelHovered) {
        setHoveredMenu(null);
        onClose();
      }
    }, 220);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      if (anchorRef?.current) {
        setAnchorRect(anchorRef.current.getBoundingClientRect());
      }
    };

    updateRect();

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHoveredMenu(null);
        onClose();
      }
    };

    const handleResize = () => updateRect();
    const handleScroll = () => updateRect();

    document.addEventListener("keydown", handleEsc);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, onClose, anchorRef]);

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
    setHoveredMenu(null);
  };

  const panelLeft =
    typeof window !== "undefined" && anchorRect
      ? Math.min(Math.max(anchorRect.left - 250, 16), window.innerWidth - 980)
      : 16;

  const panelTop = anchorRect ? anchorRect.bottom + 12 : 72;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[999998] bg-slate-950/25 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => {
              setHoveredMenu(null);
              onClose();
            }}
          />

          {anchorRect && (
            <motion.div
              className="fixed z-[999999] pointer-events-none"
              style={{
                top: anchorRect.top + anchorRect.height / 2 - 6,
                left: anchorRect.left + anchorRect.width / 2 - 6,
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.18, scale: 18 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <div className="h-3 w-3 rounded-full bg-blue-500 blur-[2px]" />
            </motion.div>
          )}

          <motion.div
            className="fixed z-[999999]"
            style={{
              top: panelTop,
              left: "600px",
              width: "min(980px, calc(100vw - 32px))",
            }}
            initial={{
              opacity: 0,
              scale: 0.82,
              y: -20,
              transformOrigin: anchorRect
                ? `${Math.max(40, anchorRect.left - panelLeft + 20)}px top`
                : "right top",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transformOrigin: anchorRect
                ? `${Math.max(40, anchorRect.left - panelLeft + 20)}px top`
                : "right top",
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: -12,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 26,
              mass: 0.9,
            }}
            onMouseEnter={() => {
              clearCloseTimer();
              setPanelHovered(true);
            }}
            onMouseLeave={() => {
              setPanelHovered(false);
              scheduleClose();
            }}
          >
            <div className="relative mr-14 overflow-visible rounded-[28px] border border-white/50 bg-white/85 shadow-[0_30px_90px_rgba(15,23,42,0.28)] ring-1 ring-slate-200/60 backdrop-blur-2xl">
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white via-slate-50/95 to-slate-100/80" />

              <div className="relative flex items-center justify-between border-b border-slate-200/70 px-5 py-4 sm:px-6">
                <div>
                  <div className="text-[15px] font-semibold text-slate-900">
                    Quick Navigation
                  </div>
                  <div className="text-xs text-slate-500">
                    Hover to open menus smoothly
                  </div>
                </div>

                <button
                  onClick={() => {
                    setHoveredMenu(null);
                    onClose();
                  }}
                  className="rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  Close
                </button>
              </div>

              <div className="relative max-h-[85vh] overflow-visible p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {menuItems.map((item) => {
                    const hasChildren = !!item.children?.length;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        className="relative"
                        onMouseEnter={() => {
                          clearCloseTimer();
                          setHoveredMenu(item.id);
                        }}
                        onMouseLeave={() => {
                          if (!hasChildren) {
                            scheduleClose();
                          }
                        }}
                      >
                        <button
                          onClick={() => {
                            if (hasChildren) {
                              if (item.defaultPath) {
                                handleNavigate(item.defaultPath);
                              }
                            } else {
                              handleNavigate(item.path || item.defaultPath || "#");
                            }
                          }}
                          className="group relative w-full overflow-visible rounded-[22px] border border-slate-200/80 bg-white/85 p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-xl"
                        >
                          <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-white via-slate-50/80 to-slate-100/70" />

                          <div className="relative flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-inner">
                                <Icon className="h-[18px] w-[18px] text-slate-700" />
                              </div>

                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-slate-900">
                                  {item.label}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {hasChildren ? "Explore" : "Open page"}
                                </div>
                              </div>
                            </div>

                            {hasChildren && (
                              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-200 group-hover:bg-slate-900 group-hover:text-white">
                                <ChevronRightIcon className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </button>

                        {hasChildren && hoveredMenu === item.id && item.children && (
                          <>
                            <div className="absolute left-0 top-full h-4 w-full" />
                            <div
                              className="absolute left-0 top-full pt-2"
                              onMouseEnter={clearCloseTimer}
                              onMouseLeave={scheduleClose}
                            >
                              <FlyoutList items={item.children} onNavigate={handleNavigate} />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------- Main Component ------------------------- */

export default function LiveMasterFilter() {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const pathname: any = usePathname() || "";

  const quickMenuButtonRef = useRef<HTMLButtonElement>(null);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [menuPopupOpen, setMenuPopupOpen] = useState(false);
  const [logoutDropdownOpen, setLogoutDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [dataIdOptions, setDataIdOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [assemblyOptions, setAssemblyOptions] = useState<string[]>([]);
  const [parliamentOptions, setParliamentOptions] = useState<string[]>([]);

  const [selectedDataId, setSelectedDataId] = useState("");
  const [selectedPartyDistrict, setSelectedPartyDistrict] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedAssembly, setSelectedAssembly] = useState("");
  const [selectedParliament, setSelectedParliament] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedMandal, setSelectedMandal] = useState("");
  const [selectedKendra, setSelectedKendra] = useState("");

  const partyDistrictOptions: string[] = [];
  const blockOptions: string[] = [];
  const mandalOptions: string[] = [];
  const kendraOptions: string[] = [];

  useEffect(() => {
    const fetchMasterFilterData = async () => {
      try {
        setLoading(true);
        const response = await volterListMasterFilter();

        if (response.success && Array.isArray(response.data)) {
          const data = response.data;

          const dataIdSet = new Set<string>();
          data.forEach((item: any) => {
            if (item.data_id_name_hi) {
              dataIdSet.add(`${item.data_id} - ${item.data_id_name_hi}`);
            } else if (item.data_id) {
              dataIdSet.add(item.data_id);
            }
          });
          setDataIdOptions(Array.from(dataIdSet));

          const districtSet = new Set<string>();
          data.forEach((item: any) => {
            if (item.district_hi) {
              districtSet.add(item.district_hi);
            }
          });
          setDistrictOptions(Array.from(districtSet));

          const assemblySet = new Set<string>();
          data.forEach((item: any) => {
            if (item.ac_name_hi) {
              assemblySet.add(`${item.ac_id} - ${item.ac_name_hi}`);
            }
          });
          setAssemblyOptions(Array.from(assemblySet));

          const parliamentSet = new Set<string>();
          data.forEach((item: any) => {
            if (item.pc_name_hi) {
              parliamentSet.add(`${item.pc_id} - ${item.pc_name_hi}`);
            }
          });
          setParliamentOptions(Array.from(parliamentSet));
        }
      } catch (error) {
        console.log("Error fetching master filter data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterFilterData();
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setLogoutDropdownOpen(false);
        setMenuPopupOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  const extractId = (value: string): string => {
    if (!value || value === "All") return "";
    const parts = value.split(" - ");
    return parts[0].trim();
  };

  const handleApplyFilters = async () => {
    try {
      setApplying(true);

      const queryParams = new URLSearchParams();
      queryParams.append("limit", "10");

      if (selectedDataId && selectedDataId !== "All") {
        queryParams.append("data_id", extractId(selectedDataId));
      }

      if (selectedDistrict && selectedDistrict !== "All") {
        queryParams.append("district", selectedDistrict);
      }

      if (selectedAssembly && selectedAssembly !== "All") {
        queryParams.append("ac_id", extractId(selectedAssembly));
      }

      if (selectedParliament && selectedParliament !== "All") {
        queryParams.append("pc_id", extractId(selectedParliament));
      }

      const queryString = queryParams.toString();
      await (volterMasterFilterGo as any)(queryString);
    } catch (error) {
      console.log("Error applying filters:", error);
    } finally {
      setApplying(false);
    }
  };

  const handleRefresh = () => {
    setSelectedDataId("");
    setSelectedPartyDistrict("");
    setSelectedDistrict("");
    setSelectedAssembly("");
    setSelectedParliament("");
    setSelectedBlock("");
    setSelectedMandal("");
    setSelectedKendra("");
  };

  const handleLogout = async () => {
    await logout();
  };

  const isAnyFilterSelected = Boolean(
    selectedDataId ||
    selectedPartyDistrict ||
    selectedDistrict ||
    selectedAssembly ||
    selectedParliament ||
    selectedBlock ||
    selectedMandal ||
    selectedKendra
  );

  return (
    <>
      <div className="w-full m-0 relative">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
            >
              <img
                src="/logo.png"
                alt="THE BIG OWL Logo"
                className="h-10 w-auto object-contain cursor-pointer rounded"
              />
              <h2 className="hidden lg:block text-xl font-bold text-gray-800 tracking-wide whitespace-nowrap">
                THE BIG OWL
              </h2>
            </button>
          </div>

          <div className="flex flex-nowrap justify-end items-center ml-auto gap-1 p-0 m-0">
            {pathname?.includes("/voter-list/booth-maping") && (
              <>
                <div className="flex-shrink-0 min-w-[120px] relative">
                  <SearchableSelect
                    id="dataId"
                    value={selectedDataId}
                    onChange={setSelectedDataId}
                    options={["All", ...dataIdOptions]}
                    placeholder="डेटा आईडी"
                    label=""
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                  />
                </div>

                <div className="flex-shrink-0 min-w-[120px] relative">
                  <SearchableSelect
                    id="partyDistrict"
                    value={selectedPartyDistrict}
                    onChange={setSelectedPartyDistrict}
                    options={["All", ...partyDistrictOptions]}
                    placeholder="पार्टी जिला"
                    label=""
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                  />
                </div>

                <div className="flex-shrink-0 min-w-[100px] relative">
                  <SearchableSelect
                    id="district"
                    value={selectedDistrict}
                    onChange={setSelectedDistrict}
                    options={["All", ...districtOptions]}
                    placeholder="ज़िला"
                    label=""
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                  />
                </div>

                <div className="flex-shrink-0 min-w-[140px] relative">
                  <SearchableSelect
                    id="assembly"
                    value={selectedAssembly}
                    onChange={setSelectedAssembly}
                    options={["All", ...assemblyOptions]}
                    placeholder="विधानसभा क्षेत्र"
                    label=""
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                  />
                </div>

                <div className="flex-shrink-0 min-w-[140px] relative">
                  <SearchableSelect
                    id="parliament"
                    value={selectedParliament}
                    onChange={setSelectedParliament}
                    options={["All", ...parliamentOptions]}
                    placeholder="संसदीय क्षेत्र"
                    label=""
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-1 flex-shrink-0">
              {pathname === '/voter-list/import-data' && (
                <button
                  onClick={handleRefresh}
                  disabled={applying}
                  className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer h-[38px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={16} />
                </button>
              )}

              <button
                ref={quickMenuButtonRef}
                type="button"
                // onMouseEnter={() => setMenuPopupOpen(true)}
                onClick={() => setMenuPopupOpen((prev) => !prev)}
                disabled={applying}
                className="group relative cursor-pointer flex items-center justify-center h-[35px] w-[35px] rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-[1px] hover:border-slate-300 hover:bg-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 opacity-100" />
                <div className="relative grid grid-cols-2 grid-rows-2 gap-[3px] w-[18px] h-[18px]">
                  <span className="block w-full h-full rounded-[4px] bg-gradient-to-br from-blue-300 to-blue-500 shadow-sm"></span>
                  <span className="block w-full h-full rounded-[4px] bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm"></span>
                  <span className="block w-full h-full rounded-[4px] bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm"></span>
                  <span className="block w-full h-full rounded-[4px] bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm"></span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center flex-col space-x-2">
                  <span className="font-bold uppercase text-[12px] text-gray-900">{user?.username}</span>
                  <span className="text-xs font-extralight text-blue-800 rounded-full capitalize">
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="flex items-center border space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                title="Logout"
              >
                <Power className="w-4 h-4 cursor-pointer font-bold" size={28} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuickMenuPopup
        isOpen={menuPopupOpen}
        onClose={() => setMenuPopupOpen(false)}
        anchorRef={quickMenuButtonRef}
      />
    </>
  );
}