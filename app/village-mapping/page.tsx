'use client';

import React, { useState, useMemo, ChangeEvent } from 'react';
import { MapPin, Search, RefreshCw, ChevronDown } from 'lucide-react';
import AdvancedExcelDataTable from '../../components/AdvancedExcelDataTable';
import Header from '@/components/layout/Header';

// Type Definitions
interface VillageData {
  id: number;
  ltp: string;
  districtName: string;
  block: string;
  gp: string;
  villageName: string;
  count: string;
  mappingStatus: string;
  villageId: string;
  gpId: string;
  acId: string;
  acName: string;
  pcId: string;
  pcName: string;
}

interface ColumnFilterState {
  ltp: string;
  districtName: string;
  block: string;
  gp: string;
  villageName: string;
  count: string;
  mappingStatus: string;
  acId: string;
  acName: string;
  pcId: string;
  pcName: string;
  villageId: string;
  gpId: string;
}

interface ColumnDefinition {
  id: keyof VillageData;
  accessorKey: keyof VillageData;
  header: string;
  size: number;
  readOnly: boolean;
}

interface ColumnOption {
  key: keyof ColumnFilterState;
  label: string;
}

// Searchable Select Component for Column Filters
interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}

function SearchableSelect({ value, onChange, options, placeholder, disabled = false }: SearchableSelectProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredOptions = useMemo((): string[] => {
    if (!searchTerm.trim()) return options;
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelect = (option: string): void => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = (): void => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-left flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                <>
                  <button
                    onClick={() => handleSelect('')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    All
                  </button>
                  {filteredOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(option)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      {option}
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VillageMappingPage(): React.ReactElement {
  const [data] = useState<VillageData[]>(STATIC_VILLAGE_DATA);
  const [columnFilters, setColumnFilters] = useState<ColumnFilterState>({
    ltp: '',
    districtName: '',
    block: '',
    gp: '',
    villageName: '',
    count: '',
    mappingStatus: '',
    acId: '',
    acName: '',
    pcId: '',
    pcName: '',
    villageId: '',
    gpId: ''
  });

  // Get unique values for each column from static data
  const getUniqueColumnValues = (columnKey: keyof VillageData): string[] => {
    const values = new Set<string>();
    
    data.forEach(row => {
      const value = row[columnKey];
      if (value && String(value).trim() !== '') {
        values.add(String(value).trim());
      }
    });
    
    return Array.from(values).sort();
  };

  // Apply column filters to data
  const filteredData = useMemo((): VillageData[] => {
    let filtered = [...data];
    
    (Object.entries(columnFilters) as [keyof ColumnFilterState, string][]).forEach(([key, filterValue]) => {
      if (filterValue.trim() !== '') {
        filtered = filtered.filter(row => {
          const cellValue = row[key as keyof VillageData];
          return String(cellValue || '').trim() === filterValue.trim();
        });
      }
    });
    
    return filtered;
  }, [data, columnFilters]);

  const handleColumnFilterChange = (columnKey: keyof ColumnFilterState, value: string): void => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  // FIXED: Make this function async and return Promise<void>
  const handleUpdateCell = async (rowIndex: number, columnId: string, value: any): Promise<void> => {
    console.log('Update cell:', { rowIndex, columnId, value });
    // In a real app, you would update the data state here
    // For static demo, we'll just log it
    alert(`Updated cell ${columnId} in row ${rowIndex} to: ${value}`);
    // Return a resolved promise (implicitly, since async functions return Promise)
  };

  const handleClearFilters = (): void => {
    setColumnFilters({
      ltp: '',
      districtName: '',
      block: '',
      gp: '',
      villageName: '',
      count: '',
      mappingStatus: '',
      acId: '',
      acName: '',
      pcId: '',
      pcName: '',
      villageId: '',
      gpId: ''
    });
  };

  const handleDownloadCSV = (): void => {
    const csvContent = [
      columns.map(col => col.header).join(','),
      ...filteredData.map(row => 
        columns.map(col => `"${row[col.accessorKey] || ''}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'village_mapping_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Mock functions for Header props
  const handleDataReceived = (data: any): void => {
    console.log('Data received:', data);
  };

  const handleFilterChange = (filters: any): void => {
    console.log('Filter changed:', filters);
  };

  // Column definitions for ExcelDataTable
  const columns: ColumnDefinition[] = [
    { id: 'ltp', accessorKey: 'ltp', header: 'LBT', size: 120, readOnly: false },
    { id: 'districtName', accessorKey: 'districtName', header: 'District', size: 150, readOnly: false },
    { id: 'block', accessorKey: 'block', header: 'Block', size: 120, readOnly: false },
    { id: 'gp', accessorKey: 'gp', header: 'GP', size: 120, readOnly: false },
    { id: 'villageName', accessorKey: 'villageName', header: 'Village', size: 150, readOnly: false },
    { id: 'count', accessorKey: 'count', header: 'Count', size: 100, readOnly: false },
    { id: 'mappingStatus', accessorKey: 'mappingStatus', header: 'Mapping Status', size: 120, readOnly: false },
    { id: 'villageId', accessorKey: 'villageId', header: 'Village id', size: 120, readOnly: false },
    { id: 'gpId', accessorKey: 'gpId', header: 'GP id', size: 120, readOnly: false },
    { id: 'acId', accessorKey: 'acId', header: 'AC id', size: 100, readOnly: false },
    { id: 'acName', accessorKey: 'acName', header: 'AC Name', size: 150, readOnly: false },
    { id: 'pcId', accessorKey: 'pcId', header: 'PC id', size: 100, readOnly: false },
    { id: 'pcName', accessorKey: 'pcName', header: 'PC Name', size: 150, readOnly: false },
  ];

  // Available column options for filters
  const columnOptions: ColumnOption[] = [
    { key: 'ltp', label: 'LBT' },
    { key: 'districtName', label: 'District' },
    { key: 'block', label: 'Block' },
    { key: 'gp', label: 'GP' },
    { key: 'villageName', label: 'Village' },
    { key: 'count', label: 'Count' },
    { key: 'mappingStatus', label: 'Mapping Status' },
    { key: 'villageId', label: 'Village id' },
    { key: 'gpId', label: 'GP id' },
    { key: 'acId', label: 'AC id' },
    { key: 'acName', label: 'AC Name' },
    { key: 'pcId', label: 'PC id' },
    { key: 'pcName', label: 'PC Name' },
  ];

  const activeFilterCount = Object.values(columnFilters).filter(filter => filter.trim() !== '').length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header with required props */}
      <Header 
        onDataReceived={handleDataReceived}
        onFilterChange={handleFilterChange}
      />
      
      {/* Column Filters */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {columnOptions.map((column) => {
              const uniqueValues = getUniqueColumnValues(column.key as keyof VillageData);
              const hasOptions = uniqueValues.length > 0;
              const currentValue = columnFilters[column.key];
              
              return (
                <div key={column.key} className="min-w-[140px] w-[140px] flex-shrink-0">
                  <SearchableSelect
                    value={currentValue}
                    onChange={(value) => handleColumnFilterChange(column.key, value)}
                    options={uniqueValues}
                    placeholder={column.label}
                    disabled={!hasOptions}
                  />
                </div>
              );
            })}
            
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              {/* Active Filters Count */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
                  </svg>
                  {activeFilterCount} active
                </div>
              )}

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                title="Clear All Filters"
              >
                <RefreshCw size={14} />
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors cursor-pointer"
                title="Download CSV"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-hidden bg-white">
        {filteredData.length > 0 ? (
          <div className="h-full overflow-auto">
            <AdvancedExcelDataTable
              data={filteredData}
              columns={columns}
              onUpdateCell={handleUpdateCell}
              enableCopyPaste={true}
              enableSorting={true}
              enableColumnResize={true}
              enableRowSelection={true}
              enableUndoRedo={true}
            />
          </div>
        ) : (
          <div className="px-6 py-16 text-center text-gray-500 bg-gray-50 m-4 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex flex-col items-center">
              <MapPin className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium mb-2">No village mapping data found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-2 border-t border-gray-200 bg-white text-xs text-gray-500 flex-shrink-0">
        <div className="flex justify-between items-center">
          <span>Village Mapping - Static Demo</span>
          <span>Total Records: {data.length} | Filtered: {filteredData.length}</span>
        </div>
      </div>
    </div>
  );
}

// Static sample data (moved outside component for better organization)
const STATIC_VILLAGE_DATA: VillageData[] = [
  {
    id: 1,
    ltp: 'LTP001',
    districtName: 'District A',
    block: 'Block 1',
    gp: 'GP 001',
    villageName: 'Village Alpha',
    count: '150',
    mappingStatus: 'Mapped',
    villageId: 'V001',
    gpId: 'GP001',
    acId: 'AC001',
    acName: 'Assembly A',
    pcId: 'PC001',
    pcName: 'Parliament A'
  },
  {
    id: 2,
    ltp: 'LTP002',
    districtName: 'District B',
    block: 'Block 2',
    gp: 'GP 002',
    villageName: 'Village Beta',
    count: '200',
    mappingStatus: 'Unmapped',
    villageId: 'V002',
    gpId: 'GP002',
    acId: 'AC002',
    acName: 'Assembly B',
    pcId: 'PC002',
    pcName: 'Parliament B'
  },
  {
    id: 3,
    ltp: 'LTP003',
    districtName: 'District C',
    block: 'Block 3',
    gp: 'GP 003',
    villageName: 'Village Gamma',
    count: '180',
    mappingStatus: 'Mapped',
    villageId: 'V003',
    gpId: 'GP003',
    acId: 'AC003',
    acName: 'Assembly C',
    pcId: 'PC003',
    pcName: 'Parliament C'
  },
  {
    id: 4,
    ltp: 'LTP004',
    districtName: 'District A',
    block: 'Block 1',
    gp: 'GP 004',
    villageName: 'Village Delta',
    count: '220',
    mappingStatus: 'In Progress',
    villageId: 'V004',
    gpId: 'GP004',
    acId: 'AC001',
    acName: 'Assembly A',
    pcId: 'PC001',
    pcName: 'Parliament A'
  },
  {
    id: 5,
    ltp: 'LTP005',
    districtName: 'District B',
    block: 'Block 2',
    gp: 'GP 005',
    villageName: 'Village Epsilon',
    count: '170',
    mappingStatus: 'Mapped',
    villageId: 'V005',
    gpId: 'GP005',
    acId: 'AC002',
    acName: 'Assembly B',
    pcId: 'PC002',
    pcName: 'Parliament B'
  }
];