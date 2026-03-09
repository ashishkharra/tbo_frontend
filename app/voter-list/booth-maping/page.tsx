"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
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
  MapPin,
  Trash2,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import {
  dataidMapingMaster,
  DownloadBoothMaping,
  updateMappingBatch,
} from "@/apis/api";
import { LiveMasterFilter } from "@/components/voterList/LiveMasterFilter";
import { SearchableSelect } from "@/components/voterList/SearchableSelect";

registerAllModules();

interface VillageOption {
  village_id: string;
  village: string;
}

interface BlockOption {
  block_id: string;
  block: string;
}

interface Option {
  id: string | number;
  display: string;
  searchText?: string;
}

interface FilterOptions {
  bhag_no: Option[];
  sec_no: Option[];
  village: Option[];
  block: Option[];
  psb: Option[];
  pincode: Option[];
  postoff: Option[];
  policst: Option[];
  ru: Option[];
}

interface Metadata {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

interface VoterDataItem {
  id: number;
  name: string;
  age: number;
  gender: string;
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  data?: {
    result: DataItem[];
    filters: FilterOptions;
    total: number;
    page: number;
    limit: number;
  };
  voters?: VoterDataItem[];
  mapping?: any;
  metadata?: Metadata;
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
  ru: number;
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

interface VoterFilterOptions {
  blocks: string[];
  gps: string[];
  kendras: string[];
  mandals: string[];
  pincodes: string[];
  pjilas: string[];
  policeStations: string[];
  postOffices: string[];
  villages: string[];
  ru: string[];
  sections: string[];
  bhagNos: string[];
  castId: string[];
  sex: string[];
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | number | VillageOption | BlockOption | null)[];
  placeholder: string;
  label: string;
  disabled?: boolean;
  id: string;
  activeDropdown: string | null;
  onDropdownToggle: (id: string | null) => void;
  displayFormat?: "id-name" | "name" | "id";
}

export default function Page() {
  const hotTableRef = useRef<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    data_id: [],
    ac_id: [],
    bhag_no: [],
    sec_no: [],
    village: [],
    block: [],
    mandal: [],
    status: [],
  });
  const [voterFilterOptions, setVoterFilterOptions] =
    useState<VoterFilterOptions>({
      blocks: [],
      gps: [],
      kendras: [],
      mandals: [],
      pincodes: [],
      pjilas: [],
      policeStations: [],
      postOffices: [],
      villages: [],
      ru: [],
      sections: [],
      bhagNos: [],
      castId: [],
      sex: [],
    });
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [changedData, setChangedData] = useState<Map<string, UpdateRow>>(
    new Map()
  );
  const [voterData, setVoterData] = useState<VoterDataItem[]>([]);
  const [mappingData, setMappingData] = useState<any>(null);
  const [metadata, setMetadata] = useState<Metadata>({
    totalRecords: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [selectedDataId, setSelectedDataId] = useState<string>("");
  const [selectedAssembly, setSelectedAssembly] = useState<string>("");
  const [selectedParliament, setSelectedParliament] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [allItems, setAllItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<string | number>(50);
  const [showNoDataMessage, setShowNoDataMessage] = useState(false);
  const [isGoClicked, setIsGoClicked] = useState(false)

  const [bhagNo, setBhagNo] = useState("");
  const [sectionNo, setSectionNo] = useState("");
  const [ru, setRu] = useState("");
  const [village, setVillage] = useState("");
  const [gpWard, setGpWard] = useState("");
  const [psb, setPsb] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const pageSizeOptions = [10, 25, 50, 100, 200, 500];

  useEffect(() => { }, []);

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

  const getRowKey = (row: DataItem): string => {
    return `${row.data_id}-${row.ac_id}-${row.bhag_no}-${row.sec_no}`;
  };

  const getPageNumbers = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const hotSettings = {
    cells: () => {
      return {
        className: "htCenter htMiddle",
      };
    },
    afterChange: (changes: any[] | null, source: string) => {
      // Handle all types of changes including paste, autofill, etc.
      if (changes && (source === 'edit' || source === 'paste' || source === 'autofill' || source === 'CopyPaste.paste')) {
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

            // Get the actual property name if prop is a number (column index)
            let columnProp = prop;
            if (typeof prop === 'number') {
              const column = columns[prop];
              columnProp = column?.data as string;
            }

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

    afterPaste: (changes: any[] | null, source: string) => {
      // Handle paste operations
      if (changes && changes.length > 0) {
        const newChangedData = new Map(changedData);

        changes.forEach((change) => {
          // Handle different change formats
          let row, col, oldValue, newValue;

          if (Array.isArray(change) && change.length >= 4) {
            [row, col, oldValue, newValue] = change;
          } else if (change && typeof change === 'object') {
            row = change.row;
            col = change.col;
            oldValue = change.oldValue;
            newValue = change.newValue;
          }

          if (row !== undefined && col !== undefined && oldValue !== newValue && data[row]) {
            const rowData = data[row];
            const rowKey = getRowKey(rowData);
            const existing = newChangedData.get(rowKey) || {
              id: rowData.id,
              data_id: rowData.data_id,
              ac_id: rowData.ac_id,
              bhag_no: rowData.bhag_no,
              sec_no: rowData.sec_no,
            };

            // Get column property from column index
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

    afterSetDataAtCell: (changes: any[] | null, source: string) => {
      // Handle all data changes
      if (changes && changes.length > 0) {
        const newChangedData = new Map(changedData);

        changes.forEach((change) => {
          let row, col, oldValue, newValue;

          if (Array.isArray(change) && change.length >= 4) {
            [row, col, oldValue, newValue] = change;
          }

          if (row !== undefined && col !== undefined && oldValue !== newValue && data[row]) {
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

    afterSelection: (row: number, col: number, row2: number, col2: number) => {
      // Store selection for potential paste operations
      console.log('Selected range:', { startRow: row, startCol: col, endRow: row2, endCol: col2 });
    },

    beforePaste: (data: any[], coords: { startRow: number, startCol: number, endRow: number, endCol: number }) => {
      // Process data before paste - ensure it's in the right format
      console.log('Pasting data:', data);
      return data;
    }
  };

  const [columns, setColumns] = useState<ColumnSettings[]>([]);

  const generateColumns = (rows: any[]): ColumnSettings[] => {
    if (!rows || rows.length === 0) return [];

    const keys = Object.keys(rows[0]);

    return keys.map((key) => {
      const column: ColumnSettings = {
        data: key,
        title: key.replace(/_/g, " ").toUpperCase(),
        width: 120,
        className: "htCenter",
      };

      if (key === "id") {
        column.readOnly = true;
        column.width = 70;
      }

      if (key === "updated_at") {
        column.renderer = (instance, td, row, col, prop, value) => {
          td.textContent = value ? new Date(value).toLocaleString() : "-";
          return td;
        };
      }

      if (key === "is_active") {
        column.renderer = (instance, td, row, col, prop, value) => {
          td.textContent = value === 1 ? "Active" : "Inactive";
          return td;
        };
      }

      if (key === "ru") {
        column.renderer = (instance, td, row, col, prop, value) => {
          td.textContent = value === 1 ? "R" : value === 0 ? "U" : "-";
          return td;
        };
      }

      return column;
    });
  };

  const fetchData = async (page: number = currentPage, customParams?: any) => {
    setLoading(true);
    setShowNoDataMessage(false);

    try {
      const params: any = customParams || {
        page: page,
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

      console.log("Fetching with params:", params);

      const response = (await dataidMapingMaster(params)) as ApiResponse;

      // console.log(response)

      if (response.success && response.data) {
        const result = response.data.result || [];

        setData(result);
        setColumns(generateColumns(result));

        setFilterOptions(
          response.data.filters || {
            data_id: [],
            ac_id: [],
            bhag_no: [],
            sec_no: [],
            village: [],
            block: [],
            mandal: [],
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

    setIsGoClicked(true)

    // Convert sub-filters to numbers as well
    const subFilterParams = {
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

    // Remove undefined values
    Object.keys(subFilterParams).forEach(key =>
      subFilterParams[key] === undefined && delete subFilterParams[key]
    );

    setCurrentPage(1);
    fetchData(1, subFilterParams);
  };

  const handlePageChange = async (page: number) => {
    // Ensure page is a number
    const pageNumber = Number(page);
    setCurrentPage(pageNumber);

    if (activeFilterMode === "master") {
      await handleApplyFilters(currentFilters, pageNumber);
    } else {
      await handleSubFilterGo(pageNumber);
    }
  };

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    setTimeout(() => fetchData(1), 0);
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

      const response = await updateMappingBatch(updates);

      if (response.success) {
        alert(
          `Successfully updated ${response?.updated?.total_processed || 0} rows`
        );
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
    console.log("Upload clicked");
  };


  const handleApplyFilters = async (params: any, page: number = 1): Promise<void> => {
    try {
      setLoading(true);
      setShowNoDataMessage(false);
      setCurrentPage(page);

      const queryParams = {
        ...params,
        page: page,
        limit: pageSize,
        data_id: params.data_id ? Number(params.data_id) : undefined,
        ac_id: params.ac_id ? Number(params.ac_id) : undefined,
        pc_id: params.pc_id ? Number(params.pc_id) : undefined,
        district_id: params.district_id ? Number(params.district_id) : undefined,
        party_district_id: params.party_district_id ? Number(params.party_district_id) : undefined,
        initial_load: true
      };

      Object.keys(queryParams).forEach(
        key => queryParams[key] === undefined && delete queryParams[key]
      );

      // console.log("Sending to API:", queryParams);

      const response: ApiResponse = await dataidMapingMaster(queryParams);

      if (response.success) {
        setIsGoClicked(true)

        // SET SUB FILTER OPTIONS HERE
        if (response.data?.unique_mapping) {
          const mapping = response.data.unique_mapping;

          console.log('mapping =?????? ', mapping)

          const safe = (v: any) => (v ?? "").toString();

          setFilterOptions({
            bhag_no: (mapping.bhag || []).map((item: any) => ({
              id: item.bhag_no,
              display: `${safe(item.bhag_no)} - ${safe(item.bhag)}`,
              searchText: `${safe(item.bhag_no)} ${safe(item.bhag)}`.toLowerCase()
            })),

            sec_no: (mapping.section || []).map((item: any) => ({
              id: item.sec_no,
              display: `${safe(item.sec_no)} - ${safe(item.section)}`,
              searchText: `${safe(item.sec_no)} ${safe(item.section)}`.toLowerCase()
            })),

            village: (mapping.village || []).map((item: any) => ({
              id: item.village_id,
              display: `${safe(item.village_id)} - ${safe(item.village)}`,
              searchText: `${safe(item.village_id)} ${safe(item.village)}`.toLowerCase()
            })),

            block: (mapping.gp_ward || []).map((item: any) => ({
              id: item.gp_ward_id,
              display: `${safe(item.gp_ward_id)} - ${safe(item.gp_ward)}`,
              searchText: `${safe(item.gp_ward_id)} ${safe(item.gp_ward)}`.toLowerCase()
            })),

            psb: (mapping.psb || []).map((item: any) => ({
              id: item.psb_id,
              display: `${safe(item.psb_id)} - ${safe(item.psb)}`,
              searchText: `${safe(item.psb_id)} ${safe(item.psb)}`.toLowerCase()
            })),

            pincode: (mapping.pincode || []).map((item: any) => ({
              id: item.pincode_id,
              display: safe(item.pincode),
              searchText: safe(item.pincode).toLowerCase()
            })),

            postoff: (mapping.postoff || []).map((item: any) => ({
              id: item.postoff_id,
              display: `${safe(item.postoff_id)} - ${safe(item.postoff)}`,
              searchText: `${safe(item.postoff_id)} ${safe(item.postoff)}`.toLowerCase()
            })),

            policst: (mapping.policst || []).map((item: any) => ({
              id: item.policst_id,
              display: `${safe(item.policst_id)} - ${safe(item.policst)}`,
              searchText: `${safe(item.policst_id)} ${safe(item.policst)}`.toLowerCase()
            })),

            ru: (mapping.ru || []).map((item: any) => ({
              id: String(item.ru_id),
              display: String(item.ru),
              searchText: String(item.ru).toLowerCase()
            }))
          });
        }

        // ⭐ TABLE DATA
        if (response.data && response.data.result) {
          const result = response.data.result;

          setData(result);
          setColumns(generateColumns(result));

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
        setIsGoClicked(false)
      }

    } catch (error) {
      console.log("Error applying filters:", error);
      setData([]);
      setShowNoDataMessage(true);
      setIsGoClicked(false)
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    console.log("Delete clicked");
  };

  const handleResetClick = () => {
    setIsGoClicked(false)
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
    setPageSize(50);
    setTimeout(() => fetchData(1), 100);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-hidden" >
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-1.5 flex-shrink-0">
        <div className="w-full flex items-center gap-6">
          <div className="flex-1 min-w-0">
            <LiveMasterFilter onApplyFilters={handleApplyFilters} />
          </div>
        </div>
      </div>

      {isGoClicked && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="min-w-[190px]">
              <SearchableSelect
                id="bhagNo"
                value={bhagNo}
                onChange={setBhagNo}
                options={filterOptions.bhag_no || []}
                placeholder="Bhag No - Hi - Eng"
                label=""
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                disabled={loading || updateLoading}
              />
            </div>

            <div className="min-w-[190px]">
              <SearchableSelect
                id="sectionNo"
                value={sectionNo}
                onChange={setSectionNo}
                options={filterOptions.sec_no || []}
                placeholder="Section No - Name"
                label=""
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                disabled={loading || updateLoading}
              />
            </div>

            <div className="min-w-[190px]">
              <SearchableSelect
                id="ru"
                value={ru}
                onChange={setRu}
                options={filterOptions?.ru || []}
                placeholder="R/U"
                label=""
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                disabled={loading || updateLoading}
              />
            </div>

            <div className="min-w-[190px]">
              <SearchableSelect
                id="village"
                value={village}
                onChange={setVillage}
                options={filterOptions.village || []}
                placeholder="Village ID - Name"
                label=""
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                disabled={loading || updateLoading}
                displayFormat="id-name"
              />
            </div>

            <div className="min-w-[190px]">
              <SearchableSelect
                id="gpWard"
                value={gpWard}
                onChange={setGpWard}
                options={filterOptions.block || []}
                placeholder="GP/Ward ID - Name"
                label=""
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                disabled={loading || updateLoading}
                displayFormat="id-name"
              />
            </div>

            <div className="min-w-[190px]">
              <SearchableSelect
                id="psb"
                value={psb}
                onChange={setPsb}
                options={[]}
                placeholder="PSB ID - Name"
                label=""
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                disabled={loading || updateLoading}
              />
            </div>

            <div className="min-w-[190px]">
              <SearchableSelect
                id="pinCode"
                value={pinCode}
                onChange={setPinCode}
                options={[]}
                placeholder="Pin Code ID - Name"
                label=""
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                disabled={loading || updateLoading}
              />
            </div>

            <div className="min-w-[190px]">
              <SearchableSelect
                id="postOffice"
                value={postOffice}
                onChange={setPostOffice}
                options={[]}
                placeholder="Post Office ID - Name"
                label=""
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                disabled={loading || updateLoading}
              />
            </div>

            <div className="min-w-[190px]">
              <SearchableSelect
                id="policeStation"
                value={policeStation}
                onChange={setPoliceStation}
                options={[]}
                placeholder="Police Station ID - Name"
                label=""
                activeDropdown={activeDropdown}
                onDropdownToggle={setActiveDropdown}
                disabled={loading || updateLoading}
              />
            </div>

            <div className="flex items-center gap-2 ml-auto ">
              <button
                onClick={handleGoClick}
                disabled={loading || updateLoading}
                className={`flex items-center gap-1 px-4 h-8 rounded-md text-sm cursor-pointer ${loading || updateLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-gray-900"
                  } text-white`}
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Play size={14} />
                )}{" "}
                Go
              </button>

              <button
                onClick={handleUpdateSyncClick}
                disabled={loading || updateLoading || changedData.size === 0}
                className={`flex items-center gap-1 px-4 h-8 rounded-md text-sm ${loading || updateLoading || changedData.size === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-800 cursor-pointer"
                  } text-white`}
              >
                {updateLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                {changedData.size > 0
                  ? `Update & Sync (${changedData.size})`
                  : "Update & Sync"}
              </button>

              <button
                onClick={handleTemplateClick}
                disabled={loading || updateLoading}
                className={`flex items-center gap-1 px-4 h-8 rounded-md text-sm cursor-pointer ${loading || updateLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-800"
                  } text-white`}
              >
                <FileText size={14} /> Template
              </button>

              <button
                onClick={handleUploadClick}
                disabled={loading || updateLoading}
                className={`flex items-center gap-1 px-4 h-8 rounded-md text-sm cursor-pointer ${loading || updateLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-800"
                  } text-white`}
              >
                <Upload size={14} /> Upload
              </button>

              <button
                onClick={handleDownloadClick}
                disabled={loading || updateLoading}
                className={`flex items-center gap-1 px-4 h-8 rounded-md text-sm cursor-pointer ${loading || updateLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-800"
                  } text-white`}
              >
                <Download size={14} /> Download
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={true}
                className="flex items-center gap-1 bg-gray-200 text-gray-500 px-4 h-8 rounded-md text-sm cursor-not-allowed"
              >
                <Trash2 size={14} /> Delete
              </button>

              <button
                onClick={handleResetClick}
                disabled={loading || updateLoading}
                className="h-8 w-10 flex items-center justify-center border cursor-pointer border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="py-3">
        {loading ? (
          <div className="bg-white border rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Loading data...</p>
            </div>
          </div>
        ) : data.length > 0 ? (
          <div className="bg-white border rounded-lg">
            <div className="overflow-hidden">
              <HotTable
                ref={hotTableRef}
                wordWrap={false}
                data={data}
                columns={columns}
                colHeaders={columns.map((c) => c.title)}
                rowHeaders={true}
                width="100%"
                height="calc(100vh - 210px)"
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
                rowHeights={35}
                licenseKey="non-commercial-and-evaluation"
                afterChange={hotSettings.afterChange}
                cells={hotSettings.cells}
              />
            </div>
            <div className="px-4 py-1 bg-gray-50 border-t flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4 text-gray-700">
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-700"
                  disabled={loading || updateLoading}
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || loading || updateLoading}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading || updateLoading}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      disabled={loading || updateLoading}
                      className={`px-3 py-1 border rounded-md text-sm ${currentPage === page
                        ? "bg-gray-800 text-white border-gray-800"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-gray-700">
                      {page}
                    </span>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage === totalPages || loading || updateLoading
                  }
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={
                    currentPage === totalPages || loading || updateLoading
                  }
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg h-[420px] flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex items-center justify-center">
              <MapPin size={48} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-600 max-w-xl">
              {showNoDataMessage ? (
                <>
                  No data found for selected filters. Please try different
                  filters.
                </>
              ) : (
                <>
                  डेटा देखने के लिए{" "}
                  <span className="font-medium">
                    DataID, पार्टी जिला, जिला, AC, या PC
                  </span>{" "}
                  में से कोई 1 वैल्यू सेलेक्ट करें...
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
