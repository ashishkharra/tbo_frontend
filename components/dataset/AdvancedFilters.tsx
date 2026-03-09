// components/dataset/AdvancedFilters.tsx
'use client';

import React from "react";

interface Props {
  selectedFilters: any;
  subFilterOptions: any;
  onFilterChange: (key: string, value: string) => void;
  show: boolean;
}

export const AdvancedFilters: React.FC<Props> = ({
  selectedFilters,
  subFilterOptions,
  onFilterChange,
  show,
}) => {
  if (!show) return null;

  return (
    <div className="bg-white px-4 pb-3">
      <div className="flex justify-center">
        <div className="flex flex-wrap items-center gap-3 max-w-7xl">
          <select 
            value={selectedFilters.religion || ""} 
            onChange={(e) => onFilterChange("religion", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50 focus:bg-white focus:text-gray-800 focus:border-gray-400 focus:outline-none"
          >
            <option value="">धर्म (Religion)</option>
            {subFilterOptions?.religion?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <select 
            value={selectedFilters.surname || ""} 
            onChange={(e) => onFilterChange("surname", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50 focus:bg-white focus:text-gray-800 focus:border-gray-400 focus:outline-none"
          >
            <option value="">उपनाम (Surname)</option>
            {subFilterOptions?.surname?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <select 
            value={selectedFilters.sex || ""} 
            onChange={(e) => onFilterChange("sex", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50 focus:bg-white focus:text-gray-800 focus:border-gray-400 focus:outline-none"
          >
            <option value="">लिंग (Gender)</option>
            <option value="पुरुष">पुरुष (Male)</option>
            <option value="महिला">महिला (Female)</option>
          </select>
        </div>
      </div>
    </div>
  );
};