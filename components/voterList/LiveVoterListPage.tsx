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
import { CommonPagination } from "./CommonPagination";
import {
  downloadPrintRegister,
  filterPrintRegister,
  getVoterListSubFilter,
  getYojnaListApi,
  volterMasterFilterGo,
  saveLiveVoterListApi
} from "@/apis/api";
import { getOriginalKey, mapFiltersToBackend } from "@/utils/helper";
import YojnaModal from "./YojnaModal";

registerAllModules();

interface VoterData {
  id?: number;
  ac_no?: number;
  bhag_no?: number;
  vsno?: number;
  vname?: string;
  relation?: string;
  rname?: string | null;
  surname?: string | null;
  age?: number;
  sex?: string;
  epic?: string;
  hno?: string;
  section?: string;
  sec_no?: number;
  castid?: string;
  cast_id_hi?: string;
  cast_cat?: string;
  castid_surname?: string;
  cast_id_surname?: string;
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

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showMoreLiveVoterFilters, setShowMoreLiveVoterFilters] =
    useState<number>(0);
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
  const [itemsPerPage, setItemsPerPage] = useState<number | "All">(1000);
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

  const extractId = (value: string): string => {
    if (!value || value === "All") return "";
    const parts = value.split(" - ");
    return parts[0].trim();
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
    targetPage?: number
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

      const resolvedLimit = Number(itemsPerPage);

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

  const handleSubFilterGo = async (targetPage?: number): Promise<void> => {
    try {
      setLoading(true);
      setActiveFilterMode("sub");

      const page = targetPage !== undefined ? Number(targetPage) : Number(currentPage);

      // Calculate limit properly
      const apiLimit =
        itemsPerPage === "All"
          ? metadata.totalRecords > 0
            ? metadata.totalRecords
            : 1000000
          : Number(itemsPerPage);

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

    const apiLimit =
      value === "All"
        ? metadata.totalRecords > 0
          ? metadata.totalRecords
          : 1000000
        : Number(value);

    if (activeFilterMode === "master") {
      // Always re-run master filters when page size changes
      await handleApplyFilters({
        ...currentFilters,
        page: 1,
        limit: apiLimit,
      });
    } else {
      // For sub-filter, call with page 1 and new limit
      await handleSubFilterGo(1);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    console.log("REFRESH: Clearing all data");

    // Clear all master filter selections
    setSelectedDataId("");
    setSelectedAssembly("");
    setSelectedParliament("");
    setSelectedDistrict("");

    // Clear sub filter form
    setLiveVoterListFilters({
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

    // Reset pagination
    setCurrentPage(1);
    setCurrentFilters({});
    setActiveFilterMode("master");

    // IMPORTANT: Clear ALL voter data
    setVoterData([]);

    // Clear mapping data
    setMappingData({
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

    // Reset metadata
    setMetadata({
      totalRecords: 0,
      currentPage: 1,
      totalPages: 1,
    });

    // Reset filter options
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

  const HIDDEN_COLUMNS = [
    "acc_no",
    "accNo",
    "account_no",
    "mapping",
    "mapping_id",
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
              readOnly: false,
              className: "htCenter htMiddle",
            },
          ],
          castid_surname: [
            {
              data: "cast_id_surname",
              title: "SURNAME HI",
              readOnly: false,
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
          orderedKeys.push(key);

          if (extraColumnsMap[key]) {
            extraColumnsMap[key].forEach((column) => {
              if (typeof column.data === "string") {
                orderedKeys.push(column.data);
              }
            });
          }
        });

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

                  // Handle surname object with r and v properties
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
        style={{ minHeight: "calc(100vh - 160px)", maxHeight: "calc(100vh - 120px)" }}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-700 font-medium">Loading data...</p>
                </div>
              </div>
            ) : voterData.length === 0 ? (
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

                afterChange={(changes, source) => {
                  if (!changes || source === "loadData") return;

                  setEditedRows((prev) => {
                    const updated = { ...prev };

                    changes.forEach(([rowIndex, prop, oldValue, newValue]: any) => {
                      if (oldValue === newValue) return;

                      const rowData = voterData[rowIndex];
                      if (!rowData) return;

                      const rowId: any = rowData.id;

                      updated[rowId] = {
                        ...(updated[rowId] || {
                          id: rowData.id,
                          data_id: rowData.data_id,
                        }),
                        [prop]: newValue,
                      };
                    });

                    return updated;
                  });
                }}

                rowHeaders={(index) => {
                  const style = 'style="font-size:10px;text-align:center;height:10px;"';
                  return `<span ${style}>${index + 1}</span>`;
                }}

                width="100%"
                height="calc(100vh - 195px)"

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
