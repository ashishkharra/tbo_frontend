// LiveVoterListPage.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import Handsontable from "handsontable";

import { LiveMasterFilter } from "./LiveMasterFilter";
import { LiveVoterFilters } from "./LiveVoterFilters";
import { PrintModal } from "./PrintModal";

import {
  downloadPrintRegister,
  filterPrintRegister,
  getVoterListSubFilter,
  getYojnaListApi,
  volterMasterFilterGo,
  saveLiveVoterListApi,
  getCastIdLookupApi,
  getCastIdSurnameLookupApi,
} from "@/apis/api";
import { getOriginalKey, mapFiltersToBackend } from "@/utils/helper";
import YojnaModal from "./YojnaModal";
import CommonPagination from "../CommonPagination";

registerAllModules();

interface VoterData {
  id?: number;
  ac_no?: number;
  bhag_no?: number;
  vsno?: number;
  vname?: string;
  relation?: string;
  rname?: string | null;
  surname?: string | null | Record<string, any>;
  age?: number;
  sex?: string;
  epic?: string;
  hno?: string;
  section?: string;
  sec_no?: number;

  castid?: string;
  cast_id?: string; // add this
  cast_id_hi?: string;
  cast_cat?: string;
  religion?: string;

  castid_surname?: string;
  cast_id_surname?: string;
  subcast?: string;
  oldnew?: number;

  edu_id?: string;
  education_id_hi?: string;
  proff_id?: string;
  proffession_id_hi?: string;
  phone1?: string | null;
  data_id?: number;
  card_id?: string;
  familyid?: string;
  hof?: number;
  [key: string]: any;
}
interface MappingItem {
  [key: string]: any;
}

interface MappingResponse {
  block?: MappingItem[];
  gp_ward?: MappingItem[];
  village?: MappingItem[];
  kendra?: any[];
  mandal?: any[];
  pjila?: any[];
  pincode?: any[];
  policst?: any[];
  postoff?: any[];
  ru?: any[];
  section?: any[];
  bhag_no?: any[];
  castid?: any[];
  sex?: any[];
}

interface Metadata {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

interface MappingData {
  block: string | null;
  block_id: string | null;
  gp_ward: string | null;
  gp_ward_id: string | null;
  kendra: string | null;
  kendra_id: string | null;
  mandal: string | null;
  mandal_id: string | null;
  pincode: string | null;
  pjila: string | null;
  policst: string | null;
  postoff: string | null;
  ru: string | null;
  village: string | null;
  village_id: string | null;
}

interface ApiResponse {
  success: boolean;
  voters?: any[];
  mapping?: MappingResponse;
  metadata?: {
    totalRecords?: number;
    currentPage?: number;
    totalPages?: number;
  };
}

interface FilterOptions {
  blocks: any[]; // Array of objects with block_id and block
  gps: any[]; // Array of objects with gp_ward_id and gp_ward
  kendras: any[]; // Array of objects with kendra_id and kendra
  mandals: any[]; // Array of objects with mandal_id and mandal
  pjilas: any[]; // Array of objects with pjila_id and pjila
  pincodes: any[]; // Array of objects with pincode_id and pincode
  policeStations: any[]; // Array of objects with policst_id and policst
  postOffices: any[]; // Array of objects with postoff_id and postoff
  villages: any[]; // Array of objects with village_id and village
  sections: any[]; // Array of objects with sec_no and section
  ru: string[];
  bhagNos: string[];
  castId: string[];
  sex: string[];
  dataIds: string[];
}

interface MasterFilterItem {
  id: number;
  ac_no: number;
  ac_name_hi: string;
  pc_no: number;
  pc_name_hi: string;
  data_id?: number;
  data_id_name_hi?: string;
  district_hi?: string;
  ac_id?: number;
  pc_id?: number;
  [key: string]: any;
}

const columns = [
  {
    data: 'dataId',
    title: 'DATA ID',
    width: 15,  // Adjust based on content
  },
  {
    data: 'idCard',
    title: 'ID CARD',
    width: 120,
  },
  {
    data: 'acNo',
    title: 'AC NO',
    width: 80,
  },
  {
    data: 'bhagNo',
    title: 'BHAG NO',
    width: 80,
  },
  {
    data: 'secNo',
    title: 'SEC NO',
    width: 80,
  },
  {
    data: 'section',
    title: 'SECTION',
    width: 100,
  },
  {
    data: 'epic',
    title: 'EPIC',
    width: 130,
  },
  {
    data: 'vsno',
    title: 'VSNO',
    width: 80,
  },
  {
    data: 'name',
    title: 'NAME',
    width: 200,  // Wider for names
  },
  {
    data: 'gender',
    title: 'GENDER',
    width: 70,
  },
  {
    data: 'age',
    title: 'AGE',
    width: 60,
  }
];

export default function LiveVoterListPage(): React.ReactElement {
  const router = useRouter();
  const hotTableRef = useRef<any>(null);
  type HotChangeTuple = [number, string | number, unknown, unknown];
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showMoreLiveVoterFilters, setShowMoreLiveVoterFilters] =
    useState<number>(1);
  const [showDownloadPrintMenu, setShowDownloadPrintMenu] =
    useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showSaveRibbon, setShowSaveRibbon] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const [selectedDataId, setSelectedDataId] = useState<string>("");
  const [selectedAssembly, setSelectedAssembly] = useState<string>("");
  const [selectedParliament, setSelectedParliament] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [seltectPartyDistrict, setSelectedPartyDistrict] = useState<string>("")

  const [allItems, setAllItems] = useState<MasterFilterItem[]>([]);

  const [voterData, setVoterData] = useState<VoterData[]>([]);
  const [mappingData, setMappingData] = useState<MappingData>({
    block: null,
    block_id: null,
    gp_ward: null,
    gp_ward_id: null,
    kendra: null,
    kendra_id: null,
    mandal: null,
    mandal_id: null,
    pincode: null,
    pjila: null,
    policst: null,
    postoff: null,
    ru: null,
    village: null,
    village_id: null,
  });

  const [metadata, setMetadata] = useState<Metadata>({
    totalRecords: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "All">(50);
  const [currentFilters, setCurrentFilters] = useState<any>({});

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
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
    dataIds: [],
  });

  const [acOptions, setAcOptions] = useState<any[]>([]);
  const [acDetails, setAcDetails] = useState<any[]>([]);
  const [selectedAc, setSelectedAc] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [selectedGp, setSelectedGp] = useState<string>("");
  const [selectedGram, setSelectedGram] = useState<string>("");
  const [selectedBhag, setSelectedBhag] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [loadingAcData, setLoadingAcData] = useState<boolean>(false);
  const [isGoClicked, setIsGoClicked] = useState<boolean>(false)
  const [editedRows, setEditedRows] = useState<Record<number, any>>({});

  const [yojnaData, setYojnaData] = useState<any[]>([])
  const [showModal, setShowModal] = useState<boolean>(false)

  const [blockOptions, setBlockOptions] = useState<string[]>([]);
  const [gpOptions, setGpOptions] = useState<string[]>([]);
  const [gramOptions, setGramOptions] = useState<string[]>([]);
  const [bhagOptions, setBhagOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);
  const [activeFilterMode, setActiveFilterMode] = useState<"master" | "sub">(
    "master"
  );

  const activeEditorInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const activeEditorListenerRef = useRef<((e: Event) => void) | null>(null);

  const [liveVoterListFilters, setLiveVoterListFilters] = useState<any>({
    lbt: "",
    gram: "",
    gp: "",
    bhagNo: "",
    sectionNo: "",
    areaColony: "",
    epic: "",
    hno: "",
    name: "",
    rName: "",
    surname: "",
    mobile: "",
    gender: "",
    ageFrom: "",
    ageTo: "",
    dob: "",
    castId: "",
    cast: "",
    profession_name: "",
    edu: "",
    aadhar: "",
    mukhiya: "",
    postOffice: "",
    pinCode: "",
    policeStation: "",
    block: "",
    mandal: "",
    kendra: "",
    village: "",
  });

  const [printOptions, setPrintOptions] = useState({
    register: "survey",
    wiseType: "bhagWise",
    pdfType: "single",
    familyCount: "",
    voterCount: "",
    castFilter: "all",
    mobileFilter: "all",
  });

  type CastLookupItem = {
    castid: string;
    caste: string;
    cast_cat?: string;
    religion?: string;
    data_id?: number | string;
  };

  type CastSurnameLookupItem = {
    castid_surname: string;
    surname: string;
    subcast?: string;
    oldnew?: number;
    data_id?: number | string;
  };

  type LookupMode = "castid" | "castid_surname" | null;

  const [lookupState, setLookupState] = useState<{
    open: boolean;
    row: number;
    prop: LookupMode;
    items: Array<CastLookupItem | CastSurnameLookupItem>;
    activeIndex: number;
    top: number;
    left: number;
    width: number;
    loading: boolean;
  }>({
    open: false,
    row: -1,
    prop: null,
    items: [],
    activeIndex: 0,
    top: 0,
    left: 0,
    width: 320,
    loading: false,
  });

  const castLookupCacheRef = useRef<Map<string, CastLookupItem[]>>(new Map());
  const castSurnameLookupCacheRef = useRef<Map<string, CastSurnameLookupItem[]>>(new Map());
  const activeLookupRequestRef = useRef<string>("");

  const extractId = (value: string): string => {
    if (!value || value === "All") return "";
    const parts = value.split(" - ");
    return parts[0].trim();
  };

  function debounce<T extends (...args: any[]) => void>(fn: T, wait = 250) {
    let timer: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  const closeLookup = () => {
    activeLookupRequestRef.current = "";
    setLookupState((prev) => ({
      ...prev,
      open: false,
      row: -1,
      prop: null,
      items: [],
      activeIndex: 0,
      loading: false,
    }));
  };

  const openLookupAtCell = (
    row: number,
    prop: LookupMode,
    items: Array<CastLookupItem | CastSurnameLookupItem>,
    loading = false
  ) => {
    const hot = hotTableRef.current?.hotInstance;
    if (!hot || !prop) return;

    const col = hot.propToCol(prop);
    const td = hot.getCell(row, col);
    if (!td) return;

    const rect = td.getBoundingClientRect();

    setLookupState({
      open: true,
      row,
      prop,
      items,
      activeIndex: 0,
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      loading,
    });
  };

  const getEditorValue = (row: number, prop: string) => {
    const hot = hotTableRef.current?.hotInstance;
    if (!hot) return "";

    const activeEditor = hot.getActiveEditor?.();
    const editorValue =
      activeEditor?.TEXTAREA?.value ??
      activeEditor?.TEXTAREA_PARENT?.querySelector?.("textarea")?.value ??
      activeEditor?.TEXTAREA_PARENT?.querySelector?.("input")?.value;

    if (editorValue !== undefined && editorValue !== null) {
      return String(editorValue);
    }

    return String(hot.getDataAtRowProp(row, prop) ?? "");
  };

  useEffect(() => {
    const fetchAcOptions = async () => {
      try {
        const response = await filterPrintRegister();

        console.log("AC API Response:", response); // 👈 add this

        if (!response?.success) {
          console.error("API returned failure:", response?.message);
          return;
        }

        if (Array.isArray(response.data)) {
          setAcOptions(response.data);
        } else {
          console.error("Invalid data format:", response.data);
        }

      } catch (error: any) {
        console.error("Error fetching AC options:", error?.message || error);
      }
    };

    fetchAcOptions();
  }, []);

  // Real-time editor input listener for API calls
  // useEffect(() => {
  //   const hot = hotTableRef.current?.hotInstance;
  //   if (!hot) return;

  //   let inputElement: any = null;
  //   let handleInput: ((e: Event) => void) | null = null;

  //   const attachInputListener = () => {
  //     try {
  //       const activeEditor = hot.getActiveEditor?.();
  //       if (!activeEditor) return;

  //       // Get the input/textarea element from the editor
  //       inputElement =
  //         activeEditor.TEXTAREA ||
  //         activeEditor.TEXTAREA_PARENT?.querySelector?.("textarea") ||
  //         activeEditor.TEXTAREA_PARENT?.querySelector?.("input");

  //       if (!inputElement) {
  //         console.warn("Could not find input element in editor");
  //         return;
  //       }

  //       const currentValue = inputElement.value || "";
  //       const selected = hot.getSelectedLast?.();
  //       if (!selected) return;

  //       const [row, col] = selected;
  //       const prop = hot.colToProp(col);

  //       // Initial API call for current value
  //       if (currentValue.trim() && (prop === "castid" || prop === "castid_surname")) {
  //         console.log(`Initial API call for ${prop}:`, currentValue);
  //         if (prop === "castid") {
  //           fetchCastLookup(row, currentValue);
  //         } else if (prop === "castid_surname") {
  //           fetchCastSurnameLookup(row, currentValue);
  //         }
  //       }

  //       // Handle future input events
  //       handleInput = () => {
  //         const newValue = inputElement.value || "";

  //         if (!newValue.trim()) {
  //           closeLookup();
  //           return;
  //         }

  //         const currentSelected = hot.getSelectedLast?.();
  //         if (!currentSelected) return;

  //         const [currentRow, currentCol] = currentSelected;
  //         const currentProp = hot.colToProp(currentCol);

  //         console.log(`Input detected on ${currentProp}:`, newValue);

  //         // Call appropriate lookup API based on column
  //         if (currentProp === "castid") {
  //           fetchCastLookup(currentRow, newValue);
  //         } else if (currentProp === "castid_surname") {
  //           fetchCastSurnameLookup(currentRow, newValue);
  //         }
  //       };

  //       inputElement.addEventListener("input", handleInput);
  //     } catch (err) {
  //       console.error("Error attaching input listener:", err);
  //     }
  //   };

  //   const detachInputListener = () => {
  //     if (inputElement && handleInput) {
  //       inputElement.removeEventListener("input", handleInput);
  //       inputElement = null;
  //       handleInput = null;
  //     }
  //   };

  //   // Attach listener when editor opens
  //   hot.addHook?.("beforeEditRender", attachInputListener);

  //   // Detach listener when editor closes
  //   hot.addHook?.("afterEditEnd", detachInputListener);

  //   return () => {
  //     hot.removeHook?.("beforeEditRender", attachInputListener);
  //     hot.removeHook?.("afterEditEnd", detachInputListener);
  //     detachInputListener();
  //   };
  // }, [voterData]);

  const detachEditorInputListener = () => {
    if (activeEditorInputRef.current && activeEditorListenerRef.current) {
      activeEditorInputRef.current.removeEventListener(
        "input",
        activeEditorListenerRef.current
      );
    }

    activeEditorInputRef.current = null;
    activeEditorListenerRef.current = null;
  };

  const attachEditorInputListener = (row: number, prop: string) => {
    const hot = hotTableRef.current?.hotInstance;
    if (!hot) return;

    detachEditorInputListener();

    setTimeout(() => {
      const activeEditor = hot.getActiveEditor?.();
      if (!activeEditor) return;

      const inputEl =
        activeEditor.TEXTAREA ||
        activeEditor.TEXTAREA_PARENT?.querySelector?.("textarea") ||
        activeEditor.TEXTAREA_PARENT?.querySelector?.("input");

      if (!inputEl) {
        console.warn("Editor input element not found");
        return;
      }

      const handler = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const typedValue = target?.value ?? "";

        if (!typedValue.trim()) {
          closeLookup();
          return;
        }

        if (prop === "castid") {
          closeLookup(); // no suggestion UI
          fetchCastLookup(row, typedValue);
        } else if (prop === "castid_surname") {
          fetchCastSurnameLookup(row, typedValue);
        }
      };

      inputEl.addEventListener("input", handler);

      activeEditorInputRef.current = inputEl;
      activeEditorListenerRef.current = handler;

      const initialValue = inputEl.value || "";
      if (initialValue.trim()) {
        if (prop === "castid") {
          closeLookup();
          fetchCastLookup(row, initialValue);
        } else if (prop === "castid_surname") {
          fetchCastSurnameLookup(row, initialValue);
        }
      }
    }, 0);
  };
  useEffect(() => {
    return () => {
      detachEditorInputListener();
    };
  }, []);

  const handleAcChange = async (acId: string) => {
    setSelectedAc(acId);
    setLoadingAcData(true);

    setSelectedBlock("");
    setSelectedGp("");
    setSelectedGram("");
    setSelectedBhag("");
    setSelectedSection("");
    setBlockOptions([]);
    setGpOptions([]);
    setGramOptions([]);
    setBhagOptions([]);
    setSectionOptions([]);

    try {
      const response = await filterPrintRegister({ ac_id: acId });

      if (response.success && Array.isArray(response.data)) {
        setAcDetails(response.data);

        const blocks: string[] = Array.from(
          new Set(
            response.data
              .map((item: any) => item.block)
              .filter(
                (block: any): block is string =>
                  typeof block === "string" && block.trim() !== ""
              )
          )
        );

        setBlockOptions(blocks);

        const gps: string[] = Array.from(
          new Set(
            response.data
              .map((item: any) => item.gp_ward)
              .filter(
                (gp: any): gp is string =>
                  typeof gp === "string" && gp.trim() !== ""
              )
          )
        );

        setGpOptions(gps);

        const grams = Array.from(
          new Set<string>(
            response.data
              .map((item: any) => item.village)
              .filter(
                (v: any): v is string =>
                  typeof v === "string" && v.trim() !== ""
              )
          )
        );

        setGramOptions(grams);

        const bhags = Array.from(
          new Set<string>(
            response.data
              .map((item: any) => item.bhag_no?.toString())
              .filter(
                (v: any): v is string =>
                  typeof v === "string" && v.trim() !== ""
              )
          )
        );

        setBhagOptions(bhags);

        const sections = Array.from(
          new Set<string>(
            response.data
              .map((item: any) => item.section)
              .filter(
                (v: any): v is string =>
                  typeof v === "string" && v.trim() !== ""
              )
          )
        );

        setSectionOptions(sections);
      }
    } catch (error) {
      console.log("Error fetching AC details:", error);
    } finally {
      setLoadingAcData(false);
    }
  };

  const handleBlockChange = (block: string) => {
    setSelectedBlock(block);
  };

  const handleGpChange = (gp: string) => {
    setSelectedGp(gp);
  };

  const handleGramChange = (gram: string) => {
    setSelectedGram(gram);
  };

  const handleBhagChange = (bhag: string) => {
    setSelectedBhag(bhag);
  };

  const handleApplyFilters = async (
    params: Record<string, any>,
    targetPage?: number,
    forcedLimit?: number | "All"
  ): Promise<void> => {
    try {
      setLoading(true);
      setActiveFilterMode("master");

      const page = targetPage ?? currentPage;

      if (params.data_id) {
        setSelectedDataId(params.data_id);
      }

      if (params.ac_id) {
        const acItem = allItems?.find(
          (item: any) => item.ac_no === params.ac_id
        );

        setSelectedAssembly(
          acItem
            ? `${acItem.ac_no} - ${acItem.ac_name_hi}`
            : String(params.ac_id)
        );
      }

      if (params.pc_id) {
        const pcItem = allItems?.find(
          (item: any) => item.pc_no === params.pc_id
        );

        setSelectedParliament(
          pcItem
            ? `${pcItem.pc_no} - ${pcItem.pc_name_hi}`
            : String(params.pc_id)
        );
      }

      if (params.district_id) {
        setSelectedDistrict(String(params.district_id));
      }

      if (params.party_district_id) {
        setSelectedPartyDistrict(String(params.party_district_id));
      }

      const effectiveItemsPerPage = forcedLimit ?? itemsPerPage;
      const resolvedLimit =
        effectiveItemsPerPage === "All"
          ? metadata.totalRecords > 0
            ? metadata.totalRecords
            : 1000000
          : Number(effectiveItemsPerPage);

      const queryParams = {
        ...params,
        page,
        limit: resolvedLimit,
      };

      const response: ApiResponse = await volterMasterFilterGo(queryParams);

      if (!response.success) {
        setVoterData([]);
        setMetadata({
          totalRecords: 0,
          currentPage: 1,
          totalPages: 1,
        });
        return;
      }

      if (Array.isArray(response.voters)) {
        const enrichedVoters = response.voters.map((row: any) => ({
          ...row,
          cast_id: row.cast_id ?? "",
          cast_cat_name: row.cast_cat_name ?? "",
          cast_id_surname: row.cast_id_surname ?? "",
          education_id: row.education_id ?? "",
          proffession_id: row.proffession_id ?? "",
        }));

        setVoterData(enrichedVoters);
      }
      setIsGoClicked(true)
      const mapping: any = response.mapping;

      if (mapping) {
        console.log("Raw mapping data:", mapping); // Debug log

        // Helper function to transform array of objects to array of objects (keeping structure)
        const transformToObjects = (
          array: Record<string, any>[] = [],
          idKey: string,
          nameKey: string
        ): Record<string, any>[] => {
          if (!Array.isArray(array)) return [];

          return array
            .filter((item) => item && item[idKey] && item[nameKey])
            .map((item) => ({
              [idKey]: item[idKey],
              [nameKey]: item[nameKey],
            }));
        };

        // Helper function for simple arrays
        const transformToArray = (array?: any[]): string[] => {
          if (!Array.isArray(array)) return [];
          return array.map(item => String(item));
        };

        setFilterOptions({
          // For complex objects - KEEP THE OBJECT STRUCTURE
          blocks: transformToObjects(mapping.block, "block_id", "block"),
          gps: transformToObjects(mapping.gp_ward, "gp_ward_id", "gp_ward"),
          villages: transformToObjects(mapping.village, "village_id", "village"),
          kendras: transformToObjects(mapping.kendra, "kendra_id", "kendra"),
          mandals: transformToObjects(mapping.mandal, "mandal_id", "mandal"),
          pjilas: transformToObjects(mapping.pjila, "pjila_id", "pjila"),
          pincodes: transformToObjects(mapping.pincode, "pincode_id", "pincode"),
          policeStations: transformToObjects(mapping.policst, "policst_id", "policst"),
          postOffices: transformToObjects(mapping.postoff, "postoff_id", "postoff"),
          sections: transformToObjects(mapping.section, "sec_no", "section"),

          // For simple arrays - keep as strings
          bhagNos: transformToArray(mapping.bhag_no),
          ru: transformToArray(mapping.ru),
          castId: transformToArray(mapping.castid),
          sex: transformToArray(mapping.sex),

          dataIds: [],
        });

        console.log("Transformed filterOptions:", {
          blocks: transformToObjects(mapping.block, "block_id", "block"),
          gps: transformToObjects(mapping.gp_ward, "gp_ward_id", "gp_ward"),
          villages: transformToObjects(mapping.village, "village_id", "village"),
        }); // Debug log
      }

      setMetadata({
        totalRecords: response.metadata?.totalRecords ?? 0,
        currentPage: response.metadata?.currentPage ?? 1,
        totalPages: response.metadata?.totalPages ?? 1,
      });

      setCurrentFilters(queryParams);
    } catch (error: any) {
      setIsGoClicked(false)
      setVoterData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubFilterGo = async (
    targetPage?: number,
    forcedLimit?: number | "All"
  ): Promise<void> => {
    try {
      setLoading(true);
      setActiveFilterMode("sub");

      const page = targetPage !== undefined ? Number(targetPage) : Number(currentPage);

      // Calculate limit properly
      const effectiveItemsPerPage = forcedLimit ?? itemsPerPage;

      const apiLimit =
        effectiveItemsPerPage === "All"
          ? metadata.totalRecords > 0
            ? metadata.totalRecords
            : 1000000
          : Number(effectiveItemsPerPage);

      // Helper function to safely convert to number or return undefined
      const safeNumber = (value: any): number | undefined => {
        if (value === undefined || value === null || value === '') return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
      };

      // Helper function for text values
      const safeString = (value: any): string | undefined => {
        if (value === undefined || value === null || value === '') return undefined;
        return String(value).trim();
      };

      const extractIdFromDisplay = (displayValue: any): string | undefined => {
        if (displayValue === undefined || displayValue === null) return undefined;

        if (typeof displayValue === "number") {
          return String(displayValue);
        }

        if (typeof displayValue === "string" && !displayValue.includes(" - ")) {
          return displayValue.trim();
        }

        if (typeof displayValue === "string") {
          const parts = displayValue.split(" - ");
          return parts[0].trim();
        }

        return undefined;
      };

      // Build the filters object
      const subFilterParams: any = {
        // Fixed filters
        ...(selectedDataId && { data_id: safeNumber(extractIdFromDisplay(selectedDataId)) }),
        ...(selectedAssembly && { ac_no: safeNumber(extractIdFromDisplay(selectedAssembly)) }),
        ...(selectedParliament && { pc_no: safeNumber(extractIdFromDisplay(selectedParliament)) }),
        ...(selectedDistrict && { district_id: safeNumber(extractIdFromDisplay(selectedDistrict)) }),
        ...(seltectPartyDistrict && { party_district_id: safeNumber(extractIdFromDisplay(seltectPartyDistrict)) }),

        // Sub filter values
        ...(liveVoterListFilters.lbt && { lbt: safeString(liveVoterListFilters.lbt) }),
        ...(liveVoterListFilters.gram && { gram: liveVoterListFilters.gram }),
        ...(liveVoterListFilters.gp && { gp: liveVoterListFilters.gp }),
        ...(liveVoterListFilters.bhagNo && { bhag_no: safeNumber(liveVoterListFilters.bhagNo) }),
        ...(liveVoterListFilters.sectionNo && { sec_no: safeNumber(liveVoterListFilters.sectionNo) }),
        ...(liveVoterListFilters.mobile && { phone1: safeString(liveVoterListFilters.mobile) }),
        ...(liveVoterListFilters.castId && { castid: safeString(liveVoterListFilters.castId) }),
        ...(liveVoterListFilters.name && { vname: safeString(liveVoterListFilters.name) }),
        ...(liveVoterListFilters.surname && { surname: safeString(liveVoterListFilters.surname) }),
        ...(liveVoterListFilters.gender && { sex: safeString(liveVoterListFilters.gender) }),

        // More filters level 1
        ...(liveVoterListFilters.block && { block: liveVoterListFilters.block }),
        ...(liveVoterListFilters.mandal && { mandal_id: safeString(liveVoterListFilters.mandal) }),
        ...(liveVoterListFilters.kendra && { kendra_id: safeString(liveVoterListFilters.kendra) }),
        ...(liveVoterListFilters.hno && { hno: safeString(liveVoterListFilters.hno) }),
        ...(liveVoterListFilters.ageFrom && { ageFrom: safeNumber(liveVoterListFilters.ageFrom) }),
        ...(liveVoterListFilters.ageTo && { ageTo: safeNumber(liveVoterListFilters.ageTo) }),
        ...(liveVoterListFilters.dob && { dob: safeString(liveVoterListFilters.dob) }),
        ...(liveVoterListFilters.profession_name && { profession_name: safeString(liveVoterListFilters.profession_name) }),

        // More filters level 2
        ...(liveVoterListFilters.aadhar && { aadhar: safeString(liveVoterListFilters.aadhar) }),
        ...(liveVoterListFilters.postOffice && { postoff_id: safeString(liveVoterListFilters.postOffice) }),
        ...(liveVoterListFilters.pinCode && { pincode_id: safeString(liveVoterListFilters.pinCode) }),
        ...(liveVoterListFilters.policeStation && { policst_id: safeString(liveVoterListFilters.policeStation) }),
        ...(liveVoterListFilters.edu && { edu_id: safeString(liveVoterListFilters.edu) }),
        ...(liveVoterListFilters.mukhiya && { mukhiya: safeString(liveVoterListFilters.mukhiya) }),

        page: safeNumber(page) || 1,
        limit: apiLimit,
      };

      const cleanParams = Object.fromEntries(
        Object.entries(subFilterParams).filter(([_, v]) =>
          v !== undefined && v !== null && v !== ''
        )
      );

      console.log("Sending to sub-filter API:", cleanParams);

      const response = await getVoterListSubFilter(cleanParams);

      console.log("API Response:", response); // Debug log

      // FIX: Check the response structure - data is in 'voters' field
      if (response && response.success) {
        // ✅ FIX: Use response.voters instead of response.data
        const votersData = (response.voters || []).map((row: any) => ({
          ...row,
          cast_id: row.cast_id ?? "",
          cast_cat_name: row.cast_cat_name ?? "",
          cast_id_surname: row.cast_id_surname ?? "",
          education_id: row.education_id ?? "",
          proffession_id: row.proffession_id ?? "",
        }));

        if (votersData && votersData.length > 0) {
          setVoterData(votersData);
          console.log("Voter data set:", votersData.length, "records");
        } else {
          setVoterData([]);
          console.log("No voter data received");
        }

        // Update metadata - use response.total
        const totalRecords = response.total || 0;
        const currentPageNum = response.currentPage || page;
        const totalPagesNum = response.totalPages || Math.ceil(totalRecords / apiLimit) || 1;

        setMetadata({
          totalRecords: totalRecords,
          currentPage: currentPageNum,
          totalPages: totalPagesNum,
        });

        // ✅ IMPORTANT: Update mapping after sub-filter
        if (response.mapping) {
          const mapping = response.mapping;
          console.log("Raw mapping data:", mapping);

          const transformToObjects = (
            array: any[] = [],
            idKey: string,
            nameKey: string
          ): any[] => {
            if (!Array.isArray(array)) return [];

            return array
              .filter((item) => item && item[idKey] && item[nameKey])
              .map((item) => ({
                [idKey]: item[idKey],
                [nameKey]: item[nameKey],
              }));
          };

          const transformToArray = (array?: any[]): string[] => {
            if (!Array.isArray(array)) return [];
            return array.map(item => String(item));
          };

          const newFilterOptions = {
            blocks: transformToObjects(mapping.block, "block_id", "block"),
            gps: transformToObjects(mapping.gp_ward, "gp_ward_id", "gp_ward"),
            villages: transformToObjects(mapping.village, "village_id", "village"),
            kendras: transformToObjects(mapping.kendra, "kendra_id", "kendra"),
            mandals: transformToObjects(mapping.mandal, "mandal_id", "mandal"),
            pjilas: transformToObjects(mapping.pjila, "pjila_id", "pjila"),
            pincodes: transformToObjects(mapping.pincode, "pincode_id", "pincode"),
            policeStations: transformToObjects(mapping.policst, "policst_id", "policst"),
            postOffices: transformToObjects(mapping.postoff, "postoff_id", "postoff"),
            sections: transformToObjects(mapping.section, "sec_no", "section"),
            bhagNos: transformToArray(mapping.bhag_no),
            ru: transformToArray(mapping.ru),
            castId: transformToArray(mapping.castid),
            sex: transformToArray(mapping.sex),
            dataIds: [],
            professions: transformToObjects(mapping.profession, "proff_id", "proff"),
            educations: transformToObjects(mapping.education, "edu_id", "edu"),
            mukhiyas: transformToArray(mapping.mukhiya),
          };

          setFilterOptions(newFilterOptions);
          console.log("Updated filterOptions:", newFilterOptions);
        }
      } else {
        console.warn("API returned success: false or invalid response:", response);
        setVoterData([]);
        alert(response?.message || "Failed to apply sub filter");
      }
    } catch (error) {
      console.error("❌ Error applying sub filter:", error);
      alert("Error applying sub filter");
      setVoterData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);

    if (activeFilterMode === "master") {
      await handleApplyFilters(currentFilters, page);
    } else {
      await handleSubFilterGo(page);
    }
  };

  const handleItemsPerPageChange = async (
    value: number | "All"
  ): Promise<void> => {
    setItemsPerPage(value);
    setCurrentPage(1);

    if (activeFilterMode === "master") {
      await handleApplyFilters(
        {
          ...currentFilters,
        },
        1,
        value
      );
    } else {
      await handleSubFilterGo(1, value);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    const resetFilters = {
      lbt: "",
      gram: "",
      gp: "",
      bhagNo: "",
      sectionNo: "",
      areaColony: "",
      epic: "",
      hno: "",
      name: "",
      rName: "",
      surname: "",
      mobile: "",
      gender: "",
      ageFrom: "",
      ageTo: "",
      dob: "",
      castId: "",
      cast: "",
      profession_name: "",
      edu: "",
      aadhar: "",
      mukhiya: "",
      postOffice: "",
      pinCode: "",
      policeStation: "",
      block: "",
      mandal: "",
      kendra: "",
      village: "",
    };

    setLiveVoterListFilters(resetFilters);
    setCurrentPage(1);
    setActiveFilterMode("master");
    setActiveDropdown(null);
    setShowDownloadPrintMenu(false);

    const extractIdFromDisplay = (displayValue: any): string | undefined => {
      if (displayValue === undefined || displayValue === null) return undefined;

      if (typeof displayValue === "number") {
        return String(displayValue);
      }

      if (typeof displayValue === "string" && !displayValue.includes(" - ")) {
        return displayValue.trim();
      }

      if (typeof displayValue === "string") {
        const parts = displayValue.split(" - ");
        return parts[0].trim();
      }

      return undefined;
    };

    const refreshedMasterParams: any = {
      ...(selectedDataId && {
        data_id: Number(extractIdFromDisplay(selectedDataId)),
      }),
      ...(selectedAssembly && {
        ac_id: Number(extractIdFromDisplay(selectedAssembly)),
      }),
      ...(selectedParliament && {
        pc_id: Number(extractIdFromDisplay(selectedParliament)),
      }),
      ...(selectedDistrict && {
        district_id: Number(extractIdFromDisplay(selectedDistrict)),
      }),
      ...(seltectPartyDistrict && {
        party_district_id: Number(extractIdFromDisplay(seltectPartyDistrict)),
      }),
    };

    const cleanMasterParams = Object.fromEntries(
      Object.entries(refreshedMasterParams).filter(
        ([_, v]) => v !== undefined && v !== null && v !== "" && !Number.isNaN(v)
      )
    );

    if (Object.keys(cleanMasterParams).length > 0) {
      await handleApplyFilters(cleanMasterParams, 1);
    } else {
      setVoterData([]);
      setMetadata({
        totalRecords: 0,
        currentPage: 1,
        totalPages: 1,
      });
      setFilterOptions({
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
        dataIds: [],
      });
      setIsGoClicked(false);
    }
  };

  const handleDownloadPDF = async (requestData?: any) => {
    if (!selectedAc) {
      alert("Please select an AC first");
      return;
    }

    setDownloading(true);
    try {
      const response = await downloadPrintRegister(requestData);

      if (response.success) {
        const contentType = response.contentType || "";
        const blob = new Blob([response.data], { type: contentType });

        let filename = `voter_register_${selectedAc}`;
        if (contentType.includes("zip")) {
          filename += ".zip";
        } else if (contentType.includes("pdf")) {
          filename += ".pdf";
        } else {
          filename += ".zip";
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setShowPrintModal(false);
        alert("Download completed successfully!");
      } else {
        alert(response.message || "Failed to download");
      }
    } catch (error) {
      console.error("Error downloading:", error);
      alert("Error downloading");
    } finally {
      setDownloading(false);
    }
  };

  const openYojnaModal = async (dataId: string) => {
    const res = await getYojnaListApi(dataId);

    if (res.success) {
      setYojnaData(res.data);
      setShowModal(true);
    } else {
      alert('Yojna model can not open')
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);

      const payload = Object.values(editedRows);

      if (payload.length === 0) {
        alert("No changes to save");
        return;
      }

      const res = await saveLiveVoterListApi(payload);

      if (res?.success) {
        setShowSaveRibbon(true);
        setTimeout(() => setShowSaveRibbon(false), 3000);
        setEditedRows({});
      } else {
        alert(res?.message || "Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Something went wrong while saving changes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCastLookup = debounce(async (row: number, searchValue: string) => {
    try {
      const typed = String(searchValue || "").trim().toUpperCase();

      if (!typed) return;

      const res = await getCastIdLookupApi({
        search: typed,
        data_id: voterData?.[row]?.data_id || currentFilters?.data_id || null,
        limit: 1,
      });

      if (!res?.success || !Array.isArray(res?.data) || res.data.length === 0) {
        return;
      }

      const match = res.data[0];
      const hot = hotTableRef.current?.hotInstance;
      if (!hot) return;

      hot.setDataAtRowProp(row, "castid", match.castid || "");
      hot.setDataAtRowProp(row, "cast_id", match.caste || "");
      hot.setDataAtRowProp(row, "cast_cat", match.cast_cat || "");
      hot.setDataAtRowProp(row, "religion", match.religion || "");

      setVoterData((prev) => {
        const next = [...prev];
        if (!next[row]) next[row] = {};
        next[row] = {
          ...next[row],
          castid: match.castid || "",
          cast_id: match.caste || "",
          cast_cat: match.cast_cat || "",
          religion: match.religion || "",
          modified: true,
        };
        return next;
      });

      setEditedRows((prev) => {
        const baseData = voterData[row] || {};
        return {
          ...prev,
          [baseData?.id ?? row]: {
            ...baseData,
            castid: match.castid || "",
            cast_id: match.caste || "",
            cast_cat: match.cast_cat || "",
            religion: match.religion || "",
          },
        };
      });

      closeLookup();
    } catch (error) {
      console.error("fetchCastLookup error:", error);
    }
  }, 750);

  const fetchCastSurnameLookup = debounce(async (row: number, value: string) => {
    if (row < 0 || row >= voterData.length) {
      closeLookup();
      return;
    }

    const rowData = voterData[row];
    if (!rowData) {
      closeLookup();
      return;
    }

    const dataId = rowData?.data_id;
    const search = String(value || "").trim();

    if (!search) {
      closeLookup();
      return;
    }

    const cacheKey = `${dataId || "all"}__${search.toLowerCase()}`;
    const currentRequestKey = `castid_surname|${row}|${search.toLowerCase()}`;
    activeLookupRequestRef.current = currentRequestKey;

    if (castSurnameLookupCacheRef.current.has(cacheKey)) {
      openLookupAtCell(
        row,
        "castid_surname",
        castSurnameLookupCacheRef.current.get(cacheKey) || []
      );
      return;
    }

    openLookupAtCell(row, "castid_surname", [], true);

    try {
      const res = await getCastIdSurnameLookupApi({
        search,
        data_id: dataId,
        limit: 20,
      });

      if (activeLookupRequestRef.current !== currentRequestKey) {
        return;
      }

      const isWrappedResponse = res && typeof res === "object" && "success" in res;
      if (isWrappedResponse && !res.success) {
        console.warn("Cast surname lookup API returned unsuccessful response:", (res as any).message);
        closeLookup();
        return;
      }

      const responseData = isWrappedResponse ? (res as any).data : res;
      const items = Array.isArray(responseData) ? responseData : [];
      castSurnameLookupCacheRef.current.set(cacheKey, items);
      openLookupAtCell(row, "castid_surname", items, false);
    } catch (error) {
      if (activeLookupRequestRef.current !== currentRequestKey) {
        return;
      }
      console.error("cast surname lookup error:", error);
      closeLookup();
    }
  }, 500);

  const applyCastLookupSelection = (rowIndex: number, selected: CastLookupItem) => {
    const hot = hotTableRef.current?.hotInstance;
    if (!hot) return;

    try {
      hot.setDataAtRowProp(rowIndex, "castid", selected.castid || "", "lookup-fill");
      hot.setDataAtRowProp(rowIndex, "cast_id", selected.caste || "", "lookup-fill");
      if (selected.cast_cat) {
        hot.setDataAtRowProp(rowIndex, "cast_cat", selected.cast_cat, "lookup-fill");
      }
      if (selected.religion) {
        hot.setDataAtRowProp(rowIndex, "religion", selected.religion, "lookup-fill");
      }

      setVoterData((prev) => {
        const next = [...prev];
        if (!next[rowIndex]) next[rowIndex] = {};
        next[rowIndex] = {
          ...next[rowIndex],
          castid: selected.castid || "",
          cast_id: selected.caste || "",
          cast_cat: selected.cast_cat || next[rowIndex]?.cast_cat || "",
          religion: selected.religion || next[rowIndex]?.religion || "",
          modified: true,
        };
        return next;
      });

      setEditedRows((prev) => {
        const baseData = voterData[rowIndex] || {};
        return {
          ...prev,
          [baseData?.id ?? rowIndex]: {
            ...baseData,
            castid: selected.castid || "",
            cast_id: selected.caste || "",
            cast_cat: selected.cast_cat || baseData.cast_cat || "",
            religion: selected.religion || baseData.religion || "",
          },
        };
      });
    } catch (error) {
      console.error("Error applying cast lookup selection:", error);
    }

    closeLookup();
  };

  const applyCastSurnameLookupSelection = (
    rowIndex: number,
    selected: CastSurnameLookupItem
  ) => {
    const hot = hotTableRef.current?.hotInstance;
    if (!hot) return;

    try {
      // Update the Handsontable cells immediately
      hot.setDataAtRowProp(
        rowIndex,
        "castid_surname",
        selected.castid_surname || "",
        "lookup-fill"
      );
      hot.setDataAtRowProp(
        rowIndex,
        "cast_id_surname",
        selected.surname || "",
        "lookup-fill"
      );
      if (selected.subcast) hot.setDataAtRowProp(rowIndex, "subcast", selected.subcast, "lookup-fill");
      if (selected.oldnew !== undefined) hot.setDataAtRowProp(rowIndex, "oldnew", selected.oldnew, "lookup-fill");

      // Update voterData state
      setVoterData((prev) => {
        const next = [...prev];
        if (!next[rowIndex]) next[rowIndex] = {};
        const current = { ...next[rowIndex] };

        current.castid_surname = selected.castid_surname || "";
        current.cast_id_surname = selected.surname || "";
        current.subcast = selected.subcast || current.subcast || "";
        current.oldnew = selected.oldnew ?? current.oldnew;
        current.modified = true;

        next[rowIndex] = current;
        return next;
      });

      // Update edited rows - use the updated data directly
      setEditedRows((prev) => {
        const baseData = voterData[rowIndex] || {};
        const rowData = {
          ...baseData,
          castid_surname: selected.castid_surname || "",
          cast_id_surname: selected.surname || "",
          subcast: selected.subcast || baseData.subcast || "",
          oldnew: selected.oldnew ?? baseData.oldnew,
        };

        return {
          ...prev,
          [baseData?.id ?? rowIndex]: rowData,
        };
      });
    } catch (error) {
      console.error("Error applying cast surname lookup selection:", error);
    }

    closeLookup();
  };

  const handleLookupSelect = (item: CastLookupItem | CastSurnameLookupItem) => {
    if (lookupState.row < 0 || !lookupState.prop) return;

    const currentRow = lookupState.row;
    const currentProp = lookupState.prop;
    const hot = hotTableRef.current?.hotInstance;

    try {
      if (currentProp === "castid") {
        applyCastLookupSelection(currentRow, item as CastLookupItem);
      } else if (currentProp === "castid_surname") {
        applyCastSurnameLookupSelection(currentRow, item as CastSurnameLookupItem);
      }
    } catch (error) {
      console.error("Error handling lookup selection:", error);
      return;
    }

    // ✅ keyboard aur mouse dono me same movement
    if (!hot) return;

    const currentCol = hot.propToCol(currentProp);
    const nextRow = currentRow + 1;

    setTimeout(() => {
      if (nextRow < hot.countRows()) {
        hot.selectCell(nextRow, currentCol);
        hot.beginEditing();
      }
    }, 0);
  };

  const HIDDEN_COLUMNS = [
    "acc_no",
    "accNo",
    "account_no",
    "mapping",
    "mapping_id",
    "cast_cat_name",
    "caste",
    "cast_id",
    "cast_id_surname",
  ];

  const columns =
    voterData.length > 0
      ? (() => {

        const visibleKeys = Object.keys(voterData[0]).filter(
          (key) => !HIDDEN_COLUMNS.includes(key.toLowerCase())
        );

        const extraColumnsMap: Record<string, Handsontable.ColumnSettings[]> = {
          castid: [
            {
              data: "cast_id",
              title: "CAST HI",
              readOnly: true,
              className: "htCenter htMiddle",
            },
          ],
          castid_surname: [
            {
              data: "cast_id_surname",
              title: "SURNAME HI",
              readOnly: true,
              className: "htCenter htMiddle",
            },
          ],
          edu_id: [
            {
              data: "education_id",
              title: "EDU HI",
              readOnly: false,
              className: "htCenter htMiddle",
            },
          ],
          proff_id: [
            {
              data: "proffession_id",
              title: "PROFF HI",
              readOnly: false,
              className: "htCenter htMiddle",
            },
          ],
        };

        const orderedKeys: string[] = [];

        visibleKeys.forEach((key) => {
          if (!orderedKeys.includes(key)) {
            orderedKeys.push(key);
          }

          if (extraColumnsMap[key]) {
            extraColumnsMap[key].forEach((column) => {
              if (
                typeof column.data === "string" &&
                !orderedKeys.includes(column.data)
              ) {
                orderedKeys.push(column.data);
              }
            });
          }
        });

        const moveRelatedIdNextToField = (baseKey: string, idKey: string) => {
          const baseIndex = orderedKeys.indexOf(baseKey);
          const idIndex = orderedKeys.indexOf(idKey);

          if (baseIndex === -1 || idIndex === -1 || idIndex === baseIndex + 1) {
            return;
          }

          orderedKeys.splice(idIndex, 1);
          const insertIndex = orderedKeys.indexOf(baseKey) + 1;
          orderedKeys.splice(insertIndex, 0, idKey);
        };

        // Ensure IDs are shown adjacent to their related label fields.
        moveRelatedIdNextToField("block", "block_id");
        moveRelatedIdNextToField("gp_ward", "gp_ward_id");
        moveRelatedIdNextToField("village", "village_id");
        moveRelatedIdNextToField("pincode", "pincode_id");
        moveRelatedIdNextToField("mandal", "mandal_id");
        moveRelatedIdNextToField("kendra", "kendra_id");
        moveRelatedIdNextToField("postoff", "postoff_id");
        moveRelatedIdNextToField("policst", "policst_id");
        moveRelatedIdNextToField("district", "district_id");

        // Ensure religion appears immediately after cast_cat when both exist
        if (orderedKeys.includes("cast_cat") && orderedKeys.includes("religion")) {
          const castCatIndex = orderedKeys.indexOf("cast_cat");
          const religionIndex = orderedKeys.indexOf("religion");
          if (religionIndex !== castCatIndex + 1) {
            orderedKeys.splice(religionIndex, 1);
            orderedKeys.splice(castCatIndex + 1, 0, "religion");
          }
        }

        const moveKeyToLast = (key: string) => {
          const index = orderedKeys.indexOf(key);
          if (index !== -1) {
            orderedKeys.splice(index, 1);
            orderedKeys.push(key);
          }
        };

        moveKeyToLast("update_by");
        moveKeyToLast("updated_by");
        moveKeyToLast("updatedBy");

        const allColumns = orderedKeys.map((key) => {
          const manualColumn = Object.values(extraColumnsMap)
            .flat()
            .find((column) => column.data === key);

          if (manualColumn) {
            return manualColumn;
          }

          return {
            data: key,
            title: key.replace(/_/g, " ").toUpperCase(),
            readOnly: false,
            className: "htCenter htMiddle",
            renderer: (instance: any, td: any, row: any, col: any, prop: any, value: any) => {
              let displayValue = value ?? "";

              if (key === "ru") {
                if (value === 1 || value === "1") {
                  displayValue = "शहरी";
                } else if (value === 0 || value === "0") {
                  displayValue = "ग्रामीण";
                } else {
                  displayValue = "-";
                }
              }

              else if (key === "pdob_verify") {
                displayValue =
                  value === 1 || value === "1"
                    ? "true"
                    : value === 0 || value === "0"
                      ? "false"
                      : String(value ?? "");
              }

              td.textContent = displayValue;
              td.className = "htCenter htMiddle";
              return td;
            },

            ...(key === "surname" && {
              renderer: (
                instance: any,
                td: any,
                row: any,
                col: any,
                prop: any,
                value: any
              ) => {
                let surnameValue = "-";
                if (value && typeof value === "object") {
                  const voterSurname = value.v || "";
                  const relationSurname = value.r || "";

                  if (voterSurname && relationSurname) {
                    surnameValue = `V: ${voterSurname} R: ${relationSurname}`;
                  } else if (voterSurname) {
                    surnameValue = `V: ${voterSurname}`;
                  } else if (relationSurname) {
                    surnameValue = `R: ${relationSurname}`;
                  } else if (value.surname) {
                    surnameValue = value.surname;
                  }
                } else if (value) {
                  surnameValue = value;
                }

                td.textContent = surnameValue;
                td.className = "htCenter htMiddle";
                return td;
              },
              editor: class SurnameEditor extends Handsontable.editors.TextEditor {
                originalObjectValue: any;

                prepare(row: number, col: number, prop: string, td: any, originalValue: any, cellProperties: any) {
                  this.originalObjectValue = originalValue;
                  let editValue = "";

                  if (originalValue && typeof originalValue === "object") {
                    if (originalValue.surname) {
                      editValue = String(originalValue.surname);
                    } else {
                      const voterSurname = originalValue.v || "";
                      const relationSurname = originalValue.r || "";
                      if (voterSurname && relationSurname) {
                        editValue = `V: ${voterSurname} R: ${relationSurname}`;
                      } else if (voterSurname) {
                        editValue = `V: ${voterSurname}`;
                      } else if (relationSurname) {
                        editValue = `R: ${relationSurname}`;
                      }
                    }
                  } else if (originalValue || originalValue === 0) {
                    editValue = String(originalValue);
                  }

                  super.prepare(row, col, prop, td, editValue, cellProperties);
                }

                setValue(value: any) {
                  let editValue = "";
                  if (value && typeof value === "object") {
                    if (value.surname) {
                      editValue = String(value.surname);
                    } else {
                      const voterSurname = value.v || "";
                      const relationSurname = value.r || "";
                      if (voterSurname && relationSurname) {
                        editValue = `V: ${voterSurname} R: ${relationSurname}`;
                      } else if (voterSurname) {
                        editValue = `V: ${voterSurname}`;
                      } else if (relationSurname) {
                        editValue = `R: ${relationSurname}`;
                      }
                    }
                  } else if (value || value === 0) {
                    editValue = String(value);
                  }
                  super.setValue(editValue);
                }

                getValue() {
                  const rawValue = super.getValue();
                  const inputValue = String(rawValue).trim();

                  if (this.originalObjectValue && typeof this.originalObjectValue === "object") {
                    const result = { ...this.originalObjectValue };
                    const matchV = inputValue.match(/V:\s*([^R]*)/i);
                    const matchR = inputValue.match(/R:\s*(.*)/i);

                    if (matchV && matchV[1] !== undefined) {
                      result.v = matchV[1].trim();
                    }
                    if (matchR && matchR[1] !== undefined) {
                      result.r = matchR[1].trim();
                    }

                    if (!matchV && !matchR) {
                      if (result.hasOwnProperty("surname")) {
                        result.surname = inputValue;
                      } else {
                        result.v = inputValue;
                      }
                    }

                    return result;
                  }

                  return inputValue;
                }
              },
            }),

            ...(key === "hof" && {
              renderer: (
                instance: any,
                td: any,
                row: any,
                col: any,
                prop: any,
                value: any
              ) => {
                const hofValue = value === 1 ? "HOF" : value === 0 ? "MEM" : value || "-";
                td.textContent = hofValue;
                td.className = "htCenter htMiddle";
                return td;
              },
            }),
          };
        });


        /* ADD ACTION COLUMN */

        allColumns.push({
          data: null as any,
          title: "ACTION",
          readOnly: true,
          className: "htCenter htMiddle",

          renderer: (instance: any, td: any, row: number) => {

            const rowData = instance.getSourceDataAtRow(row);

            td.innerHTML = "";
            td.style.padding = "0";

            const btn = document.createElement("button");
            btn.textContent = "Action";

            btn.style.width = "100%";
            btn.style.height = "100%";
            btn.style.fontSize = "12px";
            btn.style.border = "none";
            btn.style.borderRadius = "0";
            btn.style.background = "#2563eb";
            btn.style.color = "#fff";
            btn.style.cursor = "pointer";

            btn.onclick = () => {
              const dataId = rowData?.data_id;
              if (dataId) {
                openYojnaModal(dataId);
              } else {
                alert('data id not found')
              }
            };

            td.appendChild(btn);

            return td;
          }
        });

        return allColumns;

      })()
      : [];

  const tableWrapperStyle = !isGoClicked
    ? { minHeight: "calc(100vh - 140px)", maxHeight: "calc(100vh - 61px)" }
    : showMoreLiveVoterFilters === 2
      ? { minHeight: "calc(100vh - 175px)", maxHeight: "calc(100vh - 125px)" }
      : showMoreLiveVoterFilters === 1
        ? { minHeight: "calc(100vh - 205px)", maxHeight: "calc(100vh - 100px)" }
        : { minHeight: "calc(100vh - 175px)", maxHeight: "calc(100vh - 80px)" };

  const hotTableHeight = !isGoClicked
    ? "calc(100vh - 185px)"
    : showMoreLiveVoterFilters === 2
      ? "calc(100vh - 210px)"
      : showMoreLiveVoterFilters === 1
        ? "calc(100vh - 190px)"
        : "calc(100vh - 141px)";

  return (
    <div className="live-voter-list-page h-screen flex flex-col overflow-hidden">
      {showSaveRibbon && (
        <div className="fixed top-20 right-6 z-40 px-6 py-4 text-white font-medium shadow-2xl rounded-lg bg-green-600 max-w-md">
          <div className="flex items-center space-x-3">
            <span>Changes saved successfully!</span>
          </div>
        </div>
      )}

      {showModal && (
        <YojnaModal
          data={yojnaData}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="bg-gray-100 border-b border-gray-200 px-6 py-2 flex-shrink-0 sticky top-0 z-[1000] min-h-[60px]">
        <div className="w-full flex items-center gap-6">
          <div className="flex-1 min-w-0 overflow-visible">
            <LiveMasterFilter onApplyFilters={handleApplyFilters} />
          </div>
        </div>
      </div>

      {isGoClicked && (
        <LiveVoterFilters
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          showMoreFilters={showMoreLiveVoterFilters}
          setShowMoreFilters={setShowMoreLiveVoterFilters}
          showDownloadPrintMenu={showDownloadPrintMenu}
          setShowDownloadPrintMenu={setShowDownloadPrintMenu}
          onPrintClick={() => setShowPrintModal(true)}
          onSaveClick={handleSaveChanges}
          onRefresh={handleRefresh}
          onSubFilterGo={handleSubFilterGo}
          loading={loading}
          filters={liveVoterListFilters}
          setFilters={setLiveVoterListFilters}
          filterOptions={filterOptions}
          selectedDataId={selectedDataId}
        />
      )}

      <div
        className="flex-1 overflow-hidden bg-white z-0"
        style={tableWrapperStyle}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            {voterData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-6 py-12">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    डेटा दिखाने के लिए फ़ील्ड चुनें
                  </h3>
                  <p className="text-gray-500 text-sm mt-2">
                    कृपया ऊपर दिए गए मास्टर फ़िल्टर से कोई भी फ़ील्ड चुनें
                  </p>
                </div>
              </div>
            ) : (
              <HotTable
                ref={hotTableRef}
                data={voterData}
                colHeaders={columns.map((col) =>
                  typeof col.title === "string" ? col.title : ""
                )}
                columns={columns}
                afterDeselect={() => {
                  const activeEl = document.activeElement as HTMLElement | null;
                  const lookupEl = document.getElementById("hot-lookup-dropdown");

                  // agar focus lookup ke andar hi hai to close mat karo
                  if (lookupEl && activeEl && lookupEl.contains(activeEl)) {
                    return;
                  }

                  detachEditorInputListener();

                  setTimeout(() => {
                    const currentActive = document.activeElement as HTMLElement | null;
                    const currentLookup = document.getElementById("hot-lookup-dropdown");

                    if (currentLookup && currentActive && currentLookup.contains(currentActive)) {
                      return;
                    }

                    closeLookup();
                  }, 120);
                }}
                beforeKeyDown={(event) => {
                  const hot = hotTableRef.current?.hotInstance;
                  if (!hot) return;

                  const selected = hot.getSelectedLast?.();
                  if (!selected) return;

                  const [row, col] = selected;

                  if (lookupState.open) {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      event.stopPropagation();
                      setLookupState((prev) => ({
                        ...prev,
                        activeIndex: Math.min(prev.activeIndex + 1, prev.items.length - 1),
                      }));
                      return false;
                    }

                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      event.stopPropagation();
                      setLookupState((prev) => ({
                        ...prev,
                        activeIndex: Math.max(prev.activeIndex - 1, 0),
                      }));
                      return false;
                    }

                    if (event.key === "Enter") {
                      const selectedItem = lookupState.items[lookupState.activeIndex];
                      if (selectedItem) {
                        event.preventDefault();
                        event.stopPropagation();

                        handleLookupSelect(selectedItem);

                        setTimeout(() => {
                          const nextRow = row + 1;
                          if (nextRow < hot.countRows()) {
                            hot.selectCell(nextRow, col);
                            hot.beginEditing();
                          }
                        }, 0);

                        return false;
                      }
                    }

                    if (event.key === "Escape") {
                      event.preventDefault();
                      event.stopPropagation();
                      closeLookup();
                      return false;
                    }

                    return;
                  }

                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();

                    const nextRow = row + 1;
                    if (nextRow < hot.countRows()) {
                      hot.selectCell(nextRow, col);
                      hot.beginEditing();
                    }

                    return false;
                  }
                }}
                afterChange={(changes: any, source: any) => {
                  if (!changes || source === "loadData") return;

                  setVoterData((prev: any) => {
                    const updated = [...prev];

                    (changes ?? []).forEach(
                      ([row, prop, oldValue, newValue]: HotChangeTuple) => {
                        if (!updated[row]) return;
                        if (oldValue === newValue) return;

                        updated[row] = {
                          ...updated[row],
                          [String(prop)]: newValue,
                        };
                      }
                    );

                    return updated;
                  });
                }}
                rowHeaders={(index) => {
                  const style = 'style="font-size:10px;text-align:center;height:10px;"';
                  return `<span ${style}>${index + 1}</span>`;
                }}
                // clicksToEdit={1}
                enterBeginsEditing={true}
                enterMoves={undefined}
                afterBeginEditing={(row, col) => {
                  const hot = hotTableRef.current?.hotInstance;
                  if (!hot) return;

                  const prop = hot.colToProp(col);

                  if (prop === "castid" || prop === "castid_surname") {
                    attachEditorInputListener(row, String(prop));
                  } else {
                    detachEditorInputListener();
                    closeLookup();
                  }
                }}
                width="100%"
                height={hotTableHeight}
                wordWrap={false}
                licenseKey="non-commercial-and-evaluation"
                stretchH="all"
                filters={false}
                columnSorting={true}
                manualColumnResize={true}
                manualRowResize={true}
                dropdownMenu={false}
                contextMenu={true}
                search={true}
                comments={true}
                fillHandle={true}
                autoWrapRow={false}
                autoWrapCol={false}
                rowHeights={25}
                autoColumnSize={true}
                className="htCompact"
              />
            )}
            {lookupState.open && (
              <div
                id="hot-lookup-dropdown"
                ref={null}
                tabIndex={-1}
                style={{
                  position: "fixed",
                  top: lookupState.top,
                  left: lookupState.left,
                  width: Math.max(lookupState.width, 320),
                  maxHeight: 260,
                  overflowY: "auto",
                  zIndex: 999999,
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
                  outline: "none",
                }}
                onKeyDown={(e) => {
                  if (lookupState.items.length === 0) return;

                  let newIndex = lookupState.activeIndex;

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    newIndex = Math.min(newIndex + 1, lookupState.items.length - 1);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    newIndex = Math.max(newIndex - 1, 0);
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    handleLookupSelect(lookupState.items[lookupState.activeIndex]);
                    return;
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    closeLookup();
                    return;
                  }

                  if (newIndex !== lookupState.activeIndex) {
                    setLookupState((prev) => ({
                      ...prev,
                      activeIndex: newIndex,
                    }));
                  }
                }}
              >
                {lookupState.loading ? (
                  <div className="px-3 py-2 text-sm text-slate-500">Loading...</div>
                ) : lookupState.items.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-500">No suggestions</div>
                ) : lookupState.prop === "castid" ? (
                  lookupState.items.map((item, index) => {
                    const row = item as CastLookupItem;
                    return (
                      <button
                        key={`${row.castid}-${row.data_id}-${index}`}
                        type="button"
                        className="w-full text-left px-3 py-2 border-b border-slate-100 last:border-b-0"
                        style={{
                          background: lookupState.activeIndex === index ? "#eff6ff" : "#fff",
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleLookupSelect(row);
                        }}
                      >
                        <div className="text-sm font-medium text-slate-800">{row.castid || "-"}</div>
                        <div className="text-xs text-slate-600">{row.caste || "-"}</div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {row.cast_cat || "-"} | {row.religion || "-"}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  lookupState.items.map((item, index) => {
                    const row = item as CastSurnameLookupItem;
                    return (
                      <button
                        key={`${row.castid_surname}-${row.surname}-${row.data_id}-${index}`}
                        type="button"
                        className="w-full text-left px-3 py-2 border-b border-slate-100 last:border-b-0"
                        style={{
                          background: lookupState.activeIndex === index ? "#eff6ff" : "#fff",
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleLookupSelect(row);
                        }}
                      >
                        <div className="text-sm font-medium text-slate-800">
                          {row.castid_surname || "-"}
                        </div>
                        <div className="text-xs text-slate-600">{row.surname || "-"}</div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {row.subcast || "-"} | oldnew: {row.oldnew ?? "-"}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {
            isGoClicked && (
              <div className="flex-shrink-0">
                <CommonPagination
                  currentPage={metadata.currentPage}
                  totalPages={metadata.totalPages}
                  totalItems={metadata.totalRecords}
                  itemsPerPage={itemsPerPage}
                  currentPageItemCount={voterData.length}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  loading={loading}
                  showRefreshButton={true}
                  onRefresh={handleRefresh}
                />
              </div>
            )
          }
        </div>
      </div>

      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        acOptions={acOptions}
        selectedAc={selectedAc}
        onAcChange={handleAcChange}
        blockOptions={blockOptions}
        selectedBlock={selectedBlock}
        onBlockChange={handleBlockChange}
        gpOptions={gpOptions}
        selectedGp={selectedGp}
        onGpChange={handleGpChange}
        gramOptions={gramOptions}
        selectedGram={selectedGram}
        onGramChange={handleGramChange}
        bhagOptions={bhagOptions}
        selectedBhag={selectedBhag}
        onBhagChange={handleBhagChange}
        sectionOptions={sectionOptions}
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
        loadingAcData={loadingAcData}
        printOptions={printOptions}
        setPrintOptions={setPrintOptions}
        onDownload={handleDownloadPDF}
        downloading={downloading}
        selectedDataId={selectedDataId}
      />
    </div>
  );
}