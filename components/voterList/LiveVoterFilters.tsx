"use client";

import React, { useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Printer,
  Download,
  Save,
  RefreshCw,
} from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  showMoreFilters: number;
  setShowMoreFilters: (value: number) => void;
  showDownloadPrintMenu: boolean;
  setShowDownloadPrintMenu: (value: boolean) => void;
  onPrintClick: () => void;
  onSaveClick: () => void;
  onRefresh: () => void;
  onSubFilterGo: () => void;
  loading: boolean;
  filters: any;
  setFilters: (filters: any) => void;
  filterOptions: any;
  selectedDataId: string;
}

export const LiveVoterFilters: React.FC<Props> = ({
  activeDropdown,
  setActiveDropdown,
  showMoreFilters,
  setShowMoreFilters,
  showDownloadPrintMenu,
  setShowDownloadPrintMenu,
  onPrintClick,
  onSaveClick,
  onRefresh,
  onSubFilterGo,
  loading,
  filters,
  setFilters,
  filterOptions,
  selectedDataId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const downloadPrintMenuRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
      if (
        downloadPrintMenuRef.current &&
        !downloadPrintMenuRef.current.contains(event.target as Node)
      ) {
        setShowDownloadPrintMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setActiveDropdown, setShowDownloadPrintMenu]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setShowDownloadPrintMenu(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [setActiveDropdown, setShowDownloadPrintMenu]);

  const hasActiveFilters = (): boolean => {
    // Check main filters
    if (filters.lbt) return true;
    if (filters.gp) return true;
    if (filters.gram) return true;
    if (filters.bhagNo) return true;
    if (filters.sectionNo) return true;
    if (filters.mobile) return true;
    if (filters.castId) return true;
    if (filters.name) return true;
    if (filters.surname) return true;
    if (filters.gender) return true;

    // Check more filters (level 1)
    if (filters.block) return true;
    if (filters.mandal) return true;
    if (filters.kendra) return true;
    if (filters.hno) return true;
    if (filters.ageFrom) return true;
    if (filters.ageTo) return true;
    if (filters.dob) return true;
    if (filters.profession_name) return true;

    // Check more filters (level 2)
    if (filters.aadhar) return true;
    if (filters.postOffice) return true;
    if (filters.pinCode) return true;
    if (filters.policeStation) return true;
    if (filters.edu) return true;
    if (filters.mukhiya) return true;

    return false;
  };

  const hasDataIdSelected = (): boolean => {
    return !!(selectedDataId);
  };

  return (
    <div
      className="border-b border-[#2a2e36] bg-white text-black shadow-lg sticky top-0 z-50"
      ref={containerRef}
    >
      <div className="w-full px-6 py-2">
        <div className="">
          {/* Primary Filter Row */}
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-2">

              {/* LBT - Simple array */}
              <div className="min-w-[70px]">
                <select
                  id="lbt"
                  value={filters.lbt || ""}
                  onChange={(e) => {
                    setFilters({ ...filters, lbt: e.target.value });
                  }}
                  className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">LBT (RU)</option>
                  {(filterOptions.ru || []).map((item: any) => (
                    <option key={item} value={item}>
                      {item === "0" ? "ग्रामीण" : item === "1" ? "शहरी" : item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gram Panchayat - Object array with gp_ward_id and gp_ward */}
              <div className="min-w-[70px]">
                <SearchableSelect
                  id="gp-select"
                  value={filters.gp || ""}
                  onChange={(value) => {
                    setFilters({ ...filters, gp: value });
                    setActiveDropdown(null);
                  }}
                  options={(filterOptions.gps || []).map((item: any) => ({
                    id: item.gp_ward_id,
                    display: `${item.gp_ward} - ${item.gp_ward_id}`,
                    searchText: `${item.gp_ward_id} ${item.gp_ward}`.toLowerCase()
                  }))}
                  placeholder="GP (ग्राम पंचायत)"
                  label=""
                  disabled={loading}
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                  displayKey="display"
                  valueKey="id"
                />
              </div>

              {/* Gram/Village - Object array with village_id and village */}
              <div className="min-w-[70px]">
                <SearchableSelect
                  id="gram-select"
                  value={filters.gram || ""}
                  onChange={(value) => {
                    setFilters({ ...filters, gram: value });
                    setActiveDropdown(null);
                  }}
                  options={(filterOptions.villages || []).map((item: any) => ({
                    id: item.village_id,
                    display: item.village_id.length > 10
                      ? `${item.village} - ${item.village_id.substring(0, 10)}...`
                      : `${item.village} - ${item.village_id}`,
                    fullDisplay: `${item.village} - ${item.village_id}`,
                    searchText: `${item.village_id} ${item.village}`.toLowerCase()
                  }))}
                  placeholder="ग्राम (Village)"
                  label=""
                  disabled={loading}
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                  displayKey="display"
                  valueKey="id"
                />
              </div>

              {/* Bhag No - Simple array */}
              <div className="min-w-[70px]">
                <select
                  id="bhagNo"
                  value={filters.bhagNo || ""}
                  onChange={(e) => {
                    setFilters({ ...filters, bhagNo: e.target.value });
                    setActiveDropdown(null);
                  }}
                  className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">भाग नं.</option>
                  {(filterOptions.bhagNos || []).map((item: any) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section/Colony - Object array with sec_no and section */}
              <div className="min-w-[70px]">
                <SearchableSelect
                  id="sectionNo-select"
                  value={filters.sectionNo || ""}
                  onChange={(value) => {
                    setFilters({ ...filters, sectionNo: value });
                    setActiveDropdown(null);
                  }}
                  options={(filterOptions.sections || []).map((item: any) => ({
                    id: item.sec_no,
                    display: `${item.section} - ${item.sec_no}`,
                    searchText: `${item.sec_no} ${item.section}`.toLowerCase()
                  }))}
                  placeholder="क्षेत्र/कॉलोनी"
                  label=""
                  disabled={loading}
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                  displayKey="display"
                  valueKey="id"
                />
              </div>

              {/* Mobile - Simple input */}
              <div className="min-w-[70px]">
                <input
                  type="text"
                  placeholder="मोबाइल नं."
                  value={filters.mobile || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, mobile: e.target.value })
                  }
                  className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors"
                />
              </div>

              {/* Caste - Simple array */}
              <div className="min-w-[70px]">
                <select
                  id="cast"
                  value={filters.castId || ""}
                  onChange={(e) => {
                    setFilters({ ...filters, castId: e.target.value });
                    setActiveDropdown(null);
                  }}
                  className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">जाति</option>
                  {(filterOptions.castId || []).map((item: any) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name - Simple input */}
              <div className="min-w-[70px]">
                <input
                  type="text"
                  placeholder="नाम"
                  value={filters.name || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value })
                  }
                  className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors"
                />
              </div>

              {/* Surname - Simple input */}
              <div className="min-w-[70px]">
                <input
                  type="text"
                  placeholder="उपनाम"
                  value={filters.surname || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, surname: e.target.value })
                  }
                  className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors"
                />
              </div>

              {/* Gender - Simple array */}
              <div className="min-w-[70px]">
                <select
                  id="gender"
                  value={filters.gender || ""}
                  onChange={(e) => {
                    setFilters({ ...filters, gender: e.target.value });
                    setActiveDropdown(null);
                  }}
                  className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">लिंग</option>
                  {(filterOptions.sex || []).map((item: any) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {/* Go Button */}
              <button
                onClick={onSubFilterGo}
                disabled={!hasActiveFilters() || !hasDataIdSelected()}
                className={`px-4 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${hasActiveFilters() && hasDataIdSelected()
                  ? "bg-[#e8b12c] text-black hover:bg-[#f0c24b]"
                  : "bg-[#333842] text-gray-600 cursor-not-allowed"
                  }`}
              >
                Go
              </button>

              {/* Refresh Icon Button */}
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-1.5 text-white cursor-pointer hover:text-[#e8b12c] bg-[#2f3540] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

              {/* Save Button */}
              <button
                onClick={onSaveClick}
                disabled={!hasDataIdSelected()}
                className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center cursor-pointer ${hasDataIdSelected()
                  ? "bg-[#2f3540] text-gray-300 hover:bg-[#3a404d] border border-[#4a505e]"
                  : "text-gray-700 cursor-not-allowed border border-[#333842]"
                  }`}
              >
                <Save size={14} className="mr-1" /> Save
              </button>

              {/* Print/Download Dropdown */}
              <div className="relative" ref={downloadPrintMenuRef}>
                <button
                  onClick={() => setShowDownloadPrintMenu(!showDownloadPrintMenu)}
                  disabled={!hasDataIdSelected()}
                  className={`flex items-center justify-center px-3 py-1.5 text-xs rounded transition-colors cursor-pointer ${hasDataIdSelected()
                    ? "bg-[#2f3540] text-gray-300 hover:bg-[#3a404d] border border-[#4a505e]"
                    : "text-gray-700 cursor-not-allowed border border-[#333842]"
                    }`}
                >
                  <Printer size={14} className="mr-1" />
                  <ChevronDown size={12} />
                </button>

                {showDownloadPrintMenu && hasDataIdSelected() && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded shadow-2xl border border-[#3a3f4a] z-[10000] py-1 animate-slideIn">
                    <button
                      onClick={() => {
                        setShowDownloadPrintMenu(false);
                        // Download Excel functionality
                      }}
                      className="w-full text-black flex items-center space-x-2 px-4 py-2 text-left hover:bg-[#2f3540] hover:text-white transition-colors text-xs"
                    >
                      <Download size={14} />
                      <span>Download Excel</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDownloadPrintMenu(false);
                        onPrintClick();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-left text-black hover:bg-[#2f3540] hover:text-white transition-colors text-xs"
                    >
                      <Printer size={14} />
                      <span>Print Register</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Show More Button */}
              <button
                onClick={() => setShowMoreFilters(showMoreFilters === 0 ? 1 : 0)}
                className="flex items-center justify-center px-3 py-1.5 text-xs text-gray-300 bg-[#2f3540] border border-[#4a505e] rounded hover:bg-[#3a404d] transition-colors cursor-pointer"
              >
                Show More
                {showMoreFilters >= 1 ? (
                  <ChevronUp size={14} className="ml-1" />
                ) : (
                  <ChevronDown size={14} className="ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* More Filters Level 1 */}
          {showMoreFilters >= 1 && (
            <div className="flex flex-wrap items-start gap-3 pt-1 animate-fadeIn">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-2">
                {/* Block - Object array */}

                <div className="min-w-[70px]">
                  <SearchableSelect
                    id="block-select"
                    value={filters.block || ""}
                    onChange={(value) => {
                      setFilters({ ...filters, block: value });
                      setActiveDropdown(null);
                    }}
                    options={(filterOptions.blocks || []).map((item: any) => ({
                      id: item.block_id,
                      display: item.block_id.length > 10
                        ? `${item.block} - ${item.block_id.substring(0, 10)}...`
                        : `${item.block} - ${item.block_id}`,
                      fullDisplay: `${item.block} - ${item.block_id}`,
                      searchText: `${item.block_id} ${item.block}`.toLowerCase()
                    }))}
                    placeholder="ब्लॉक"
                    label=""
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                    displayKey="display"
                    valueKey="id"
                  />
                </div>

                {/* Mandal - Object array */}
                <div className="min-w-[70px]">
                  <SearchableSelect
                    id="mandal-select"
                    value={filters.mandal || ""}
                    onChange={(value) => {
                      setFilters({ ...filters, mandal: value });
                      setActiveDropdown(null);
                    }}
                    options={(filterOptions.mandals || []).map((item: any) => ({
                      id: item.mandal_id,
                      display: item.mandal_id.length > 10
                        ? `${item.mandal} - ${item.mandal._id.substring(0, 10)}...`
                        : `${item.mandal} - ${item.mandal_id}`,
                      fullDisplay: `${item.mandal} - ${item.mandal_id}`,
                      searchText: `${item.mandal_id} ${item.mandal}`.toLowerCase()
                    }))}
                    placeholder="मंडल"
                    label=""
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                    displayKey="display"
                    valueKey="id"
                  />
                </div>

                {/* Kendra - Object array - FIXED DUPLICATE ISSUE */}
                <div className="min-w-[70px]">
                  <SearchableSelect
                    id="kendra-select"
                    value={filters.kendra || ""}
                    onChange={(value) => {
                      setFilters({ ...filters, kendra: value });
                      setActiveDropdown(null);
                    }}
                    options={(filterOptions.kendras || []).map((item: any) => ({
                      id: item.mandal_id,
                      display: item.kendra_id.length > 10
                        ? `${item.kendra} - ${item.kendra._id.substring(0, 10)}...`
                        : `${item.kendra} - ${item.kendra_id}`,
                      fullDisplay: `${item.kendra} - ${item.kendra_id}`,
                      searchText: `${item.kendra_id} ${item.kendra}`.toLowerCase()
                    }))}
                    placeholder="केंद्र"
                    label=""
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                    displayKey="display"
                    valueKey="id"
                  />
                </div>

                {/* House No */}
                <div className="min-w-[70px]">
                  <input
                    type="text"
                    placeholder="गृह स."
                    value={filters.hno || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, hno: e.target.value })
                    }
                    className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors"
                  />
                </div>

                {/* Age From */}
                <div className="min-w-[70px]">
                  <input
                    type="number"
                    placeholder="आयु से"
                    value={filters.ageFrom || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, ageFrom: e.target.value })
                    }
                    className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors"
                  />
                </div>

                {/* Age To */}
                <div className="min-w-[70px]">
                  <input
                    type="number"
                    placeholder="आयु तक"
                    value={filters.ageTo || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, ageTo: e.target.value })
                    }
                    className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors"
                  />
                </div>

                {/* Date of Birth */}
                <div className="min-w-[70px]">
                  <input
                    type="date"
                    placeholder="जन्म तिथि"
                    value={filters.dob || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, dob: e.target.value })
                    }
                    className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors"
                  />
                </div>

                {/* Profession */}
                <div className="min-w-[70px]">
                  <SearchableSelect
                    id="profession-select"
                    value={filters.profession_name || ""}
                    onChange={(value) => {
                      setFilters({ ...filters, profession_name: value });
                      setActiveDropdown(null);
                    }}
                    options={(filterOptions.professions || []).map((item: any) => ({
                      id: item.proff_id,
                      display: item.proff_id && item.proff_id.length > 10
                        ? `${item.proff} - ${item.proff_id.substring(0, 10)}...`
                        : item.proff_id
                          ? `${item.proff} - ${item.proff_id}`
                          : item.proff,
                      fullDisplay: item.proff_id ? `${item.proff} - ${item.proff_id}` : item.proff,
                      searchText: `${item.proff_id || ''} ${item.proff}`.toLowerCase()
                    }))}
                    placeholder="व्यवसाय"
                    label=""
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                    displayKey="display"
                    valueKey="id"
                  />
                </div>

                {/* Aadhar */}
                <div className="w-full min-w-[100px]">
                  <input
                    type="text"
                    placeholder="आधार"
                    value={filters.aadhar || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, aadhar: e.target.value })
                    }
                    className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors"
                  />
                </div>

                {/* Dummy filler for grid alignment */}
                <div className="min-w-[70px] hidden lg:block"></div>
                <div className="min-w-[70px] hidden lg:block"></div>
              </div>

              {/* More Filters Toggle (Level 1 -> 2) */}
              <div className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setShowMoreFilters(showMoreFilters === 1 ? 2 : 1)}
                  className="flex items-center justify-center px-3 py-1.5 text-xs text-gray-300 bg-[#2f3540] border border-[#4a505e] rounded hover:bg-[#3a404d] transition-colors cursor-pointer"
                >
                  {showMoreFilters === 2 ? (
                    <ChevronUp size={14} className="mr-1" />
                  ) : (
                    <ChevronDown size={14} className="mr-1" />
                  )}
                  More
                </button>
              </div>
            </div>
          )}

          {/* More Filters Level 2 */}
          {/* More Filters Level 2 */}
          {showMoreFilters === 2 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 animate-fadeIn">

              {/* Post Office - Searchable */}
              <div className="w-full min-w-[140px]">
                <SearchableSelect
                  id="postOffice-select"
                  value={filters.postOffice || ""}
                  onChange={(value) => {
                    setFilters({ ...filters, postOffice: value });
                    setActiveDropdown(null);
                  }}
                  options={(filterOptions.postOffices || []).map((item: any) => ({
                    id: item.postoff_id,
                    display: item.postoff_id && item.postoff_id.length > 10
                      ? `${item.postoff} - ${item.postoff_id.substring(0, 10)}...`
                      : item.postoff_id
                        ? `${item.postoff} - ${item.postoff_id}`
                        : item.postoff,
                    searchText: `${item.postoff_id || ''} ${item.postoff}`.toLowerCase()
                  }))}
                  placeholder="Post Office"
                  label=""
                  disabled={loading}
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                  displayKey="display"
                  valueKey="id"
                />
              </div>

              {/* Pin Code - Searchable */}
              <div className="w-full min-w-[120px]">
                <SearchableSelect
                  id="pinCode-select"
                  value={filters.pinCode || ""}
                  onChange={(value) => {
                    setFilters({ ...filters, pinCode: value });
                    setActiveDropdown(null);
                  }}
                  options={(filterOptions.pincodes || []).map((item: any) => ({
                    id: item.pincode_id,
                    display: item.pincode_id && item.pincode_id.length > 10
                      ? `${item.pincode} - ${item.pincode_id.substring(0, 10)}...`
                      : item.pincode_id
                        ? `${item.pincode} - ${item.pincode_id}`
                        : item.pincode,
                    searchText: `${item.pincode_id || ''} ${item.pincode}`.toLowerCase()
                  }))}
                  placeholder="Pin code"
                  label=""
                  disabled={loading}
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                  displayKey="display"
                  valueKey="id"
                />
              </div>

              {/* Police Station - Searchable */}
              <div className="w-full min-w-[140px]">
                <SearchableSelect
                  id="policeStation-select"
                  value={filters.policeStation || ""}
                  onChange={(value) => {
                    setFilters({ ...filters, policeStation: value });
                    setActiveDropdown(null);
                  }}
                  options={(filterOptions.policeStations || []).map((item: any) => ({
                    id: item.policst_id,
                    display: item.policst_id && item.policst_id.length > 10
                      ? `${item.policst} - ${item.policst_id.substring(0, 10)}...`
                      : item.policst_id
                        ? `${item.policst} - ${item.policst_id}`
                        : item.policst,
                    searchText: `${item.policst_id || ''} ${item.policst}`.toLowerCase()
                  }))}
                  placeholder="Police Station"
                  label=""
                  disabled={loading}
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                  displayKey="display"
                  valueKey="id"
                />
              </div>

              {/* Education - Searchable */}
              <div className="w-full min-w-[120px]">
                <SearchableSelect
                  id="edu-select"
                  value={filters.edu || ""}
                  onChange={(value) => {
                    setFilters({ ...filters, edu: value });
                    setActiveDropdown(null);
                  }}
                  options={(filterOptions.educations || []).map((item: any) => ({
                    id: item.edu_id,
                    display: item.edu_id && item.edu_id.length > 10
                      ? `${item.edu} - ${item.edu_id.substring(0, 10)}...`
                      : item.edu_id
                        ? `${item.edu} - ${item.edu_id}`
                        : item.edu,
                    searchText: `${item.edu_id || ''} ${item.edu}`.toLowerCase()
                  }))}
                  placeholder="शिक्षा"
                  label=""
                  disabled={loading}
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                  displayKey="display"
                  valueKey="id"
                />
              </div>

              {/* Profession - Searchable (if you have this in level 2) */}
              {filterOptions.professions && (
                <div className="w-full min-w-[120px]">
                  <SearchableSelect
                    id="profession-select"
                    value={filters.profession_name || ""}
                    onChange={(value) => {
                      setFilters({ ...filters, profession_name: value });
                      setActiveDropdown(null);
                    }}
                    options={(filterOptions.professions || []).map((item: any) => ({
                      id: item.proff_id,
                      display: item.proff_id && item.proff_id.length > 10
                        ? `${item.proff} - ${item.proff_id.substring(0, 10)}`
                        : item.proff_id
                          ? `${item.proff} - ${item.proff_id}`
                          : item.proff,
                      searchText: `${item.proff_id || ''} ${item.proff}`.toLowerCase()
                    }))}
                    placeholder="व्यवसाय"
                    label=""
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                    displayKey="display"
                    valueKey="id"
                  />
                </div>
              )}

              {/* Mukhiya - Simple select or Searchable based on number of options */}
              <div className="w-full min-w-[120px]">
                {(filterOptions.mukhiyas || []).length > 10 ? (
                  <SearchableSelect
                    id="mukhiya-select"
                    value={filters.mukhiya || ""}
                    onChange={(value) => {
                      setFilters({ ...filters, mukhiya: value });
                      setActiveDropdown(null);
                    }}
                    options={(filterOptions.mukhiyas || []).map((item: any) => ({
                      id: item,
                      display: String(item),
                      searchText: String(item).toLowerCase()
                    }))}
                    placeholder="मुखिया"
                    label=""
                    disabled={loading}
                    activeDropdown={activeDropdown}
                    onDropdownToggle={setActiveDropdown}
                    displayKey="display"
                    valueKey="id"
                  />
                ) : (
                  <select
                    id="mukhiya"
                    value={filters.mukhiya || ""}
                    onChange={(e) => {
                      setFilters({ ...filters, mukhiya: e.target.value });
                      setActiveDropdown(null);
                    }}
                    className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">मुखिया</option>
                    {(filterOptions.mukhiyas || []).map((item: any) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.15s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};