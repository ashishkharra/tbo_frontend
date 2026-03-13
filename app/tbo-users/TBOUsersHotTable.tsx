"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import type Handsontable from "handsontable";

registerAllModules();

const USER_ROLES = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "coordinator", label: "Coordinator" },
    { value: "data_entry_operator", label: "Data Entry Operator" },
    { value: "caller", label: "Caller" },
    { value: "driver", label: "Driver" },
    { value: "survey", label: "Survey" },
    { value: "printer", label: "Printer" },
    { value: "mobile_user", label: "Mobile User" },
    { value: "leader", label: "Leader" },
    { value: "volunteer", label: "Volunteer" },
    { value: "user", label: "User" },
];

const ROLE_LABEL_MAP: Record<string, string> = {};
USER_ROLES.forEach((r) => {
    ROLE_LABEL_MAP[r.value] = r.label;
});

// Derive display value of modules code from user object
function getModulesCode(user: any): string {
    return (user.modules_code || user.modulesCode || "").trim();
}

// Derive assignment tokens display
function getAssignCode(user: any): string {
    if (user.assignment_tokens && Array.isArray(user.assignment_tokens) && user.assignment_tokens.length > 0) {
        return user.assignment_tokens.filter((t: string) => t && t !== "null").join(", ");
    }
    if (user.assign_code) return user.assign_code;
    return "";
}

interface TBOUsersHotTableProps {
    data: any[];
    loading: boolean;
    onUpdateCell: (rowIndex: number, colId: string, value: any) => Promise<void>;
    onManageUser: (user: any) => void;
    onModulesClick: (user: any) => void;
    onDataAssignClick: (user: any) => Promise<void>;
    onParentClick: (user: any) => void;
    hasPermission: (perm: string) => boolean;
}

export default function TBOUsersHotTable({
    data,
    loading,
    onUpdateCell,
    onManageUser,
    onModulesClick,
    onDataAssignClick,
    onParentClick,
    hasPermission,
}: TBOUsersHotTableProps) {
    const hotRef = useRef<any>(null);

    // Convert data to row array for HOT
    const tableData = data.map((user) => {
        const isBlank = user.id && String(user.id).startsWith("blank-");
        return [
            isBlank ? "" : user.id,
            isBlank ? "" : (user.role || ""),
            isBlank ? "" : (user.username || ""),
            isBlank ? "" : (user.mobile || ""),
            isBlank ? "" : getModulesCode(user),
            isBlank ? "" : (user.permission_code || ""),
            isBlank ? "" : getAssignCode(user),
            "",
        ];
    });

    // Custom renderer for ID column
    const idRenderer = useCallback(
        (
            instance: Handsontable,
            td: HTMLTableCellElement,
            row: number,
            col: number,
            prop: string | number,
            value: any
        ) => {
            td.innerHTML = "";
            td.style.padding = "4px 8px";
            td.style.color = "#374151";
            td.style.fontSize = "12px";
            td.style.verticalAlign = "middle";
            td.style.backgroundColor = "#f9fafb";
            if (value) {
                td.textContent = String(value);
            } else {
                td.style.color = "#9ca3af";
                td.textContent = "-";
            }
            return td;
        },
        []
    );
    const usernameRenderer = useCallback(
        (
            instance: Handsontable,
            td: HTMLTableCellElement,
            row: number,
            col: number,
            prop: string | number,
            value: any
        ) => {
            td.innerHTML = "";
            td.style.padding = "4px 8px";
            td.style.verticalAlign = "middle";
            td.style.cursor = "pointer";

            const user = data[row];
            const isBlank = user && user.id && String(user.id).startsWith("blank-");

            if (!value || isBlank) {
                td.style.color = "#9ca3af";
                td.style.fontStyle = "italic";
                td.textContent = isBlank ? "Click to add username" : "-";
                return td;
            }

            const span = document.createElement("span");
            span.textContent = value;
            span.style.color = "#1d4ed8";
            span.style.fontWeight = "600";
            span.style.textDecoration = "underline";
            span.style.cursor = "pointer";
            span.addEventListener("click", (e) => {
                e.stopPropagation();
                if (user) onManageUser(user);
            });
            td.appendChild(span);
            return td;
        },
        [data, onManageUser]
    );

    // Custom renderer for Role dropdown display
    const roleRenderer = useCallback(
        (
            instance: Handsontable,
            td: HTMLTableCellElement,
            row: number,
            col: number,
            prop: string | number,
            value: any
        ) => {
            td.innerHTML = "";
            td.style.padding = "4px 8px";
            td.style.verticalAlign = "middle";

            const user = data[row];
            const isBlank = user && user.id && String(user.id).startsWith("blank-");

            if (isBlank) {
                td.style.color = "#9ca3af";
                td.style.fontStyle = "italic";
                td.textContent = "Select role";
                return td;
            }

            const label = ROLE_LABEL_MAP[value] || value || "-";
            td.textContent = label;
            td.style.color = "#111827";
            td.style.fontWeight = "500";
            td.style.fontSize = "12px";
            return td;
        },
        [data]
    );

    // Custom renderer for read-only code cells (modules code, permission code, assign code)
    const codeRenderer = useCallback(
        (
            instance: Handsontable,
            td: HTMLTableCellElement,
            row: number,
            col: number,
            prop: string | number,
            value: any
        ) => {
            td.innerHTML = "";
            td.style.padding = "4px 8px";
            td.style.verticalAlign = "middle";
            td.style.backgroundColor = "#f9fafb";

            if (!value) {
                td.style.color = "#9ca3af";
                td.style.fontSize = "11px";
                td.textContent = "-";
                return td;
            }

            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.alignItems = "center";
            wrapper.style.gap = "4px";
            wrapper.style.maxWidth = "100%";

            const span = document.createElement("span");
            span.textContent = String(value);
            span.style.fontSize = "11px";
            span.style.fontFamily = "monospace";
            span.style.color = "#1e40af";
            span.style.backgroundColor = "#eff6ff";
            span.style.padding = "2px 6px";
            span.style.borderRadius = "4px";
            span.style.overflow = "hidden";
            span.style.textOverflow = "ellipsis";
            span.style.whiteSpace = "nowrap";
            span.style.maxWidth = "calc(100% - 28px)";
            span.title = String(value);

            const copyBtn = document.createElement("button");
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
            copyBtn.style.border = "none";
            copyBtn.style.background = "transparent";
            copyBtn.style.cursor = "pointer";
            copyBtn.style.padding = "2px";
            copyBtn.style.color = "#6b7280";
            copyBtn.style.flexShrink = "0";
            copyBtn.title = "Copy";
            copyBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(String(value)).then(() => {
                    copyBtn.style.color = "#16a34a";
                    setTimeout(() => {
                        copyBtn.style.color = "#6b7280";
                    }, 1500);
                });
            });

            wrapper.appendChild(span);
            wrapper.appendChild(copyBtn);
            td.appendChild(wrapper);
            return td;
        },
        []
    );

    // Custom renderer for Actions column
    const actionsRenderer = useCallback(
        (
            instance: Handsontable,
            td: HTMLTableCellElement,
            row: number,
            col: number,
            prop: string | number,
            value: any
        ) => {
            td.innerHTML = "";
            td.style.padding = "4px 6px";
            td.style.verticalAlign = "middle";
            td.style.whiteSpace = "nowrap";

            const user = data[row];
            if (!user) return td;
            const isBlank = user.id && String(user.id).startsWith("blank-");
            if (isBlank) {
                td.style.color = "#9ca3af";
                td.textContent = "-";
                return td;
            }

            const btnStyle = (bg: string = "#374151") => ({
                padding: "3px 8px",
                fontSize: "11px",
                fontWeight: "500",
                color: "#fff",
                backgroundColor: bg,
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                whiteSpace: "nowrap" as const,
                marginRight: "4px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            });

            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.flexWrap = "wrap";
            wrapper.style.gap = "3px";
            wrapper.style.alignItems = "center";

            // Modules button
            const modulesBtn = document.createElement("button");
            modulesBtn.textContent = "Modules";
            Object.assign(modulesBtn.style, btnStyle());
            modulesBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                onModulesClick(user);
            });
            wrapper.appendChild(modulesBtn);

            // Data Assign button
            if (hasPermission("users:update") && Number(user.id)) {
                const dataBtn = document.createElement("button");
                dataBtn.textContent = "Data Assign";
                Object.assign(dataBtn.style, btnStyle());
                dataBtn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    await onDataAssignClick(user);
                });
                wrapper.appendChild(dataBtn);
            }

            // Team button
            const isNew =
                user.id && (String(user.id).startsWith("new") || String(user.id).startsWith("blank-"));
            if (!isNew) {
                const teamBtn = document.createElement("button");
                teamBtn.textContent = "Team";
                Object.assign(teamBtn.style, btnStyle());
                teamBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    onParentClick(user);
                });
                wrapper.appendChild(teamBtn);
            }

            // Setting link
            const settingLink = document.createElement("a");
            settingLink.textContent = "Setting";
            settingLink.href = `/tbo-users/setting/${user.id}`;
            Object.assign(settingLink.style, {
                ...btnStyle(),
                textDecoration: "none",
                display: "inline-block",
            });
            wrapper.appendChild(settingLink);

            td.appendChild(wrapper);
            return td;
        },
        [data, onModulesClick, onDataAssignClick, onParentClick, hasPermission]
    );

    const columns: Handsontable.ColumnSettings[] = [
        {
            title: "ID",
            data: 0,
            width: 50,
            readOnly: false,
            renderer: idRenderer as any,
        },
        {
            title: "Role *",
            data: 1,
            width: 130,
            type: "dropdown",
            source: USER_ROLES.map((r) => r.value),
            renderer: roleRenderer as any,
            allowInvalid: false,
        },
        {
            title: "Username",
            data: 2,
            width: 120,
            type: "text",
            renderer: usernameRenderer as any,
        },
        {
            title: "Mobile",
            data: 3,
            width: 110,
            type: "text",
        },
        {
            title: "Modules Code",
            data: 4,
            width: 160,
            readOnly: true,
            renderer: codeRenderer as any,
        },
        {
            title: "Permission Code",
            data: 5,
            width: 130,
            readOnly: true,
            renderer: codeRenderer as any,
        },
        {
            title: "Assign Code",
            data: 6,
            width: 180,
            readOnly: true,
            renderer: codeRenderer as any,
        },
        {
            title: "Actions",
            data: 7,
            width: 260,
            readOnly: true,
            renderer: actionsRenderer as any,
        },
    ];

    // Column IDs in order (parallel to columns array)
    const COL_IDS = [
        "id",
        "role",
        "username",
        "mobile",
        "modulesCode",
        "permission_code",
        "assignmentCode",
        "actions",
    ];

    const handleAfterChange = useCallback(
        (changes: Handsontable.CellChange[] | null, source: string) => {
            if (!changes || source === "loadData") return;
            changes.forEach(([row, col, oldVal, newVal]) => {
                if (oldVal === newVal) return;
                const colIndex = typeof col === "number" ? col : Number(col);
                const colId = COL_IDS[colIndex];
                if (!colId || colId === "id" || colId === "actions") return;
                onUpdateCell(row, colId, newVal);
            });
        },
        [onUpdateCell]
    );

    // Determine read-only rows (blank rows)
    const cells = useCallback(
        (row: number): Handsontable.CellMeta => {
            const user = data[row];
            if (user && user.id && String(user.id).startsWith("blank-")) {
                return { readOnly: true };
            }
            return {};
        },
        [data]
    );

    if (loading && data.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "200px",
                }}
            >
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        border: "3px solid #e5e7eb",
                        borderTopColor: "#3b82f6",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            <style>{`
        /* Handsontable style overrides */
        .htCore td {
          font-size: 12px;
          color: #111827;
          border-color: #e5e7eb !important;
        }
        .htCore th {
          background: #f3f4f6 !important;
          color: #374151 !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          border-color: #d1d5db !important;
        }
        .htCore tr:hover td {
          background-color: #f0f9ff !important;
        }
        .htCore td.htDimmed {
          background-color: #f9fafb !important;
          color: #9ca3af !important;
        }
        .htDropdownMenu .listbox .option {
          font-size: 12px;
        }
      `}</style>
            <HotTable
                ref={hotRef}
                data={tableData}
                columns={columns}
                cells={cells}
                colHeaders={true}
                rowHeaders={false}
                width="100%"
                height={data.length === 0 ? 100 : Math.min(data.length * 42 + 50, 550)}
                licenseKey="non-commercial-and-evaluation"
                afterChange={handleAfterChange}
                stretchH="all"
                manualColumnResize={true}
                columnSorting={true}
                contextMenu={false}
                copyPaste={true}
                outsideClickDeselects={true}
                autoWrapRow={true}
                autoWrapCol={true}
                wordWrap={false}
                className="htMiddle"
                tableClassName="tbo-users-hot"
            />
        </div>
    );
}
