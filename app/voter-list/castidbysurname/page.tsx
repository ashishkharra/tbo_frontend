"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { HotTable } from "@handsontable/react";
import Handsontable from "handsontable";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";

registerAllModules();

import { LiveMasterFilter } from "@/components/voterList/LiveMasterFilter";
import { getSurnameListApi } from "@/apis/api";


import {
  ChevronDown,
  Eye,
  FilePlus2,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";
import CommonPagination from "@/components/CommonPagination";

type SearchField = "All" | "voter-surname" | "relation-surname";

type ApplyFilterParams = Record<string, any>;
type TableRow = Record<string, any>;

type ChangedCell = {
  row: number;
  prop: string;
  oldValue: any;
  newValue: any;
};

export default function SurnameHotTablePage() {
  const hotTableRef: any = useRef<HotTable>(null);
  const selectedRowsRef = useRef<number[]>([]);

  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [originalData, setOriginalData] = useState<TableRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const [searchField, setSearchField] = useState<SearchField>("All");
  const [searchValue, setSearchValue] = useState<string>("");
  const [minCount, setMinCount] = useState<string>("");

  const [appliedFilters, setAppliedFilters] = useState<ApplyFilterParams>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);

  // NOTE: make limit stateful so CommonPagination "Show:" dropdown actually works
  const [limit, setLimit] = useState<number>(100);

  const [total, setTotal] = useState<number>(0);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [changedCells, setChangedCells] = useState<ChangedCell[]>([]);

  // CommonPagination expects itemsPerPage as number | "All"
  const [itemsPerPage, setItemsPerPage] = useState<number | "All">(limit);

  const totalPages = useMemo(() => {
    if (!total || limit <= 0) return 0;
    return Math.ceil(total / limit);
  }, [total, limit]);

  const normalizeRows = useCallback((rows: TableRow[] = []) => {
    if (!Array.isArray(rows) || !rows.length) {
      return { normalizedRows: [], normalizedColumns: [] };
    }

    const allKeys = Array.from(
      new Set(rows.flatMap((row) => Object.keys(row || {})))
    );

    const preferredOrder = [
      "id",
      "data_id",
      "surname",
      "v_count",
      "r_count",
      "total_count",
      "castid_surname",
      "caste",
      "cast_cat",
      "religion",
      "district",
      "block",
      "ac_no",
      "pc_no",
      "process_status",
      "process_count",
      "last_process",
      "processed_by",
      "updated_at",
    ];

    const orderedColumns = [
      ...preferredOrder.filter((key) => allKeys.includes(key)),
      ...allKeys.filter((key) => !preferredOrder.includes(key)),
    ];

    const normalizedRows = rows.map((row) => {
      const normalized: TableRow = {};
      orderedColumns.forEach((col) => {
        normalized[col] = row?.[col] ?? "";
      });
      return normalized;
    });

    return {
      normalizedRows,
      normalizedColumns: orderedColumns,
    };
  }, []);

  const fetchSurnameData = useCallback(
    async (
      extraPayload: Record<string, unknown> = {},
      resetPage: boolean = false,
      pageNumber?: number,
      filtersOverride?: ApplyFilterParams
    ) => {
      try {
        setLoading(true);

        const currentPage = resetPage ? 1 : pageNumber ?? page;
        const nextLimit =
          typeof extraPayload.limit === "number" ? extraPayload.limit : limit;
        const nextSearchField =
          (extraPayload.searchField as SearchField | undefined) ?? searchField;
        const nextSearchValue =
          typeof extraPayload.searchValue === "string"
            ? extraPayload.searchValue.trim()
            : searchValue?.trim() || "";
        const nextMinTotalCount = Object.prototype.hasOwnProperty.call(
          extraPayload,
          "min_total_count"
        )
          ? extraPayload.min_total_count
          : minCount?.trim()
            ? Number(minCount)
            : undefined;

        const payload = {
          ...(filtersOverride ?? appliedFilters),
          ...extraPayload,
          page: currentPage,
          limit: nextLimit,
          searchField: nextSearchField,
          searchValue: nextSearchValue,
          min_total_count: nextMinTotalCount,
          sortBy: "total_count",
          sortOrder: "DESC",
        };

        const response = await getSurnameListApi(payload);

        if (response?.success) {
          const rows = response?.data || [];
          const { normalizedRows, normalizedColumns } = normalizeRows(rows);

          setTableData(normalizedRows);
          setOriginalData(JSON.parse(JSON.stringify(normalizedRows)));
          setColumns(normalizedColumns);

          setTotal(response?.pagination?.total || 0);
          setPage(response?.pagination?.page || currentPage);
          setSelectedRows([]);
          setChangedCells([]);
        } else {
          setTableData([]);
          setOriginalData([]);
          setColumns([]);
          setTotal(0);
          setPage(1);
          setSelectedRows([]);
          setChangedCells([]);
        }

        setHasSearched(true);
      } catch (error) {
        console.error("fetchSurnameData error:", error);
        setTableData([]);
        setOriginalData([]);
        setColumns([]);
        setTotal(0);
        setPage(1);
        setSelectedRows([]);
        setChangedCells([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters, limit, minCount, normalizeRows, page, searchField, searchValue]
  );

  const handleApplyFilters = async (params: ApplyFilterParams): Promise<void> => {
    setAppliedFilters(params);
    await fetchSurnameData({}, true, 1, params);
  };

  const handleGo = async (): Promise<void> => {
    await fetchSurnameData({}, true);
  };

  const handleReset = async (): Promise<void> => {
    setSearchField("All");
    setSearchValue("");
    setMinCount("");
    setAppliedFilters({});
    setPage(1);
    setSelectedRows([]);
    setChangedCells([]);

    // reset pagination controls and reload unfiltered data
    setLimit(100);
    setItemsPerPage(100);

    await fetchSurnameData(
      {
        page: 1,
        limit: 100,
        searchField: "All",
        searchValue: "",
        min_total_count: undefined,
      },
      true,
      1,
      {}
    );
  };

  const handleImport = (): void => {
    console.log("Import clicked");
  };

  const handleViewImported = (): void => {
    const selectedData = selectedRows
      .map((rowIndex) => tableData[rowIndex])
      .filter(Boolean);
    console.log("View Imported clicked", selectedData);
  };

  const handleAddToExportQueue = (): void => {
    const selectedData = selectedRows
      .map((rowIndex) => tableData[rowIndex])
      .filter(Boolean);
    console.log("Add to Export Queue clicked", selectedData);
  };

  const handleSaveData = async (): Promise<void> => {
    try {
      const hotInstance = hotTableRef.current?.hotInstance;
      const latestData = hotInstance
        ? (hotInstance.getSourceData() as TableRow[])
        : tableData;

      const editedRows = latestData.filter((row, index) => {
        const oldRow = originalData[index];
        return JSON.stringify(row) !== JSON.stringify(oldRow);
      });

      console.log("Full current data:", latestData);
      console.log("Edited rows only:", editedRows);
      console.log("Changed cells:", changedCells);
      console.log("Selected rows:", selectedRows);

      setOriginalData(JSON.parse(JSON.stringify(latestData)));
      setChangedCells([]);
      alert(`Saved locally. Edited rows: ${editedRows.length}`);
    } catch (error) {
      console.error("handleSaveData error:", error);
      alert("Failed to save data");
    }
  };

  // --- CommonPagination integration ---
  const currentPageItemCount = tableData.length;

  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (loading) return;
      if (newPage < 1 || newPage > totalPages) return;

      setPage(newPage);
      await fetchSurnameData({}, false, newPage);
    },
    [fetchSurnameData, loading, totalPages]
  );

  const handleItemsPerPageChange = useCallback(
    async (newItemsPerPage: number | "All") => {
      const nextLimit =
        newItemsPerPage === "All"
          ? total > 0
            ? total
            : 100000
          : newItemsPerPage;

      setItemsPerPage(newItemsPerPage);
      setLimit(nextLimit);

      setPage(1);
      await fetchSurnameData({ page: 1, limit: nextLimit }, true);
    },
    [fetchSurnameData, total]
  );

  const handleRefresh = useCallback(async () => {
    await fetchSurnameData({}, false, page);
  }, [fetchSurnameData, page]);
  // --- end pagination integration ---

  const hotColumns = useMemo(() => {
    return columns.map((col) => {
      const lower = col.toLowerCase();

      const isNumeric =
        lower === "id" ||
        lower === "data_id" ||
        lower === "v_count" ||
        lower === "r_count" ||
        lower === "total_count" ||
        lower === "ac_no" ||
        lower === "pc_no" ||
        lower === "process_count" ||
        lower === "processed_by";

      const isBoolean = lower === "process_status";

      if (isBoolean) {
        return {
          data: col,
          type: "checkbox",
          className: "htCenter htMiddle",
        };
      }

      if (isNumeric) {
        return {
          data: col,
          type: "numeric",
          className: "htCenter htMiddle",
          allowInvalid: false,
        };
      }

      return {
        data: col,
        type: "text",
        className: "htMiddle",
      };
    });
  }, [columns]);

  const colHeaders = useMemo(() => {
    return columns.map((col) => col.replace(/_/g, " ").toUpperCase());
  }, [columns]);

  const selectedRowsData = useMemo(() => {
    return selectedRows.map((index) => tableData[index]).filter(Boolean);
  }, [selectedRows, tableData]);

  return (
    <div className="min-h-screen w-full bg-[#f3f3f3] text-[#2f2f2f]">
      <div className="px-10 pt-2">
        <LiveMasterFilter onApplyFilters={handleApplyFilters} />
      </div>

      <div className="mt-3">
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#dddddd] px-3 py-1 shadow-sm">

          {/* Search Field */}
          <div className="flex items-center gap-2">
            <label className="text-[13px] font-medium text-[#303030] whitespace-nowrap">
              Field:
            </label>

            <div className="relative">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as SearchField)}
                className="h-[32px] min-w-[120px] appearance-none rounded-[4px] border border-[#cfcfcf] bg-white pl-3 pr-8 text-[13px] text-[#333] outline-none focus:border-[#b8b8b8]"
              >
                <option value="All">All</option>
                <option value="voter-surname">Voter</option>
                <option value="relation-surname">Relation</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#777]" />
            </div>
          </div>

          {/* Search Value */}
          <div className="flex items-center gap-2">
            <label className="text-[13px] font-medium text-[#303030] whitespace-nowrap">
              Value:
            </label>

            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="h-[32px] w-[140px] rounded-[4px] border border-[#cfcfcf] bg-white px-3 text-[13px] text-[#333] outline-none placeholder:text-[#9b9b9b] focus:border-[#b8b8b8]"
            />
          </div>

          {/* Min Count */}
          <div className="flex items-center gap-2">
            <label className="text-[13px] font-medium text-[#303030] whitespace-nowrap">
              Min:
            </label>

            <input
              type="number"
              value={minCount}
              onChange={(e) => setMinCount(e.target.value)}
              placeholder="Count"
              className="h-[32px] w-[100px] rounded-[4px] border border-[#cfcfcf] bg-white px-3 text-[13px] text-[#333] outline-none focus:border-[#b8b8b8]"
            />
          </div>

          {/* Go Button */}
          <button
            onClick={handleGo}
            disabled={loading}
            className="h-[32px] px-3 rounded-[4px] bg-[#3f4756] text-[13px] font-medium text-white shadow-sm hover:bg-[#353c49] disabled:opacity-60 whitespace-nowrap"
          >
            {loading ? "..." : "Go"}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            type="button"
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[4px] border border-[#cfcfcf] bg-[#f7f7f7] text-[#6b7280] hover:bg-white"
          >
            <RotateCcw className="h-[14px] w-[14px]" />
          </button>

          {/* Import */}
          <button
            onClick={handleImport}
            type="button"
            className="flex h-[32px] items-center gap-1 rounded-[4px] bg-[#3f4756] px-3 text-[13px] font-medium text-white hover:bg-[#353c49] whitespace-nowrap"
          >
            <Upload className="h-[14px] w-[14px]" />
            Import
          </button>

          {/* View */}
          <button
            onClick={handleViewImported}
            disabled={!selectedRows.length}
            className="flex h-[32px] items-center gap-1 rounded-[4px] border border-[#d6d6d6] bg-[#e9eaec] px-3 text-[13px] font-medium text-[#7a7d84] disabled:opacity-70 whitespace-nowrap"
          >
            <Eye className="h-[14px] w-[14px]" />
            View
          </button>

          {/* Export */}
          <button
            onClick={handleAddToExportQueue}
            disabled={!selectedRows.length}
            className="flex h-[32px] items-center gap-1 rounded-[4px] border border-[#d6d6d6] bg-[#e9eaec] px-3 text-[13px] font-medium text-[#7a7d84] disabled:opacity-70 whitespace-nowrap"
          >
            <FilePlus2 className="h-[14px] w-[14px]" />
            Export
          </button>

          {/* Save */}
          <button
            onClick={handleSaveData}
            disabled={!tableData.length}
            className="flex h-[32px] items-center gap-1 rounded-[4px] border border-[#d6d6d6] bg-[#e9eaec] px-3 text-[13px] font-medium text-[#2f2f2f] hover:bg-white disabled:opacity-70 whitespace-nowrap"
          >
            <Save className="h-[14px] w-[14px]" />
            Save
          </button>

        </div>
      </div>

      {!tableData.length ? (
        <div className="flex min-h-screen items-start justify-center px-6">
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
        <div className="px-1 pt-2">
          <div className="overflow-hidden rounded-[5px] border border-[#dddddd] bg-white shadow-sm">
            <div>
              <HotTable
                ref={hotTableRef}
                data={tableData}
                columns={hotColumns}
                colHeaders={colHeaders}
                rowHeaders={true}
                width="100%"
                height="81.5vh"
                stretchH="all"
                licenseKey="non-commercial-and-evaluation"
                contextMenu={true}
                dropdownMenu={true}
                filters={true}
                manualColumnResize={true}
                manualRowResize={true}
                columnSorting={true}
                multiColumnSorting={true}
                navigableHeaders={true}
                autoWrapRow={true}
                autoWrapCol={true}
                copyPaste={true}
                fillHandle={true}
                undo={true}
                readOnly={false}
                wordWrap={false}
                search={true}
                selectionMode="multiple"
                outsideClickDeselects={false}
                className="htCenter htMiddle"
                tableClassName="custom-hot"
                currentRowClassName="currentRow"
                currentColClassName="currentCol"
                afterChange={(changes, source) => {
                  if (!changes || source === "loadData") return;

                  setTableData((prev) => {
                    const updated = [...prev];

                    changes.forEach(([row, prop, oldValue, newValue]) => {
                      if (row == null || prop == null) return;
                      if (oldValue === newValue) return;

                      const rowIndex = Number(row);
                      const propKey = String(prop);

                      if (!updated[rowIndex]) return;
                      updated[rowIndex] = {
                        ...updated[rowIndex],
                        [propKey]: newValue,
                      };
                    });

                    return updated;
                  });

                  setChangedCells((prev) => {
                    const next = [...prev];

                    changes.forEach(([row, prop, oldValue, newValue]) => {
                      if (row == null || prop == null) return;
                      if (oldValue === newValue) return;

                      const rowIndex = Number(row);
                      const propKey = String(prop);

                      const existingIndex = next.findIndex(
                        (item) => item.row === rowIndex && item.prop === propKey
                      );

                      const changeObj: ChangedCell = {
                        row: rowIndex,
                        prop: propKey,
                        oldValue,
                        newValue,
                      };

                      if (existingIndex >= 0) {
                        next[existingIndex] = changeObj;
                      } else {
                        next.push(changeObj);
                      }
                    });

                    return next;
                  });
                }}
                afterSelectionEnd={(row, _column, row2) => {
                  const start = Math.min(row, row2);
                  const end = Math.max(row, row2);
                  const selected: number[] = [];

                  for (let i = start; i <= end; i++) {
                    selected.push(i);
                  }

                  if (
                    selected.length !== selectedRowsRef.current.length ||
                    !selected.every(
                      (val, idx) => val === selectedRowsRef.current[idx]
                    )
                  ) {
                    selectedRowsRef.current = selected;
                    setSelectedRows(selected);
                  }
                }}
                afterDeselect={() => {
                  if (selectedRowsRef.current.length > 0) {
                    selectedRowsRef.current = [];
                    setSelectedRows([]);
                  }
                }}
                cells={(row, col) => {
                  const cellProperties: any = {
                    halign: "center",
                    valign: "middle",
                    className: "htCenter htMiddle",
                  };

                  if (columns[col] && columns[col].toLowerCase() === "block") {
                    cellProperties.halign = "left";
                    cellProperties.className = "htLeft htMiddle";
                  }

                  return cellProperties;
                }}
              />
            </div>

            {/* Pagination at the bottom of the HotTable */}
            <CommonPagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={itemsPerPage}
              currentPageItemCount={tableData.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              loading={loading}
              showRefreshButton={true}
              onRefresh={handleRefresh}
            />

            {!!selectedRowsData.length && (
              <div className="border-t border-[#ececec] bg-[#fafafa] px-5 py-4">
                <h4 className="mb-2 text-[14px] font-semibold text-[#333]">
                  Selected Rows Preview ({selectedRowsData.length})
                </h4>

                <div className="max-h-[160px] overflow-auto rounded-md border bg-white p-3 text-[12px] text-[#444]">
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(selectedRowsData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}