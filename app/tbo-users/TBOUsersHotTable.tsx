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

function getParentName(user: any): string {
    if (user?.p?.name) return String(user.p.name);
    if (user?.parent?.name) return String(user.parent.name);
    if (user?.parent_name) return String(user.parent_name);
    if (user?.p_name) return String(user.p_name);
    if (Array.isArray(user?.parents) && user.parents.length > 0) {
        return user.parents
            .map((item: any) => item?.name || item?.username || item?.label || item?.id)
            .filter(Boolean)
            .join(", ");
    }
    return "";
}

function parseAccessObject(value: any) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                const parsed = JSON.parse(trimmed);
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    return parsed;
                }
            } catch {
                // Ignore invalid JSON
            }
        }
    }

    return {};
}

function getLoginAccess(user: any) {
    const loginAccess = parseAccessObject(user?.login_access);
    const lastLoginAccess = parseAccessObject(user?.last_login);
    const rawAccess =
        Object.keys(loginAccess).length > 0 ? loginAccess : lastLoginAccess;

    const permissionList = Array.isArray(user?.permissions)
        ? user.permissions.map((item: any) => String(item).toLowerCase())
        : String(user?.permissions || "")
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);

    const codeText = String(user?.permission_code || "").toLowerCase();

    const hasPermission = (key: string) =>
        permissionList.includes(key) || codeText.includes(key);

    const webValue = rawAccess?.web;
    const mobileValue = rawAccess?.mobile ?? rawAccess?.app;

    return {
        web:
            typeof webValue === "boolean" ? webValue : hasPermission("web"),
        mobile:
            typeof mobileValue === "boolean"
                ? mobileValue
                : hasPermission("app") || hasPermission("mobile"),
    };
}

function getPassPin(user: any): string {
    return String(
        user?.pass_pin || user?.passPin || user?.pin || user?.password || ""
    ).trim();
}

function parseMaybeJSON(value: any, fallback: any = null) {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "object") return value;

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function normalizeArrayValue(value: any) {
    if (Array.isArray(value)) return value;
    const parsed = parseMaybeJSON(value, []);
    return Array.isArray(parsed) ? parsed : [];
}

function normalizeObjectValue(value: any, fallback: any = {}) {
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
    return parseMaybeJSON(value, fallback) || fallback;
}

function toDisplay(value: any): string {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map((item) => toDisplay(item)).join(", ");
    }
    if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
    }
    return String(value);
}

interface TBOUsersHotTableProps {
    data: any[];
    loading: boolean;
    onUpdateCell: (userId: number, colId: string, value: any) => void;
    onManageUser: (user: any) => void;
    onModulesClick: (user: any) => void;
    onDataAssignClick: (user: any) => Promise<void>;
    onParentClick: (user: any) => void;
    selectedUserIds?: Set<number>;
    onSelectionChange?: (selectedIds: Set<number>) => void;
    hasPermission?: (perm: string) => boolean;
}

export default function TBOUsersHotTable({
    data,
    loading,
    onUpdateCell,
    onManageUser,
    onModulesClick,
    onDataAssignClick,
    onParentClick,
    selectedUserIds = new Set(),
    onSelectionChange,
    hasPermission,
}: TBOUsersHotTableProps) {
    const hotRef = useRef<any>(null);

    // Convert data to row array for HOT
    const tableData = data.map((user, index) => {
        const isBlank = user.id && String(user.id).startsWith("blank-");
        const loginAccess = getLoginAccess(user);

        return [
            isBlank ? "" : false, // Checkbox column (initially unchecked)
            isBlank ? "" : user.id,
            isBlank ? "" : (user.role || ""),
            isBlank ? "" : getParentName(user),
            isBlank ? "" : (user.name || user.username || ""),
            isBlank ? "" : loginAccess.web,
            isBlank ? "" : loginAccess.mobile,
            isBlank ? "" : getPassPin(user),
            isBlank ? "" : (user.mobile || user.mobile_no || ""),
            isBlank ? "" : getModulesCode(user),
            isBlank ? "" : (user.permission_code || ""),
            isBlank ? "" : getAssignCode(user),
            "",
        ];
    });

    // Custom renderer for Checkbox column
    const checkboxRenderer = useCallback(
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
            td.style.textAlign = "center";
            td.style.verticalAlign = "middle";
            td.style.backgroundColor = "#f9fafb";

            const user = data[row];
            if (!user || !user.id) {
                return td;
            }

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = selectedUserIds.has(user.id);
            checkbox.style.cursor = "pointer";
            checkbox.addEventListener("change", (e) => {
                e.stopPropagation();
                const newSelectedIds = new Set(selectedUserIds);
                if ((e.target as HTMLInputElement).checked) {
                    newSelectedIds.add(user.id);
                } else {
                    newSelectedIds.delete(user.id);
                }
                onSelectionChange?.(newSelectedIds);
            });

            td.appendChild(checkbox);
            return td;
        },
        [data, selectedUserIds, onSelectionChange]
    );

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
            td.style.textAlign = "center";
            td.style.verticalAlign = "middle";
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

    const rowNumberRenderer = useCallback(
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
            td.style.textAlign = "center";

            td.textContent = value ? String(value) : "-";
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
            span.addEventListener("dblclick", (e) => {
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

    const accessRenderer = useCallback(
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
            td.style.textAlign = "center";
            td.style.verticalAlign = "middle";
            td.style.backgroundColor = "#f9fafb";

            const user = data[row];
            const isBlank = user && user.id && String(user.id).startsWith("blank-");

            if (isBlank || !user?.id) {
                td.style.color = "#9ca3af";
                td.textContent = "-";
                return td;
            }

            const accessKey = col === 5 ? "web" : "mobile";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = value === true;
            checkbox.style.width = "15px";
            checkbox.style.height = "15px";
            checkbox.style.margin = "0";
            checkbox.style.cursor = "pointer";
            checkbox.style.accentColor = "#16a34a";

            checkbox.addEventListener("click", (e) => {
                e.stopPropagation();
            });

            checkbox.addEventListener("change", (e) => {
                e.stopPropagation();
                const checked = (e.target as HTMLInputElement).checked;
                const currentAccess = getLoginAccess(user);

                onUpdateCell(Number(user.id), "login_access", {
                    ...currentAccess,
                    [accessKey]: checked,
                });
            });

            td.appendChild(checkbox);
            return td;
        },
        [data, onUpdateCell]
    );

    const buildHoverCard = (
        title: string,
        sections: Array<{ title: string; rows: Array<{ label: string; value: any }> }>
    ) => {
        const card = document.createElement("div");
        card.style.position = "fixed";
        card.style.zIndex = "99999";
        card.style.minWidth = "320px";
        card.style.maxWidth = "520px";
        card.style.maxHeight = "420px";
        card.style.overflowY = "auto";
        card.style.background = "#ffffff";
        card.style.border = "1px solid #d1d5db";
        card.style.borderRadius = "10px";
        card.style.boxShadow = "0 10px 30px rgba(0,0,0,0.18)";
        card.style.padding = "12px";
        card.style.fontSize = "12px";
        card.style.lineHeight = "1.45";
        card.style.color = "#111827";
        card.style.pointerEvents = "auto";

        const heading = document.createElement("div");
        heading.textContent = title;
        heading.style.fontWeight = "700";
        heading.style.fontSize = "13px";
        heading.style.marginBottom = "10px";
        heading.style.color = "#111827";
        card.appendChild(heading);

        sections.forEach((section) => {
            if (!section.rows.length) return;

            const sectionTitle = document.createElement("div");
            sectionTitle.textContent = section.title;
            sectionTitle.style.fontWeight = "600";
            sectionTitle.style.fontSize = "12px";
            sectionTitle.style.marginTop = "8px";
            sectionTitle.style.marginBottom = "6px";
            sectionTitle.style.color = "#4f46e5";
            card.appendChild(sectionTitle);

            section.rows.forEach((row) => {
                const rowWrap = document.createElement("div");
                rowWrap.style.display = "grid";
                rowWrap.style.gridTemplateColumns = "120px 1fr";
                rowWrap.style.gap = "8px";
                rowWrap.style.padding = "4px 0";
                rowWrap.style.borderBottom = "1px dashed #e5e7eb";

                const label = document.createElement("div");
                label.textContent = row.label;
                label.style.fontWeight = "600";
                label.style.color = "#374151";

                const value = document.createElement("div");
                value.textContent = toDisplay(row.value);
                value.style.whiteSpace = "pre-wrap";
                value.style.wordBreak = "break-word";
                value.style.color = "#111827";

                rowWrap.appendChild(label);
                rowWrap.appendChild(value);
                card.appendChild(rowWrap);
            });
        });

        return card;
    };

    const modulesCodeHoverRenderer = useCallback(
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

            const user = data[row];
            const isBlank = user && user.id && String(user.id).startsWith("blank-");

            if (isBlank) {
                td.style.color = "#9ca3af";
                td.style.fontSize = "11px";
                td.textContent = "-";
                return td;
            }

            const code = value ? String(value) : "-";
            const assignedModules =
                normalizeArrayValue(user?.assignedModules).length > 0
                    ? normalizeArrayValue(user?.assignedModules)
                    : normalizeArrayValue(user?.assigned_modules);

            const wrapper = document.createElement("div");
            wrapper.style.display = "inline-flex";
            wrapper.style.alignItems = "center";
            wrapper.style.justifyContent = "center";
            wrapper.style.position = "relative";
            wrapper.style.maxWidth = "100%";

            const span = document.createElement("span");
            span.textContent = code;
            span.style.fontSize = "11px";
            span.style.fontFamily = "monospace";
            span.style.color = code !== "-" ? "#1e40af" : "#6b7280";
            span.style.backgroundColor = code !== "-" ? "#eff6ff" : "#f3f4f6";
            span.style.padding = "2px 6px";
            span.style.borderRadius = "4px";
            span.style.cursor = "pointer";
            span.title = code !== "-" ? code : "No code";

            let hoverCard: HTMLDivElement | null = null;
            let hideTimer: ReturnType<typeof setTimeout> | null = null;

            const showCard = () => {
                if (code === "-") return;
                if (hideTimer) {
                    clearTimeout(hideTimer);
                    hideTimer = null;
                }
                if (hoverCard) return;

                hoverCard = buildHoverCard("Modules Code Details", [
                    {
                        title: "User",
                        rows: [
                            { label: "Username", value: user?.username || user?.name || "-" },
                            { label: "Modules Code", value: code },
                        ],
                    },
                    {
                        title: "Assigned Modules",
                        rows: assignedModules.length
                            ? assignedModules.map((item: any, index: number) => ({
                                label: `Module ${index + 1}`,
                                value: item,
                            }))
                            : [{ label: "Assigned Modules", value: "No assigned modules" }],
                    },
                ]) as HTMLDivElement;

                document.body.appendChild(hoverCard);

                const rect = span.getBoundingClientRect();
                hoverCard.style.top = `${rect.bottom + 8}px`;
                hoverCard.style.left = `${Math.min(rect.left, window.innerWidth - 540)}px`;

                hoverCard.addEventListener("mouseenter", showCard);
                hoverCard.addEventListener("mouseleave", hideCardDelayed);
            };

            const hideCard = () => {
                if (hideTimer) {
                    clearTimeout(hideTimer);
                    hideTimer = null;
                }
                if (hoverCard && hoverCard.parentNode) {
                    hoverCard.parentNode.removeChild(hoverCard);
                }
                hoverCard = null;
            };

            const hideCardDelayed = () => {
                if (hideTimer) clearTimeout(hideTimer);
                hideTimer = setTimeout(() => {
                    hideCard();
                }, 180);
            };

            wrapper.addEventListener("mouseenter", showCard);
            wrapper.addEventListener("mouseleave", hideCardDelayed);

            span.addEventListener("click", (e) => e.stopPropagation());

            wrapper.appendChild(span);
            td.appendChild(wrapper);
            return td;
        },
        [data]
    );

    const permissionCodeHoverRenderer = useCallback(
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

            const user = data[row];
            const isBlank = user && user.id && String(user.id).startsWith("blank-");

            if (isBlank) {
                td.style.color = "#9ca3af";
                td.style.fontSize = "11px";
                td.textContent = "-";
                return td;
            }

            const code = value ? String(value) : "-";
            const hoverDetails = normalizeObjectValue(user?.hover_details, {});
            const hoverUser = normalizeObjectValue(hoverDetails?.user, {});
            const hoverPermissions = normalizeArrayValue(hoverDetails?.user_permissions);
            const hoverAssignments = normalizeArrayValue(hoverDetails?.user_data_assignments);

            const wrapper = document.createElement("div");
            wrapper.style.display = "inline-flex";
            wrapper.style.alignItems = "center";
            wrapper.style.justifyContent = "center";
            wrapper.style.position = "relative";
            wrapper.style.maxWidth = "100%";

            const span = document.createElement("span");
            span.textContent = code;
            span.style.fontSize = "11px";
            span.style.fontFamily = "monospace";
            span.style.color = code !== "-" ? "#1e40af" : "#6b7280";
            span.style.backgroundColor = code !== "-" ? "#eff6ff" : "#f3f4f6";
            span.style.padding = "2px 6px";
            span.style.borderRadius = "4px";
            span.style.cursor = "pointer";
            span.title = code !== "-" ? code : "No code";

            let hoverCard: HTMLDivElement | null = null;
            let hideTimer: ReturnType<typeof setTimeout> | null = null;

            const showCard = () => {
                if (code === "-") return;
                if (hideTimer) {
                    clearTimeout(hideTimer);
                    hideTimer = null;
                }
                if (hoverCard) return;

                hoverCard = buildHoverCard("Permission Code Details", [
                    {
                        title: "User Table",
                        rows: [
                            { label: "Username", value: hoverUser?.username || user?.username || "-" },
                            { label: "Role", value: hoverUser?.role || user?.role || "-" },
                            { label: "Mobile", value: hoverUser?.mobile_no || user?.mobile_no || "-" },
                            { label: "Permission Code", value: hoverUser?.permission_code || code }
                        ],
                    },
                    {
                        title: "User Data Assignments Table",
                        rows: hoverAssignments.length
                            ? hoverAssignments.map((item: any, index: number) => ({
                                label: `Assign ${index + 1}`,
                                value: `db_table: ${item?.db_table ?? "-"}, wise_type: ${item?.wise_type ?? "-"}, data_id: ${item?.data_id ?? "-"}, block_id: ${item?.block_id ?? "-"}, gp_ward_id: ${item?.gp_ward_id ?? "-"}, village_id: ${item?.village_id ?? "-"}, ac_id: ${item?.ac_id ?? "-"}, bhag_no: ${item?.bhag_no ?? "-"}, sec_no: ${item?.sec_no ?? "-"}, mandal_id: ${item?.mandal_id ?? "-"}, kendra_id: ${item?.kendra_id ?? "-"}, cast_filter: ${item?.cast_filter ?? "-"}`
                            }))
                            : [{ label: "Assignments", value: "No data assignments" }],
                    },
                ]) as HTMLDivElement;

                document.body.appendChild(hoverCard);

                const rect = span.getBoundingClientRect();
                hoverCard.style.top = `${rect.bottom + 8}px`;
                hoverCard.style.left = `${Math.min(rect.left, window.innerWidth - 540)}px`;

                hoverCard.addEventListener("mouseenter", showCard);
                hoverCard.addEventListener("mouseleave", hideCardDelayed);
            };

            const hideCard = () => {
                if (hideTimer) {
                    clearTimeout(hideTimer);
                    hideTimer = null;
                }
                if (hoverCard && hoverCard.parentNode) {
                    hoverCard.parentNode.removeChild(hoverCard);
                }
                hoverCard = null;
            };

            const hideCardDelayed = () => {
                if (hideTimer) clearTimeout(hideTimer);
                hideTimer = setTimeout(() => {
                    hideCard();
                }, 180);
            };

            wrapper.addEventListener("mouseenter", showCard);
            wrapper.addEventListener("mouseleave", hideCardDelayed);

            span.addEventListener("click", (e) => e.stopPropagation());

            wrapper.appendChild(span);
            td.appendChild(wrapper);
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

            const user = data[row];
            const isBlank = user && user.id && String(user.id).startsWith("blank-");

            if (isBlank) {
                td.style.color = "#9ca3af";
                td.style.fontSize = "11px";
                td.textContent = "-";
                return td;
            }

            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.alignItems = "center";
            wrapper.style.justifyContent = "center";
            wrapper.style.gap = "6px";
            wrapper.style.maxWidth = "100%";

            const span = document.createElement("span");
            span.textContent = value ? String(value) : "-";
            span.style.fontSize = "11px";
            span.style.fontFamily = "monospace";
            span.style.color = value ? "#1e40af" : "#6b7280";
            span.style.backgroundColor = value ? "#eff6ff" : "#f3f4f6";
            span.style.padding = "2px 6px";
            span.style.borderRadius = "4px";
            span.style.overflow = "hidden";
            span.style.textOverflow = "ellipsis";
            span.style.whiteSpace = "nowrap";
            span.style.maxWidth = "100%";
            span.style.textAlign = "center";
            span.title = value ? String(value) : "-";

            wrapper.appendChild(span);

            td.appendChild(wrapper);
            return td;
        },
        [data]
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
            td.style.padding = "0";
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
                marginRight: "0",
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            });

            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.flexWrap = "wrap";
            wrapper.style.gap = "0";
            wrapper.style.alignItems = "stretch";
            wrapper.style.justifyContent = "stretch";
            wrapper.style.width = "100%";
            wrapper.style.height = "100%";

            // Modules button
            // const modulesBtn = document.createElement("button");
            // modulesBtn.textContent = "Modules";
            // Object.assign(modulesBtn.style, btnStyle());
            // modulesBtn.addEventListener("click", (e) => {
            //     e.stopPropagation();
            //     onModulesClick(user);
            // });
            // wrapper.appendChild(modulesBtn);

            // Data Assign button
            // if (hasPermission("users:update") && Number(user.id)) {
            //     const dataBtn = document.createElement("button");
            //     dataBtn.textContent = "Data Assign";
            //     Object.assign(dataBtn.style, btnStyle());
            //     dataBtn.addEventListener("click", async (e) => {
            //         e.stopPropagation();
            //         await onDataAssignClick(user);
            //     });
            //     wrapper.appendChild(dataBtn);
            // }

            // Team button
            // const isNew =
            //     user.id && (String(user.id).startsWith("new") || String(user.id).startsWith("blank-"));
            // if (!isNew) {
            //     const teamBtn = document.createElement("button");
            //     teamBtn.textContent = "Team";
            //     Object.assign(teamBtn.style, btnStyle());
            //     teamBtn.addEventListener("click", (e) => {
            //         e.stopPropagation();
            //         onParentClick(user);
            //     });
            //     wrapper.appendChild(teamBtn);
            // }

            // Setting link
            const settingLink = document.createElement("a");
            settingLink.textContent = "Setting";
            settingLink.href = `/tbo-users/setting/${user.id}`;
            Object.assign(settingLink.style, {
                ...btnStyle(),
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                minHeight: "32px",
                borderRadius: "0",
                boxShadow: "none",
                textAlign: "center",
            });
            wrapper.appendChild(settingLink);

            td.appendChild(wrapper);
            return td;
        },
        [data, onModulesClick, onDataAssignClick, onParentClick, hasPermission]
    );

    const MOBILE_COL_INDEX = 8;

    const handleBeforeKeyDown = useCallback((event: KeyboardEvent) => {
        const hot = hotRef.current?.hotInstance as any;
        if (!hot) return;

        const selected = hot.getSelectedLast?.();
        if (!selected) return;

        const [, col] = selected;
        if (col !== MOBILE_COL_INDEX) return;

        const editor = hot.getActiveEditor?.() as any;
        const textarea = editor?.TEXTAREA as HTMLTextAreaElement | undefined;

        if (textarea) {
            textarea.maxLength = 10;
            textarea.inputMode = "numeric";
        }

        if (event.ctrlKey || event.metaKey || event.altKey) return;

        const allowedKeys = [
            "Backspace",
            "Delete",
            "Tab",
            "Escape",
            "Enter",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
        ];

        if (allowedKeys.includes(event.key)) return;

        if (!/^\d$/.test(event.key)) {
            event.preventDefault();
            event.stopImmediatePropagation?.();
            return;
        }

        const currentValue = textarea?.value || "";
        const hasSelection = textarea
            ? textarea.selectionStart !== textarea.selectionEnd
            : false;

        if (currentValue.length >= 10 && !hasSelection) {
            event.preventDefault();
            event.stopImmediatePropagation?.();
        }
    }, []);

    const columns: Handsontable.ColumnSettings[] = [
        {
            title: "",
            data: 0,
            width: 35,
            readOnly: false,
            renderer: checkboxRenderer as any,
        },
        {
            title: "ID",
            data: 1,
            width: 40,
            readOnly: false,
            renderer: idRenderer as any,
        },
        {
            title: "Role *",
            data: 2,
            width: 130,
            type: "dropdown",
            source: USER_ROLES.map((r) => r.value),
            renderer: roleRenderer as any,
            allowInvalid: false,
        },
        {
            title: "P.NAME",
            data: 3,
            width: 100,
            type: "text",
            readOnly: true,
        },
        {
            title: "NAME",
            data: 4,
            width: 100,
            type: "text",
            renderer: usernameRenderer as any,
        },
        {
            title: "WEB",
            data: 5,
            width: 40,
            readOnly: true,
            renderer: accessRenderer as any,
        },
        {
            title: "MOBILE",
            data: 6,
            width: 55,
            readOnly: true,
            renderer: accessRenderer as any,
        },
        {
            title: "PASS/PIN",
            data: 7,
            width: 90,
            readOnly: true,
            renderer: codeRenderer as any,
        },
        {
            title: "Mobile",
            data: 8,
            width: 110,
            type: "text",
        },
        {
            title: "Modules Code",
            data: 9,
            width: 100,
            readOnly: true,
            renderer: modulesCodeHoverRenderer as any,
        },
        {
            title: "Permission Code",
            data: 10,
            width: 110,
            readOnly: true,
            renderer: permissionCodeHoverRenderer as any,
        },
        {
            title: "Actions",
            data: 12,
            width: 150,
            readOnly: true,
            renderer: actionsRenderer as any,
        },
    ];

    // Column IDs in order (parallel to columns array)
    const COL_IDS = [
        "select",
        "id",
        "role",
        "parent_name",
        "username",
        "web_access",
        "mobile_access",
        "pass_pin",
        "mobile",
        "modules_code",
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

                if (!colId || colId === "row_number" || colId === "id" || colId === "actions") return;

                const userId = data[row]?.id;
                if (!userId) return;

                let nextValue = newVal;

                if (colId === "mobile") {
                    nextValue = String(newVal ?? "").replace(/\D/g, "").slice(0, 10);
                    if (nextValue !== newVal) {
                        hotRef.current?.hotInstance?.setDataAtCell(row, colIndex, nextValue, "mobile-sanitize");
                    }
                }

                onUpdateCell(userId, colId, nextValue);
            });
        },
        [onUpdateCell, data]
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
        <div
            style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                height: "100%",
                overflowX: "auto",
                overflowY: "hidden",
            }}
        >
            <style>{`
        /* Handsontable style overrides */
        .htCore td {
          font-size: 12px;
          color: #111827;
          border-color: #e5e7eb !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        .htCore th {
          background: #f3f4f6 !important;
          color: #374151 !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          border-color: #d1d5db !important;
          text-align: center !important;
          text-transform: uppercase !important;
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
                rowHeaders={true}
                width="100%"
                height={data.length === 0 ? 100 : Math.min(data.length * 42 + 50, 640)}
                licenseKey="non-commercial-and-evaluation"
                afterChange={handleAfterChange}
                beforeKeyDown={handleBeforeKeyDown}
                stretchH="all"
                manualColumnResize={true}
                columnSorting={true}
                contextMenu={false}
                copyPaste={true}
                outsideClickDeselects={true}
                autoWrapRow={true}
                autoWrapCol={true}
                wordWrap={false}
                className="htMiddle htCenter"
                tableClassName="tbo-users-hot"
            />
        </div>
    );
}
