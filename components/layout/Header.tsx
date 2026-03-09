"use client";
import { getMasterFilter, getTableDataByMasterFilter } from "@/apis/api";
import { ArrowLeft, Play, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Select from "react-select";

const Header = ({ onDataReceived, onFilterChange }) => {
  const router = useRouter();

  const [masterData, setMasterData] = useState({
    district: [],
    block_city: [],
    blockToDistrictMap: new Map(),
    isLoading: true,
    noDataFound: false
  });
  const [showSubMenu, setShowSubMenu] = useState<boolean>(false)
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedParliament, setSelectedParliament] = useState(null);
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMasterFilterData = async () => {
    setMasterData(prev => ({ ...prev, isLoading: true, noDataFound: false }));

    try {
      const res = await getMasterFilter();

      // Check if no data is returned
      if (!res || res.length === 0) {
        setMasterData({
          district: [],
          block_city: [],
          blockToDistrictMap: new Map(),
          isLoading: false,
          noDataFound: true
        });
        return;
      }

      const blockToDistrictMap = new Map();

      const uniqueDistricts = [...new Set(res.map(item => item.districts[0]))];
      const districtOptions = uniqueDistricts.map(district => ({
        label: district,
        value: district,
      }));

      const allBlocks = [];
      res.forEach(item => {
        const district = item.districts[0];
        item.blocks.forEach(block => {
          allBlocks.push(block);
          blockToDistrictMap.set(block, district);
        });
      });

      const uniqueBlocks = [...new Set(allBlocks)];
      const blockOptions = uniqueBlocks.map(block => ({
        label: block,
        value: block,
      }));

      setMasterData({
        district: districtOptions,
        block_city: blockOptions,
        blockToDistrictMap: blockToDistrictMap,
        isLoading: false,
        noDataFound: false
      });

    } catch (err) {
      console.error("Error fetching master filter data:", err);
      setMasterData({
        district: [],
        block_city: [],
        blockToDistrictMap: new Map(),
        isLoading: false,
        noDataFound: true
      });
    }
  };

  useEffect(() => {
    fetchMasterFilterData();
  }, []);

  const handleBlockChange = (selectedOption) => {
    setSelectedBlock(selectedOption);

    if (selectedOption) {
      const districtForBlock = masterData.blockToDistrictMap.get(selectedOption.value);
      const districtOption = masterData.district.find(
        d => d.value === districtForBlock
      );
      setSelectedDistrict(districtOption || null);
    }
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption);
    if (!selectedOption) {
      setSelectedBlock(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  const handleGo = async () => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();

      if (selectedBlock?.value) {
        queryParams.append("block_city", selectedBlock.value);
      }

      if (selectedDistrict?.value) {
        queryParams.append("distt", selectedDistrict.value);
      }

      if (selectedAssembly?.value) {
        queryParams.append("ac_no", selectedAssembly.value);
      }

      if (selectedParliament?.value) {
        queryParams.append("pc_no", selectedParliament.value);
      }

      const queryString = queryParams.toString();
      console.log("Query Parameters:", queryString);

      const apiResponse = await getTableDataByMasterFilter(queryString);
      console.log("Voter Data Response:", apiResponse);

      if (onDataReceived) {
        onDataReceived(apiResponse);
      }

      if (onFilterChange) {
        onFilterChange({
          block_city: selectedBlock?.value || "",
          distt: selectedDistrict?.value || "",
          ac_no: selectedAssembly?.value || "",
          pc_no: selectedParliament?.value || "",
        });
      }

    } catch (err) {
      console.error("Error fetching voter data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchMasterFilterData();
    setSelectedDistrict(null);
    setSelectedBlock(null);
    setSelectedParliament(null);
    setSelectedAssembly(null);
  };

  // Custom no options message
  const getNoOptionsMessage = () => {
    if (masterData.isLoading) return "लोड हो रहा है...";
    if (masterData.noDataFound) return "संसद क्षेत्र में कोई डेटा नहीं मिला";
    return "कोई विकल्प नहीं";
  };

  // Custom styles for react-select to match your filter inputs
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "32px",
      height: "32px",
      borderColor: "#3a3f4a",
      borderRadius: "4px",
      fontSize: "12px",
      boxShadow: "none",
      backgroundColor: "#ffffff",
      "&:hover": {
        borderColor: "#e8b12c",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      height: "32px",
      padding: "0 8px",
    }),
    input: (base) => ({
      ...base,
      margin: "0",
      padding: "0",
      fontSize: "12px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#000000",
      fontSize: "12px",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#000000",
      fontSize: "12px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      fontSize: "12px",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "12px",
      backgroundColor: state.isSelected
        ? "#e8b12c"
        : state.isFocused
          ? "#f3f4f6"
          : "#ffffff",
      color: state.isSelected ? "#000000" : "#111827",
      cursor: "pointer",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0 4px",
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: "0 4px",
    }),
  };

  return (
    <>
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <Link href={'/'}>
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="w-8 h-8" alt="Logo" />
            <span className="font-semibold text-gray-800">THE BIG OWL</span>
          </div>
        </Link>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2">
            {/* Parliament Select - Small like filter inputs */}
            <div className="w-40">
              <Select
                options={[]}
                value={selectedParliament}
                onChange={setSelectedParliament}
                placeholder="संसदीय क्षेत्र"
                isSearchable={true}
                className="text-xs"
                classNamePrefix="select"
                noOptionsMessage={() => "कोई विकल्प नहीं"}
                styles={selectStyles}
              />
            </div>

            {/* Assembly Select - Small like filter inputs */}
            <div className="w-40">
              <Select
                options={[]}
                value={selectedAssembly}
                onChange={setSelectedAssembly}
                placeholder="विधानसभा क्षेत्र"
                isSearchable={true}
                className="text-xs"
                classNamePrefix="select"
                noOptionsMessage={() => "कोई विकल्प नहीं"}
                styles={selectStyles}
              />
            </div>

            {/* District Select - Small like filter inputs */}
            <div className="w-40">
              <Select
                options={masterData.district}
                value={selectedDistrict}
                onChange={handleDistrictChange}
                placeholder="जिला"
                isSearchable
                isLoading={masterData.isLoading}
                loadingMessage={() => "लोड हो रहा है..."}
                noOptionsMessage={() => masterData.noDataFound ? "कोई जिला नहीं मिला" : "कोई विकल्प नहीं"}
                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                styles={{
                  ...selectStyles,
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>

            {/* Block Select - Small like filter inputs */}
            <div className="w-40">
              <Select
                options={masterData.block_city}
                value={selectedBlock}
                onChange={handleBlockChange}
                placeholder="ब्लॉक"
                isSearchable
                className="text-xs"
                classNamePrefix="select"
                isLoading={masterData.isLoading}
                loadingMessage={() => "लोड हो रहा है..."}
                noOptionsMessage={getNoOptionsMessage}
                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                styles={{
                  ...selectStyles,
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>

            {/* Go Button - Small like filter buttons */}
            <button
              onClick={handleGo}
              disabled={loading || masterData.isLoading}
              className="px-4 py-1.5 bg-[#e8b12c] text-black text-xs font-medium rounded hover:bg-[#f0c24b] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[60px] h-8"
            >
              {loading ? (
                <span className="flex items-center gap-1">
                  <RefreshCw size={12} className="animate-spin" />
                </span>
              ) : (
                "Go"
              )}
            </button>

            {/* Refresh Button - Small like filter buttons */}
            <button
              onClick={handleRefresh}
              className="p-1.5 bg-[#2f3540] text-white rounded hover:bg-[#3a404d] transition-colors h-8 w-8 flex items-center justify-center"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>

            <button
              onClick={() => {
                setShowSubMenu(prev => !prev)
              }}
              // disabled={applying}
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

        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 flex items-center justify-center gap-2 cursor-pointer hover:text-red-600 transition-colors"
        >
          <img src="/logout.png" className="w-6 h-6" alt="Logout" />
          Admin
        </button>
      </div>

      {showSubMenu && (
        <div className="bg-white border-b px-4 py-1 flex items-center">
          <div className="flex-1 flex justify-center">
            <nav className="flex items-center gap-6 text-xs font-medium text-gray-700">
              <a href="#" className="hover:text-[#e8b12c] hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                Dashboard
              </a>
              <a href="#" className="bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors">
                Filter
              </a>
              <a href="#" className="hover:text-[#e8b12c] hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                Master
              </a>

              <div className="relative group">
                <button className="hover:text-[#e8b12c] hover:bg-gray-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                  Data Process
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[10000]">
                  <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100">
                      By Surname
                    </a>
                    <a href="#" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100">
                      Data Alteration
                    </a>
                    <a href="#" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100">
                      Data Condition
                    </a>
                    <a href="/village-mapping" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100">
                      Village Mapping
                    </a>
                  </div>
                </div>
              </div>

              <a href="/dataset/importExport" className="hover:text-[#e8b12c] hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                Import / Export
              </a>
              <a href="#" className="hover:text-[#e8b12c] hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                Activity
              </a>
              <a href="#" className="hover:text-[#e8b12c] hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                Maps
              </a>
              <a href="#" className="hover:text-[#e8b12c] hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                Setting
              </a>
              <a href="#" className="hover:text-[#e8b12c] hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                Report
              </a>
              <a href="#" className="hover:text-[#e8b12c] hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                Printer
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;