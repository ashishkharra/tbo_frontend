// LiveMasterFilter.tsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Search,
  Play,
  RefreshCw,
  LayoutDashboard,
  ListChecks,
  Settings as SettingsIcon,
  Import as ImportIcon,
  Printer as PrinterIcon,
  FileText as FileTextIcon,
} from "lucide-react";
import { volterListMasterFilter, volterMasterFilterGo } from "@/apis/api";

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
            className={`${
              value ? "text-gray-900" : "text-gray-500"
            } truncate flex-1 min-w-0`}
          >
            {value || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ml-1 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute w-full bg-white rounded-lg shadow-2xl max-h-60 overflow-visible min-w-[160px] z-[99999] mt-1">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                        value === optionStr ? "bg-gray-200 font-semibold" : ""
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

export default function LiveMasterFilter() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [menuPopupOpen, setMenuPopupOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
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
  const pathname = usePathname() || "";

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
      console.log("Calling volterMasterFilterGo with query:", queryString);

      const response = await (volterMasterFilterGo as any)(queryString);
      console.log("volterMasterFilterGo response:", response);
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
                    label="" // Add this line
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
                    label="" // Add this line
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
                    label="" // Add this line
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
                    label="" // Add this line
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-1 flex-shrink-0">
              {/* <button
                onClick={handleApplyFilters}
                disabled={!isAnyFilterSelected || applying}
                className={`flex items-center justify-center space-x-0.5 px-2 py-2 rounded-lg font-medium text-sm h-[38px] ${
                  isAnyFilterSelected && !applying
                    ? 'bg-gray-600 text-white hover:bg-gray-700 cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {applying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play size={14} />
                )}
                <span>Go</span>
              </button> */}

              <button
                onClick={handleRefresh}
                disabled={applying}
                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer h-[38px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} />
              </button>

              <button
                onClick={() => setMenuPopupOpen(true)}
                disabled={applying}
                className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-6 h-6">
                  <span className="block w-full h-full bg-gradient-to-br from-blue-300 to-blue-500"></span>
                  <span className="block w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></span>
                  <span className="block w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></span>
                  <span className="block w-full h-full bg-gradient-to-br from-blue-500 to-blue-700"></span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-medium text-gray-700 uppercase">
                ADMIN
              </span>
              <button
                onClick={() => setLogoutDropdownOpen(!logoutDropdownOpen)}
                className="flex items-center justify-center p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                <img src="/logout.png" alt="logout" className="w-4 h-4" />
              </button>

              {logoutDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[120px] z-50">
                  <button
                    onClick={() => {
                      setLogoutDropdownOpen(false);
                      router.push("/login");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <img src="/logout.png" alt="logout" className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {menuPopupOpen && (
        <div
          className="fixed inset-0 z-[999999] bg-black/70 flex items-center justify-center p-10"
          onClick={() => {
            setMenuPopupOpen(false);
            setOpenSubmenu(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[125vh] overflow-visible border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="text-sm font-semibold text-gray-800">
                Quick Navigation
              </div>
              <button
                onClick={() => {
                  setMenuPopupOpen(false);
                  setOpenSubmenu(null);
                }}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(95vh-60px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  {
                    id: "dashboard",
                    label: "Dashboard",
                    path: "/live-voter-list/dashboard",
                    icon: LayoutDashboard,
                  },
                  {
                    id: "voterlist",
                    label: "Voterlist",
                    path: "/voter-list",
                    icon: ListChecks,
                  },
                  {
                    id: "master",
                    label: "Master",
                    defaultPath: "/voter-list",
                    icon: SettingsIcon,
                    children: [
                      { label: "Master Data", path: "/voter-list/master" },
                      {
                        label: "Booth Mapping",
                        path: "/voter-list/booth-maping",
                      },
                      {
                        label: "Live Cast ID Master",
                        path: "/live-voter-list/master/cast-id",
                      },
                    ],
                  },
                  {
                    id: "importExport",
                    label: "Import / Export",
                    defaultPath: "/voter-list/import-data",
                    icon: ImportIcon,
                    children: [
                      { label: "Import Data", path: "/voter-list/import-data" },
                      { label: "Export Data", path: "/voter-list/import-data" },
                      {
                        label: "Export Process",
                        path: "/voter-list/import-data",
                      },
                    ],
                  },
                  {
                    id: "print",
                    label: "Print",
                    defaultPath: "/live-voter-list/print-1",
                    icon: PrinterIcon,
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
                    icon: SettingsIcon,
                  },
                  {
                    id: "report",
                    label: "Report",
                    path: "/live-voter-list/report",
                    icon: FileTextIcon,
                  },
                ].map((item) => {
                  const hasChildren = !!item.children?.length;

                  return (
                    <div key={item.id} className="relative">
                      <button
                        onClick={() => {
                          if (hasChildren) {
                            setOpenSubmenu(
                              openSubmenu === item.id ? null : item.id
                            );
                          } else {
                            router.push(item.path || item.defaultPath || "#");
                          }
                        }}
                        className="w-full flex flex-col items-start justify-center px-4 py-3 rounded-lg border bg-white border-gray-200 text-gray-800 hover:bg-gray-50 text-left transition shadow-sm hover:shadow-md"
                      >
                        <div className="w-full flex items-start justify-between gap-2">
                          <span className="flex items-center gap-2 text-sm font-semibold">
                            {item.icon && (
                              <item.icon size={16} className="text-gray-600" />
                            )}
                            {item.label}
                          </span>
                          {hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenSubmenu(
                                  openSubmenu === item.id ? null : item.id
                                );
                              }}
                              className="text-gray-500 hover:text-gray-800 text-lg leading-none px-1"
                            >
                              ⋯
                            </button>
                          )}
                        </div>
                      </button>

                      {hasChildren && openSubmenu === item.id && (
                        <div className="absolute top-2 right-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
                          <div className="py-1">
                            {item.children?.map((child) => (
                              <button
                                key={child.path}
                                onClick={() => router.push(child.path)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-800"
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
