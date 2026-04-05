// FilterDashboardUI.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/app/hook/useAuth";
import Header from "@/components/layout/Header";
import { FamilyDetailsPopup } from "./FamilyDetailsPopup";
import { FilterBar } from "./FilterBar";
import { AdvancedFilters } from "./AdvancedFilters";
import { VoterTable } from "./VoterTable";
import { TablePagination } from "./TablePagination";
import {
  getTableDataByMasterFilter,
  getSubFilter,
  updateDataset
} from "@/apis/api";
import { RefreshCw, Search } from "lucide-react";

interface VoterData {
  id?: number;
  family_id?: string;
  vname?: string;
  fname?: string;
  mname?: string;
  surname?: {
    f?: string;
    m?: string;
    v?: string;
  };
  sex?: string;
  age?: number;
  phone1?: string;
  phone2?: string;
  dob?: string;
  ru?: string;
  dist?: string;
  village?: string;
  gp_ward?: string;
  address?: string;
  cast_name?: string;
  cast_cat?: string;
  religion?: string;
  cast_id?: string;
  ac_no?: string;
  pc_no?: string;
  photo?: string;
  pdob_verify?: number;
  [key: string]: any;
}

interface FormattedVoterData {
  id: number | string;
  family_id: string;
  vname: string;
  fname: string;
  mname: string;
  surname: string;
  sex: string;
  age: number | null;
  phone1: string;
  phone2: string;
  dob: string;
  ru: string;
  dist: string;
  village: string;
  gp_ward: string;
  address: string;
  cast_name: string;
  cast_cat: string;
  religion: string;
  cast_id: string;
  ac_no: string;
  pc_no: string;
  star: string;
  msg: string;
  photo?: string;
}

interface MasterFilters {
  block_city?: string;
  distt?: string;
  ac_no?: string;
  pc_no?: string;
  ru?: string;
  gp_ward?: string;
  village?: string;
  cast_id?: string;
  religion?: string;
  surname?: string;
  sex?: string;
  mobile?: string;
  dob?: string;
  vname?: string;
  mname?: string;
  fname?: string;
  cast_name?: string;
  cast_cat?: string;
  [key: string]: string | undefined;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T[];
  totalPages?: number;
  total?: number;
  page?: number;
  message?: string;
  subFilterOptions?: {
    ru?: string[];
    gp_ward?: string[];
    village?: string[];
    cast?: Array<{ cast_id: string, cast_name: string }>;
    religion?: string[];
    surname?: string[];
    sex?: string[];
  };
}

const formatVoterDataForTable = (voterData: VoterData[]): FormattedVoterData[] => {
  return voterData.map((voter) => ({
    id: voter.id || voter.family_id || "",
    family_id: voter.family_id || "",
    vname: voter.vname || "",
    fname: voter.fname || "",
    mname: voter.mname || "",
    surname: voter.surname
      ? `${voter.surname.f || "N/A"}:${voter.surname.m || "N/A"}:${voter.surname.v || "N/A"}`
      : "N/A:N/A:N/A",
    sex: voter.sex === "पुरुष" ? "M" : voter.sex === "महिला" ? "F" : voter.sex || "",
    age: voter.age ? parseInt(String(voter.age)) : null,
    phone1: voter.phone1 || "",
    phone2: voter.phone2 || "",
    dob: formatDate(voter.dob),
    ru: voter.ru || "",
    dist: voter.dist || "",
    village: voter.village || "",
    gp_ward: voter.gp_ward || "",
    address: voter.address || "",
    cast_name: voter.cast_name || "",
    cast_cat: voter.cast_cat || "",
    religion: voter.religion || "",
    cast_id: voter.cast_id || "",
    ac_no: voter.ac_no || "",
    pc_no: voter.pc_no || "",
    star: "",
    msg: "",
    photo: voter.photo || "",
    pdob_verify: voter.pdob_verify ?? 0,
  }));
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      .replace(/ /g, "-");
  } catch {
    return dateString;
  }
};

const getGenderInHindi = (gender?: string): string => {
  if (!gender) return "";
  return gender === "पुरुष" ? "पुरुष" : gender === "महिला" ? "महिला" : gender;
};

declare global {
  interface Window {
    handleNameClick?: (rowData: VoterData) => void;
  }
}

export default function FilterDashboardUI() {
  const router = useRouter();
  const checking = useAuth();
  const hotTableRef = useRef<any>(null);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [voterData, setVoterData] = useState<VoterData[]>([]);
  const [formattedData, setFormattedData] = useState<FormattedVoterData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(100);
  const [editedRows, setEditedRows] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [isPageChanging, setIsPageChanging] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [selectedPerson, setSelectedPerson] = useState<VoterData | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [subFilterOptions, setSubFilterOptions] = useState<ApiResponse['subFilterOptions']>({});
  const [selectedFilters, setSelectedFilters] = useState<MasterFilters>({
    ac_no: "",
    pc_no: "",
    distt: "",
    block_city: "",
    ru: "",
    gp_ward: "",
    village: "",
    cast_id: "",
    cast_name: "",
    cast_cat: "",
    mobile: "",
    surname: "",
    dob: "",
    vname: "",
    mname: "",
    fname: "",
    sex: "",
    religion: "",
  });
  const [isGoClicked, setIsGoClicked] = useState<boolean>(false)

  const handleNameClick = useCallback((rowData: VoterData): void => {
    setSelectedPerson(rowData);
    setIsPopupOpen(true);
  }, []);

  useEffect(() => {
    window.handleNameClick = (rowData: VoterData) => handleNameClick(rowData);
    return () => { delete window.handleNameClick; };
  }, [handleNameClick]);

  const fetchVoterData = useCallback(async (page: number, limit: number, filters: MasterFilters): Promise<void> => {
    const hasFilters = Object.values(filters).some((value) => value && value.trim() !== "");
    if (!hasFilters) {
      setVoterData([]);
      setFormattedData([]);
      setTotalPages(1);
      setTotalRecords(0);
      return;
    }

    const filtersToSend = { ...filters };

    if (!filtersToSend.ac_no && !filtersToSend.pc_no && !filtersToSend.distt && !filtersToSend.block_city) {
      filtersToSend.ac_no = "1";
    }

    setIsPageChanging(true);
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filtersToSend).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          queryParams.append(key, value);
        }
      });
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));

      const apiResponse = await getTableDataByMasterFilter(queryParams.toString());

      if (apiResponse?.success) {
        const data = Array.isArray(apiResponse.data) ? apiResponse.data : [];
        setVoterData(data);
        const formatted = formatVoterDataForTable(data);
        setFormattedData(formatted);
        setTotalPages(apiResponse.totalPages ?? 1);
        setTotalRecords(apiResponse.total ?? 0);
        setCurrentPage(apiResponse.page ?? page);
        setEditedRows({});
        setSaveSuccess(null);
      } else {
        setVoterData([]);
        setFormattedData([]);
      }
    } catch (error) {
      console.error("Error:", error);
      setVoterData([]);
      setFormattedData([]);
    } finally {
      setLoading(false);
      setIsPageChanging(false);
    }
  }, []);

  const handleFilterChange = useCallback((key: string, value: string): void => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleApplyFilters = useCallback(async (): Promise<void> => {
    setCurrentPage(1);

    const activeFilters = Object.fromEntries(
      Object.entries(selectedFilters).filter(([_, value]) => value && value.trim() !== "")
    );

    try {
      const response = await getSubFilter(activeFilters);

      if (response?.success) {
        setSubFilterOptions(response.subFilterOptions || {});

        setIsGoClicked(true)
        if (response.data && Array.isArray(response.data)) {
          setVoterData(response.data);
          setFormattedData(formatVoterDataForTable(response.data));
          setTotalPages(response.totalPages || 1);
          setTotalRecords(response.total || 0);
        }
      }
    } catch (error) {
      console.error("Error in getSubFilter:", error);
    }
  }, [selectedFilters]);

  const handleResetFilters = useCallback((): void => {
    setSelectedFilters({
      block_city: "",
      distt: "",
      ac_no: "",
      pc_no: "",
      ru: "",
      gp_ward: "",
      village: "",
      cast_id: "",
      religion: "",
      surname: "",
      sex: "",
      mobile: "",
      dob: "",
      vname: "",
      mname: "",
      fname: "",
      cast_name: "",
      cast_cat: "",
    });
    setCurrentPage(1);
    fetchVoterData(1, entriesPerPage, {
      block_city: "",
      distt: "",
      ac_no: "",
      pc_no: "",
      ru: "",
      gp_ward: "",
      village: "",
      cast_id: "",
      religion: "",
      surname: "",
      sex: "",
      mobile: "",
      dob: "",
      vname: "",
      mname: "",
      fname: "",
      cast_name: "",
      cast_cat: "",
    });
  }, [entriesPerPage, fetchVoterData]);

  const handlePageChange = useCallback((page: number): void => {
    if (page < 1 || page > totalPages || page === currentPage || isPageChanging) return;
    setCurrentPage(page);
    fetchVoterData(page, entriesPerPage, selectedFilters);
  }, [totalPages, currentPage, isPageChanging, entriesPerPage, selectedFilters, fetchVoterData]);

  const handleEntriesPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newLimit = parseInt(e.target.value);
    setEntriesPerPage(newLimit);
    setCurrentPage(1);
    fetchVoterData(1, newLimit, selectedFilters);
  }, [selectedFilters, fetchVoterData]);

  const handleAfterChange = useCallback((changes: any[] | null, source: string): void => {
    if (source === "edit" && changes) {
      const newEditedRows = { ...editedRows };
      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (oldValue !== newValue) {
          const rowData = hotTableRef.current?.hotInstance?.getSourceDataAtRow(row);
          const rowId = rowData?.id || rowData?.family_id;
          if (rowId) {
            if (!newEditedRows[rowId]) newEditedRows[rowId] = {};
            const fieldMapping: Record<string, string> = {
              vname: "vname", fname: "fname", mname: "mname", surname: "surname",
              sex: "sex", age: "age", phone1: "phone1", phone2: "phone2",
              dob: "dob", ru: "ru", village: "village", gp_ward: "gp_ward",
              address: "address", cast_name: "cast_name", cast_cat: "cast_cat",
              religion: "religion", cast_id: "cast_id", ac_no: "ac_no", pc_no: "pc_no",
              star: "star", msg: "msg",
            };
            newEditedRows[rowId][fieldMapping[prop as string] || prop] = newValue;
          }
        }
      });
      setEditedRows(newEditedRows);
      if (Object.keys(newEditedRows).length > 0) setSaveSuccess(null);
    }
  }, [editedRows]);

  const handleSaveChanges = useCallback(async (): Promise<void> => {
    if (Object.keys(editedRows).length === 0) {
      alert("No changes to save!");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);

    try {
      const updatePayload = {
        rows: Object.entries(editedRows).map(([id, data]) => ({ id: parseInt(id), data }))
      };
      const response = await updateDataset(updatePayload);

      if (response.success) {
        setSaveSuccess(true);
        setEditedRows({});
        await fetchVoterData(currentPage, entriesPerPage, selectedFilters);
        setTimeout(() => setSaveSuccess(null), 3000);
      } else {
        setSaveSuccess(false);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  }, [editedRows, currentPage, entriesPerPage, selectedFilters, fetchVoterData]);

  const handleUndoChanges = useCallback((): void => {
    if (hotTableRef.current?.hotInstance) {
      hotTableRef.current.hotInstance.undo();
      setEditedRows({});
    }
  }, []);

  const handleExportToExcel = useCallback(async (): Promise<void> => {
    if (voterData.length === 0) {
      alert("No data to export!");
      return;
    }

    try {
      const ExcelJS = await import("exceljs");
      const { saveAs } = await import("file-saver");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Voter Data");

      worksheet.columns = [
        { header: "ID", key: "id", width: 15 },
        { header: "Family ID", key: "family_id", width: 20 },
        { header: "Name", key: "name", width: 25 },
        { header: "Gender", key: "gender", width: 10 },
        { header: "Age", key: "age", width: 8 },
        { header: "Surname", key: "surname", width: 15 },
        { header: "Father Name", key: "father_name", width: 25 },
        { header: "Mother Name", key: "mother_name", width: 25 },
        { header: "Mobile 1", key: "mobile1", width: 15 },
        { header: "Mobile 2", key: "mobile2", width: 15 },
        { header: "DOB", key: "dob", width: 15 },
        { header: "R/U", key: "ru", width: 8 },
        { header: "District", key: "district", width: 20 },
        { header: "Village", key: "village", width: 20 },
        { header: "GP/Ward", key: "gp_ward", width: 20 },
        { header: "Address", key: "address", width: 40 },
        { header: "Caste", key: "caste", width: 20 },
        { header: "Cast Cat", key: "cast_cat", width: 15 },
        { header: "Religion", key: "religion", width: 15 },
        { header: "Cast ID", key: "cast_id", width: 15 },
        { header: "AC No", key: "ac_no", width: 15 },
        { header: "PC No", key: "pc_no", width: 15 },
        { header: "Star", key: "star", width: 10 },
        { header: "Message", key: "msg", width: 20 },
      ];

      worksheet.insertRow(1, ["Voter Data Export"]);
      worksheet.mergeCells("A1:X1");

      const titleRow = worksheet.getRow(1);
      titleRow.font = { bold: true, size: 14 };
      titleRow.alignment = { vertical: "middle", horizontal: "center" };
      titleRow.height = 30;

      const headerRow = worksheet.getRow(2);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4F81BD" } };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 25;

      voterData.forEach((voter, index) => {
        const row = worksheet.addRow({
          id: voter.id || "",
          family_id: voter.family_id || "",
          name: voter.vname || "",
          gender: getGenderInHindi(voter.sex),
          age: voter.age || "",
          surname: voter.surname?.v || voter.surname?.f || "",
          father_name: voter.fname || "",
          mother_name: voter.mname || "",
          mobile1: voter.phone1 || "",
          mobile2: voter.phone2 || "",
          dob: formatDate(voter.dob),
          ru: voter.ru || "",
          district: voter.dist || "",
          village: voter.village || "",
          gp_ward: voter.gp_ward || "",
          address: voter.address || "",
          caste: voter.cast_name || "",
          cast_cat: voter.cast_cat || "",
          religion: voter.religion || "",
          cast_id: voter.cast_id || "",
          ac_no: voter.ac_no || "",
          pc_no: voter.pc_no || "",
          star: "",
          msg: "",
        });

        row.eachCell((cell: any) => cell.alignment = { vertical: "middle", horizontal: "center" });

        ["name", "father_name", "mother_name", "address", "caste", "village", "gp_ward", "district"].forEach((col) => {
          const cell = row.getCell(col);
          if (cell) cell.alignment = { vertical: "middle", horizontal: "left" };
        });

        if (index % 2 === 0) {
          row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F2F2F2" } };
        }
        row.height = 22;
      });

      worksheet.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: worksheet.columnCount } };

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        `Voter_Data_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error exporting to Excel. Please try again.");
    }
  }, [voterData]);

  const handleExportToCSV = useCallback((): void => {
    if (voterData.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = ["ID", "FAMILY ID", "NAME", "FNAME", "MNAME", "SURNAME", "SEX", "AGE", "PHONE 1", "PHONE 2", "DOB", "R_U", "DISTRICT", "VILLAGE", "GP/WARD", "ADDRESS", "CASTE", "CAST CAT", "RELIGION", "CASTEID", "AC_NO", "PC_NO", "STAR", "MSG"];

    const csvRows = voterData.map((voter) =>
      [
        voter.id || "",
        voter.family_id || "",
        voter.vname || "",
        voter.fname || "",
        voter.mname || "",
        voter.surname?.f || voter.surname?.m || voter.surname?.v || "",
        getGenderInHindi(voter.sex),
        voter.age || "",
        voter.phone1 || "",
        voter.phone2 || "",
        formatDate(voter.dob),
        voter.ru || "",
        voter.dist || "",
        voter.village || "",
        voter.gp_ward || "",
        voter.address || "",
        voter.cast_name || "",
        voter.cast_cat || "",
        voter.religion || "",
        voter.cast_id || "",
        voter.ac_no || "",
        voter.pc_no || "",
        "",
        "",
      ].map((field) => `"${field}"`).join(",")
    );

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `voter_data_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [voterData]);

  const handleVoterDataReceived = useCallback((data: ApiResponse<VoterData>): void => {
    if (data?.success) {
      const rawData = data.data || [];
      setVoterData(rawData);
      setFormattedData(formatVoterDataForTable(rawData));
      setTotalPages(data.totalPages || 1);
      setTotalRecords(data.total || 0);
      setCurrentPage(data.page || 1);
      setSubFilterOptions(data.subFilterOptions || {});
      setEditedRows({});
      setSaveSuccess(null);
    } else {
      setVoterData([]);
      setFormattedData([]);
    }
  }, []);

  if (checking) return null;

  const startIndex = (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalRecords);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header onDataReceived={() => handleVoterDataReceived} onFilterChange={(filters: any) => { }} />

      <FamilyDetailsPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        selectedPerson={selectedPerson}
        allMembers={voterData}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {(
          <div className="flex-shrink-0">
            <FilterBar
              selectedFilters={selectedFilters}
              subFilterOptions={subFilterOptions}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
              onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
              showAdvanced={showAdvancedFilters}
              editedRowsCount={Object.keys(editedRows).length}
              onSaveChanges={handleSaveChanges}
              onUndoChanges={handleUndoChanges}
              isSaving={isSaving}
              saveSuccess={saveSuccess}
              loading={loading}
              onExportExcel={handleExportToExcel}
              onExportCSV={handleExportToCSV}
              hasData={voterData.length > 0}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          </div>
        )}

        {/* <div className="flex-shrink-0">
          <AdvancedFilters
            selectedFilters={selectedFilters}
            subFilterOptions={subFilterOptions}
            onFilterChange={handleFilterChange}
            show={showAdvancedFilters}
          />
        </div> */}

        <div className="flex-1 min-h-0 overflow-hidden relative">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <RefreshCw size={40} className="animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading data...</p>
              </div>
            </div>
          ) : voterData.length > 0 ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <VoterTable
                  data={formattedData}
                  onDataChange={handleAfterChange}
                  hotTableRef={hotTableRef}
                />
              </div>

              <div className="flex-shrink-0">
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalRecords={totalRecords}
                  entriesPerPage={entriesPerPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  isPageChanging={isPageChanging}
                  onPageChange={handlePageChange}
                  onEntriesPerPageChange={handleEntriesPerPageChange}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Search className="text-purple-600" size={32} />
              </div>
              <p className="text-gray-700 font-medium mb-1">डेटासेट चुना गया है - अब फ़िल्टर लगाएं</p>
              <p className="text-sm text-gray-500">लोकसभा | विधानसभा | जिला | ब्लॉक | अन्य विविध फ़िल्टर चुनें</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}