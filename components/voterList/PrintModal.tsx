"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Printer, Download, RefreshCw, ChevronDown } from "lucide-react";
import { downloadBlankRegister, filterPrintRegister } from "@/apis/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  acOptions: any[];
  selectedAc: string;
  onAcChange: (acId: string) => void;
  blockOptions: string[];
  selectedBlock: string;
  onBlockChange: (block: string) => void;
  gpOptions: string[];
  selectedGp: string;
  onGpChange: (gp: string) => void;
  gramOptions: string[];
  selectedGram: string;
  onGramChange: (gram: string) => void;
  bhagOptions: string[];
  selectedBhag: string;
  onBhagChange: (bhag: string) => void;
  sectionOptions: string[];
  selectedSection: string;
  onSectionChange: (section: string) => void;
  loadingAcData: boolean;
  printOptions: any;
  setPrintOptions: (options: any) => void;
  onDownload: (data: any) => Promise<void>;
  downloading: boolean;
  selectedDataId?: string;
}

export const PrintModal: React.FC<Props> = ({
  isOpen,
  onClose,
  acOptions,
  selectedAc,
  onAcChange,
  blockOptions,
  selectedBlock,
  onBlockChange,
  gpOptions,
  selectedGp,
  onGpChange,
  gramOptions,
  selectedGram,
  onGramChange,
  bhagOptions,
  selectedBhag,
  onBhagChange,
  sectionOptions,
  selectedSection,
  onSectionChange,
  loadingAcData,
  printOptions,
  setPrintOptions,
  onDownload,
  downloading,
  selectedDataId = "",
}) => {
  const [blankDownloading, setBlankDownloading] = useState(false);
  const [loadingBhag, setLoadingBhag] = useState(false);
  const [dynamicBhagOptions, setDynamicBhagOptions] = useState<string[]>([]);
  const [castIds, setCastIds] = useState<string[]>([]);

  const [selectedBhags, setSelectedBhags] = useState<number[]>([]);
  const [familyCount, setFamilyCount] = useState<number>(4);

  const [bhagDropdownOpen, setBhagDropdownOpen] = useState(false);
  const [castDropdownOpen, setCastDropdownOpen] = useState(false);

  const [selectedExcludeCasts, setSelectedExcludeCasts] = useState<string[]>(
    []
  );
  const [excludeMobile, setExcludeMobile] = useState<boolean>(false);
  const [excludeDob, setExcludeDob] = useState<boolean>(false);
  const [includeDob, setIncludeDob] = useState<boolean>(false);
  const [includeMobile, setIncludeMobile] = useState<boolean>(false);
  const [includeCastCat, setIncludeCastCat] = useState<boolean>(false);
  const [includeCast, setIncludeCast] = useState<boolean>(false);
  const [showExcludeCastSelect, setShowExcludeCastSelect] = useState(false);

  const bhagDropdownRef = useRef<HTMLDivElement>(null);
  const excludeCastDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bhagDropdownRef.current &&
        !bhagDropdownRef.current.contains(event.target as Node)
      ) {
        setBhagDropdownOpen(false);
      }
      if (
        excludeCastDropdownRef.current &&
        !excludeCastDropdownRef.current.contains(event.target as Node)
      ) {
        setCastDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadBlankRegister = async () => {
    setBlankDownloading(true);
    try {
      const response = await downloadBlankRegister();
      if (response.success) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "blank_register.pdf");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert(response.message || "Failed to download blank register");
      }
    } catch (error) {
      console.error("Error downloading blank register:", error);
      alert("Error downloading blank register");
    } finally {
      setBlankDownloading(false);
    }
  };

  const handleGoClick = async () => {
    if (!selectedAc) {
      alert("Please select a wise type first");
      return;
    }
    if (!selectedDataId) {
      alert("Please select a data ID from master filter first");
      return;
    }
    setLoadingBhag(true);
    try {
      const params = { data_id: selectedDataId, wise_type: selectedAc };
      const response = await filterPrintRegister(params);
      if (response.success && response.data) {
        if (response.data.bhag && Array.isArray(response.data.bhag)) {
          const bhagIds = response.data.bhag.map(
            (item: any) => item.id_no?.toString() || ""
          );
          setDynamicBhagOptions(bhagIds.filter((id: any) => id !== ""));
        } else {
          setDynamicBhagOptions([]);
        }
        if (response.data.castids && Array.isArray(response.data.castids)) {
          setCastIds(response.data.castids);
        }
        alert("Bhag options fetched successfully!");
      } else {
        alert(response.message || "Failed to fetch bhag options");
      }
    } catch (error) {
      console.error("Error fetching bhag options:", error);
      alert("Error fetching bhag options");
    } finally {
      setLoadingBhag(false);
    }
  };

  const handleBhagSelect = (bhag: string) => {
    const bhagNumber = parseInt(bhag);
    if (bhag === "all") {
      if (selectedBhags.length === dynamicBhagOptions.length) {
        setSelectedBhags([]);
      } else {
        setSelectedBhags(dynamicBhagOptions.map((b) => parseInt(b)));
      }
    } else {
      if (selectedBhags.includes(bhagNumber)) {
        setSelectedBhags(selectedBhags.filter((b) => b !== bhagNumber));
      } else {
        setSelectedBhags([...selectedBhags, bhagNumber]);
      }
    }
  };

  const handleExcludeCastToggle = (cast: string) => {
    if (cast === "all") {
      if (selectedExcludeCasts.length === castIds.length) {
        setSelectedExcludeCasts([]);
      } else {
        setSelectedExcludeCasts([...castIds]);
      }
    } else {
      if (selectedExcludeCasts.includes(cast)) {
        setSelectedExcludeCasts(selectedExcludeCasts.filter((c) => c !== cast));
      } else {
        setSelectedExcludeCasts([...selectedExcludeCasts, cast]);
      }
    }
  };

  const handleExcludeCastCheckbox = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShowExcludeCastSelect(e.target.checked);
    if (!e.target.checked) setSelectedExcludeCasts([]);
  };

  const handleDownload = async () => {
    const requestData = {
      data_id: parseInt(selectedDataId),
      wise_type: selectedAc,
      singlePdf: printOptions.pdfType === "multiple",
      familyCount: familyCount,
      filters: { bhag: selectedBhags },
      includes: {
        dob: includeDob,
        mobile: includeMobile,
        cast_cat: includeCastCat,
      },
      excludes: {
        dob: excludeDob,
        mobile: excludeMobile,
        cast: showExcludeCastSelect,
        excludeCasts: selectedExcludeCasts,
      },
    };
    await onDownload(requestData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[50%] max-w-5xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Print Options</h2>
          {selectedDataId && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm text-center">
              <span className="font-medium">Selected Data ID:</span>{" "}
              {selectedDataId}
            </div>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Row 1: Register & PDF Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
                Register
              </label>
              <select
                value={printOptions.register}
                onChange={(e) =>
                  setPrintOptions({ ...printOptions, register: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white text-gray-700"
              >
                <option value="survey">Survey Register</option>
                <option value="voter">Voter Register</option>
                <option value="family">Family Register</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
                PDF Type
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pdfType"
                    checked={printOptions.pdfType === "single"}
                    onChange={() =>
                      setPrintOptions({ ...printOptions, pdfType: "single" })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Multiple Pdf</span>
                </label>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 py-4 rounded-lg">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex ">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
                    Wise Type
                  </label>
                  <select
                    value={selectedAc}
                    onChange={(e) => onAcChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white text-gray-700"
                  >
                    <option value="">Select Wise Type</option>
                    <option value="bhag">Bhag Wise</option>
                    <option value="cast">Cast Wise</option>
                    <option value="section">Section Wise</option>
                    <option value="gram">Gram Wise</option>
                    <option value="gp">GP Wise</option>
                  </select>
                </div>
                <div className="flex items-end p-[19px]">
                  <button
                    onClick={handleGoClick}
                    disabled={loadingBhag || !selectedAc || !selectedDataId}
                    className="px-5 py-2 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-800 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-50%"
                  >
                    {loadingBhag ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      "Go"
                    )}
                  </button>
                </div>
              </div>

              <div ref={bhagDropdownRef}>
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
                  Select Bhag
                </label>
                <div className="relative ">
                  <button
                    onClick={() => setBhagDropdownOpen(!bhagDropdownOpen)}
                    disabled={
                      !selectedAc ||
                      loadingBhag ||
                      dynamicBhagOptions.length === 0
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white text-gray-700 disabled:bg-gray-100 text-left flex justify-between items-center"
                  >
                    <span>
                      {selectedBhags.length > 0
                        ? `${selectedBhags.length} selected`
                        : "Select Bhag"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform ${
                        bhagDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {bhagDropdownOpen && dynamicBhagOptions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto text-sm">
                      <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={
                            selectedBhags.length === dynamicBhagOptions.length
                          }
                          onChange={() => handleBhagSelect("all")}
                          className="mr-2 text-blue-600 rounded"
                        />
                        <span className="text-gray-700 font-medium">All</span>
                      </label>
                      {dynamicBhagOptions.map((bhag) => (
                        <label
                          key={bhag}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBhags.includes(parseInt(bhag))}
                            onChange={() => handleBhagSelect(bhag)}
                            className="mr-2 text-blue-600 rounded"
                          />
                          <span className="text-gray-700">Bhag {bhag}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedBhags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedBhags.map((bhag) => (
                  <span
                    key={bhag}
                    className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    Bhag {bhag}
                    <button
                      onClick={() => handleBhagSelect(bhag.toString())}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Print Fields & Exclude Options */}
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Print Fields
                </h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDob}
                      onChange={(e) => setIncludeDob(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">DOB</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMobile}
                      onChange={(e) => setIncludeMobile(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Mobile</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCastCat}
                      onChange={(e) => setIncludeCastCat(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Cast Category</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCast}
                      onChange={(e) => setIncludeCast(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Cast</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Exclude Options
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer min-w-[80px]">
                      <input
                        type="checkbox"
                        checked={showExcludeCastSelect}
                        onChange={handleExcludeCastCheckbox}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Cast
                      </span>
                    </label>
                    {showExcludeCastSelect && castIds.length > 0 && (
                      <div
                        ref={excludeCastDropdownRef}
                        className="relative w-64"
                      >
                        <button
                          onClick={() => setCastDropdownOpen(!castDropdownOpen)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white text-gray-700 text-left flex justify-between items-center"
                        >
                          <span>
                            {selectedExcludeCasts.length > 0
                              ? `${selectedExcludeCasts.length} selected`
                              : "Select Cast"}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`transform transition-transform ${
                              castDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {castDropdownOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto text-sm">
                            <div className="p-2">
                              <label className="flex items-center space-x-2 cursor-pointer border-b border-gray-200 pb-2 mb-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedExcludeCasts.length ===
                                    castIds.length
                                  }
                                  onChange={() =>
                                    handleExcludeCastToggle("all")
                                  }
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                  All
                                </span>
                              </label>
                              {castIds.map((cast) => (
                                <label
                                  key={cast}
                                  className="flex items-center space-x-2 cursor-pointer py-1"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedExcludeCasts.includes(
                                      cast
                                    )}
                                    onChange={() =>
                                      handleExcludeCastToggle(cast)
                                    }
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <span className="text-sm text-gray-600">
                                    {cast}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={excludeMobile}
                          onChange={(e) => setExcludeMobile(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Mobile
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={excludeDob}
                          onChange={(e) => setExcludeDob(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          DOB
                        </span>
                      </label>
                    </div>
                  </div>
                  {selectedExcludeCasts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedExcludeCasts.map((cast) => (
                        <span
                          key={cast}
                          className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs"
                        >
                          {cast}
                          <button
                            onClick={() => handleExcludeCastToggle(cast)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
              Family Count (Minimum)
            </label>
            <input
              type="text"
              min="0"
              value={familyCount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setFamilyCount(value ? parseInt(value) : 0);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Backspace" ||
                  e.key === "Delete" ||
                  e.key === "Tab" ||
                  e.key === "Escape" ||
                  e.key === "Enter" ||
                  e.key === "ArrowLeft" ||
                  e.key === "ArrowRight" ||
                  e.key === "ArrowUp" ||
                  e.key === "ArrowDown"
                ) {
                  return;
                }
                if (!/^[0-9]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Enter minimum family count"
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white text-gray-700"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
              <span>Download Blank Register for empty template</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadBlankRegister}
                disabled={blankDownloading}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {blankDownloading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Printer size={14} />
                )}
                <span>
                  {blankDownloading ? "Downloading..." : "Blank Register"}
                </span>
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading || !selectedAc || !selectedDataId}
                className="px-4 py-1.5 text-xs font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:bg-gray-400"
              >
                {downloading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>{downloading ? "Processing..." : "Download"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
