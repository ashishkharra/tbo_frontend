'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Power, RefreshCw } from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";
import { QuickMenuPopup } from "./QuickMenuPopup";
import { volterListMasterFilter } from "@/apis/api";
import { useAuth as useAuthContext } from '../../contexts/AuthContext'
import DynamicPageSubMenu from '@/components/common/DynamicPageSubMenu'

interface Props {
  onApplyFilters?: (params: any) => void;
}

interface MasterFilterItem {
  id: number;
  ac_no: number;
  ac_name_hi: string;
  pc_no: number;
  pc_name_hi: string;
  data_id?: number;
  data_id_name_hi?: string;
  district_hi?: string;
  district_id?: number;
  party_district_id?: number;
  party_district_hi?: string;
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  data: {
    [key: string]: MasterFilterItem[];
  };
}

export const LiveMasterFilter: React.FC<Props> = ({ onApplyFilters }) => {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const pathname: any = usePathname()
  const containerRef = useRef<HTMLDivElement>(null);
  const quickMenuButtonRef = useRef<HTMLButtonElement>(null);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [menuPopupOpen, setMenuPopupOpen] = useState<boolean>(false);
  const [logoutDropdownOpen, setLogoutDropdownOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [applying, setApplying] = useState<boolean>(false);

  const [masterData, setMasterData] = useState<Record<string, MasterFilterItem[]>>({});
  const [allItems, setAllItems] = useState<MasterFilterItem[]>([]);

  const [districtOptions, setDistrictOptions] = useState<Array<{ id: number, name: string }>>([]);
  const [assemblyOptions, setAssemblyOptions] = useState<string[]>([]);
  const [parliamentOptions, setParliamentOptions] = useState<string[]>([]);
  const [partyDistrictOptions, setPartyDistrictOptions] = useState<string[]>([]);

  const [selectedDataId, setSelectedDataId] = useState<string>("");
  const [selectedPartyDistrict, setSelectedPartyDistrict] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedAssembly, setSelectedAssembly] = useState<string>("");
  const [selectedParliament, setSelectedParliament] = useState<string>("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setLogoutDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  useEffect(() => {
    const fetchMasterFilterData = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await volterListMasterFilter() as ApiResponse;
        console.log("Master Filter API Response:", response);

        if (response.success && response.data) {
          setMasterData(response.data);

          const allItemsArray: MasterFilterItem[] = [];
          Object.entries(response.data).forEach(([dataId, items]) => {
            if (Array.isArray(items)) {
              items.forEach(item => {
                allItemsArray.push({
                  ...item,
                  data_id: parseInt(dataId, 10)
                });
              });
            }
          });
          setAllItems(allItemsArray);

          const dataIdSet = new Set<string>();
          const partyDistrictSet = new Set<string>();
          const districtSet = new Set<string>();
          const assemblySet = new Set<string>();
          const parliamentSet = new Set<string>();

          allItemsArray.forEach((item) => {
            if (item.data_id) {
              dataIdSet.add(`${item.data_id}`);
            }
            if (item.party_district_id && item.party_district_hi) {
              partyDistrictSet.add(`${item.party_district_hi} - ${item.party_district_id}`);
            }
            if (item.district_id && item.district_hi) {
              districtSet.add(`${item.district_hi} - ${item.district_id}`);
            }
            if (item.ac_no && item.ac_name_hi) {
              assemblySet.add(`${item.ac_name_hi} - ${item.ac_no}`);
            }
            if (item.pc_no && item.pc_name_hi) {
              parliamentSet.add(`${item.pc_name_hi} - ${item.pc_no}`);
            }
          });

          setPartyDistrictOptions(Array.from(partyDistrictSet));
          setDistrictOptions(
            Array.from(districtSet).map(s => {
              const parts = s.split(" - ");
              return { name: parts[0], id: parseInt(parts[1]) };
            })
          );
          setAssemblyOptions(Array.from(assemblySet));
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
    if (!value) return "";
    const parts = value.split(" - ");
    if (parts.length === 1) return parts[0].trim();
    return parts[parts.length - 1].trim();
  };

  const getDataIdDisplayOptions = (): Array<{ id: string; display: string; searchText: string }> => {
    const optionMap = new Map<string, string>();

    allItems.forEach((item) => {
      if (!item.data_id) return;
      const id = String(item.data_id);
      const name = String(item.data_id_name_hi || "").trim();

      if (!optionMap.has(id)) {
        optionMap.set(id, name ? `${id} - ${name}` : id);
      }
    });

    return Array.from(optionMap.entries()).map(([id, display]) => ({
      id,
      display,
      searchText: display.toLowerCase(),
    }));
  };

  const getFilteredOptions = (key: string): string[] => {
    const results = new Set<string>();

    allItems.forEach(item => {
      if (key === "partyDistrict" && item.party_district_id && item.party_district_hi) results.add(`${item.party_district_hi} - ${item.party_district_id}`);
      if (key === "district" && item.district_id && item.district_hi) results.add(`${item.district_hi} - ${item.district_id}`);
      if (key === "assembly" && item.ac_no && item.ac_name_hi) results.add(`${item.ac_name_hi} - ${item.ac_no}`);
      if (key === "parliament" && item.pc_no && item.pc_name_hi) results.add(`${item.pc_name_hi} - ${item.pc_no}`);
    });

    return Array.from(results);
  };

  const handleFilterSelection = (key: string, value: string) => {
    if (!value) {
      if (key === "dataId") setSelectedDataId("");
      else if (key === "partyDistrict") setSelectedPartyDistrict("");
      else if (key === "district") setSelectedDistrict("");
      else if (key === "assembly") setSelectedAssembly("");
      else if (key === "parliament") setSelectedParliament("");
      return;
    }

    const id = parseInt(extractId(value), 10);

    const match = allItems.find(item => {
      if (key === "dataId") return item.data_id === id;
      if (key === "partyDistrict") return item.party_district_id === id;
      if (key === "district") return item.district_id === id;
      if (key === "assembly") return item.ac_no === id;
      if (key === "parliament") return item.pc_no === id;
      return false;
    });

    if (match) {
      setSelectedDataId(match.data_id ? String(match.data_id) : "");
      setSelectedPartyDistrict(match.party_district_hi && match.party_district_id ? `${match.party_district_hi} - ${match.party_district_id}` : "");
      setSelectedDistrict(match.district_hi && match.district_id ? `${match.district_hi} - ${match.district_id}` : "");
      setSelectedAssembly(match.ac_name_hi && match.ac_no ? `${match.ac_name_hi} - ${match.ac_no}` : "");
      setSelectedParliament(match.pc_name_hi && match.pc_no ? `${match.pc_name_hi} - ${match.pc_no}` : "");
    } else {
      if (key === "dataId") setSelectedDataId(value);
      else if (key === "partyDistrict") setSelectedPartyDistrict(value);
      else if (key === "district") setSelectedDistrict(value);
      else if (key === "assembly") setSelectedAssembly(value);
      else if (key === "parliament") setSelectedParliament(value);
    }

    setActiveDropdown(null);
  };

  const handleApplyFilters = async (): Promise<void> => {
    try {
      setApplying(true);

      const params: any = {
        limit: 50,
        page: 1,
        initial_load: false
      };

      if (selectedDataId) {
        params.data_id = parseInt(selectedDataId, 10);
      }

      if (selectedPartyDistrict) {
        params.party_district_id = parseInt(extractId(selectedPartyDistrict), 10);
      }

      if (selectedDistrict) {
        params.district_id = parseInt(extractId(selectedDistrict), 10);
      }

      if (selectedAssembly) {
        params.ac_id = parseInt(extractId(selectedAssembly), 10);
      }

      if (selectedParliament) {
        params.pc_id = parseInt(extractId(selectedParliament), 10);
      }

      if (onApplyFilters) {
        await onApplyFilters(params);
      }
    } catch (error) {
      console.log("Error applying filters:", error);
    } finally {
      setApplying(false);
    }
  };

  const handleRefresh = (): void => {
    setSelectedDataId("");
    setSelectedPartyDistrict("");
    setSelectedDistrict("");
    setSelectedAssembly("");
    setSelectedParliament("");

    setDistrictOptions([]);
    setAssemblyOptions([]);
    setParliamentOptions([]);

    setActiveDropdown(null);
    setLogoutDropdownOpen(false);
  };

  const isAnyFilterSelected = Boolean(
    selectedDataId ||
    selectedPartyDistrict ||
    selectedDistrict ||
    selectedAssembly ||
    selectedParliament
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <div className="w-full m-0 relative h-10" ref={containerRef}>
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

          <div className="flex flex-nowrap items-center justify-center gap-1 p-0 m-0">
            <div className="flex-shrink-0 min-w-[120px] relative text-gray-700">
              <SearchableSelect
                id="dataId"
                value={selectedDataId}
                onChange={(val) => handleFilterSelection("dataId", val)}
                options={getDataIdDisplayOptions()}
                placeholder="डेटा आईडी"
                label=""
                disabled={loading}
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
              />
            </div>

            <div className="flex-shrink-0 min-w-[120px] relative text-gray-700">
              <SearchableSelect
                id="partyDistrict"
                value={selectedPartyDistrict}
                onChange={(val) => handleFilterSelection("partyDistrict", val)}
                options={getFilteredOptions("partyDistrict")}
                placeholder="पार्टी जिला"
                label=""
                disabled={loading}
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
              />
            </div>

            <div className="flex-shrink-0 min-w-[100px] relative text-gray-700">
              <SearchableSelect
                id="district"
                value={selectedDistrict}
                onChange={(val) => handleFilterSelection("district", val)}
                options={getFilteredOptions("district")}
                placeholder="ज़िला"
                label=""
                disabled={loading}
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
              />
            </div>

            <div className="flex-shrink-0 min-w-[140px] relative text-gray-700">
              <SearchableSelect
                id="assembly"
                value={selectedAssembly}
                onChange={(val) => handleFilterSelection("assembly", val)}
                options={getFilteredOptions("assembly")}
                placeholder="विधानसभा क्षेत्र"
                label=""
                disabled={loading}
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
              />
            </div>

            <div className="flex-shrink-0 min-w-[140px] relative text-gray-700">
              <SearchableSelect
                id="parliament"
                value={selectedParliament}
                onChange={(val) => handleFilterSelection("parliament", val)}
                options={getFilteredOptions("parliament")}
                placeholder="संसदीय क्षेत्र"
                label=""
                disabled={loading}
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
              />
            </div>

            <div className="h-8 w-px bg-gray-300 mx-2"></div>

            <div className="flex items-center gap-1 flex-shrink-0 text-gray-700">
              <button
                onClick={handleApplyFilters}
                disabled={!isAnyFilterSelected || applying}
                className={`flex items-center justify-center space-x-0.5 px-0.5 rounded font-medium text-sm w-12 h-[28px] ${isAnyFilterSelected && !applying
                  ? "bg-gray-600 text-white hover:bg-gray-700 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {applying ? (
                  <div className="w-4 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Go</span>
                )}
              </button>

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
                // onMouseLeave={() => setMenuPopupOpen(false)}
                onClick={() => setMenuPopupOpen((prev) => !prev)}
                disabled={applying}
                className="group relative ml-7 flex cursor-pointer items-center justify-center h-[35px] w-[35px] rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-[1px] hover:border-slate-300 hover:bg-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

        <QuickMenuPopup
          isOpen={menuPopupOpen}
          onClose={() => setMenuPopupOpen(false)}
          anchorRef={quickMenuButtonRef}
        />
      </div>
    </>
  );
};