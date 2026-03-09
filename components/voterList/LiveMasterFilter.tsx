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
          Object.values(response.data).forEach((items) => {
            if (Array.isArray(items)) {
              allItemsArray.push(...items);
            }
          });
          setAllItems(allItemsArray);

          // Data ID Options - using data_id as the key
          const dataIdSet = new Set<string>();
          Object.keys(response.data).forEach((dataId) => {
            const items = response.data[dataId];
            if (items && items.length > 0) {
              const firstItem = items[0];
              // Use data_id as the ID and create display string
              dataIdSet.add(`${dataId}`);
            }
          });
          setDataIdOptions(Array.from(dataIdSet));

          // Extract Party District Options from all items
          const partyDistrictSet = new Set<string>();
          allItemsArray.forEach((item) => {
            if (item.party_district_id && item.party_district_hi) {
              partyDistrictSet.add(`${item.party_district_hi} - ${item.party_district_id}`);
            } else if (item.party_district_id) {
              partyDistrictSet.add(String(item.party_district_id));
            }
          });
          setPartyDistrictOptions(Array.from(partyDistrictSet));

          // Other dropdowns are initially empty
          setDistrictOptions([]);
          setAssemblyOptions([]);
          setParliamentOptions([]);
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
    if (selectedDataId) {
      const dataId = extractId(selectedDataId);
      const items = masterData[dataId] || [];

      const districtMap = new Map();
      items.forEach(item => {
        if (item.district_id && item.district_hi) {
          districtMap.set(item.district_id, {
            name: item.district_hi,
            id: item.district_id
          });
        }
      });
      setDistrictOptions(Array.from(districtMap.values()));

      // Get unique assemblies
      const assemblies = items
        .map(item => item.ac_no && item.ac_name_hi ? `${item.ac_name_hi} - ${item.ac_no}` : null)
        .filter((value): value is string => value !== null && value !== undefined);
      setAssemblyOptions(Array.from(new Set(assemblies)));

      // Get unique parliaments
      const parliaments = items
        .map(item => item.pc_no && item.pc_name_hi ? `${item.pc_name_hi} - ${item.pc_no}` : null)
        .filter((value): value is string => value !== null && value !== undefined);
      setParliamentOptions(Array.from(new Set(parliaments)));

      // Update party district options based on selected data ID
      const partyDistricts = items
        .map(item => item.party_district_id && item.party_district_hi ? `${item.party_district_hi} - ${item.party_district_id}` : null)
        .filter((value): value is string => value !== null && value !== undefined);

      if (partyDistricts.length > 0) {
        setPartyDistrictOptions(Array.from(new Set(partyDistricts)));
      }
    } else {
      // Clear options if no Data ID selected
      setDistrictOptions([]);
      setAssemblyOptions([]);
      setParliamentOptions([]);

      // Clear selected values
      setSelectedDistrict("");
      setSelectedAssembly("");
      setSelectedParliament("");
    }
  }, [selectedDataId, masterData]);

  const extractId = (value: string): string => {
    if (!value) return "";
    const parts = value.split(" - ");
    return parts[0].trim();
  };

  const handleDataIdChange = (value: string) => {
    setSelectedDataId(value);

    if (value) {
      const dataId = extractId(value);
      const items = masterData[dataId] || [];

      if (items.length > 0) {
        // Get unique values for auto-select
        const districts = items
          .map(item => item.district_hi)
          .filter((value): value is string => value !== null && value !== undefined);

        const assemblies = items
          .map(item => item.ac_no && item.ac_name_hi ? `${item.ac_no} - ${item.ac_name_hi}` : null)
          .filter((value): value is string => value !== null && value !== undefined);

        const parliaments = items
          .map(item => item.pc_no && item.pc_name_hi ? `${item.pc_no} - ${item.pc_name_hi}` : null)
          .filter((value): value is string => value !== null && value !== undefined);

        const partyDistricts = items
          .map(item => item.party_district_id && item.party_district_hi ? `${item.party_district_id} - ${item.party_district_hi}` : null)
          .filter((value): value is string => value !== null && value !== undefined);

        // Auto-select if only one option
        if (districts.length === 1) {
          // For district, we need to send the data_id as district_id
          setSelectedDistrict(`${items[0].district_id} - ${districts[0]}`);
        } else {
          setSelectedDistrict("");
        }

        setSelectedAssembly(assemblies.length === 1 ? assemblies[0] : "");
        setSelectedParliament(parliaments.length === 1 ? parliaments[0] : "");
        setSelectedPartyDistrict(partyDistricts.length === 1 ? partyDistricts[0] : "");
      }
    } else {
      setSelectedDistrict("");
      setSelectedAssembly("");
      setSelectedParliament("");
      setSelectedPartyDistrict("");
    }

    // Close dropdown after selection
    setActiveDropdown(null);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setActiveDropdown(null);
  };

  const handleAssemblyChange = (value: string) => {
    setSelectedAssembly(value);
    setActiveDropdown(null);
  };

  const handleParliamentChange = (value: string) => {
    setSelectedParliament(value);
    setActiveDropdown(null);
  };

  const handlePartyDistrictChange = (value: string) => {
    setSelectedPartyDistrict(value);
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
              onChange={handleDataIdChange}
              options={dataIdOptions}
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
              onChange={handlePartyDistrictChange}
              options={partyDistrictOptions}
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
              onChange={handleDistrictChange}
              options={districtOptions.map(d => `${d.id} - ${d.name}`)}
              placeholder="ज़िला"
              label=""
              disabled={loading || !selectedDataId}
              activeDropdown={activeDropdown}
              onDropdownToggle={setActiveDropdown}
            />
          </div>

          <div className="flex-shrink-0 min-w-[140px] relative text-gray-700">
            <SearchableSelect
              id="assembly"
              value={selectedAssembly}
              onChange={handleAssemblyChange}
              options={assemblyOptions}
              placeholder="विधानसभा क्षेत्र"
              label=""
              disabled={loading || !selectedDataId}
              activeDropdown={activeDropdown}
              onDropdownToggle={setActiveDropdown}
            />
          </div>

          <div className="flex-shrink-0 min-w-[140px] relative text-gray-700">
            <SearchableSelect
              id="parliament"
              value={selectedParliament}
              onChange={handleParliamentChange}
              options={parliamentOptions}
              placeholder="संसदीय क्षेत्र"
              label=""
              disabled={loading || !selectedDataId}
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