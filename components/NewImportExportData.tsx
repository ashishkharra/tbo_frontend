// NewImportExportData.tsx
"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Plus, Upload, X, FileText, Trash2, Search } from "lucide-react";
import {
  getDataIdRow,
  updateDataIdRow,
  getDataIdAllRow,
  importEnRollData,
} from "../apis/api";
import { SearchableSelect } from "./voterList/SearchableSelect";

interface DataRange {
  from: number;
  to: number;
}

interface DataEntry {
  id: string;
  dataId: string;
  dataName: string;
  dataNameHi: string;
  date: string;
  acId: string;
  acNo: string;
  ac?: string;
  state?: string;
  liveVoterListCount: number;
  liveAdvVoterListCount: number;
  isActive?: boolean;
  data_range?: DataRange[];
}

interface AcOption {
  ac_id: string;
  ac_list: string;
}

interface DataIdOption {
  data_id: string;
  data_id_name_en?: string;
  data_id_name_hi?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  type?: string;
  data?: T[];
  message?: string;
  error?: string;
  deletedRows?: number;
}

interface NewImportExportDataProps {
  onSelectedRowsChange?: (selectedDataIds: string[]) => void;
  onBrowseClick?: () => void;
  setImportRowClicked?: (value: boolean) => void;
}

export default function NewImportExportData({
  onSelectedRowsChange,
  setImportRowClicked,
}: NewImportExportDataProps = {}) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false);
  const [selectedDataIdForUpload, setSelectedDataIdForUpload] =
    useState<string>("");
  const [selectedAcNoForUpload, setSelectedAcNoForUpload] =
    useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ac: "",
    dataId: "",
    dataName: "",
    dataNameHi: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [acOptions, setAcOptions] = useState<AcOption[]>([]);
  const [selectedAcValue, setSelectedAcValue] = useState<string>("");
  const [dataIdOptions, setDataIdOptions] = useState<DataIdOption[]>([]);
  const [loadingAcList, setLoadingAcList] = useState<boolean>(false);
  const [loadingDataIds, setLoadingDataIds] = useState<boolean>(false);
  const [loadingDataEntries, setLoadingDataEntries] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uploadAction, setUploadAction] = useState<string>("insert");

  const filteredEntries = dataEntries.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.dataId?.toLowerCase().includes(query) ||
      entry.dataName?.toLowerCase().includes(query) ||
      entry.dataNameHi?.toLowerCase().includes(query) ||
      entry.acNo?.toLowerCase().includes(query) ||
      entry.ac?.toLowerCase().includes(query) ||
      entry.date?.includes(query)
    );
  });

  const acSelectOptions = acOptions.map((option) => option.ac_list);

  const dataIdSelectOptions = dataIdOptions.map(
    (option) => option.data_id || ""
  );

  const loadDataEntries = async (): Promise<void> => {
    setLoadingDataEntries(true);
    try {
      const response = (await getDataIdAllRow()) as ApiResponse<any>;
      if (response?.success && response.type === "DATA_ID_LIST_ALL_ROWS") {
        const rows = response.data || [];

        const mapped: DataEntry[] = rows.map((e: any, index: number) => ({
          id: `${e.data_id}-${e.ac_no}-${index}`,
          dataId: e.data_id || "",
          dataName: e.data_id_name_en || "",
          dataNameHi: e.data_id_name_hi || "-",
          data_range: Array.isArray(e.data_range) ? e.data_range : [],
          date: e.updated_at ? String(e.updated_at).substring(0, 10) : "",
          ac: `${e.ac_no || ""} ${e.ac_name_hi || ""}`.trim(),
          acId: e.ac_name_hi || "",
          acNo: e.ac_no?.toString() || "",
          liveVoterListCount: e.live_voter_list_count || 0,
          liveAdvVoterListCount: e.live_adv_voter_list_count || 0,
          isActive: e.is_active === 1 || e.is_active === true,
        }));

        setDataEntries(mapped);
      }
    } catch (error) {
      console.error("Error loading data entries:", error);
    } finally {
      setLoadingDataEntries(false);
    }
  };

  const loadAcList = async (): Promise<void> => {
    setLoadingAcList(true);
    try {
      const response = (await getDataIdRow()) as ApiResponse<AcOption>;
      if (response?.success && response.type === "AC_LIST") {
        setAcOptions(response.data || []);
      }
    } catch (error) {
      console.error("Error loading AC list:", error);
    } finally {
      setLoadingAcList(false);
    }
  };

  const loadDataIdsByAc = async (acValue: string): Promise<void> => {
    if (!acValue) {
      setDataIdOptions([]);
      return;
    }

    setLoadingDataIds(true);
    try {
      const [ac_no, ...acNameParts] = acValue.split(" - ");
      const ac_name_hi = acNameParts.join(" - ");

      const response = (await getDataIdRow(
        `ac_no=${ac_no}&ac_name_hi=${encodeURIComponent(ac_name_hi)}`
      )) as ApiResponse<DataIdOption>;

      if (response?.success && response.type === "DATA_ID_LIST") {
        const dataIds = response.data || [];
        setDataIdOptions(dataIds);

        if (dataIds.length > 0) {
          const firstDataId = dataIds[0];
          setFormData({
            ac: acValue,
            dataId: firstDataId.data_id || "",
            dataName: firstDataId.data_id_name_en || "",
            dataNameHi: firstDataId.data_id_name_hi || "",
            date: new Date().toISOString().split("T")[0],
          });
        } else {
          setFormData({
            ac: acValue,
            dataId: "",
            dataName: "",
            dataNameHi: "",
            date: new Date().toISOString().split("T")[0],
          });
        }
      }
    } catch (error) {
      console.error("Error loading Data IDs:", error);
    } finally {
      setLoadingDataIds(false);
    }
  };

  const handleAcSelectChange = (value: string): void => {
    setSelectedAcValue(value);

    if (value) {
      loadDataIdsByAc(value);
    } else {
      setDataIdOptions([]);
      setFormData((prev) => ({
        ...prev,
        ac: "",
        dataId: "",
        dataName: "",
        dataNameHi: "",
        date: new Date().toISOString().split("T")[0],
      }));
    }
  };

  const handleDataIdSelectChange = (value: string): void => {
    const selectedOption = dataIdOptions.find((opt) => opt.data_id === value);

    if (selectedOption) {
      setFormData({
        ...formData,
        dataId: selectedOption.data_id || "",
        dataName: selectedOption.data_id_name_en || "",
        dataNameHi: selectedOption.data_id_name_hi || "",
      });
    }
  };

  const handleDataNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      dataName: e.target.value,
    });
  };

  const handleDataNameHiChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      dataNameHi: e.target.value,
    });
  };

  useEffect(() => {
    loadDataEntries();
    loadAcList();
  }, []);

  useEffect(() => {
    if (showAddForm && acOptions.length === 0) {
      loadAcList();
    }
  }, [showAddForm, acOptions.length]);

  const handleAddClick = (): void => {
    setShowAddForm(true);
    setFormData({
      ac: "",
      dataId: "",
      dataName: "",
      dataNameHi: "",
      date: new Date().toISOString().split("T")[0],
    });
    setSelectedAcValue("");
    setDataIdOptions([]);
  };

  const handleFormSubmit = async (
    e: React.FormEvent | React.MouseEvent
  ): Promise<void> => {
    e.preventDefault();

    if (!formData.dataId || !formData.dataName) {
      alert("Please fill in Data ID and Data Name");
      return;
    }

    try {
      const acParts = formData.ac.split(" - ");
      const acNo = acParts[0] || "";

      const updateData = {
        data_id: formData.dataId,
        ac_no: parseInt(acNo),
        data_id_name_en: formData.dataName,
        data_id_name_hi: formData.dataNameHi || formData.dataName,
      };

      const response = (await updateDataIdRow(updateData)) as ApiResponse;

      if (response?.success) {
        await loadDataEntries();
        setShowAddForm(false);
        setFormData({
          ac: "",
          dataId: "",
          dataName: "",
          dataNameHi: "",
          date: new Date().toISOString().split("T")[0],
        });
        setSelectedAcValue("");
        setDataIdOptions([]);
        alert("Data ID updated successfully!");
      } else {
        alert(
          `Failed to update Data ID: ${response?.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error(error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (): Promise<void> => {
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    if (!selectedDataIdForUpload || !selectedAcNoForUpload) {
      alert("Missing Data ID or AC No");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("action", uploadAction);

      const response = (await importEnRollData(
        formData,
        selectedDataIdForUpload,
        selectedAcNoForUpload
      )) as ApiResponse;

      if (response?.success) {
        alert(
          `File uploaded successfully! Action: ${uploadAction}. ${response.message || ""
          }`
        );
        await loadDataEntries();
        setShowUploadDialog(false);
        setSelectedFile(null);
        setUploadAction("insert");
      } else {
        alert(`Upload failed: ${response?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Upload failed: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setUploading(false);
    }
  };

  const openUploadDialog = (entry: DataEntry): void => {
    setSelectedDataIdForUpload(entry.dataId);
    setSelectedAcNoForUpload(entry.acNo);
    setSelectedFile(null);
    setShowUploadDialog(true);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleCheckAllChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newSelected = e.target.checked
      ? new Set(filteredEntries.map((entry) => entry.id))
      : new Set<string>();
    setSelectedRows(newSelected);
    if (onSelectedRowsChange) {
      onSelectedRowsChange(
        e.target.checked
          ? filteredEntries.map((e) => e.dataId).filter((id) => id)
          : []
      );
    }
  };

  const handleRowCheckChange = (entry: DataEntry, checked: boolean): void => {
    const updated = new Set(selectedRows);
    checked ? updated.add(entry.id) : updated.delete(entry.id);
    setSelectedRows(updated);
    if (onSelectedRowsChange) {
      const selectedDataIds = dataEntries
        .filter((e) => updated.has(e.id))
        .map((e) => e.dataId)
        .filter((id) => id);
      onSelectedRowsChange(selectedDataIds);
    }
  };

  return (
    <div className={`bg-white rounded border border-gray-200 px-4 h-full`}>
      <div className="">
        <button
          id="import-add-button"
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium opacity-0"
        >
          <Plus className="w-4 h-4" /> Add Import Row
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/40  z-[9999] flex items-center justify-center">
          <div className="bg-white rounded shadow-xl w-full max-w-2xl">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 flex items-center justify-between rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                Add New Import Session
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedAcValue("");
                  setDataIdOptions([]);
                  setImportRowClicked?.(false); // reset parent state
                }}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="flex justify-between">
                  <div className="w-full mr-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AC No & Name <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      id="ac-select"
                      value={selectedAcValue}
                      onChange={handleAcSelectChange}
                      options={acSelectOptions}
                      placeholder="Select AC No & Name"
                      label=""
                      activeDropdown={activeDropdown}
                      onDropdownToggle={setActiveDropdown}
                    />
                    {loadingAcList && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading AC list...
                      </p>
                    )}
                  </div>

                  <div className="w-full ml-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      readOnly
                      className="w-full h-[38px] text-gray-700 px-3 py-2 border border-gray-300 rounded bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="w-full ml-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data ID <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      id="dataid-select"
                      value={formData.dataId}
                      onChange={handleDataIdSelectChange}
                      options={dataIdSelectOptions}
                      placeholder={
                        !selectedAcValue ? "Select AC first" : "Select Data ID"
                      }
                      label=""
                      activeDropdown={activeDropdown}
                      onDropdownToggle={setActiveDropdown}
                      disabled={loadingDataIds || !selectedAcValue}
                    />
                    {loadingDataIds && (
                      <p className="text-xs text-gray-500 mt-1">
                        Loading Data IDs...
                      </p>
                    )}
                    {dataIdOptions.length > 0 && !loadingDataIds && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ First Data ID auto-selected
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between align-center gap-2">
                  <div className="w-full">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Data Name En <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.dataName}
                      onChange={handleDataNameChange}
                      className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter English name"
                    />
                  </div>

                  <div className="w-full">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Data Name Hi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.dataNameHi}
                      onChange={handleDataNameHiChange}
                      className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter Hindi name"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedAcValue("");
                  setDataIdOptions([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={!formData.dataId || !formData.dataName}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-md">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                Upload File
              </h3>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="p-2 hover:bg-gray-200 rounded"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Data ID:</span>{" "}
                    {selectedDataIdForUpload}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">AC No:</span>{" "}
                    {selectedAcNoForUpload}
                  </p>
                </div>
                <div className="mt-4 mb-4 flex items-end gap-4">
                  {/* Action Type */}
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      value={uploadAction}
                      onChange={(e) => setUploadAction(e.target.value)}
                      disabled={uploading}
                    >
                      <option value="insert">Insert</option>
                      <option value="update">Update</option>
                      <option value="delete">Delete</option>
                    </select>
                  </div>
                  <div className="w-2/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select File (CSV only)
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    />
                  </div>
                </div>
                {selectedFile && (
                  <p className="text-xs text-green-600 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}

                {uploading && (
                  <div className="mt-4 flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">
                      Uploading...
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-4 justify-end rounded-b-lg">
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Submit"}
              </button>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                disabled={uploading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Existing Import Sessions
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search data..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-gray-700"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {loadingDataEntries ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <input
                      type="checkbox"
                      checked={
                        filteredEntries.length > 0 &&
                        selectedRows.size === filteredEntries.length
                      }
                      onChange={handleCheckAllChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    AC NO
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    NAME (HI)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    NAME (EN)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Data Range
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    DATE
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(entry.id)}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleRowCheckChange(entry, e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.dataId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {entry.acNo || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {entry.dataNameHi || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {entry.dataName || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {entry.data_range && entry.data_range.length > 0
                          ? `${entry.data_range[0].from} - ${entry.data_range[0].to}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {entry.date || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => openUploadDialog(entry)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-xs font-medium"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No import sessions found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Create a new Data ID to get started
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedRows.size > 0 && (
          <div className="mt-4 flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium border border-red-200">
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedRows.size})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
