// components/dataset/FilterBar.tsx
'use client';

import React, { useState } from "react";
import { Play, RefreshCw, ChevronDown, Save, Download } from "lucide-react";
import { SearchableSelect } from "../voterList/SearchableSelect";


interface Props {
  selectedFilters: any;
  subFilterOptions: any;
  onFilterChange: (key: string, value: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onToggleAdvanced: () => void;
  showAdvanced: boolean;
  editedRowsCount: number;
  onSaveChanges?: () => void;
  onUndoChanges?: () => void;
  isSaving: boolean;
  saveSuccess: boolean | null;
  loading: boolean;
  onExportExcel?: () => void;
  onExportCSV?: () => void;
  hasData: boolean;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
}

// const [isGoClicked, setIsGoClicked] = useState<boolean>(false)

export const FilterBar: React.FC<Props> = ({
  selectedFilters,
  subFilterOptions,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  onToggleAdvanced,
  showAdvanced,
  editedRowsCount,
  onSaveChanges,
  onUndoChanges,
  isSaving,
  saveSuccess,
  loading,
  onExportExcel,
  onExportCSV,
  hasData,
  activeDropdown,
  setActiveDropdown,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-1 text-black">
      <div className="flex justify-center">
        <div className="flex flex-wrap items-center gap-2 max-w-7xl">

          {/* LBT (R/U) - Simple select (few options) */}
          <div className="min-w-[90px]">
            <select
              id="ru-select"
              value={selectedFilters.ru || ""}
              onChange={(e) => onFilterChange("ru", e.target.value)}
              className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors text-black appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2rem'
              }}
            >
              <option value="">LBT (R/U)</option>
              {subFilterOptions?.ru?.map((option: string) => (
                <option key={option} value={option}>
                  {option === "0" ? "ग्रामीण" : option === "1" ? "शहरी" : option}
                </option>
              ))}
            </select>
          </div>

          {/* GP (ग्राम पंचायत) - Searchable */}
          <div className="min-w-[140px]">
            <SearchableSelect
              id="gp-select"
              value={selectedFilters.gp_ward || ""}
              onChange={(value) => onFilterChange("gp_ward", value)}
              options={(subFilterOptions?.gp_ward || []).map((item: any) => ({
                id: typeof item === 'string' ? item : item.gp_ward_id,
                display: typeof item === 'string'
                  ? item
                  : item.gp_ward_id && item.gp_ward_id.length > 10
                    ? `${item.gp_ward_id.substring(0, 10)}... - ${item.gp_ward}`
                    : `${item.gp_ward_id} - ${item.gp_ward}`,
                searchText: typeof item === 'string'
                  ? item.toLowerCase()
                  : `${item.gp_ward_id || ''} ${item.gp_ward || ''}`.toLowerCase()
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

          {/* ग्राम (Village) - Searchable */}
          <div className="min-w-[120px]">
            <SearchableSelect
              id="village-select"
              value={selectedFilters.village || ""}
              onChange={(value) => onFilterChange("village", value)}
              options={(subFilterOptions?.village || []).map((item: any) => ({
                id: typeof item === 'string' ? item : item.village_id,
                display: typeof item === 'string'
                  ? item
                  : item.village_id && item.village_id.length > 10
                    ? `${item.village_id.substring(0, 10)}... - ${item.village}`
                    : `${item.village_id} - ${item.village}`,
                searchText: typeof item === 'string'
                  ? item.toLowerCase()
                  : `${item.village_id || ''} ${item.village || ''}`.toLowerCase()
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

          {/* Cast ID - जाति - Searchable */}
          <div className="min-w-[120px]">
            <SearchableSelect
              id="cast-select"
              value={selectedFilters.cast_id || ""}
              onChange={(value) => onFilterChange("cast_id", value)}
              options={(subFilterOptions?.cast || []).map((item: any) => ({
                id: item.cast_id,
                display: `${item.cast_id} - ${item.cast_name}`,
                searchText: `${item.cast_id} ${item.cast_name}`.toLowerCase()
              }))}
              placeholder="Cast ID - जाति"
              label=""
              disabled={loading}
              activeDropdown={activeDropdown}
              onDropdownToggle={setActiveDropdown}
              displayKey="display"
              valueKey="id"
            />
          </div>

          {/* Go Button */}
          <button
            onClick={onApplyFilters}
            disabled={loading}
            className="px-4 py-1.5 bg-[#e8b12c] text-black text-xs font-medium rounded hover:bg-[#f0c24b] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[60px] h-8"
          >
            {loading ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              "Go"
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onResetFilters}
            className="p-1.5 bg-[#2f3540] text-white rounded hover:bg-[#3a404d] transition-colors h-8 w-8 flex items-center justify-center"
            title="Reset Filters"
          >
            <RefreshCw size={14} />
          </button>

          {/* Save Changes Button */}
          {onSaveChanges && (
            <button
              onClick={onSaveChanges}
              disabled={isSaving || editedRowsCount === 0 || loading}
              className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center h-8 ${editedRowsCount > 0 && !loading
                  ? "bg-[#2f3540] text-gray-300 hover:bg-[#3a404d] border border-[#4a505e]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400"
                }`}
            >
              {isSaving ? (
                <><RefreshCw size={12} className="animate-spin mr-1" /> Saving...</>
              ) : (
                <><Save size={12} className="mr-1" /> Save {editedRowsCount > 0 && `(${editedRowsCount})`}</>
              )}
            </button>
          )}

          {/* Success/Failure Message */}
          {saveSuccess === true && (
            <span className="text-green-600 text-xs font-medium">✓ Saved!</span>
          )}
          {saveSuccess === false && (
            <span className="text-red-600 text-xs font-medium">✗ Failed</span>
          )}

          {/* Undo Button */}
          {editedRowsCount > 0 && !loading && onUndoChanges && (
            <button
              onClick={onUndoChanges}
              className="px-3 py-1.5 text-xs rounded border border-[#3a3f4a] bg-white text-black hover:bg-gray-50 transition-colors h-8"
            >
              Undo
            </button>
          )}

          {/* Export Excel Button */}
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              disabled={!hasData || loading}
              className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center h-8 ${hasData && !loading
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <Download size={12} className="mr-1" /> Excel
            </button>
          )}

          {/* Export CSV Button */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              disabled={!hasData || loading}
              className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center h-8 ${hasData && !loading
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <Download size={12} className="mr-1" /> CSV
            </button>
          )}

          {/* Show More Button */}
          <button
            onClick={onToggleAdvanced}
            className="flex items-center justify-center px-3 py-1.5 text-xs text-gray-300 bg-[#2f3540] border border-[#4a505e] rounded hover:bg-[#3a404d] transition-colors h-8"
          >
            Show More
            <ChevronDown
              size={14}
              className={`ml-1 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>
      </div>

      {/* Advanced Filters Section */}
      {showAdvanced && (
        <div className="flex justify-center mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2 max-w-7xl">
            {/* Add your advanced filter inputs here */}
            {/* Example advanced filters: */}

            {/* Block */}
            <div className="min-w-[120px]">
              <SearchableSelect
                id="block-select"
                value={selectedFilters.block || ""}
                onChange={(value) => onFilterChange("block", value)}
                options={(subFilterOptions?.blocks || []).map((item: any) => ({
                  id: item.block_id,
                  display: `${item.block_id} - ${item.block}`,
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

            {/* Mandal */}
            <div className="min-w-[120px]">
              <SearchableSelect
                id="mandal-select"
                value={selectedFilters.mandal || ""}
                onChange={(value) => onFilterChange("mandal", value)}
                options={(subFilterOptions?.mandals || []).map((item: any) => ({
                  id: item.mandal_id,
                  display: `${item.mandal_id} - ${item.mandal}`,
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

            {/* Kendra */}
            <div className="min-w-[120px]">
              <SearchableSelect
                id="kendra-select"
                value={selectedFilters.kendra || ""}
                onChange={(value) => onFilterChange("kendra", value)}
                options={(subFilterOptions?.kendras || []).map((item: any) => ({
                  id: item.kendra_id,
                  display: item.kendra,
                  searchText: item.kendra.toLowerCase()
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

            {/* Age From */}
            <div className="min-w-[80px]">
              <input
                type="number"
                placeholder="आयु से"
                min={0}
                max={100}
                value={selectedFilters.ageFrom || ""}
                onChange={(e) => onFilterChange("ageFrom", e.target.value)}
                className="w-full px-2 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors h-7"
              />
            </div>

            {/* Age To */}
            <div className="min-w-[80px]">
              <input
                type="number" 
                min={0}
                max={100}
                placeholder="आयु तक"
                value={selectedFilters.ageTo || ""}
                onChange={(e) => onFilterChange("ageTo", e.target.value)}
                className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors h-7"
              />
            </div>

            {/* Gender */}
            <div className="min-w-[80px]">
              <select
                id="gender-select"
                value={selectedFilters.gender || ""}
                onChange={(e) => onFilterChange("gender", e.target.value)}
                className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors appearance-none bg-white h-7"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2rem'
                }}
              >
                <option value="">लिंग</option>
                <option value="MALE">पुरुष</option>
                <option value="FEMALE">महिला</option>
                <option value="OTHER">अन्य</option>
              </select>
            </div>

            {/* Mobile */}
            <div className="min-w-[100px]">
              <input
                type="text"
                placeholder="मोबाइल नं."
                value={selectedFilters.mobile || ""}
                onChange={(e) => onFilterChange("mobile", e.target.value)}
                className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs placeholder:text-black focus:outline-none focus:border-[#e8b12c] transition-colors h-7"
              />
            </div>

            {/* धर्म (Religion) - Searchable */}
            <div className="min-w-[120px]">
              <SearchableSelect
                id="religion-select"
                value={selectedFilters.religion || ""}
                onChange={(value) => onFilterChange("religion", value)}
                options={(subFilterOptions?.religion || []).map((item: any) => ({
                  id: typeof item === 'string' ? item : item.religion_id || item,
                  display: typeof item === 'string'
                    ? item
                    : item.religion_name || item,
                  searchText: typeof item === 'string'
                    ? item.toLowerCase()
                    : (item.religion_name || item).toLowerCase()
                }))}
                placeholder="धर्म (Religion)"
                label=""
                disabled={loading}
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                displayKey="display"
                valueKey="id"
              />
            </div>

            {/* उपनाम (Surname) - Searchable */}
            <div className="min-w-[120px]">
              <SearchableSelect
                id="surname-select"
                value={selectedFilters.surname || ""}
                onChange={(value) => onFilterChange("surname", value)}
                options={(subFilterOptions?.surname || []).map((item: any) => ({
                  id: typeof item === 'string' ? item : item.surname_id || item,
                  display: typeof item === 'string'
                    ? item
                    : item.surname_name || item,
                  searchText: typeof item === 'string'
                    ? item.toLowerCase()
                    : (item.surname_name || item).toLowerCase()
                }))}
                placeholder="उपनाम (Surname)"
                label=""
                disabled={loading}
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                displayKey="display"
                valueKey="id"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};