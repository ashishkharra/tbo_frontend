// components/dataset/VoterTable.tsx
'use client';

import React, { useEffect } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import type { ColumnSettings } from "handsontable/settings";

registerAllModules();

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

interface Props {
  data: FormattedVoterData[];
  onDataChange?: (changes: any[] | null, source: string) => void;
  hotTableRef?: React.RefObject<any>;
}

export const VoterTable: React.FC<Props> = ({
  data,
  onDataChange,
  hotTableRef,
}) => {

  useEffect(() => {
    if (hotTableRef?.current?.hotInstance) {
      setTimeout(() => {
        hotTableRef.current.hotInstance.render();
        hotTableRef.current.hotInstance.refreshDimensions();
      }, 100);
    }
  }, [data, hotTableRef]);

  const columns: ColumnSettings[] = [
    { data: "id", title: "ID", width: 70, readOnly: true, className: "htCenter htMiddle" },
    { 
      data: "family_id", title: "FAM ID", width: 80, readOnly: true,
      renderer: (instance, td, row, col, prop, value) => {
        td.textContent = value ? value.toString().slice(-5) : "-";
        td.className = "htCenter htMiddle";
        return td;
      }
    },
    {
      data: undefined, title: "NAME | GEN | AGE", width: 180, readOnly: true,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const rowData = instance.getSourceDataAtRow(row) as FormattedVoterData;
        const name = rowData?.vname || "-";
        const rawGender = rowData?.sex || "";
        let gender = "-";
        if (rawGender === "M" || rawGender === "पुरुष") gender = "M";
        if (rawGender === "F" || rawGender === "महिला") gender = "F";
        const age = rowData?.age || "-";
        const rowDataString = JSON.stringify(rowData).replace(/"/g, "&quot;");
        td.innerHTML = `<div style="display: flex; justify-content:space-around; align-items: center; width: 100%; padding: 0 8px;">
          <span style="text-align: left; font-weight: 500; cursor: pointer;" onclick="window.handleNameClick(${rowDataString})">${name}</span>
          <span style="text-align: right; color: #666;">${gender} | ${age}</span>
        </div>`;
        td.className = "htMiddle";
        return td;
      }
    },
    { data: "fname", title: "FNAME", width: 120, className: "htCenter htMiddle" },
    { data: "mname", title: "MNAME", width: 120, className: "htCenter htMiddle" },
    { data: "surname", title: "SURNAME", width: 100, className: "htCenter htMiddle" },
    { data: "phone1", title: "PHONE 1", width: 110, type: "numeric", className: "htCenter htMiddle", validator: /^\d{0,10}$/ },
    { data: "phone2", title: "PHONE 2", width: 110, type: "numeric", className: "htCenter htMiddle", validator: /^\d{0,10}$/ },
    { data: "dob", title: "DOB", width: 120, className: "htCenter htMiddle", type: "date", dateFormat: "DD/MM/YYYY" },
    { data: "ru", title: "R/U", width: 60, className: "htCenter htMiddle", type: "dropdown", source: ["R", "U", "1", "0"], strict: true },
    { data: "village", title: "VILLAGE", width: 120, className: "htCenter htMiddle" },
    { data: "gp_ward", title: "GP/WARD", width: 120, className: "htCenter htMiddle" },
    {
      data: "address", title: "ADDRESS", width: 180, className: "htLeft",
      renderer: (instance, td, row, col, prop, value) => {
        const fullAddress = value || "-";
        td.textContent = fullAddress;
        td.title = fullAddress;
        td.className = "htLeft";
        td.style.whiteSpace = "nowrap";
        td.style.overflow = "hidden";
        td.style.textOverflow = "ellipsis";
        return td;
      }
    },
    { data: "cast_name", title: "CASTE", width: 100, className: "htCenter htMiddle" },
    { data: "cast_cat", title: "CAST CAT", width: 90, className: "htCenter htMiddle" },
    { data: "religion", title: "RELIGION", width: 100, className: "htCenter htMiddle" },
    { data: "cast_id", title: "CASTEID", width: 80, className: "htCenter htMiddle", type: "numeric" },
    { data: "ac_no", title: "AC_NO", width: 80, className: "htCenter htMiddle", readOnly: false },
    { data: "pc_no", title: "PC_NO", width: 80, className: "htCenter htMiddle", readOnly: false },
    { data: "star", title: "STAR", width: 80, className: "htCenter htMiddle", readOnly: false },
    { data: "msg", title: "MESSAGE", width: 80, className: "htCenter htMiddle", readOnly: false },
    {
      data: "photo", 
      title: "PHOTO", 
      width: 80, 
      className: "htCenter htMiddle",
      renderer: (instance, td, row, col, prop, value) => {
        if (value && value.trim() !== "") {
          const img = document.createElement("img");
          img.src = value;
          img.alt = "Voter";
          img.style.width = "40px";
          img.style.height = "40px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "4px";
          img.style.cursor = "pointer";
          img.onclick = () => {
            
            window.open(value, "_blank");
          };
          td.innerHTML = "";
          td.appendChild(img);
        } else {
          td.textContent = "-";
        }
        td.className = "htCenter htMiddle";
        return td;
      }
    }
  ];

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "300px" }}>
      <HotTable
        ref={hotTableRef}
        data={data}
        columns={columns}
        colHeaders={true}
        rowHeaders={true}
        width="100%"
        height="calc(100vh - 185px)"
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
        afterChange={onDataChange}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
};