"use client";

import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from "react";
import { DatasetImportHistory, ImportDatasetCsv } from "../../../apis/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Type Definitions
interface BlockItem {
  id: number;
  blockId: string;
  blockName: string;
  district: string;
  file: File | null;
  status: "pending" | "completed";
  total: number;
  success: number;
  failed: number;
  date: string;
}

interface ImportHistoryItem {
  id: number;
  block_id?: string;
  block_name: string;
  district?: string;
  file_name: string;
  imported_records: number;
  failed_records: number;
  created_at: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T[];
  message?: string;
}

interface NavItem {
  name: string;
  isActive?: boolean;
}

interface TableHeader {
  key: string;
  label: string | React.ReactNode; // Changed from JSX.Element to React.ReactNode
}

export default function ImportExportPage() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [blockId, setBlockId] = useState<string>("");
  const [blockName, setBlockName] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const navItems: NavItem[] = useMemo(() => [
    { name: "Dashboard" },
    { name: "Filter" },
    { name: "Master" },
    { name: "Data Process" },
    { name: "Import / Export", isActive: true },
    { name: "Activity" },
    { name: "Maps" },
    { name: "Setting" },
    { name: "Report" },
    { name: "Printer" }
  ], []);

  const loadImportHistory = useCallback(async (): Promise<void> => {
    setLoadingHistory(true);
    try {
      const res = await DatasetImportHistory() as ApiResponse<ImportHistoryItem>;
      if (res.success) {
        setImportHistory(res.data || []);
      } else {
        toast.error("Failed to load import history");
      }
    } catch (error) {
      toast.error("Error loading import history");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadImportHistory();
  }, [loadImportHistory]);

  const handleImport = useCallback(async (block: BlockItem): Promise<void> => {
    if (!block.file) {
      toast.error("Please select CSV file");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to upload this CSV file?");
    if (!confirmed) return;

    setLoadingId(block.id);

    const formData = new FormData();
    formData.append("file", block.file);
    formData.append("block_id", block.blockId);
    formData.append("block_name", block.blockName);
    formData.append("district", block.district);

    try {
      const res = await ImportDatasetCsv(formData) as ApiResponse;
      
      if (res.success) {
        toast.success("Import completed successfully");
        setBlocks([]);
        await loadImportHistory();
      } else {
        toast.error(res.message || "Import failed");
      }
    } catch (error) {
      toast.error("Import failed. Please try again.");
    } finally {
      setLoadingId(null);
    }
  }, [loadImportHistory]);

  const handleAddBlock = useCallback((): void => {
    if (!blockId.trim() || !blockName.trim() || !district.trim()) {
      toast.error("Block ID, Block Name and District are required");
      return;
    }

    const newBlock: BlockItem = {
      id: Date.now(),
      blockId: blockId.trim(),
      blockName: blockName.trim(),
      district: district.trim(),
      file: null,
      status: "pending",
      total: 0,
      success: 0,
      failed: 0,
      date: new Date().toLocaleDateString(),
    };

    setBlocks(prev => [newBlock, ...prev]);
    setShowModal(false);
    setBlockId("");
    setBlockName("");
    setDistrict("");
    toast.success("Block added successfully");
  }, [blockId, blockName, district]);

  const handleFileSelect = useCallback((blockId: number, file: File | null): void => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, file } : b
    ));
  }, []);

  const tableHeaders: TableHeader[] = useMemo(() => [
    { key: "checkbox", label: <input className="text-center" type="checkbox" aria-label="Select all" /> },
    { key: "sno", label: "S.No" },
    { key: "blockId", label: "Block ID" },
    { key: "blockName", label: "Block Name - District" },
    { key: "count", label: "Count" },
    { key: "import", label: "Import" },
    { key: "date", label: "Date" },
    { key: "action", label: "Action" }
  ], []);

  const exportHeaders: TableHeader[] = useMemo(() => [
    { key: "sno", label: "S.No" },
    { key: "type", label: "Type" },
    { key: "fileName", label: "File Name" },
    { key: "format", label: "Format" },
    { key: "count", label: "Count" },
    { key: "export", label: "Export" },
    { key: "date", label: "Date" }
  ], []);

  const renderTableRow = useCallback((block: BlockItem, index: number): React.ReactElement => (
    <tr key={block.id} className="border-t bg-yellow-50">
      <td className="px-3 py-2">
        <input type="checkbox" aria-label={`Select block ${block.blockName}`} />
      </td>
      <td className="px-3 py-2">{index + 1}</td>
      <td className="px-3 py-2">{block.blockId}</td>
      <td className="px-3 py-2">{block.blockName} - {block.district}</td>
      <td className="px-3 py-2">
        {block.status === "completed" ? `${block.success}/${block.failed}` : "-"}
      </td>
      <td className="px-3 py-2">
        {block.status === "pending" ? (
          <label className="cursor-pointer text-blue-600 hover:text-blue-800 transition-colors">
            Upload CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                handleFileSelect(block.id, e.target.files?.[0] || null)
              }
            />
          </label>
        ) : (
          <span className="text-green-600 font-medium">✓ Completed</span>
        )}
      </td>
      <td className="px-3 py-2">{block.date}</td>
      <td className="px-3 py-2">
        {block.status === "pending" ? (
          loadingId === block.id ? (
            <span className="text-blue-600 text-xs animate-pulse">Importing...</span>
          ) : (
            <button
              disabled={!block.file}
              onClick={() => handleImport(block)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Import
            </button>
          )
        ) : (
          "-"
        )}
      </td>
    </tr>
  ), [loadingId, handleImport, handleFileSelect]);

  const renderHistoryRow = useCallback((item: ImportHistoryItem, index: number): React.ReactElement => (
    <tr key={`db-${item.id}`} className="border-t">
      <td className="text-center px-3 py-2">
        <input type="checkbox" aria-label={`Select history item ${index + 1}`} />
      </td>
      <td className="px-3 py-2">{blocks.length + index + 1}</td>
      <td className="px-3 py-2">{item.block_id || "-"}</td>
      <td className="px-3 py-2">{item.block_name}{item.district ? ` - ${item.district}` : ""}</td>
      <td className="px-3 py-2">
        {item.imported_records}/{item.failed_records}
      </td>
      <td className="px-3 py-2">
        <span className="text-green-600">✓</span>
      </td>
      <td className="px-3 py-2">
        {new Date(item.created_at).toLocaleDateString()}
      </td>
      <td className="px-3 py-2">-</td>
    </tr>
  ), [blocks.length]);

  const handleModalClose = useCallback((): void => {
    setShowModal(false);
    setBlockId("");
    setBlockName("");
    setDistrict("");
  }, []);

  const handleModalOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      handleModalClose();
    }
  }, [handleModalClose]);

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-gray-800 font-sans">
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3 font-semibold text-sm">
            <img src="/logo.png" alt="Logo" className="w-7 h-7" />
            THE BIG OWL
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            {navItems.map((item) => (
              <span
                key={item.name}
                className={`cursor-pointer hover:text-black transition-colors ${
                  item.isActive
                    ? "text-black font-medium bg-gray-100 px-3 py-1 rounded"
                    : ""
                }`}
              >
                {item.name}
              </span>
            ))}
          </div>
          <div className="text-sm font-medium">admin</div>
        </div>
      </div>
      
      <div className="bg-white px-6 py-3 border-b border-gray-200">
        <div className="flex gap-3 items-center">
          <div className="text-right w-full">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-5 py-1 rounded-lg shadow-md transition duration-200 cursor-pointer"
            >
              <span className="text-lg font-bold">+ </span>
              Add
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="px-4 py-2 border-b text-sm font-medium bg-gray-50">
              Import Table
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {tableHeaders.map((h) => (
                      <th key={h.key} className="px-3 py-2 text-left font-medium">
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {blocks.map(renderTableRow)}
                  
                  {loadingHistory && (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-gray-400">
                        Loading import history...
                      </td>
                    </tr>
                  )}

                  {!loadingHistory && importHistory.length === 0 && blocks.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-gray-400">
                        No data available
                      </td>
                    </tr>
                  )}

                  {!loadingHistory && importHistory.map(renderHistoryRow)}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="px-4 py-2 border-b flex justify-between text-sm font-medium bg-gray-50">
              <span>Export Table</span>
              <span className="text-red-500 cursor-pointer hover:text-red-700 transition-colors">
                Clear History
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {exportHeaders.map((h) => (
                      <th key={h.key} className="px-3 py-2 text-left font-medium">
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">dataset1</td>
                    <td className="px-3 py-2">surname_data</td>
                    <td className="px-3 py-2">CSV</td>
                    <td className="px-3 py-2">5018</td>
                    <td className="px-3 py-2">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        ✓ Completed
                      </span>
                    </td>
                    <td className="px-3 py-2">16/10/2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleModalOverlayClick}
        >
          <div className="bg-white w-[400px] rounded-lg shadow-xl">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h2 className="text-sm font-semibold">Add Block</h2>
              <button
                onClick={handleModalClose}
                className="text-gray-500 hover:text-black transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="blockId" className="text-sm text-gray-600 mb-1 block">
                  Block ID
                </label>
                <input
                  id="blockId"
                  value={blockId}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setBlockId(e.target.value)}
                  placeholder="Enter Block ID"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="blockName" className="text-sm text-gray-600 mb-1 block">
                  Block Name
                </label>
                <input
                  id="blockName"
                  value={blockName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setBlockName(e.target.value)}
                  placeholder="Enter Block Name"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="district" className="text-sm text-gray-600 mb-1 block">
                  District
                </label>
                <input
                  id="district"
                  value={district}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDistrict(e.target.value)}
                  placeholder="Enter District"
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBlock}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}