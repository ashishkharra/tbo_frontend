'use client';

import { useState, useEffect, useRef } from 'react';
import LiveMasterFilter from '@/components/LiveMasterFilter';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import type { ColumnSettings } from 'handsontable/settings';
import {
  Play,
  Trash2,
  Download,
  FileText,
  Upload,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { addRowInDataIdImportMaster, dataidImportMasterTable } from '@/apis/api';

registerAllModules();

interface DataItem {
  id: number;
  data_id: number;
  data_id_name_hi: string;
  data_id_name_en: string;
  ac_no: number;
  ac_name_hi: string;
  ac_name_en: string;
  pc_no: number;
  pc_name_hi: string;
  pc_name_en: string;
  district_id: number;
  district_hi: string;
  district_en: string;
  party_district_id: number;
  party_district_hi: string;
  party_district_en: string;
  div_id: number;
  div_name_hi: string;
  div_name_en: string;
  data_range: any;
  is_active: number;
  updated_at: string;
}
interface FilterOptions {
  status: number[];
  data_id: number[];
}


interface ApiResponse {
  success: boolean;
  data: {
    result: DataItem[];
    filters: {
      status: number[];
      data_id: number[];
    };
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      limit: number;
    };
  };
}

export default function DropdownMasterPage() {
  const hotTableRef = useRef<any>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: [],
    data_id: [],
  });
  const [selectedDataId, setSelectedDataId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDropdown, setSelectedDropdown] = useState('');

  // Loading states for different actions
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [insertLoading, setInsertLoading] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);

  // Search input values
  const [valueId, setValueId] = useState('');
  const [englishValue, setEnglishValue] = useState('');
  const [hindiValue, setHindiValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'All'>(50);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  // const columns: ColumnSettings[] = [
  //   { data: 'id', title: 'ID', width: 70, readOnly: true, className: 'htCenter' },
  //   { data: 'data_id', title: 'Data ID', width: 90, className: 'htCenter' },
  //   { data: 'data_id_name_hi', title: 'Data Name (HI)', width: 120, className: 'htLeft' },
  //   { data: 'data_id_name_en', title: 'Data Name (EN)', width: 120, className: 'htLeft' },
  //   { data: 'ac_no', title: 'AC No', width: 80, className: 'htCenter' },
  //   { data: 'ac_name_hi', title: 'AC Name (HI)', width: 120, className: 'htLeft' },
  //   { data: 'ac_name_en', title: 'AC Name (EN)', width: 120, className: 'htLeft' },
  //   { data: 'pc_no', title: 'PC No', width: 80, className: 'htCenter' },
  //   { data: 'pc_name_hi', title: 'PC Name (HI)', width: 120, className: 'htLeft' },
  //   { data: 'pc_name_en', title: 'PC Name (EN)', width: 120, className: 'htLeft' },
  //   { data: 'district_id', title: 'District ID', width: 100, className: 'htCenter' },
  //   { data: 'district_hi', title: 'District (HI)', width: 120, className: 'htLeft' },
  //   { data: 'district_en', title: 'District (EN)', width: 120, className: 'htLeft' },
  //   { data: 'party_district_id', title: 'Party District ID', width: 120, className: 'htCenter' },
  //   { data: 'party_district_hi', title: 'Party District (HI)', width: 120, className: 'htLeft' },
  //   { data: 'party_district_en', title: 'Party District (EN)', width: 120, className: 'htLeft' },
  //   { data: 'div_id', title: 'Div ID', width: 80, className: 'htCenter' },
  //   { data: 'div_name_hi', title: 'Division (HI)', width: 140, className: 'htLeft' },
  //   { data: 'div_name_en', title: 'Division (EN)', width: 140, className: 'htLeft' },
  //   {
  //     data: 'is_active',
  //     title: 'Status',
  //     width: 90,
  //     className: 'htCenter',
  //     renderer: (instance, td, row, col, prop, value) => {
  //       td.textContent = value === 1 ? 'Active' : 'Inactive';
  //       td.className = 'htCenter';
  //       return td;
  //     }
  //   },
  //   {
  //     data: 'updated_at',
  //     title: 'Updated',
  //     width: 150,
  //     className: 'htCenter',
  //     renderer: (instance, td, row, col, prop, value) => {
  //       if (value) {
  //         td.textContent = new Date(value).toLocaleString();
  //       } else {
  //         td.textContent = '-';
  //       }
  //       return td;
  //     }
  //   }
  // ];

  const [columns, setColumns] = useState<ColumnSettings[]>([]);

  const [formData, setFormData] = useState({
    data_id: "",
    data_id_name_en: "",
    data_id_name_hi: "",
    ac_no: "",
    ac_name_en: "",
    ac_name_hi: "",
    pc_no: "",
    pc_name_en: "",
    pc_name_hi: "",
    district_id: "",
    district_en: "",
    district_hi: "",
    party_district_id: "",
    party_district_en: "",
    party_district_hi: "",
    div_id: "",
    div_name_en: "",
    div_name_hi: "",
    data_range: null,
    is_active: 1
  });

  const isYojnaMaster = selectedDropdown === "eroll_yojna_master";
  const isOtherMaster = selectedDropdown === "eroll_dropdown";
  const isCastMaster = selectedDropdown === "eroll_castmaster";
  const isImportMaster = selectedDropdown === "dataid_importmaster";

  const [registerName, setRegisterName] = useState("");
  const [dropdownName, setDropdownName] = useState("");

  useEffect(() => {
    setSelectedDataId("");
    setSelectedStatus("");
    setRegisterName("");
    setDropdownName("");
    setHindiValue("");
  }, [selectedDropdown]);


  const fetchData = async (page?: number, limit?: number | 'All') => {
    if (!selectedDropdown) {
      alert('Please select a dropdown master');
      return;
    }

    setLoading(true);
    try {
      const params: any = {
        table: selectedDropdown,
        page: page !== undefined ? page : currentPage,
        limit: limit !== undefined ? (limit === 'All' ? 1000 : limit) : (itemsPerPage === 'All' ? 1000 : itemsPerPage),
      };

      if (selectedDataId) params.data_id = selectedDataId;
      if (selectedStatus) params.status = selectedStatus;
      if (valueId) params.value_id = valueId;
      if (englishValue) params.search = englishValue;
      if (hindiValue) params.search = hindiValue;

      const response = await dataidImportMasterTable(params) as ApiResponse;

      // console.log('respon ->>>>> ', response)

      if (response.success && response.data) {
        const result = response.data.result || [];

        setData(result);

        if (result.length > 0) {

          const dynamicColumns: ColumnSettings[] = Object.keys(result[0]).map((key) => {

            // custom renderers
            if (key === "is_active") {
              return {
                data: key,
                title: "Status",
                width: 90,
                className: "htCenter",
                renderer: (instance, td, row, col, prop, value) => {
                  td.textContent = value === 1 ? "Active" : "Inactive";
                  td.className = "htCenter";
                  return td;
                }
              };
            }

            if (key === "updated_at") {
              return {
                data: key,
                title: "Updated",
                width: 150,
                className: "htCenter",
                renderer: (instance, td, row, col, prop, value) => {
                  td.textContent = value
                    ? new Date(value).toLocaleString()
                    : "-";
                  return td;
                }
              };
            }

            return {
              data: key,
              title: key.replace(/_/g, " ").toUpperCase(),
              width: 120,
              className: "htLeft"
            };
          });

          setColumns(dynamicColumns);
        }

        setFilterOptions(response.data.filters || { status: [], data_id: [] });

        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
          setTotalRecords(response.data.pagination.totalRecords);
          setItemsPerPage(response.data.pagination.limit === 1000 ? "All" : response.data.pagination.limit);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoClick = () => {
    setCurrentPage(1);
    fetchData(1, itemsPerPage);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchData(1, itemsPerPage);
  };

  const handleDelete = async () => {
    if (!selectedDropdown) {
      alert('Please select a dropdown master first');
      return;
    }
    setDeleteLoading(true);
    try {
      const params: any = {
        table: selectedDropdown,
        action: 'delete',
        page: 1,
        limit: itemsPerPage === 'All' ? 1000 : itemsPerPage,
      };
      if (selectedDataId) params.data_id = selectedDataId;
      if (selectedStatus) params.status = selectedStatus;
      if (valueId) params.value_id = valueId;
      if (englishValue) params.search = englishValue;
      if (hindiValue) params.search = hindiValue;

      const response = await dataidImportMasterTable(params) as ApiResponse;
      if (response.success && response.data) {
        setData(response.data.result || []);
        setFilterOptions(response.data.filters || { status: [], data_id: [] });
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
          setTotalRecords(response.data.pagination.totalRecords);
        }
        alert('Delete operation completed successfully');
      }
    } catch (error) {
      console.error('Error:', error);
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
      const params: any = {
        table: selectedDropdown,
        action: 'download'
      };

      if (selectedDataId) params.data_id = selectedDataId;
      if (selectedStatus) params.status = selectedStatus;
      if (valueId) params.value_id = valueId;
      if (englishValue) params.search = englishValue;
      if (hindiValue) params.search = hindiValue;

      const response = await dataidImportMasterTable(params) as ApiResponse;

      if (response.success && response.data) {
        setData(response.data.result || []);
        setFilterOptions(response.data.filters || { status: [], data_id: [] });
        alert('Download operation completed successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error during download operation');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleTemplate = async () => {
    if (!selectedDropdown) {
      alert('Please select a dropdown master first');
      return;
    }

    setTemplateLoading(true);
    try {
      const params: any = {
        table: selectedDropdown,
        action: 'template'
      };

      if (selectedDataId) params.data_id = selectedDataId;
      if (selectedStatus) params.status = selectedStatus;
      if (valueId) params.value_id = valueId;
      if (englishValue) params.search = englishValue;
      if (hindiValue) params.search = hindiValue;

      const response = await dataidImportMasterTable(params) as ApiResponse;

      if (response.success && response.data) {
        setData(response.data.result || []);
        setFilterOptions(response.data.filters || { status: [], data_id: [] });
        alert('Template operation completed successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error during template operation');
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedDropdown) {
      alert('Please select a dropdown master first');
      return;
    }

    setImportLoading(true);
    try {
      const params: any = {
        table: selectedDropdown,
        action: 'import'
      };

      if (selectedDataId) params.data_id = selectedDataId;
      if (selectedStatus) params.status = selectedStatus;
      if (valueId) params.value_id = valueId;
      if (englishValue) params.search = englishValue;
      if (hindiValue) params.search = hindiValue;

      const response = await dataidImportMasterTable(params) as ApiResponse;

      if (response.success && response.data) {
        setData(response.data.result || []);
        setFilterOptions(response.data.filters || { status: [], data_id: [] });
        alert('Import operation completed successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error during import operation');
    } finally {
      setImportLoading(false);
    }
  };

  const handleClear = async () => {
    if (!selectedDropdown) {
      alert('Please select a dropdown master first');
      return;
    }

    setClearLoading(true);
    try {
      const params: any = {
        table: selectedDropdown,
        action: 'clear'
      };

      if (selectedDataId) params.data_id = selectedDataId;
      if (selectedStatus) params.status = selectedStatus;
      if (valueId) params.value_id = valueId;
      if (englishValue) params.search = englishValue;
      if (hindiValue) params.search = hindiValue;

      const response = await dataidImportMasterTable(params) as ApiResponse;

      if (response.success && response.data) {
        setData(response.data.result || []);
        setFilterOptions(response.data.filters || { status: [], data_id: [] });
        alert('Clear operation completed successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error during clear operation');
    } finally {
      setClearLoading(false);
    }
  };

  const handleInsertRow = async () => {
    if (!formData.data_id) {
      alert("Data ID is required");
      return;
    }

    setInsertLoading(true);

    try {
      const payload = {
        table: selectedDropdown,
        ...formData,
        data_id: Number(formData.data_id),
        ac_no: Number(formData.ac_no || 0),
        pc_no: Number(formData.pc_no || 0),
        district_id: Number(formData.district_id || 0),
        party_district_id: Number(formData.party_district_id || 0),
        div_id: Number(formData.div_id || 0),
        is_active: 1
      };

      const response = await addRowInDataIdImportMaster(payload);

      if (response.success) {
        alert("Row inserted successfully");

        setShowInsertModal(false);

        // Reset form
        setFormData({
          data_id: "",
          data_id_name_en: "",
          data_id_name_hi: "",
          ac_no: "",
          ac_name_en: "",
          ac_name_hi: "",
          pc_no: "",
          pc_name_en: "",
          pc_name_hi: "",
          district_id: "",
          district_en: "",
          district_hi: "",
          party_district_id: "",
          party_district_en: "",
          party_district_hi: "",
          div_id: "",
          div_name_en: "",
          div_name_hi: "",
          data_range: null,
          is_active: 1
        });

        fetchData(currentPage, itemsPerPage);
      } else {
        alert(response.message || "Insert failed");
      }
    } catch (error) {
      console.error("Insert error:", error);
      alert("Error inserting row");
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
    clearLoading ||
    insertLoading;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-gray-100 border-b border-gray-200 px-6 pt-1 flex-shrink-0">
        <div className="w-full flex items-center gap-6">
          <div className="flex-1 min-w-0">
            <LiveMasterFilter />
          </div>
        </div>
      </div>

      <div className="">
        <div className="bg-white border rounded-lg px-4">
          <div className="flex items-end gap-3 pb-2 pt-0">
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

            <div className="w-[110px]">
              <select
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700"
                value={selectedDataId}
                onChange={(e) => setSelectedDataId(e.target.value)}
                disabled={isAnyActionLoading}
              >
                <option value="">All</option>
                {filterOptions.data_id?.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>


            {isOtherMaster && (
              <div className="w-[200px]">
                <select
                  value={dropdownName}
                  onChange={(e) => setDropdownName(e.target.value)}
                  className="w-full text-black mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Dropdown Name</option>
                  <option value="dropdown1">Dropdown 1</option>
                  <option value="dropdown2">Dropdown 2</option>
                </select>
              </div>
            )}

            {isYojnaMaster && (
              <div className="w-[200px]">
                <select
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Register Name</option>
                  <option value="register1">Register 1</option>
                  <option value="register2">Register 2</option>
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
                  {filterOptions.status?.map((status) => (
                    <option key={status} value={status}>
                      {status === 1 ? 'Active' : 'Inactive'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="w-[600px]">
              <input
                placeholder="Search"
                value={hindiValue}
                onChange={(e) => setHindiValue(e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400"
                disabled={isAnyActionLoading}
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <div className="pt-1 flex gap-2">
                {/* GO Button */}
                <button
                  onClick={handleGoClick}
                  disabled={isAnyActionLoading || !selectedDropdown}
                  className="h-8 min-w-[40px] px-3 flex items-center justify-center gap-2 rounded-md text-white bg-gray-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    "GO"
                  )}
                </button>

                {/* INSERT ROW Button */}
                {!isImportMaster && (
                  <button
                    onClick={() => setShowInsertModal(true)}
                    disabled={isAnyActionLoading || !selectedDropdown}
                    className="h-8 min-w-[40px] px-4 flex items-center justify-center rounded-md text-white bg-gray-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
                  >
                    {insertLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <span className="text-lg leading-none">+</span>
                    )}
                  </button>
                )}
              </div>

              {/* Apply Filters
              <button
                onClick={handleApplyFilters}
                disabled={isAnyActionLoading || !selectedDropdown}
                className="h-10 w-10 flex items-center justify-center rounded-md border border-gray-300 text-black bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Play size={16} />
                )}
              </button> */}

              {/* Delete */}
              {!isImportMaster && (
                <button
                  onClick={handleDelete}
                  disabled={isAnyActionLoading || !selectedDropdown}
                  className="h-8 w-10 flex items-center justify-center rounded-md text-white bg-gray-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}

              {/* Download */}
              <button
                onClick={handleDownload}
                disabled={isAnyActionLoading || !selectedDropdown}
                className="h-8 w-10 flex items-center justify-center rounded-md text-white bg-gray-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {downloadLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
              </button>

              {/* Template */}
              <button
                onClick={handleTemplate}
                disabled={isAnyActionLoading || !selectedDropdown}
                className="h-8 w-10 flex items-center justify-center rounded-md text-white bg-gray-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {templateLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileText size={14} />
                )}
              </button>

              {/* Import */}
              {!isImportMaster && (
                <button
                  onClick={handleImport}
                  disabled={isAnyActionLoading || !selectedDropdown}
                  className="h-8 w-10 flex items-center justify-center rounded-md text-white bg-gray-700 hover:opacity-90 cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
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
        </div>

        {loading ? (
          <div className="mt-4 border rounded-lg p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Loading data...</p>
            </div>
          </div>
        ) : data.length > 0 ? (
          <div className="mt-2 border rounded-lg overflow-hidden z-0">
            <HotTable
              ref={hotTableRef}
              data={data}
              columns={columns}
              colHeaders={columns.map(col => col.title)}
              rowHeaders={true}
              width="100%"
              height="calc(100vh - 180px)"
              stretchH="none" // 🔥 Important (prevents full width stretch)
              autoColumnSize={true}
              manualColumnResize={true}
              manualRowResize={true}
              filters={false}
              dropdownMenu={false}
              contextMenu={true}
              columnSorting={true}
              search={true}
              comments={true}
              fillHandle={true}
              autoWrapRow={true}
              autoWrapCol={true}
              rowHeights={35}
              wordWrap={false}
              className="custom-hot"
              licenseKey="non-commercial-and-evaluation"
            />
            {data.length > 0 && (
              <div className="bg-white border-t mt-7 px-4 py-1 flex items-center justify-between text-sm text-gray-600">
                <span>
                  {loading ? "Loading..." : `Page ${currentPage} of ${totalPages} · Showing ${((currentPage - 1) * (itemsPerPage === 'All' ? totalRecords : itemsPerPage)) + 1} to ${Math.min(currentPage * (itemsPerPage === 'All' ? totalRecords : itemsPerPage), totalRecords)} entries of ${totalRecords}`}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      fetchData(newPage, itemsPerPage);
                    }}
                    disabled={currentPage === 1 || loading}
                    className={`px-3 py-1 border rounded-md flex items-center ${currentPage === 1 || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      if (i < 5) pageNum = i + 1;
                      else if (i === 5) return <span key="ellipsis1" className="px-2 py-1">...</span>;
                      else pageNum = totalPages;
                    } else if (currentPage >= totalPages - 3) {
                      if (i === 0) pageNum = 1;
                      else if (i === 1) return <span key="ellipsis2" className="px-2 py-1">...</span>;
                      else pageNum = totalPages - (6 - i);
                    } else {
                      if (i === 0) pageNum = 1;
                      else if (i === 1) return <span key="ellipsis3" className="px-2 py-1">...</span>;
                      else if (i >= 2 && i <= 4) pageNum = currentPage - 2 + i;
                      else if (i === 5) return <span key="ellipsis4" className="px-2 py-1">...</span>;
                      else pageNum = totalPages;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          fetchData(pageNum, itemsPerPage);
                        }}
                        disabled={loading}
                        className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-gray-600 text-white' : 'border hover:bg-gray-50'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      fetchData(newPage, itemsPerPage);
                    }}
                    disabled={currentPage === totalPages || loading}
                    className={`px-3 py-1 border rounded-md flex items-center ${currentPage === totalPages || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                  >
                    <ChevronRight size={14} />
                  </button>

                  <span className="ml-3">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages && !loading) {
                        setCurrentPage(page);
                        fetchData(page, itemsPerPage);
                      }
                    }}
                    className="w-16 border rounded-md px-2 py-1 text-gray-700 bg-gray-50 text-center"
                    disabled={loading}
                  />

                  <span>Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      const value = e.target.value === 'All' ? 'All' : Number(e.target.value);
                      setItemsPerPage(value);
                      setCurrentPage(1);
                      fetchData(1, value);
                    }}
                    className="border rounded-md px-2 py-1 text-gray-700 bg-gray-50"
                    disabled={loading}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value="All">All</option>
                  </select>
                </div>
              </div>
            )}
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
          </div>
        )}
      </div>

      {showInsertModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white text-gray-800 rounded-xl p-6 w-[900px] shadow-2xl border">

            <h2 className="text-lg font-semibold mb-5 border-b pb-3 text-gray-700">
              Insert New Data ID Master
            </h2>

            {/* SECTION 1 */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Data ID *
                </label>
                <input
                  type="number"
                  value={formData.data_id}
                  onChange={(e) =>
                    setFormData({ ...formData, data_id: e.target.value })
                  }
                  className="compact-input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Data ID Name (EN)
                </label>
                <input
                  type="text"
                  value={formData.data_id_name_en}
                  onChange={(e) =>
                    setFormData({ ...formData, data_id_name_en: e.target.value })
                  }
                  className="compact-input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Data ID Name (HI)
                </label>
                <input
                  type="text"
                  value={formData.data_id_name_hi}
                  onChange={(e) =>
                    setFormData({ ...formData, data_id_name_hi: e.target.value })
                  }
                  className="compact-input"
                />
              </div>
            </div>

            {/* AC + PC */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <input
                type="number"
                placeholder="AC No"
                value={formData.ac_no}
                onChange={(e) =>
                  setFormData({ ...formData, ac_no: e.target.value })
                }
                className="compact-input"
              />

              <input
                placeholder="AC Name EN"
                value={formData.ac_name_en}
                onChange={(e) =>
                  setFormData({ ...formData, ac_name_en: e.target.value })
                }
                className="compact-input"
              />

              <input
                placeholder="AC Name HI"
                value={formData.ac_name_hi}
                onChange={(e) =>
                  setFormData({ ...formData, ac_name_hi: e.target.value })
                }
                className="compact-input"
              />

              <input
                type="number"
                placeholder="PC No"
                value={formData.pc_no}
                onChange={(e) =>
                  setFormData({ ...formData, pc_no: e.target.value })
                }
                className="compact-input"
              />

              <input
                placeholder="PC Name EN"
                value={formData.pc_name_en}
                onChange={(e) =>
                  setFormData({ ...formData, pc_name_en: e.target.value })
                }
                className="compact-input"
              />

              <input
                placeholder="PC Name HI"
                value={formData.pc_name_hi}
                onChange={(e) =>
                  setFormData({ ...formData, pc_name_hi: e.target.value })
                }
                className="compact-input"
              />
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 border-t pt-4 ">
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
                {insertLoading ? "Inserting..." : "Insert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}