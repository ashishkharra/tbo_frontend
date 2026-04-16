'use client';

import { useState, useEffect, useRef } from 'react';
import LiveMasterFilter from '@/components/LiveMasterFilter';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import type { ColumnSettings } from 'handsontable/settings';
import {
  Trash2,
  Download,
  FileText,
  Upload,
  Loader2,
} from 'lucide-react';
import {
  addRowInDataIdImportMaster,
  dataidImportMasterTable,
  addEmptyRowsApi,
  deleteMasterRowApi,
  saveMasterPatchApi,
  downloadMasterExcelApi,
  importMasterCsvApi
} from '@/apis/api';

registerAllModules();

interface DataItem {
  id: number;
  data_id: number | string;
  [key: string]: any;
}

interface FilterOptions {
  data_id?: number[];
  is_active?: number[];
  dropdown_name?: string[];
  reg_name?: string[];
}

interface DataIdDropdownRow {
  data_id: number | string;
  data_id_name_hi?: string;
  data_id_name_en?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    result: DataItem[];
    filters: {
      data_id?: number[];
      is_active?: number[];
      dropdown_name?: string[];
      reg_name?: string[];
    };
    dataidRows?: DataIdDropdownRow[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      limit: number;
    };
  };
  message?: string;
}

export default function DropdownMasterPage() {
  const hotTableRef = useRef<any>(null);
  const selectedPhysicalRowRef = useRef<number | null>(null);

  const [data, setData] = useState<DataItem[]>([]);
  const [columns, setColumns] = useState<ColumnSettings[]>([]);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    is_active: [],
    data_id: [],
    dropdown_name: [],
    reg_name: [],
  });

  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const [selectedDropdown, setSelectedDropdown] = useState('');
  const [selectedDataId, setSelectedDataId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDropdownName, setSelectedDropdownName] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [valueId, setValueId] = useState('');
  const [englishValue, setEnglishValue] = useState('');
  const [hindiValue, setHindiValue] = useState('');
  const [emptyRowCount, setEmptyRowCount] = useState('1');

  const [separateDataIdRows, setSeparateDataIdRows] = useState<DataIdDropdownRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [insertLoading, setInsertLoading] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);

  useEffect(() => {
    selectedPhysicalRowRef.current = selectedRowIndex;
  }, [selectedRowIndex]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState<number | 'All'>(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const isYojnaMaster = selectedDropdown === 'eroll_yojna_master';
  const isOtherMaster = selectedDropdown === 'eroll_dropdown';
  const isCastMaster = selectedDropdown === 'eroll_castmaster';
  const isImportMaster = selectedDropdown === 'dataid_importmaster';

  const [formData, setFormData] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dataIdDropdownOptions = (separateDataIdRows || []).map((item) => ({
    value: String(item.data_id),
    label: item.data_id_name_hi
      ? `${item.data_id} - ${item.data_id_name_hi}`
      : item.data_id_name_en
        ? `${item.data_id} - ${item.data_id_name_en}`
        : String(item.data_id)
  }));

  const tableFieldConfig: Record<
    string,
    {
      title: string;
      fields: {
        name: string;
        label: string;
        type?: 'text' | 'number' | 'select' | 'date';
        required?: boolean;
        readonly?: boolean;
      }[];
    }
  > = {
    dataid_importmaster: {
      title: 'Insert New Data ID Master',
      fields: [
        { name: 'data_id', label: 'Data ID', type: 'select', required: true },
        { name: 'data_id_name_hi', label: 'Data ID Name (HI)' },
        { name: 'data_id_name_en', label: 'Data ID Name (EN)' },
        { name: 'ac_no', label: 'AC No', type: 'number' },
        { name: 'ac_name_hi', label: 'AC Name HI' },
        { name: 'ac_name_en', label: 'AC Name EN' },
        { name: 'pc_no', label: 'PC No', type: 'number' },
        { name: 'pc_name_hi', label: 'PC Name HI' },
        { name: 'pc_name_en', label: 'PC Name EN' },
        { name: 'district_id', label: 'District ID', type: 'number' },
        { name: 'district_hi', label: 'District HI' },
        { name: 'district_en', label: 'District EN' },
        { name: 'party_district_id', label: 'Party District ID', type: 'number' },
        { name: 'party_district_hi', label: 'Party District HI' },
        { name: 'party_district_en', label: 'Party District EN' },
        { name: 'div_id', label: 'Div ID', type: 'number' },
        { name: 'div_name_hi', label: 'Div Name HI' },
        { name: 'div_name_en', label: 'Div Name EN' },
      ]
    },

    eroll_castmaster: {
      title: 'Insert New Cast Master',
      fields: [
        { name: 'data_id', label: 'Data ID', type: 'select', required: true },
        { name: 'rid', label: 'RID' },
        { name: 'religion_en', label: 'Religion EN' },
        { name: 'religion_hi', label: 'Religion HI' },
        { name: 'catid', label: 'Cat ID' },
        { name: 'castcat_en', label: 'Cast Category EN' },
        { name: 'castcat_hi', label: 'Cast Category HI' },
        { name: 'castid', label: 'Cast ID' },
        { name: 'castida_en', label: 'Cast Name EN' },
        { name: 'castida_hi', label: 'Cast Name HI' },
      ]
    },

    eroll_dropdown: {
      title: 'Insert New Dropdown Master',
      fields: [
        { name: 'data_id', label: 'Data ID', type: 'select', required: true },
        { name: 'dropdown_id', label: 'Dropdown ID', type: 'number' },
        { name: 'dropdown_name', label: 'Dropdown Name' },
        { name: 'value_hi', label: 'Value HI' },
        { name: 'value_en', label: 'Value EN' },
        { name: 'value_id', label: 'Value ID' },
      ]
    },

    eroll_yojna_master: {
      title: 'Insert New Yojna Master',
      fields: [
        { name: 'data_id', label: 'Data ID', type: 'select', required: true },
        { name: 'yojna_id', label: 'Yojna ID', type: 'number' },
        { name: 'yojna_name', label: 'Yojna Name' },
        { name: 'regid', label: 'Register ID', type: 'number' },
        { name: 'reg_name', label: 'Register Name' },
        { name: 'is_active', label: 'Status', type: 'number' },
        { name: 'updated_at', label: 'Updated At', type: 'date' },
      ]
    }
  };

  const getInitialFormData = (tableName: string) => {
    const config = tableFieldConfig[tableName];
    if (!config) return {};

    const initial: Record<string, any> = {};

    config.fields.forEach((field) => {
      if (field.name === 'is_active') {
        initial[field.name] = 1;
      } else {
        initial[field.name] = '';
      }
    });

    return initial;
  };

  // Helper function to format array/object values for display
  const formatArrayOrObjectValue = (value: any): string => {
    if (value === null || value === undefined) return '-';

    if (Array.isArray(value)) {
      if (value.length === 0) return '-';
      return value.map(item => {
        if (typeof item === 'object' && item !== null) {
          return JSON.stringify(item);
        }
        return String(item);
      }).join(', ');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    setSelectedDataId('');
    setSelectedStatus('');
    setRegisterName('');
    setSelectedDropdownName('');
    setHindiValue('');
    setEnglishValue('');
    setValueId('');
    setData([]);
    setColumns([]);
    setSeparateDataIdRows([]);
    setCurrentPage(1);
    setShowInsertModal(false);
    setSelectedRowIndex(null);
    setSelectedRowData(null);
    setFormData(getInitialFormData(selectedDropdown));
  }, [selectedDropdown]);

  useEffect(() => {
    if (showInsertModal && selectedDropdown) {
      setFormData((prev) => ({
        ...getInitialFormData(selectedDropdown),
        ...prev,
        data_id: selectedDataId || prev?.data_id || ''
      }));
    }
  }, [showInsertModal, selectedDropdown, selectedDataId]);

  const fetchData = async (page?: number, limit?: number | 'All') => {
    if (!selectedDropdown) {
      setData([]);
      setColumns([]);
      return;
    }

    setLoading(true);

    try {
      const params: any = {
        table: selectedDropdown,
        page: page !== undefined ? page : currentPage,
        limit:
          limit !== undefined
            ? (limit === 'All' ? 1000 : limit)
            : (itemsPerPage === 'All' ? 1000 : itemsPerPage),
      };

      if (selectedDataId) params.data_id = selectedDataId;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedDropdownName) params.dropdown_name = selectedDropdownName;
      if (registerName) params.reg_name = registerName;
      if (valueId) params.value_id = valueId;
      if (englishValue) params.search = englishValue;
      if (hindiValue) params.search = hindiValue;

      const response = await dataidImportMasterTable(params) as ApiResponse;

      if (response.success && response.data) {
        const result = response.data.result || [];
        setData(result);
        setSelectedRowIndex(null);
        setSelectedRowData(null);
        setSeparateDataIdRows(response?.data?.dataidRows || []);

        if (result.length > 0) {
          const dynamicColumns: ColumnSettings[] = Object.keys(result[0]).map((key) => {
            if (key === 'is_active') {
              return {
                data: key,
                title: 'Status',
                width: 90,
                className: 'htCenter',
                renderer: (_instance, td, _row, _col, _prop, value) => {
                  td.textContent = Number(value) === 1 ? 'Active' : 'Inactive';
                  td.className = 'htCenter htMiddle';
                  return td;
                }
              };
            }

            if (key === 'updated_at') {
              return {
                data: key,
                title: 'Updated',
                width: 150,
                className: 'htCenter',
                renderer: (_instance, td, _row, _col, _prop, value) => {
                  td.textContent = value ? new Date(value).toLocaleString() : '-';
                  td.className = 'htCenter htMiddle';
                  return td;
                }
              };
            }

            // Special handling for data_range or any array/object columns
            if (key === 'data_range' || key.includes('range')) {
              return {
                data: key,
                title: key.replace(/_/g, ' ').toUpperCase(),
                width: 200,
                className: 'htCenter htMiddle',
                renderer: (_instance, td, _row, _col, _prop, value) => {
                  const formattedValue = formatArrayOrObjectValue(value);
                  const truncatedValue = truncateText(formattedValue, 30);

                  td.textContent = truncatedValue;
                  td.className = 'htCenter htMiddle';
                  td.title = formattedValue; // Full value on hover
                  td.style.cursor = 'help';
                  td.style.overflow = 'hidden';
                  td.style.textOverflow = 'ellipsis';
                  td.style.whiteSpace = 'nowrap';

                  return td;
                }
              };
            }

            return {
              data: key,
              title: key.replace(/_/g, ' ').toUpperCase(),
              width: 120,
              className: 'htCenter htMiddle',
              readOnly:
                key === 'id' ||
                key === 'is_active' ||
                key === 'data_range'
            };
          });

          setColumns(dynamicColumns);
        } else {
          setColumns([]);
        }

        setFilterOptions(response.data.filters || {
          data_id: [],
          is_active: [],
          dropdown_name: [],
          reg_name: []
        });

        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
          setTotalRecords(response.data.pagination.totalRecords);
        }
      } else {
        setData([]);
        setColumns([]);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      setData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedDropdown) {
        fetchData(1, itemsPerPage);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    selectedDropdown,
    selectedDataId,
    selectedStatus,
    selectedDropdownName,
    registerName,
    valueId,
    englishValue,
    hindiValue
  ]);

  const handleDelete = async () => {
    console.log("vdsfvds", selectedDropdown)
    if (!selectedDropdown) {
      alert('Please select a dropdown master first');
      return;
    }
    if (!selectedRowData) {
      alert('Please select a row first 2');
      return;
    }

    if (!selectedRowData.id || !selectedRowData.data_id) {
      alert('Selected row is missing id or data_id');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete row ID ${selectedRowData.id}?`
    );

    if (!confirmDelete) return;

    setDeleteLoading(true);

    try {
      const response = await deleteMasterRowApi({
        table: selectedDropdown,
        id: Number(selectedRowData.id),
        data_id: selectedRowData.data_id
      });

      if (response.success) {
        alert(response.message || 'Row deleted successfully');
        setSelectedRowIndex(null);
        setSelectedRowData(null);
        fetchData(currentPage, itemsPerPage);
      } else {
        alert(response.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error during delete operation');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedDropdown) {
      alert('Please select a dropdown master first');
      return;
    }

    setDownloadLoading(true);

    try {
      const filters: any = {
        table: selectedDropdown,
      };

      if (selectedDataId) filters.data_id = selectedDataId;
      if (selectedStatus) filters.is_active = selectedStatus;
      if (selectedDropdownName) filters.dropdown_name = selectedDropdownName;
      if (registerName) filters.reg_name = registerName;
      if (valueId) filters.value_id = valueId;
      if (englishValue) filters.search = englishValue;
      if (hindiValue) filters.search = hindiValue;

      const res = await downloadMasterExcelApi(filters);

      if (!res.success) {
        alert(res.message || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDropdown) {
      alert('Please select a dropdown master first');
      return;
    }

    if (!selectedRowData) {
      alert('Please select a row first');
      return;
    }

    if (!selectedRowData.id || !selectedRowData.data_id) {
      alert('Selected row is missing id or data_id');
      return;
    }

    setTemplateLoading(true);

    try {
      const updates = { ...selectedRowData };
      delete updates.id;
      delete updates.data_id;

      const response = await saveMasterPatchApi({
        table: selectedDropdown,
        id: Number(selectedRowData.id),
        data_id: selectedRowData.data_id,
        updates
      });

      if (response.success) {
        alert(response.message || 'Row saved successfully');
        fetchData(currentPage, itemsPerPage);
      } else {
        alert(response.message || 'Save failed');
      }
    } catch (error) {
      console.error('Save patch error:', error);
      alert('Error while saving row');
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleImport = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];

    if (!selectedDropdown) {
      alert('Please select a dropdown master first');
      return;
    }

    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    const confirmImport = window.confirm(
      `This will override existing data in ${selectedDropdown} for the imported data scope. Continue?`
    );

    if (!confirmImport) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImportLoading(true);

    try {
      const response = await importMasterCsvApi({
        table: selectedDropdown,
        file
      });

      if (response.success) {
        alert(response.message || 'Import completed successfully');
        fetchData(currentPage, itemsPerPage);
      } else {
        alert(response.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Error during import operation');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInsertRow = async () => {
    if (!selectedDropdown) {
      alert('Please select table first');
      return;
    }

    if (!formData.data_id) {
      alert('Data ID is required');
      return;
    }

    setInsertLoading(true);

    try {
      const config = tableFieldConfig[selectedDropdown];
      const payload: Record<string, any> = {
        table: selectedDropdown
      };

      config.fields.forEach((field) => {
        let value = formData[field.name];

        if (field.type === 'number' && value !== '') {
          value = Number(value);
        }

        payload[field.name] = value === '' ? null : value;
      });

      const response = await addRowInDataIdImportMaster(payload);

      if (response.success) {
        alert('Row inserted successfully');
        setShowInsertModal(false);
        setFormData(getInitialFormData(selectedDropdown));
        fetchData(currentPage, itemsPerPage);
      } else {
        alert(response.message || 'Insert failed');
      }
    } catch (error) {
      console.error('Insert error:', error);
      alert('Error inserting row');
    } finally {
      setInsertLoading(false);
    }
  };

  const handleAddEmptyRow = async () => {
    if (!selectedDropdown) {
      alert('Please select a table first');
      return;
    }

    if (selectedDropdown === 'dataid_importmaster') {
      alert('Add row is not allowed for Data ID Import Master');
      return;
    }

    if (!selectedDataId) {
      alert('Please select a Data ID first');
      return;
    }

    const count = Number(emptyRowCount);

    if (!count || Number.isNaN(count) || count < 1) {
      alert('Please enter valid row count');
      return;
    }

    if (count > 100) {
      alert('Only 100 rows are allowed');
      return;
    }

    try {
      setInsertLoading(true);

      const res = await addEmptyRowsApi(
        selectedDropdown,
        Number(selectedDataId),
        count
      );

      if (res.success) {
        alert(res.message || 'Empty row(s) created successfully');
        fetchData(currentPage, itemsPerPage);
      } else {
        alert(res.message || 'Insert failed');
      }
    } catch (error) {
      console.error('Add empty row error:', error);
      alert('Error creating row');
    } finally {
      setInsertLoading(false);
    }
  };

  const isAnyActionLoading =
    loading ||
    deleteLoading ||
    downloadLoading ||
    templateLoading ||
    importLoading ||
    insertLoading;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-gray-100 border-b border-gray-200 px-6 pt-1 flex-shrink-0">
        <div className="w-full flex items-center gap-6">
          <div className="flex-1 min-w-0 py-1 px-6">
            <LiveMasterFilter />
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white border rounded-lg px-12">
          <div className="flex items-end gap-3 pb-2 pt-0 flex-wrap">
            <div className="w-[200px]">
              <select
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700"
                value={selectedDropdown}
                onChange={(e) => setSelectedDropdown(e.target.value)}
                disabled={isAnyActionLoading}
              >
                <option value="">Select</option>
                <option value="dataid_importmaster">DATAID Import Master</option>
                <option value="eroll_castmaster">CASTID Master</option>
                <option value="eroll_dropdown">Other Masters</option>
                <option value="eroll_yojna_master">Yojna Master</option>
              </select>
            </div>

            <div className="w-fit">
              <select
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700"
                value={selectedDataId}
                onChange={(e) => setSelectedDataId(e.target.value)}
                disabled={isAnyActionLoading}
              >
                <option value="">All</option>
                {dataIdDropdownOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {isOtherMaster && (
              <div className="w-[200px]">
                <select
                  value={selectedDropdownName}
                  onChange={(e) => setSelectedDropdownName(e.target.value)}
                  className="w-full text-black mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Dropdown Name</option>
                  {filterOptions.dropdown_name?.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isYojnaMaster && (
              <div className="w-[200px] text-black">
                <select
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Register Name</option>
                  {filterOptions.reg_name?.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!isOtherMaster && !isCastMaster && !isYojnaMaster && (
              <div className="w-[110px]">
                <select
                  className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isAnyActionLoading}
                >
                  <option value="">All</option>
                  {filterOptions.is_active?.map((status) => (
                    <option key={status} value={status}>
                      {Number(status) === 1 ? 'Active' : 'Inactive'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="w-[280px]">
              <input
                placeholder="Search"
                value={hindiValue}
                onChange={(e) => setHindiValue(e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400"
                disabled={isAnyActionLoading}
              />
            </div>

            {selectedDataId && !isImportMaster && (
              <div className="flex gap-2 items-center">
                <input
                  placeholder="Count"
                  type="number"
                  min={1}
                  max={100}
                  value={emptyRowCount}
                  onChange={(e) => setEmptyRowCount(e.target.value)}
                  className="h-8 w-20 rounded text-black px-2 border border-black"
                  disabled={isAnyActionLoading}
                />
                <button
                  onClick={handleAddEmptyRow}
                  disabled={isAnyActionLoading || !selectedDropdown || !selectedDataId}
                  className="h-8 min-w-[90px] px-3 flex items-center justify-center gap-2 rounded-md text-white bg-gray-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {insertLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    "ADD ROW"
                  )}
                </button>
              </div>
            )}

            {!isImportMaster && (
              <button
                onClick={() => setShowInsertModal(true)}
                disabled={isAnyActionLoading || !selectedDropdown}
                className="h-8 min-w-[40px] px-4 flex items-center justify-center rounded-md text-white bg-gray-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <span className="text-lg leading-none">+</span>
              </button>
            )}

            {!isImportMaster && (
              <button
                onClick={handleDelete}
                disabled={isAnyActionLoading || !selectedDropdown || !selectedRowData}
                className="h-8 w-10 flex items-center justify-center rounded-md text-white bg-gray-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
                title={selectedRowData ? 'Delete selected row' : 'Select a row first'}
              >
                {deleteLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={isAnyActionLoading || !selectedDropdown}
              className="h-8 w-fit px-2 flex gap-1.5 items-center justify-center rounded-md text-white bg-yellow-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              {downloadLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span>Download</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isAnyActionLoading || !selectedDropdown}
              className="h-8 w-fit flex gap-1.5 px-2 items-center justify-center rounded-md text-white bg-green-600 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              {templateLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
              <span>Save</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />

            {!isImportMaster && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnyActionLoading || !selectedDropdown}
                className="h-8 w-10 flex items-center justify-center rounded-md text-white bg-gray-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
                title="Import CSV and override existing data"
              >
                {importLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mt-4 border rounded-lg p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Loading data...</p>
            </div>
          </div>
        ) : data.length > 0 ? (
          <div className="mt-2 border rounded-lg overflow-hidden">
            <div className='h-[83vh]'>
              <HotTable
                ref={hotTableRef}
                data={data}
                columns={columns}
                colHeaders={true}
                rowHeaders={true}
                width="100%"
                height={data.length === 0 ? 100 : Math.min(data.length * 42 + 50, 690)}
                licenseKey="non-commercial-and-evaluation"
                stretchH="all"
                manualColumnResize={true}
                columnSorting={true}
                contextMenu={false}
                copyPaste={true}
                outsideClickDeselects={false}
                autoWrapRow={true}
                autoWrapCol={true}
                wordWrap={false}
                selectionMode="range"
                currentRowClassName="currentRow"
                currentColClassName="currentCol"
                afterSelectionEnd={(row) => {
                  const hot = hotTableRef.current?.hotInstance;
                  if (!hot) return;

                  const physicalRow = hot.toPhysicalRow(row);

                  if (
                    physicalRow === null ||
                    physicalRow === undefined ||
                    physicalRow < 0 ||
                    !data[physicalRow]
                  ) {
                    return;
                  }

                  if (selectedPhysicalRowRef.current === physicalRow) {
                    return;
                  }

                  selectedPhysicalRowRef.current = physicalRow;
                  setSelectedRowIndex(physicalRow);
                  setSelectedRowData(data[physicalRow]);
                }}
                afterChange={(changes, source) => {
                  if (!changes || source === "loadData") return;

                  setData((prevData) => {
                    const updatedData = [...prevData];

                    changes.forEach(([row, prop, oldValue, newValue]) => {
                      if (oldValue === newValue) return;

                      const hot = hotTableRef.current?.hotInstance;
                      const physicalRow =
                        hot && typeof row === "number" ? hot.toPhysicalRow(row) : row;

                      if (
                        physicalRow !== null &&
                        physicalRow !== undefined &&
                        physicalRow >= 0 &&
                        updatedData[physicalRow]
                      ) {
                        updatedData[physicalRow] = {
                          ...updatedData[physicalRow],
                          [String(prop)]: newValue
                        };
                      }
                    });

                    if (
                      selectedRowIndex !== null &&
                      selectedRowIndex !== undefined &&
                      updatedData[selectedRowIndex]
                    ) {
                      setSelectedRowData(updatedData[selectedRowIndex]);
                    }

                    return updatedData;
                  });
                }}
                afterDeselect={() => {
                  if (selectedPhysicalRowRef.current === null) return;
                  selectedPhysicalRowRef.current = null;
                  setSelectedRowIndex(null);
                  setSelectedRowData(null);
                }}
                className="htCenter htMiddle"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-260px)] text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">
              डेटा देखने के लिए डेटा ID सेलेक्ट करें
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Please select a Data ID from the filter above to view data
            </p>
            {selectedDropdown && !loading && (
              <p className="text-xs text-gray-400 mt-2">
                Total Records: {totalRecords} | Total Pages: {totalPages}
              </p>
            )}
          </div>
        )}
      </div>

      {showInsertModal && selectedDropdown && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white text-gray-800 rounded-xl p-6 w-[1000px] max-h-[90vh] overflow-y-auto shadow-2xl border">
            <h2 className="text-lg font-semibold mb-5 border-b pb-3 text-gray-700">
              {tableFieldConfig[selectedDropdown]?.title || 'Insert Row'}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-5">
              {tableFieldConfig[selectedDropdown]?.fields.map((field) => (
                <div key={field.name}>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    {field.label} {field.required ? '*' : ''}
                  </label>

                  {field.type === 'select' && field.name === 'data_id' ? (
                    <select
                      value={formData[field.name] ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select Data ID</option>
                      {dataIdDropdownOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setShowInsertModal(false)}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleInsertRow}
                disabled={insertLoading}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow"
              >
                {insertLoading ? 'Inserting...' : 'Insert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}