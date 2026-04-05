'use client';

import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";

interface Option {
  id: string | number;
  display: string;
  searchText?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: (Option | string | number | null)[];
  placeholder: string;
  label: string;
  disabled?: boolean;
  id: string;
  activeDropdown: string | null;
  onDropdownToggle: (id: string | null) => void;
  displayKey?: string;
  valueKey?: string;
}

export const SearchableSelect: React.FC<Props> = ({
  value,
  onChange,
  options,
  placeholder,
  label,
  disabled = false,
  id,
  activeDropdown,
  onDropdownToggle,
  displayKey = 'display',
  valueKey = 'id',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = activeDropdown === id;

  // Normalize options to always work with objects
  const normalizedOptions = (options || [])
    .filter(option => option !== null && option !== undefined)
    .map(option => {
      if (typeof option === 'object' && option !== null) {
        return option as Option;
      }
      return {
        id: String(option),
        display: String(option),
        searchText: String(option).toLowerCase()
      } as Option;
    })
    .sort((a, b) => {
      const isANumber = !isNaN(Number(a.display));
      const isBNumber = !isNaN(Number(b.display));

      if (isANumber && !isBNumber) return 1; // put b (string) first
      if (!isANumber && isBNumber) return -1; // put a (string) first
      // If both are same type, sort alphabetically/numerically
      if (!isANumber && !isBNumber) return a.display.localeCompare(b.display);
      return Number(a.display) - Number(b.display);
    });

  const filteredOptions = normalizedOptions.filter((option) => {
    if (option.searchText) {
      return option.searchText.includes(searchTerm.toLowerCase());
    }
    // return option.display.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Find the display text for the current value
  const getDisplayValue = (): string => {
    if (!value) return '';
    const selectedOption: any = normalizedOptions.find(
      (opt: any) => String(opt[valueKey]) === String(value) || opt.display === value
    );

    return selectedOption ? selectedOption.display : value; // just show display
  };

  const handleToggle = (): void => {
    if (!disabled) {
      onDropdownToggle(isOpen ? null : id);
      setSearchTerm("");
    }
  };

  const handleSelect = (option: Option): void => {
    const val = (option as any)[valueKey];   // 👈 FIX
    onChange(String(val));
    onDropdownToggle(null);
    setSearchTerm("");
  };

  const handleClear = (): void => {
    onChange("");
    onDropdownToggle(null);
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onDropdownToggle(null);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onDropdownToggle]);

  return (
    <div ref={dropdownRef} className="relative" data-dropdown-id={id}>
      {label && (
        <label className="block text-xs font-medium text-black mb-0.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="w-full px-2 py-1.5 border border-[#3a3f4a] rounded text-xs bg-white text-left flex items-center justify-between min-w-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2rem'
          }}
        >
          <span
            className={`${value ? "text-black" : "text-black"
              } truncate flex-1 min-w-0 text-xs`}
          >
            {value ? getDisplayValue() : placeholder}
          </span>
          {/* {value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-0.5 hover:bg-gray-200 rounded-full mr-1 absolute right-6"
            >
              <X size={12} className="text-black" />
            </button>
          )} */}
        </button>

        {isOpen && (
          <div className="absolute w-full bg-white rounded-lg shadow-2xl max-h-60 overflow-visible min-w-[200px] z-[99999] mt-1 border border-[#3a3f4a]">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto text-black">
              {/* Clear option */}
              <button
                onClick={handleClear}
                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 text-black border-b border-gray-200"
              >
                <span className="flex items-center gap-2">
                  <X size={12} />
                  Clear
                </span>
              </button>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option: any, index: any) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${String(option[valueKey]) === value || option.display === value
                      ? "bg-gray-200 font-semibold"
                      : ""
                      }`}
                    title={option.display}
                  >
                    {option.display}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-black">
                  No matching options
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};