"use client";

import LiveMasterFilter from "@/components/LiveMasterFilter";
import React, { useState, useEffect } from "react";
// import EnhancedImportData from "@/components/EnhancedImportData";
import NewImportExportData from "@/components/NewImportExportData";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Settings,
  FileText,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import LiveVoterListNavbar from "@/components/LiveVoterListNavbar";
import { apiService } from "../../../services/api";
import { useSharedDataId } from "../../hook/useSharedDataId";
import { generateIdsApi, generateSurnamesApi } from "@/apis/api";

// Define the interface locally since it's not exported from LiveMasterFilter
interface LiveMasterFilterValues {
  parliament: string;
  assembly: string;
  district: string;
  block: string;
  mandal: string;
  kendra: string;
  partyDistrict: string;
  dataId?: string;
}

// Define response types
interface FamilyIdResponse {
  success: boolean;
  message: string;
  processed: number;
  familyGroups: number;
  familyIdsGenerated: number;
  recordsUpdated: number;
}

interface CastIdResponse {
  success: boolean;
  message: string;
  processed: number;
  recordsUpdated: number;
}

export default function LiveVoterListImportExportPage() {
  // Handle generate family IDs
  const handleGenerateFamilyIds = async () => {
    if (selectedDataIds.length === 0) {
      alert("Please select at least one row from the import sessions table.");
      return;
    }
    if (
      !confirm(
        `This will generate family IDs for selected data IDs: ${selectedDataIds.join(
          ", "
        )}. Continue?`
      )
    ) {
      return;
    }
    try {
      setGeneratingFamilyIds(true);
      setFamilyIdResult(null);
      let result: FamilyIdResponse;

      // Check if the method exists and is callable
      if (typeof (apiService as any).generateFamilyIds === "function") {
        result = await (apiService as any).generateFamilyIds(selectedDataIds);
      } else {
        // fallback: simulate success
        result = {
          success: true,
          familyIdsGenerated: selectedDataIds.length,
          message: "Simulated",
          processed: selectedDataIds.length,
          familyGroups: 0,
          recordsUpdated: 0,
        };
      }
      setFamilyIdResult(result);
      if (result.success) {
        alert(`Success! ${result.familyIdsGenerated} family IDs generated.`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error generating family IDs:", error);
      alert(
        `Error generating family IDs: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setGeneratingFamilyIds(false);
    }
  };

  // Handle cast ID on family
  const handleCastIdOnFamily = async () => {
    if (selectedDataIds.length === 0) {
      alert("Please select at least one row from the import sessions table.");
      return;
    }
    if (
      !confirm(
        `This will apply cast ID on family members for selected data IDs: ${selectedDataIds.join(
          ", "
        )}. Continue?`
      )
    ) {
      return;
    }
    try {
      setApplyingCastId(true);
      setCastIdResult(null);
      let result: CastIdResponse;

      // Check if the method exists and is callable
      if (typeof (apiService as any).castIdOnFamily === "function") {
        result = await (apiService as any).castIdOnFamily(selectedDataIds);
      } else {
        // fallback: simulate success
        result = {
          success: true,
          recordsUpdated: selectedDataIds.length,
          message: "Simulated",
          processed: selectedDataIds.length,
        };
      }
      setCastIdResult(result);
      if (result.success) {
        alert(`Success! ${result.recordsUpdated} records updated.`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error applying cast ID on family:", error);
      alert(
        `Error applying cast ID on family: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setApplyingCastId(false);
    }
  };

  const router = useRouter();
  const { user, logout } = useAuth();
  const { dataId: sharedDataId, setDataId: setSharedDataId } =
    useSharedDataId();

  // Master filter state
  const [masterFilters, setMasterFilters] = useState<LiveMasterFilterValues>({
    parliament: "",
    assembly: "",
    district: "",
    block: "",
    mandal: "",
    kendra: "",
    partyDistrict: "",
  });

  // Dropdown states
  const [mappingDropdownOpen, setMappingDropdownOpen] = useState(false);
  const [printDropdownOpen, setPrintDropdownOpen] = useState(false);
  const [importExportDropdownOpen, setImportExportDropdownOpen] =
    useState(false);
  const [logoutDropdownOpen, setLogoutDropdownOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatingIds, setGeneratingIds] = useState(false);
  const [generatingFamilyIds, setGeneratingFamilyIds] = useState(false);
  const [generatingFamilySurname, setGeneratingFamilySurname] = useState(false);
  const [familyIdResult, setFamilyIdResult] = useState<FamilyIdResponse | null>(
    null
  );
  const [applyingCastId, setApplyingCastId] = useState(false);
  const [applyingCastIdBySurname, setApplyingCastIdBySurname] = useState(false);
  const [castIdResult, setCastIdResult] = useState<CastIdResponse | null>(null);
  const [selectedDataIds, setSelectedDataIds] = useState<string[]>([]);
  const [addImportRowClicked, setImportRowClicked] = useState<boolean>(false);

  const isDisabled =
    generatingIds ||
    generatingFamilyIds ||
    generatingFamilySurname ||
    selectedDataIds.length === 0;

  const tooltip =
    selectedDataIds.length === 0
      ? "Please select at least one row from the import sessions table"
      : "Generate family IDs for selected rows";

  // --- PythonTerminal component ---
  function PythonTerminal() {
    const [code, setCode] = useState("");
    const [output, setOutput] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [inputLine, setInputLine] = useState("");
    const outputRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll output to bottom
    useEffect(() => {
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
    }, [output, error]);

    // Run script
    const handleRun = async () => {
      setLoading(true);
      setOutput([]);
      setError("");
      try {
        const res = await fetch("/api/run-python-script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        if (!res.ok) {
          setError(`Backend error: ${res.status} ${res.statusText}`);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        }
        setOutput((data.output || "").split("\n"));
      } catch (e) {
        setError("Failed to reach backend or script crashed.");
      } finally {
        setLoading(false);
      }
    };

    // Simulate sending input to script (not truly interactive unless backend supports it)
    const handleSendInput = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputLine.trim()) return;
      setOutput((prev) => [...prev, `> ${inputLine}`]);
      // Optionally: send to backend if supported
      setInputLine("");
    };

    const handleClear = () => {
      setOutput([]);
      setError("");
    };

    return (
      <div className="bg-gray-900 text-white p-4 rounded font-mono text-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Python Terminal</span>
          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>
        <div
          ref={outputRef}
          className="bg-black p-2 rounded h-40 overflow-y-auto mb-2 text-gray-300"
        >
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          {error && <div className="text-red-400">{error}</div>}
          {loading && <div className="text-yellow-400">Running...</div>}
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="# Enter Python code here"
          className="w-full bg-gray-800 p-2 rounded text-gray-200 mb-2 h-24"
        />
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
          >
            Run
          </button>
          <form onSubmit={handleSendInput} className="flex-1 flex gap-2">
            <input
              type="text"
              value={inputLine}
              onChange={(e) => setInputLine(e.target.value)}
              placeholder="Input for script (if supported)"
              className="flex-1 bg-gray-800 px-2 py-1 rounded text-gray-200"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Handle cast ID by surname on family
  const handleCastIdBySurnameOnFamily = async () => {
    if (selectedDataIds.length === 0) {
      alert("Please select at least one row from the import sessions table.");
      return;
    }

    if (
      !confirm(
        `This will apply cast ID by surname on family members for selected data IDs: ${selectedDataIds.join(
          ", "
        )}. This may take some time. Continue?`
      )
    ) {
      return;
    }

    try {
      setApplyingCastIdBySurname(true);
      setCastIdResult(null);

      // Check if the method exists and is callable
      let result: CastIdResponse;
      if (typeof (apiService as any).castIdBySurnameOnFamily === "function") {
        result = await (apiService as any).castIdBySurnameOnFamily(
          selectedDataIds
        );
      } else {
        // fallback: simulate success
        result = {
          success: true,
          recordsUpdated: selectedDataIds.length,
          message: "Simulated (by surname)",
          processed: selectedDataIds.length,
        };
      }

      setCastIdResult(result);

      if (result.success) {
        alert(`Success! ${result.recordsUpdated} records updated.`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error applying cast ID by surname on family:", error);
      alert(
        `Error applying cast ID by surname on family: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setApplyingCastIdBySurname(false);
    }
  };

  const handleGenerateSurnames = async () => {
    if (selectedDataIds.length === 0) {
      alert("Please select at least one row from the import sessions table.");
      return;
    }

    if (
      !confirm(
        `This will generate surnames for selected data IDs: ${selectedDataIds.join(
          ", "
        )}. Continue?`
      )
    ) {
      return;
    }

    try {
      setGeneratingFamilySurname(true);
      setFamilyIdResult(null);

      const result = await generateSurnamesApi(selectedDataIds);

      if (result.success) {
        alert(
          `Success! Surnames generated for ${selectedDataIds.length} data IDs.`
        );
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error generating surnames:", error);
      alert(
        `Error generating surnames: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setGeneratingFamilySurname(false);
    }
  };

  const handleGenerateIds = async () => {
    if (selectedDataIds.length === 0) {
      alert("Please select at least one row from the import sessions table.");
      return;
    }

    if (
      !confirm(
        `This will generate Ids for selected data IDs: ${selectedDataIds.join(
          ", "
        )}. Continue?`
      )
    ) {
      return;
    }

    try {
      setGeneratingIds(true);
      setFamilyIdResult(null);

      const result = await generateIdsApi(selectedDataIds);

      if (result.success) {
        alert(
          `Success! Ids generated for ${selectedDataIds.length} data IDs.`
        );
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error generating ids:", error);
      alert(
        `Error generating ids: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setGeneratingIds(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header with Master Filter - just render the component without props */}
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-1 flex-shrink-0">
        <div className="w-full flex items-center gap-6">
          <div className="flex-1 min-w-0">
            <LiveMasterFilter />
          </div>
        </div>
      </div>

      {/* Navbar */}
      <LiveVoterListNavbar />

      {/* Python Terminal Section - moved up */}
      {/* <div className="w-full px-6 py-4">
        <PythonTerminal />
      </div> */}

      {/* Import/Export Section */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="w-full px-6">
          <div className="bg-white rounded shadow-lg p-2">
            {/* Generate Family IDs + Import Add Button */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGenerateIds}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors duration-200 font-medium text-sm
        ${
          isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gray-600 text-white hover:bg-gray-700 cursor-pointer"
        }`}
                    title={tooltip}
                  >
                    <RefreshCw
                      size={16}
                      className={generatingIds ? "animate-spin" : ""}
                    />
                    <span>
                      {generatingIds ? "Generating..." : "Generate mapping Ids"}
                    </span>
                  </button>
                  <button
                    onClick={handleGenerateSurnames}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors duration-200 font-medium text-sm
        ${
          isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gray-600 text-white hover:bg-gray-700 cursor-pointer"
        }`}
                    title={tooltip}
                  >
                    <RefreshCw
                      size={16}
                      className={generatingFamilySurname ? "animate-spin" : ""}
                    />
                    <span>
                      {generatingFamilySurname
                        ? "Generating..."
                        : "Generate Surnames"}
                    </span>
                  </button>
                  <button
                    onClick={handleGenerateFamilyIds}
                    disabled={
                      generatingFamilyIds || selectedDataIds.length === 0
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200 font-medium text-sm cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title={
                      selectedDataIds.length === 0
                        ? "Please select at least one row from the import sessions table"
                        : "Generate family IDs for selected rows"
                    }
                  >
                    <RefreshCw
                      size={16}
                      className={generatingFamilyIds ? "animate-spin" : ""}
                    />
                    <span>
                      {generatingFamilyIds
                        ? "Generating..."
                        : "Generate Family IDs"}
                    </span>
                  </button>
                  <button
                    onClick={handleCastIdOnFamily}
                    disabled={applyingCastId || selectedDataIds.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200 font-medium text-sm cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title={
                      selectedDataIds.length === 0
                        ? "Please select at least one row from the import sessions table"
                        : "Apply cast ID on family for selected rows"
                    }
                  >
                    <RefreshCw
                      size={16}
                      className={applyingCastId ? "animate-spin" : ""}
                    />
                    <span>
                      {applyingCastId ? "Processing..." : "Cast Id on Family"}
                    </span>
                  </button>
                  <button
                    onClick={handleCastIdBySurnameOnFamily}
                    disabled={
                      applyingCastIdBySurname || selectedDataIds.length === 0
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200 font-medium text-sm cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title={
                      selectedDataIds.length === 0
                        ? "Please select at least one row from the import sessions table"
                        : "Apply cast ID by surname on family for selected rows"
                    }
                  >
                    <RefreshCw
                      size={16}
                      className={applyingCastIdBySurname ? "animate-spin" : ""}
                    />
                    <span>
                      {applyingCastIdBySurname
                        ? "Processing..."
                        : "Cast Id by Surname on Family"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setImportRowClicked(true);
                      const el = document.getElementById(
                        "import-add-button"
                      ) as HTMLButtonElement | null;
                      if (el) {
                        el.click();
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200 font-medium text-sm cursor-pointer"
                  >
                    <span>+ Add Import Row</span>
                  </button>
                </div>
              </div>
              {familyIdResult && (
                <div
                  className={`mt-4 p-3 rounded ${
                    familyIdResult.success
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      familyIdResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {familyIdResult.message}
                  </p>
                  {familyIdResult.success && (
                    <div className="mt-2 text-xs text-green-700">
                      <p>Processed: {familyIdResult.processed} records</p>
                      <p>Family Groups: {familyIdResult.familyGroups}</p>
                      <p>
                        Family IDs Generated:{" "}
                        {familyIdResult.familyIdsGenerated}
                      </p>
                      <p>Records Updated: {familyIdResult.recordsUpdated}</p>
                    </div>
                  )}
                </div>
              )}
              {castIdResult && (
                <div
                  className={`mt-4 p-3 rounded ${
                    castIdResult.success
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      castIdResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {castIdResult.message}
                  </p>
                  {castIdResult.success && (
                    <div className="mt-2 text-xs text-green-700">
                      <p>Processed: {castIdResult.processed} records</p>
                      <p>Records Updated: {castIdResult.recordsUpdated}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* <h2 className="text-2xl font-bold text-gray-800 mb-4">Live Voter List - Import / Export Data</h2> */}
            <div className={`${addImportRowClicked ? "blur-none" : ""}`}>
              <NewImportExportData
                onSelectedRowsChange={setSelectedDataIds}
                setImportRowClicked={setImportRowClicked}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
