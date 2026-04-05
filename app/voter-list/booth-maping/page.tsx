"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import type { ColumnSettings } from "handsontable/settings";
import {
  Play,
  RefreshCw,
  Upload,
  Download,
  FileText,
  RotateCcw,
  Loader2,
} from "lucide-react";
import {
  dataidMapingMaster,
  DownloadBoothMaping,
  updateMappingBatch,
  uploadMappingOverride,
} from "@/apis/api";
import { LiveMasterFilter } from "@/components/voterList/LiveMasterFilter";
import { SearchableSelect } from "@/components/voterList/SearchableSelect";

registerAllModules();

interface Option {
  id: string | number;
  display: string;
  searchText?: string;
}

interface FilterOptions {
  data_id: Option[];
  ac_id: Option[];
  bhag_no: Option[];
  sec_no: Option[];
  village: Option[];
  block: Option[];
  psb: Option[];
  mandal: Option[];
  pincode: Option[];
  postoff: Option[];
  policst: Option[];
  ru: Option[];
  status: Option[];
}

interface ApiResponse {
  success: boolean;
  data?: {
    result: DataItem[];
    filters: FilterOptions;
    total: number;
    page: number;
    limit: number;
    unique_mapping?: {
      bhag?: any[];
      section?: any[];
      village?: any[];
      gp_ward?: any[];
      psb?: any[];
      mandal?: any[];
      pincode?: any[];
      postoff?: any[];
      policst?: any[];
      ru?: any[];
    };
  };
  message?: string;
  updated?: {
    total_processed?: number;
  };
}

interface DataItem {
  id: number;
  data_id: number;
  ac_id: number;
  ac_name: string | null;
  bhag_no: number;
  bhag: string | null;
  sec_no: number;
  section: string | null;
  ru: number | string;
  village: string | null;
  gp_ward: string | null;
  block: string | null;
  psb: string | null;
  coordinate: string | null;
  kendra: string | null;
  mandal: string | null;
  pjila: string | null;
  pincode: string | null;
  postoff: string | null;
  policst: string | null;
  is_active: number;
  updated_at: string;
  village_id: string | null;
  gp_ward_id: string | null;
  block_id: string | null;
  psb_id: string | null;
  coordinate_id: string | null;
  kendra_id: string | null;
  mandal_id: string | null;
  pjila_id: string | null;
  pincode_id: string | null;
  postoff_id: string | null;
  policst_id: string | null;
}

interface UpdateRow {
  id?: number;
  data_id: number;
  ac_id: number;
  bhag_no: number;
  sec_no: number;
  village?: string | null;
  village_id?: string | null;
  gp_ward?: string | null;
  gp_ward_id?: string | null;
  block?: string | null;
  block_id?: string | null;
  psb?: string | null;
  psb_id?: string | null;
  coordinate?: string | null;
  coordinate_id?: string | null;
  kendra?: string | null;
  kendra_id?: string | null;
  mandal?: string | null;
  mandal_id?: string | null;
  pjila?: string | null;
  pjila_id?: string | null;
  pincode?: string | null;
  pincode_id?: string | null;
  postoff?: string | null;
  postoff_id?: string | null;
  policst?: string | null;
  policst_id?: string | null;
  section?: string | null;
}

type DisplayRow = Record<string, any>;

const MULTILINE_FIELDS = new Set([
  "bhag",
  "section",
  "village",
  "gp_ward",
  "block",
  "psb",
  "coordinate",
  "kendra",
  "mandal",
  "pjila",
  "pincode",
  "postoff",
  "policst",
  "village_id",
  "gp_ward_id",
  "block_id",
  "psb_id",
  "coordinate_id",
  "kendra_id",
  "mandal_id",
  "pjila_id",
  "pincode_id",
  "postoff_id",
  "policst_id",
]);

const safeValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const uniqueValuesArray = (rows: Record<string, any>[], key: string): string[] => {
  return Array.from(
    new Set(
      rows
        .map((row) => safeValue(row[key]))
        .filter(Boolean)
    )
  );
};

const uniqueCommaValues = (rows: Record<string, any>[], key: string): string => {
  return uniqueValuesArray(rows, key).join(", ");
};

const uniqueNumberValues = (rows: Record<string, any>[], key: string): string => {
  const values = Array.from(
    new Set(
      rows
        .map((row) => row[key])
        .filter((value) => value !== null && value !== undefined && value !== "")
    )
  );

  return values.join(", ");
};

const formatNumberedText = (rows: Record<string, any>[], key: string): string => {
  const values = uniqueValuesArray(rows, key);

  if (values.length === 0) return "";

  return values
    .map((value, index) => `${index + 1}.) ${value}`)
    .join("\n");
};

const formatCommaSeparatedMultilineText = (rows: Record<string, any>[], key: string): string => {
  const values = uniqueValuesArray(rows, key);

  if (values.length === 0) return "";

  return values.join(",\n");
};

const formatGroupedText = (
  rows: Record<string, any>[],
  key: string,
  enableNumbering: boolean
): string => {
  return enableNumbering
    ? formatNumberedText(rows, key)
    : formatCommaSeparatedMultilineText(rows, key);
};

const getGroupKeyByView = (row: DataItem, viewBy: string): string => {
  switch (viewBy) {
    case "bhag":
      return `${row.data_id}-${row.ac_id}-${safeValue(row.bhag_no)}`;
    case "section":
      return `${row.data_id}-${row.ac_id}-${safeValue(row.bhag_no)}-${safeValue(row.sec_no)}`;
    case "gram":
      return `${row.data_id}-${row.ac_id}-${safeValue(row.village_id)}-${safeValue(row.village)}`;
    case "gp":
      return `${row.data_id}-${row.ac_id}-${safeValue(row.gp_ward_id)}-${safeValue(row.gp_ward)}`;
    case "block":
      return `${row.data_id}-${row.ac_id}-${safeValue(row.block_id)}-${safeValue(row.block)}`;
    default:
      return `${row.data_id}-${row.ac_id}-${safeValue(row.bhag_no)}-${safeValue(row.sec_no)}`;
  }
};

const groupRowsByView = (
  rows: DataItem[],
  viewBy: string,
  enableNumbering: boolean
): DisplayRow[] => {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  if (!viewBy || viewBy === "section") {
    return rows;
  }

  const groupedMap = new Map<string, DataItem[]>();

  rows.forEach((row) => {
    const key = getGroupKeyByView(row, viewBy);
    if (!groupedMap.has(key)) {
      groupedMap.set(key, []);
    }
    groupedMap.get(key)!.push(row);
  });

  return Array.from(groupedMap.values()).map((group) => {
    const first = group[0];

    return {
      id: first.id,
      data_id: first.data_id,
      ac_id: first.ac_id,
      ac_name: first.ac_name,

      bhag_no: viewBy === "bhag" ? first.bhag_no : uniqueNumberValues(group, "bhag_no"),
      bhag: formatGroupedText(group, "bhag", enableNumbering),

      sec_no: viewBy === "section" ? first.sec_no : uniqueNumberValues(group, "sec_no"),
      section: formatGroupedText(group, "section", enableNumbering),

      ru: uniqueNumberValues(group, "ru"),
      village: formatGroupedText(group, "village", enableNumbering),
      gp_ward: formatGroupedText(group, "gp_ward", enableNumbering),
      block: formatGroupedText(group, "block", enableNumbering),
      psb: formatGroupedText(group, "psb", enableNumbering),
      coordinate: formatGroupedText(group, "coordinate", enableNumbering),
      kendra: formatGroupedText(group, "kendra", enableNumbering),
      mandal: formatGroupedText(group, "mandal", enableNumbering),
      pjila: formatGroupedText(group, "pjila", enableNumbering),
      pincode: formatGroupedText(group, "pincode", enableNumbering),
      postoff: formatGroupedText(group, "postoff", enableNumbering),
      policst: formatGroupedText(group, "policst", enableNumbering),

      village_id: formatGroupedText(group, "village_id", enableNumbering),
      gp_ward_id: formatGroupedText(group, "gp_ward_id", enableNumbering),
      block_id: formatGroupedText(group, "block_id", enableNumbering),
      psb_id: formatGroupedText(group, "psb_id", enableNumbering),
      coordinate_id: formatGroupedText(group, "coordinate_id", enableNumbering),
      kendra_id: formatGroupedText(group, "kendra_id", enableNumbering),
      mandal_id: formatGroupedText(group, "mandal_id", enableNumbering),
      pjila_id: formatGroupedText(group, "pjila_id", enableNumbering),
      pincode_id: formatGroupedText(group, "pincode_id", enableNumbering),
      postoff_id: formatGroupedText(group, "postoff_id", enableNumbering),
      policst_id: formatGroupedText(group, "policst_id", enableNumbering),

      is_active: first.is_active,
      updated_at: first.updated_at,
      total_rows: group.length,
    };
  });
};

const defaultTextRenderer = (
  td: HTMLTableCellElement,
  value: any,
  multiline: boolean = false
) => {
  td.className = "htCenter htMiddle";
  td.style.verticalAlign = "top";
  td.style.textAlign= "justify"
  td.style.whiteSpace = multiline ? "pre-line" : "normal";
  td.style.lineHeight = multiline ? "1.45" : "normal";
  td.style.padding = multiline ? "4px" : "4px";
  td.textContent = value ?? "";
  return td;
};

const generateColumns = (rows: DisplayRow[]): ColumnSettings[] => {
  if (!rows || rows.length === 0) return [];

  const keys = Object.keys(rows[0]);

  return keys.map((key) => {
    const column: ColumnSettings = {
      data: key,
      title: key.replace(/_/g, " ").toUpperCase(),
      width: MULTILINE_FIELDS.has(key) ? 240 : 120,
      className: "htCenter htMiddle",
    };

    if (key === "id") {
      column.readOnly = true;
      column.width = 70;
    }

    if (MULTILINE_FIELDS.has(key)) {
      column.renderer = (
        _instance,
        td,
        _row,
        _col,
        _prop,
        value
      ) => defaultTextRenderer(td, value, true);
    }

    if (key === "updated_at") {
      column.renderer = (
        _instance,
        td,
        _row,
        _col,
        _prop,
        value
      ) => {
        td.className = "htCenter htMiddle";
        td.textContent = value ? new Date(value).toLocaleString() : "-";
        return td;
      };
    }

    if (key === "is_active") {
      column.renderer = (
        _instance,
        td,
        _row,
        _col,
        _prop,
        value
      ) => {
        td.className = "htCenter htMiddle";
        td.textContent = value === 1 ? "Active" : "Inactive";
        return td;
      };
    }

    if (key === "ru") {
      column.renderer = (
        _instance,
        td,
        _row,
        _col,
        _prop,
        value
      ) => {
        td.className = "htCenter htMiddle";

        if (typeof value === "string") {
          td.textContent = value
            .split(",")
            .map((v) => v.trim())
            .map((v) => (v === "1" ? "R" : v === "0" ? "U" : v))
            .join(", ");
        } else {
          td.textContent = value === 1 ? "R" : value === 0 ? "U" : "-";
        }

        return td;
      };
    }

    if (key === "total_rows") {
      column.title = "GROUP COUNT";
      column.width = 110;
      column.readOnly = true;
      column.renderer = (
        _instance,
        td,
        _row,
        _col,
        _prop,
        value
      ) => {
        td.className = "htCenter htMiddle";
        td.textContent = value ? String(value) : "0";
        return td;
      };
    }

    return column;
  });
};

export default function Page() {
  const hotTableRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [viewBy, setViewBy] = useState<string>("section");
  const [enableNumbering, setEnableNumbering] = useState<boolean>(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [columns, setColumns] = useState<ColumnSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showNoDataMessage, setShowNoDataMessage] = useState(false);
  const [isGoClicked, setIsGoClicked] = useState(false);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    data_id: [],
    ac_id: [],
    bhag_no: [],
    sec_no: [],
    village: [],
    block: [],
    psb: [],
    mandal: [],
    pincode: [],
    postoff: [],
    policst: [],
    ru: [],
    status: [],
  });

  const [changedData, setChangedData] = useState<Map<string, UpdateRow>>(new Map());

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(500);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [bhagNo, setBhagNo] = useState("");
  const [sectionNo, setSectionNo] = useState("");
  const [ru, setRu] = useState("");
  const [village, setVillage] = useState("");
  const [gpWard, setGpWard] = useState("");
  const [psb, setPsb] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [policeStation, setPoliceStation] = useState("");

  const specialFields = [
    "village",
    "gp_ward",
    "block",
    "psb",
    "coordinate",
    "kendra",
    "mandal",
    "pjila",
    "pincode",
    "postoff",
    "policst",
  ];

  const displayedData = useMemo<DisplayRow[]>(() => {
    return groupRowsByView(data, viewBy, enableNumbering);
  }, [data, viewBy, enableNumbering]);

  useEffect(() => {
    setColumns(generateColumns(displayedData));
  }, [displayedData]);

  const getRowKey = (row: DataItem): string => {
    return `${row.data_id}-${row.ac_id}-${row.bhag_no}-${row.sec_no}`;
  };

  const fetchData = async (page: number = currentPage, customParams?: Record<string, any>) => {
    setLoading(true);
    setShowNoDataMessage(false);

    try {
      const params: Record<string, any> = customParams
        ? { ...customParams }
        : {
          page,
          limit: pageSize,
        };

      if (!customParams) {
        if (bhagNo) params.bhag_no = Number(bhagNo);
        if (sectionNo) params.sec_no = Number(sectionNo);
        if (ru) params.ru = ru === "R" ? 1 : ru === "U" ? 0 : undefined;
        if (village) params.village_id = village;
        if (gpWard) params.gp_ward_id = gpWard;
        if (psb) params.psb_id = psb;
        if (pinCode) params.pincode_id = pinCode;
        if (postOffice) params.postoff_id = postOffice;
        if (policeStation) params.policst_id = policeStation;
      }

      if (params.data_id) params.data_id = Number(params.data_id);
      if (params.ac_id) params.ac_id = Number(params.ac_id);
      if (params.pc_id) params.pc_id = Number(params.pc_id);
      if (params.district_id) params.district_id = Number(params.district_id);

      const response = (await dataidMapingMaster(params)) as ApiResponse;

      if (response.success && response.data) {
        const result = response.data.result || [];
        setData(result);

        setFilterOptions(
          response.data.filters || {
            data_id: [],
            ac_id: [],
            bhag_no: [],
            sec_no: [],
            village: [],
            block: [],
            psb: [],
            mandal: [],
            pincode: [],
            postoff: [],
            policst: [],
            ru: [],
            status: [],
          }
        );

        setTotalRecords(response.data.total || 0);
        setCurrentPage(response.data.page || 1);
        setTotalPages(Math.ceil((response.data.total || 0) / pageSize));
        setChangedData(new Map());

        if (result.length === 0) {
          setShowNoDataMessage(true);
        }
      } else {
        setData([]);
        setShowNoDataMessage(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setData([]);
      setShowNoDataMessage(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoClick = () => {
    if (
      !bhagNo &&
      !sectionNo &&
      !ru &&
      !village &&
      !gpWard &&
      !psb &&
      !pinCode &&
      !postOffice &&
      !policeStation
    ) {
      alert("Please select at least one filter");
      return;
    }

    setIsGoClicked(true);

    const subFilterParams: Record<string, any> = {
      page: 1,
      limit: pageSize,
      bhag_no: bhagNo ? Number(bhagNo) : undefined,
      sec_no: sectionNo ? Number(sectionNo) : undefined,
      ru: ru ? (ru === "R" ? 1 : ru === "U" ? 0 : undefined) : undefined,
      village_id: village || undefined,
      gp_ward_id: gpWard || undefined,
      psb_id: psb || undefined,
      pincode_id: pinCode || undefined,
      postoff_id: postOffice || undefined,
      policst_id: policeStation || undefined,
    };

    Object.keys(subFilterParams).forEach((key) => {
      if (subFilterParams[key] === undefined) {
        delete subFilterParams[key];
      }
    });

    setCurrentPage(1);
    fetchData(1, subFilterParams);
  };

  const handleDownloadClick = async () => {
    try {
      setUpdateLoading(true);
      const dataId = data.length > 0 ? data[0].data_id : 1;
      const response = await DownloadBoothMaping(dataId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "booth_mapping.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Error downloading file");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateSyncClick = async () => {
    if (viewBy !== "section") {
      alert("Please switch to Section wise before updating.");
      return;
    }

    if (changedData.size === 0) {
      alert("No changes to update");
      return;
    }

    setUpdateLoading(true);

    try {
      const updates = Array.from(changedData.values()).map((update) => ({
        id: update.id,
        data_id: update.data_id,
        ac_id: update.ac_id,
        bhag_no: update.bhag_no,
        sec_no: update.sec_no,
        village: update.village || null,
        village_id: update.village_id || null,
        gp_ward: update.gp_ward || null,
        gp_ward_id: update.gp_ward_id || null,
        block: update.block || null,
        block_id: update.block_id || null,
        psb: update.psb || null,
        psb_id: update.psb_id || null,
        coordinate: update.coordinate || null,
        coordinate_id: update.coordinate_id || null,
        kendra: update.kendra || null,
        kendra_id: update.kendra_id || null,
        mandal: update.mandal || null,
        mandal_id: update.mandal_id || null,
        pjila: update.pjila || null,
        pjila_id: update.pjila_id || null,
        pincode: update.pincode || null,
        pincode_id: update.pincode_id || null,
        postoff: update.postoff || null,
        postoff_id: update.postoff_id || null,
        policst: update.policst || null,
        policst_id: update.policst_id || null,
        section: update.section || null,
      }));

      const response = (await updateMappingBatch(updates)) as ApiResponse;

      if (response.success) {
        alert(`Successfully updated ${response?.updated?.total_processed || 0} rows`);
        await fetchData();
      } else {
        alert(response.message || "Failed to update data");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating data");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleTemplateClick = () => {
    console.log("Template clicked");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadLoading(true);

      const response = await uploadMappingOverride(file);

      if (response?.success) {
        alert(response.message || "File uploaded successfully");
        fetchData();
      } else {
        alert(response?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleApplyFilters = async (params: Record<string, any>, page: number = 1): Promise<void> => {
    try {
      setLoading(true);
      setShowNoDataMessage(false);
      setCurrentPage(page);

      const queryParams: Record<string, any> = {
        ...params,
        page,
        limit: pageSize,
        data_id: params.data_id ? Number(params.data_id) : undefined,
        ac_id: params.ac_id ? Number(params.ac_id) : undefined,
        pc_id: params.pc_id ? Number(params.pc_id) : undefined,
        district_id: params.district_id ? Number(params.district_id) : undefined,
        party_district_id: params.party_district_id ? Number(params.party_district_id) : undefined,
        initial_load: true,
      };

      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response: ApiResponse = await dataidMapingMaster(queryParams);

      if (response.success) {
        setIsGoClicked(true);

        if (response.data?.unique_mapping) {
          const mapping = response.data.unique_mapping;
          const safe = (v: any) => (v ?? "").toString();

          setFilterOptions({
            data_id: [],
            ac_id: [],
            bhag_no: (mapping.bhag || []).map((item: any) => ({
              id: item.bhag_no,
              display: `${safe(item.bhag_no)} - ${safe(item.bhag)}`,
              searchText: `${safe(item.bhag_no)} ${safe(item.bhag)}`.toLowerCase(),
            })),
            sec_no: (mapping.section || []).map((item: any) => ({
              id: item.sec_no,
              display: `${safe(item.sec_no)} - ${safe(item.section)}`,
              searchText: `${safe(item.sec_no)} ${safe(item.section)}`.toLowerCase(),
            })),
            village: (mapping.village || []).map((item: any) => ({
              id: item.village_id,
              display: `${safe(item.village_id)} - ${safe(item.village)}`,
              searchText: `${safe(item.village_id)} ${safe(item.village)}`.toLowerCase(),
            })),
            block: (mapping.gp_ward || []).map((item: any) => ({
              id: item.gp_ward_id,
              display: `${safe(item.gp_ward_id)} - ${safe(item.gp_ward)}`,
              searchText: `${safe(item.gp_ward_id)} ${safe(item.gp_ward)}`.toLowerCase(),
            })),
            psb: (mapping.psb || []).map((item: any) => ({
              id: item.psb_id,
              display: `${safe(item.psb_id)} - ${safe(item.psb)}`,
              searchText: `${safe(item.psb_id)} ${safe(item.psb)}`.toLowerCase(),
            })),
            mandal: (mapping.mandal || []).map((item: any) => ({
              id: item.mandal_id,
              display: `${safe(item.mandal_id)} - ${safe(item.mandal)}`,
              searchText: `${safe(item.mandal_id)} ${safe(item.mandal)}`.toLowerCase(),
            })),
            pincode: (mapping.pincode || []).map((item: any) => ({
              id: item.pincode_id,
              display: safe(item.pincode),
              searchText: safe(item.pincode).toLowerCase(),
            })),
            postoff: (mapping.postoff || []).map((item: any) => ({
              id: item.postoff_id,
              display: `${safe(item.postoff_id)} - ${safe(item.postoff)}`,
              searchText: `${safe(item.postoff_id)} ${safe(item.postoff)}`.toLowerCase(),
            })),
            policst: (mapping.policst || []).map((item: any) => ({
              id: item.policst_id,
              display: `${safe(item.policst_id)} - ${safe(item.policst)}`,
              searchText: `${safe(item.policst_id)} ${safe(item.policst)}`.toLowerCase(),
            })),
            ru: (mapping.ru || []).map((item: any) => ({
              id: String(item.ru_id),
              display: String(item.ru),
              searchText: String(item.ru).toLowerCase(),
            })),
            status: [],
          });
        } else {
          setFilterOptions({
            data_id: [],
            ac_id: [],
            bhag_no: [],
            sec_no: [],
            village: [],
            block: [],
            psb: [],
            mandal: [],
            pincode: [],
            postoff: [],
            policst: [],
            ru: [],
            status: [],
          });
        }

        if (response.data?.result) {
          const result = response.data.result;
          setData(result);
          setTotalRecords(response.data.total || 0);
          setTotalPages(Math.ceil((response.data.total || 0) / pageSize));
        } else {
          setData([]);
          setTotalRecords(0);
          setShowNoDataMessage(true);
        }
      } else {
        setData([]);
        setShowNoDataMessage(true);
        setIsGoClicked(false);
      }
    } catch (error) {
      console.error("Error applying filters:", error);
      setData([]);
      setShowNoDataMessage(true);
      setIsGoClicked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResetClick = () => {
    setIsGoClicked(false);
    setViewBy("section");
    setEnableNumbering(true);
    setBhagNo("");
    setSectionNo("");
    setRu("");
    setVillage("");
    setGpWard("");
    setPsb("");
    setPinCode("");
    setPostOffice("");
    setPoliceStation("");
    setChangedData(new Map());
    setCurrentPage(1);
    setData([]);
    setColumns([]);
    setTotalRecords(0);
    setTotalPages(1);
    setShowNoDataMessage(false);
  };

  const hotSettings = {
    cells: (_row?: number, _col?: number, prop?: string | number) => {
      const propName = typeof prop === "string" ? prop : "";
      const isMultiline = MULTILINE_FIELDS.has(propName);

      return {
        className: "htCenter htMiddle",
        wordWrap: isMultiline,
      };
    },

    afterChange: (changes: any[] | null, source: string) => {
      if (viewBy !== "section") return;

      if (
        changes &&
        (source === "edit" ||
          source === "paste" ||
          source === "autofill" ||
          source === "CopyPaste.paste")
      ) {
        const newChangedData = new Map(changedData);

        changes.forEach(([row, prop, oldValue, newValue]) => {
          if (oldValue !== newValue && data[row]) {
            const rowData = data[row];
            const rowKey = getRowKey(rowData);

            const existing = newChangedData.get(rowKey) || {
              id: rowData.id,
              data_id: rowData.data_id,
              ac_id: rowData.ac_id,
              bhag_no: rowData.bhag_no,
              sec_no: rowData.sec_no,
            };

            let columnProp = prop;
            if (typeof prop === "number") {
              const column = columns[prop];
              columnProp = column?.data as string;
            }

            if (typeof columnProp === "string" && specialFields.includes(columnProp)) {
              (existing as any)[columnProp] = newValue;
              const idField = `${columnProp}_id`;
              if (rowData[idField as keyof DataItem]) {
                (existing as any)[idField] = rowData[idField as keyof DataItem];
              }
            } else if (
              typeof columnProp === "string" &&
              columnProp.endsWith("_id") &&
              specialFields.includes(columnProp.replace("_id", ""))
            ) {
              (existing as any)[columnProp] = newValue;
            } else if (columnProp === "section") {
              existing.section = newValue;
            }

            newChangedData.set(rowKey, existing);
          }
        });

        if (newChangedData.size > 0) {
          setChangedData(newChangedData);
        }
      }
    },

    afterPaste: (changes: any[] | null) => {
      if (viewBy !== "section") return;

      if (changes && changes.length > 0) {
        const newChangedData = new Map(changedData);

        changes.forEach((change) => {
          let row: number | undefined;
          let col: number | undefined;
          let oldValue: any;
          let newValue: any;

          if (Array.isArray(change) && change.length >= 4) {
            [row, col, oldValue, newValue] = change;
          } else if (change && typeof change === "object") {
            row = change.row;
            col = change.col;
            oldValue = change.oldValue;
            newValue = change.newValue;
          }

          if (
            row !== undefined &&
            col !== undefined &&
            oldValue !== newValue &&
            data[row]
          ) {
            const rowData = data[row];
            const rowKey = getRowKey(rowData);
            const existing = newChangedData.get(rowKey) || {
              id: rowData.id,
              data_id: rowData.data_id,
              ac_id: rowData.ac_id,
              bhag_no: rowData.bhag_no,
              sec_no: rowData.sec_no,
            };

            const column = columns[col];
            const columnProp = column?.data as string;

            if (columnProp && specialFields.includes(columnProp)) {
              (existing as any)[columnProp] = newValue;
              const idField = `${columnProp}_id`;
              if (rowData[idField as keyof DataItem]) {
                (existing as any)[idField] = rowData[idField as keyof DataItem];
              }
            } else if (
              columnProp &&
              columnProp.endsWith("_id") &&
              specialFields.includes(columnProp.replace("_id", ""))
            ) {
              (existing as any)[columnProp] = newValue;
            } else if (columnProp === "section") {
              existing.section = newValue;
            }

            newChangedData.set(rowKey, existing);
          }
        });

        if (newChangedData.size > 0) {
          setChangedData(newChangedData);
        }
      }
    },

    afterSetDataAtCell: (changes: any[] | null) => {
      if (viewBy !== "section") return;

      if (changes && changes.length > 0) {
        const newChangedData = new Map(changedData);

        changes.forEach((change) => {
          let row: number | undefined;
          let col: number | undefined;
          let oldValue: any;
          let newValue: any;

          if (Array.isArray(change) && change.length >= 4) {
            [row, col, oldValue, newValue] = change;
          }

          if (
            row !== undefined &&
            col !== undefined &&
            oldValue !== newValue &&
            data[row]
          ) {
            const rowData = data[row];
            const rowKey = getRowKey(rowData);
            const existing = newChangedData.get(rowKey) || {
              id: rowData.id,
              data_id: rowData.data_id,
              ac_id: rowData.ac_id,
              bhag_no: rowData.bhag_no,
              sec_no: rowData.sec_no,
            };

            const column = columns[col];
            const columnProp = column?.data as string;

            if (columnProp && specialFields.includes(columnProp)) {
              (existing as any)[columnProp] = newValue;
              const idField = `${columnProp}_id`;
              if (rowData[idField as keyof DataItem]) {
                (existing as any)[idField] = rowData[idField as keyof DataItem];
              }
            } else if (
              columnProp &&
              columnProp.endsWith("_id") &&
              specialFields.includes(columnProp.replace("_id", ""))
            ) {
              (existing as any)[columnProp] = newValue;
            } else if (columnProp === "section") {
              existing.section = newValue;
            }

            newChangedData.set(rowKey, existing);
          }
        });

        if (newChangedData.size > 0) {
          setChangedData(newChangedData);
        }
      }
    },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-hidden">
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-1.5 flex-shrink-0">
        <div className="w-full flex items-center gap-6">
          <div className="flex-1 min-w-0">
            <LiveMasterFilter onApplyFilters={handleApplyFilters} />
          </div>
        </div>
      </div>

      {isGoClicked && (
        <div className="bg-white border-b border-gray-200 px-3 py-1.5">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <select
              value={viewBy}
              onChange={(e) => setViewBy(e.target.value)}
              disabled={loading || updateLoading}
              className="h-[30px] text-xs px-2 border border-gray-300 rounded-md bg-gray-100 font-medium text-gray-800 min-w-[130px] cursor-pointer"
            >
              <option value="">View By</option>
              <option value="section">Section wise</option>
              <option value="bhag">Bhag wise</option>
              <option value="gram">Gram wise</option>
              <option value="gp">GP wise</option>
              <option value="block">Block wise</option>
            </select>

            <label className="inline-flex h-[30px] items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-2.5 text-xs font-medium text-gray-700 shadow-sm">
              <input
                type="checkbox"
                checked={enableNumbering}
                onChange={(e) => setEnableNumbering(e.target.checked)}
                disabled={loading || updateLoading || viewBy === "section"}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed"
              />
              <span>Numbering</span>
            </label>

            <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

            {[
              {
                id: "bhagNo",
                value: bhagNo,
                onChange: setBhagNo,
                options: filterOptions.bhag_no || [],
                placeholder: "Bhag No - Hi - Eng",
              },
              {
                id: "sectionNo",
                value: sectionNo,
                onChange: setSectionNo,
                options: filterOptions.sec_no || [],
                placeholder: "Section No - Name",
              },
              {
                id: "ru",
                value: ru,
                onChange: setRu,
                options: filterOptions.ru || [],
                placeholder: "R/U",
              },
              {
                id: "village",
                value: village,
                onChange: setVillage,
                options: filterOptions.village || [],
                placeholder: "Village ID - Name",
              },
              {
                id: "gpWard",
                value: gpWard,
                onChange: setGpWard,
                options: filterOptions.block || [],
                placeholder: "GP/Ward ID - Name",
              },
            ].map(({ id, value, onChange, options, placeholder }) => (
              <div key={id} className="flex-1 min-w-[145px]">
                <SearchableSelect
                  id={id}
                  value={value}
                  onChange={onChange}
                  options={options}
                  placeholder={placeholder}
                  label=""
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                  disabled={loading || updateLoading}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              {
                id: "psb",
                value: psb,
                onChange: setPsb,
                options: filterOptions.psb || [],
                placeholder: "PSB ID - Name",
              },
              {
                id: "pinCode",
                value: pinCode,
                onChange: setPinCode,
                options: filterOptions.pincode || [],
                placeholder: "Pin Code",
              },
              {
                id: "postOffice",
                value: postOffice,
                onChange: setPostOffice,
                options: filterOptions.postoff || [],
                placeholder: "Post Office",
              },
              {
                id: "policeStation",
                value: policeStation,
                onChange: setPoliceStation,
                options: filterOptions.policst || [],
                placeholder: "Police Station",
              },
            ].map(({ id, value, onChange, options, placeholder }) => (
              <div key={id} className="flex-1 min-w-[145px]">
                <SearchableSelect
                  id={id}
                  value={value}
                  onChange={onChange}
                  options={options}
                  placeholder={placeholder}
                  label=""
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                  disabled={loading || updateLoading}
                />
              </div>
            ))}

            <div className="flex items-center gap-1.5 ml-auto flex-wrap">
              <button
                onClick={handleGoClick}
                disabled={loading || updateLoading}
                className={`flex items-center gap-1 px-3 h-[30px] rounded-md text-xs ${loading || updateLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-900 cursor-pointer"
                  } text-white`}
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                Go
              </button>

              <button
                onClick={handleUpdateSyncClick}
                disabled={loading || updateLoading || changedData.size === 0}
                className={`flex items-center gap-1 px-3 h-[30px] rounded-md text-xs ${loading || updateLoading || changedData.size === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-800 cursor-pointer"
                  } text-white`}
              >
                {updateLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {changedData.size > 0 ? `Update & Sync (${changedData.size})` : "Update & Sync"}
              </button>

              <button
                onClick={handleTemplateClick}
                disabled={loading || updateLoading}
                className={`flex items-center gap-1 px-3 h-[30px] rounded-md text-xs ${loading || updateLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-800 cursor-pointer"
                  } text-white`}
              >
                <FileText size={12} />
                Template
              </button>

              <button
                onClick={handleUploadClick}
                disabled={uploadLoading}
                className="h-[30px] px-3 flex items-center gap-1 rounded-md text-xs text-white bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300 cursor-pointer"
              >
                {uploadLoading ? (
                  "Uploading..."
                ) : (
                  <>
                    <Upload size={12} />
                    Upload
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleDownloadClick}
                disabled={loading || updateLoading}
                className={`flex items-center gap-1 px-3 h-[30px] rounded-md text-xs ${loading || updateLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-800 cursor-pointer"
                  } text-white`}
              >
                <Download size={12} />
                Download
              </button>

              <button
                onClick={handleResetClick}
                disabled={loading || updateLoading}
                className="h-[30px] w-[30px] flex items-center justify-center border cursor-pointer border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="py-3">
        {loading ? (
          <div className="bg-white border rounded-lg flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Loading data...</p>
            </div>
          </div>
        ) : displayedData.length > 0 ? (
          <div className="bg-white border rounded-lg">
            <div className="overflow-hidden">
              <HotTable
                ref={hotTableRef}
                wordWrap={true}
                data={displayedData}
                columns={columns}
                colHeaders={columns.map((c, i) => c.title ?? `Column ${i + 1}`)}
                rowHeaders={true}
                width="100%"
                height="calc(100vh - 180px)"
                stretchH="all"
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
                rowHeights={50}
                licenseKey="non-commercial-and-evaluation"
                afterChange={hotSettings.afterChange}
                afterPaste={hotSettings.afterPaste}
                afterSetDataAtCell={hotSettings.afterSetDataAtCell}
                cells={hotSettings.cells}
              />
            </div>

            <div className="px-4 py-2 bg-gray-50 border-t text-sm text-gray-700 flex items-center justify-between">
              <span>
                View: <strong>{viewBy || "section"}</strong>
              </span>
            </div>
          </div>
        ) : showNoDataMessage ? (
          <div className="bg-white border rounded-lg min-h-[300px] flex items-center justify-center">
            <p className="text-sm text-gray-500">No data found.</p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg min-h-[300px] flex items-center justify-center">
            <p className="text-sm text-gray-500">Apply filters to load data.</p>
          </div>
        )}
      </div>
    </div>
  );
}