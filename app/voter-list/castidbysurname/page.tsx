"use client";

import { useMemo, useState } from "react";
import { LiveMasterFilter } from "@/components/voterList/LiveMasterFilter";
import {
  ChevronDown,
  Eye,
  FilePlus2,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";

type TableRow = Record<string, unknown>;

type ApplyFilterParams = Record<string, unknown>;

type SearchField = "All" | "surname" | "castid" | "vname";

export default function DataSearchEmptyStatePage() {
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [searchField, setSearchField] = useState<SearchField>("All");
  const [minCount, setMinCount] = useState<string>("");
  const [appliedFilters, setAppliedFilters] = useState<ApplyFilterParams>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleApplyFilters = async (params: ApplyFilterParams): Promise<void> => {
    try {
      setLoading(true);
      setAppliedFilters(params);
      console.log("Applied Filters:", params);

      // yaha actual API call lagani hai
      // example:
      // const response = await yourApi({
      //   ...params,
      //   searchField,
      //   minCount,
      // });
      // setTableData(response?.data || []);

      setTableData([]);
      setHasSearched(true);
    } catch (error) {
      console.error("handleApplyFilters error:", error);
      setTableData([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGo = async (): Promise<void> => {
    try {
      setLoading(true);

      const payload = {
        ...appliedFilters,
        searchField,
        minCount,
      };

      console.log("Go clicked with payload:", payload);

      // yaha actual API call lagani hai
      // const response = await yourApi(payload);
      // setTableData(response?.data || []);

      setTableData([]);
      setHasSearched(true);
    } catch (error) {
      console.error("handleGo error:", error);
      setTableData([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (): void => {
    setSearchField("All");
    setMinCount("");
    setAppliedFilters({});
    setTableData([]);
    setHasSearched(false);
    console.log("All filters reset");
  };

  const handleImport = (): void => {
    console.log("Import clicked");
  };

  const handleViewImported = (): void => {
    console.log("View Imported clicked");
  };

  const handleAddToExportQueue = (): void => {
    console.log("Add to Export Queue clicked");
  };

  const handleSaveData = (): void => {
    console.log("Save Data clicked", tableData);
  };

  const columns = useMemo<string[]>(() => {
    if (!tableData.length) return [];
    return Object.keys(tableData[0]);
  }, [tableData]);

  return (
    <div className="min-h-screen w-full bg-[#f3f3f3] text-[#2f2f2f]">
      <div className="px-10 pt-2">
        <LiveMasterFilter onApplyFilters={handleApplyFilters} />
      </div>

      <div className="">
        <div className="flex flex-wrap justify-center items-center gap-4 border-b border-[#dddddd] px-5 py-1.5 shadow-sm">
          <div className="flex items-center gap-3">
            <label className="text-[15px] font-semibold text-[#303030]">
              Search Field:
            </label>

            <div className="relative">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as SearchField)}
                className="h-[35px] min-w-[160px] appearance-none rounded-[5px] border border-[#cfcfcf] bg-white pl-4 pr-10 text-[15px] text-[#333] outline-none transition focus:border-[#b8b8b8]"
              >
                <option value="All">All</option>
                <option value="surname">Surname</option>
                <option value="castid">Cast ID</option>
                <option value="vname">Voter Name</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[15px] font-semibold text-[#303030]">
              Min Count:
            </label>

            <input
              type="text"
              value={minCount}
              onChange={(e) => setMinCount(e.target.value)}
              placeholder="Enter minimum count (e.g., 2)"
              className="h-[35px] w-[195px] rounded-[5px] border border-[#cfcfcf] bg-white px-4 text-[14px] text-[#333] outline-none placeholder:text-[#9b9b9b] focus:border-[#b8b8b8]"
            />
          </div>

          <button
            onClick={handleGo}
            disabled={loading}
            className="h-[35px] min-w-[66px] rounded-[5px] bg-[#3f4756] px-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#353c49] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Go"}
          </button>

          <button
            onClick={handleReset}
            type="button"
            className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#cfcfcf] bg-[#f7f7f7] text-[#6b7280] transition hover:bg-white"
            aria-label="Reset"
          >
            <RotateCcw className="h-[18px] w-[18px]" />
          </button>

          <button
            onClick={handleImport}
            type="button"
            className="flex h-[35px] items-center gap-2 rounded-[5px] bg-[#3f4756] px-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#353c49]"
          >
            <Upload className="h-[16px] w-[16px]" />
            <span>Import</span>
          </button>

          <button
            onClick={handleViewImported}
            type="button"
            disabled={!tableData.length}
            className="flex h-[35px] items-center gap-2 rounded-[5px] border border-[#d6d6d6] bg-[#e9eaec] px-3 text-[15px] font-semibold text-[#7a7d84] opacity-95 disabled:cursor-not-allowed"
          >
            <Eye className="h-[16px] w-[16px]" />
            <span>View Imported</span>
          </button>

          <button
            onClick={handleAddToExportQueue}
            type="button"
            disabled={!tableData.length}
            className="flex h-[35px] items-center gap-2 rounded-[5px] border border-[#d6d6d6] bg-[#e9eaec] px-3 text-[15px] font-semibold text-[#7a7d84] opacity-95 disabled:cursor-not-allowed"
          >
            <FilePlus2 className="h-[16px] w-[16px]" />
            <span>Add to Export Queue</span>
          </button>

          <button
            onClick={handleSaveData}
            type="button"
            className="flex h-[35px] items-center gap-2 rounded-[5px] border border-[#d6d6d6] bg-[#e9eaec] px-3 text-[15px] font-semibold text-[#2f2f2f] transition hover:bg-white"
          >
            <Save className="h-[16px] w-[16px]" />
            <span>Save Data</span>
          </button>
        </div>
      </div>

      {!tableData.length ? (
        <div className="flex min-h-[calc(100vh-190px)] items-start justify-center px-6">
          <div className="mt-[120px] flex flex-col items-center text-center">
            <div className="relative mb-5 h-[82px] w-[82px]">
              <div className="absolute left-[10px] top-[2px] h-[46px] w-[46px] rounded-full border-[4px] border-[#5f4aa8] bg-[radial-gradient(circle_at_35%_35%,#8fe8ff_0%,#75d9f7_35%,#65c8ee_65%,#53b7df_100%)] shadow-[inset_0_2px_6px_rgba(255,255,255,0.7)]" />
              <div className="absolute left-[36px] top-[10px] h-[8px] w-[8px] rounded-full bg-white/70 blur-[1px]" />
              <div className="absolute left-[48px] top-[40px] h-[24px] w-[14px] rotate-[-42deg] rounded-full bg-[linear-gradient(180deg,#8c4a90_0%,#7a3e86_55%,#6a3679_100%)]" />
            </div>

            <h2 className="mb-4 text-[17px] font-medium text-[#666a73]">
              {hasSearched
                ? "कोई डेटा उपलब्ध नहीं है"
                : "डेटा देखने के लिए क्षेत्र का चयन करें"}
            </h2>

            <p className="text-[14px] text-[#9aa0aa]">
              {hasSearched
                ? "फिल्टर बदलकर दोबारा प्रयास करें"
                : "लोकसभा | विधान सभा | जिला | ब्लॉक | अन्य विविध फिल्टर चुनें"}
            </p>
          </div>
        </div>
      ) : (
        <div className="px-10 pb-10 pt-6">
          <div className="overflow-hidden rounded-[18px] border border-[#dddddd] bg-white shadow-sm">
            <div className="border-b border-[#ececec] px-5 py-4">
              <h3 className="text-[16px] font-semibold text-[#2f2f2f]">
                Search Results
              </h3>
              <p className="mt-1 text-[13px] text-[#7a7d84]">
                Total Records: {tableData.length}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8f8f8]">
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="border-b border-[#ececec] px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-[#4b5563]"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-[#fafafa]">
                      {columns.map((column) => (
                        <td
                          key={`${rowIndex}-${column}`}
                          className="border-b border-[#f1f1f1] px-4 py-3 text-[14px] text-[#2f2f2f]"
                        >
                          {String(row[column] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}