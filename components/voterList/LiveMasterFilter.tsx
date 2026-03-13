'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Play, RefreshCw } from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";
import { QuickMenuPopup } from "./QuickMenuPopup";
import { volterListMasterFilter } from "@/apis/api";

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
  district_id?: number; // This might be the same as data_id
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
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [menuPopupOpen, setMenuPopupOpen] = useState<boolean>(false);
  const [logoutDropdownOpen, setLogoutDropdownOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [applying, setApplying] = useState<boolean>(false);

  const [masterData, setMasterData] = useState<Record<string, MasterFilterItem[]>>({});
  const [allItems, setAllItems] = useState<MasterFilterItem[]>([]);

  const [dataIdOptions, setDataIdOptions] = useState<string[]>([]);

  // console.log('dat id opt >>>>>> ', dataIdOptions)

  // Filtered options
  const [districtOptions, setDistrictOptions] = useState<Array<{ id: number, name: string }>>([]);
  const [assemblyOptions, setAssemblyOptions] = useState<string[]>([]);
  const [parliamentOptions, setParliamentOptions] = useState<string[]>([]);
  const [partyDistrictOptions, setPartyDistrictOptions] = useState<string[]>([]);

  const [selectedDataId, setSelectedDataId] = useState<string>("");
  const [selectedPartyDistrict, setSelectedPartyDistrict] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedAssembly, setSelectedAssembly] = useState<string>("");
  const [selectedParliament, setSelectedParliament] = useState<string>("");

  // Handle outside click to close dropdown
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

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setLogoutDropdownOpen(false);
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
                  data_id: parseInt(dataId, 10) // Inject the key as data_id
                });
              });
            }
          });
          setAllItems(allItemsArray);

          // Populate initial global options
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

          setDataIdOptions(Array.from(dataIdSet));
          setPartyDistrictOptions(Array.from(partyDistrictSet));
          setDistrictOptions(Array.from(districtSet).map(s => {
            const parts = s.split(" - ");
            return { name: parts[0], id: parseInt(parts[1]) };
          }));
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
    return parts[parts.length - 1].trim(); // Get the ID which we've standardized to be at the end
  };

  const getFilteredOptions = (key: string): string[] => {
    // Return all unique options from the entire dataset (Global)
    // This allows the user to always see and select anything
    const results = new Set<string>();

    allItems.forEach(item => {
      if (key === "dataId" && item.data_id) results.add(`${item.data_id}`);
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

    // Find the first record in the GLOBAL dataset that matches this selection
    const match = allItems.find(item => {
      if (key === "dataId") return item.data_id === id;
      if (key === "partyDistrict") return item.party_district_id === id;
      if (key === "district") return item.district_id === id;
      if (key === "assembly") return item.ac_no === id;
      if (key === "parliament") return item.pc_no === id;
      return false;
    });

    if (match) {
      // Synchronize all 5 fields using this record's data
      setSelectedDataId(`${match.data_id}`);
      setSelectedPartyDistrict(match.party_district_hi && match.party_district_id ? `${match.party_district_hi} - ${match.party_district_id}` : "");
      setSelectedDistrict(match.district_hi && match.district_id ? `${match.district_hi} - ${match.district_id}` : "");
      setSelectedAssembly(match.ac_name_hi && match.ac_no ? `${match.ac_name_hi} - ${match.ac_no}` : "");
      setSelectedParliament(match.pc_name_hi && match.pc_no ? `${match.pc_name_hi} - ${match.pc_no}` : "");
    } else {
      // Fallback: just set the selected field
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
        limit: 50, // Match your page size
        page: 1,
        initial_load: false // Make sure this is false to get data
      };

      // Convert all IDs to numbers
      if (selectedDataId) {
        params.data_id = parseInt(extractId(selectedDataId), 10);
      }

      if (selectedPartyDistrict) {
        params.party_district_id = parseInt(extractId(selectedPartyDistrict), 10);
      }

      // For district, use the selected district ID if available
      if (selectedDistrict) {
        params.district_id = parseInt(extractId(selectedDistrict), 10);
      }

      if (selectedAssembly) {
        params.ac_id = parseInt(extractId(selectedAssembly), 10);
      }

      if (selectedParliament) {
        params.pc_id = parseInt(extractId(selectedParliament), 10);
      }

      // console.log("Applying filters with params:", params);

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

    // Clear all options
    setDistrictOptions([]);
    setAssemblyOptions([]);
    setParliamentOptions([]);

    // Close any open dropdowns
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  return (
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
              options={getFilteredOptions("dataId")}
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
                  onClick={handleLogout}
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

      <QuickMenuPopup
        isOpen={menuPopupOpen}
        onClose={() => setMenuPopupOpen(false)}
      />
    </div>
  );
};