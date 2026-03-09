/**
 * AdvancedExcelDataTable - Excel-like data table component
 * 
 * Features:
 * - Cell selection with keyboard navigation (Arrow keys)
 * - Range selection with Shift + Arrow keys
 * - Edit cells with F2 key or Double-click
 * - Copy/Paste with Ctrl+C/Ctrl+V
 * - Undo/Redo with Ctrl+Z/Ctrl+Shift+Z
 * - Column resizing, sorting, and filtering
 * - Export/Import Excel files
 * - Row selection
 * - Real-time cell updates with visual feedback
 */

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import { flushSync } from 'react-dom';
import {
  Copy,
  Clipboard,
  Download,
  Upload,
  Undo,
  Redo,
  Save,
  ArrowUpDown,
  Filter,
  X,
  Check,
  Edit3
} from 'lucide-react';
import { Workbook } from 'exceljs';

// Custom CSS for Excel-like table
const excelStyles = `
  .table-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;
  }
  .advanced-excel-table {
    position: relative;
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    font-size: 11px;
    font-family: 'Calibri', 'Arial', sans-serif;
    background: white;
    border: 1px solid #c0c0c0;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .advanced-excel-table.selecting {
    cursor: cell !important;
  }
  .advanced-excel-table.selecting * {
    cursor: cell !important;
  }
  .advanced-excel-table th,
  .advanced-excel-table td {
    border-right: 1px solid #d4d4d4;
    border-bottom: 1px solid #d4d4d4;
    padding: 2px 4px;
    text-align: center;
    vertical-align: middle;
    position: relative;
    min-width: 64px;
    height: 21px;
    line-height: 17px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: white;
    user-select: none;
  }
  .advanced-excel-table th {
    background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 30;
    cursor: pointer;
    user-select: none;
    border-bottom: 1px solid #a6a6a6;
    height: 20px;
    padding: 1px 4px;
    font-size: 11px;
    color: #333;
    text-align: center;
  }
  .advanced-excel-table th:hover {
    background: linear-gradient(180deg, #e8e8e8 0%, #d8d8d8 100%);
  }
  .advanced-excel-table th:active {
    background: linear-gradient(180deg, #d8d8d8 0%, #c8c8c8 100%);
  }
  .advanced-excel-table th.header-highlight {
    background: linear-gradient(180deg, #e7efff 0%, #d6e6ff 100%) !important;
    box-shadow: inset 0 -2px 0 #1d4ed8;
  }
  .advanced-excel-table .row-number {
    background: linear-gradient(90deg, #f5f5f5 0%, #e8e8e8 100%);
    font-weight: 400;
    position: sticky;
    left: 0;
    z-index: 10;
    min-width: 40px;
    width: 40px;
    max-width: 40px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    border-right: 1px solid #a6a6a6;
    font-size: 11px;
    color: #333;
    height: 21px;
    padding: 2px;
  }
  .advanced-excel-table .row-number:hover {
    background: linear-gradient(90deg, #e8e8e8 0%, #d8d8d8 100%);
  }
  .advanced-excel-table .row-number:active {
    background: linear-gradient(90deg, #d8d8d8 0%, #c8c8c8 100%);
  }
  .advanced-excel-table th.row-number {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 40;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  }
  .advanced-excel-table .cell-selected {
    outline: none;
    box-shadow: inset 0 0 0 2px #1d4ed8;
    padding: 0 !important;
    background-color: white !important;
    z-index: 5;
    position: relative;
  }
  .advanced-excel-table td[data-selected] > div {
    outline: none;
    box-shadow: inset 0 0 0 2px #1d4ed8;
    background-color: white !important;
    z-index: 5;
    position: relative;
  }
  .advanced-excel-table td[data-in-range]:not([data-selected]) > div {
    background-color: rgba(29, 78, 216, 0.08) !important;
    outline: none;
    box-shadow: inset 0 0 0 1px rgba(29, 78, 216, 0.7);
  }
  .advanced-excel-table .fill-handle {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 8px;
    height: 8px;
    background-color: #1d4ed8;
    border: 1px solid white;
    cursor: crosshair;
    z-index: 15;
    box-shadow: 0 0 2px rgba(0,0,0,0.3);
  }
  .advanced-excel-table .fill-handle:hover {
    transform: scale(1.2);
  }
  .advanced-excel-table .cell-fill-preview {
    background-color: rgba(29, 78, 216, 0.15) !important;
    outline: 1px dashed #1d4ed8;
    outline-offset: -1px;
  }
  .advanced-excel-table .cell-editing {
    outline: 2px solid #1d4ed8 !important;
    outline-offset: -1px;
    padding: 0 !important;
    background: white !important;
    z-index: 15;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
  .advanced-excel-table .cell-in-range {
    background-color: rgba(29, 78, 216, 0.08) !important;
    outline: none;
    box-shadow: inset 0 0 0 1px rgba(29, 78, 216, 0.7);
    padding: 0 !important;
  }
  .advanced-excel-table .cell-editing input {
    width: 100%;
    height: 100%;
    border: none;
    padding: 2px 4px;
    font-size: 14px;
    line-height: 17px;
    font-family: 'Calibri', 'Arial', sans-serif;
    outline: none;
    background: white;
    box-sizing: border-box;
    user-select: text;
  }
  .advanced-excel-table .cell-copying {
    outline: 2px dashed #1d4ed8;
    outline-offset: -1px;
    animation: marchingAnts 1s linear infinite;
  }
  @keyframes marchingAnts {
    0% { outline-offset: -1px; }
    100% { outline-offset: -3px; }
  }
  .advanced-excel-table .row-selected {
    background-color: #e8f4f8 !important;
  }
  .advanced-excel-table .cell-updated {
    background-color: #fff9e6 !important;
    animation: flash 0.6s ease-in-out;
  }
  @keyframes flash {
    0%, 100% { background-color: white; }
    50% { background-color: #fff9e6; }
  }
  .advanced-excel-table tbody tr:hover td {
    background-color: #f5f5f5;
  }
  .advanced-excel-table tbody tr:hover .row-number {
    background: linear-gradient(90deg, #e8e8e8 0%, #d8d8d8 100%);
  }
  .excel-toolbar {
    display: flex;
    gap: 6px;
    padding: 8px 10px;
    background: linear-gradient(180deg, #f0f0f0 0%, #e5e5e5 100%);
    border-bottom: 1px solid #c0c0c0;
    flex-wrap: wrap;
    align-items: center;
    border-top: 1px solid #c0c0c0;
  }
  .excel-toolbar button {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
    border: 1px solid #adadad;
    border-radius: 2px;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.1s;
    height: 22px;
    color: #333;
  }
  .excel-toolbar button:hover:not(:disabled) {
    background: linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 100%);
    border-color: #707070;
  }
  .excel-toolbar button:active:not(:disabled) {
    background: linear-gradient(180deg, #e0e0e0 0%, #d0d0d0 100%);
  }
  .excel-toolbar button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .excel-toolbar button.active {
    background: linear-gradient(180deg, #d0e8f1 0%, #b0d5e8 100%);
    border-color: #1d4ed8;
    color: #1d4ed8;
  }
  .column-filter {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 30;
    min-width: 200px;
  }
  .column-filter input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 12px;
  }
  .resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    height: 100%;
    width: 4px;
    cursor: col-resize;
    user-select: none;
    touch-action: none;
    z-index: 25;
  }
  .resize-handle:hover {
    background-color: #1d4ed8;
    border-right: 2px solid #1d4ed8;
  }
  .resize-handle.resizing {
    background-color: #1d4ed8;
    border-right: 2px solid #1d4ed8;
  }
  .context-menu {
    position: fixed;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 150px;
  }
  .context-menu-item {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .context-menu-item:hover {
    background: #f8f9fa;
  }
  .context-menu-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 8px;
    background: linear-gradient(180deg, #f0f0f0 0%, #e5e5e5 100%);
    border-top: 1px solid #c0c0c0;
    font-size: 11px;
    color: #333;
    height: 22px;
    font-family: 'Calibri', 'Arial', sans-serif;
  }
  .table-container {
    overflow: auto;
    border: 1px solid #c0c0c0;
    background: white;
    position: relative;
  }
  .table-container::-webkit-scrollbar {
    width: 17px;
    height: 17px;
  }
  .table-container::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
  .table-container::-webkit-scrollbar-thumb {
    background: #c0c0c0;
    border: 1px solid #a0a0a0;
  }
  .table-container::-webkit-scrollbar-thumb:hover {
    background: #a0a0a0;
  }
  .table-container::-webkit-scrollbar-corner {
    background: #f0f0f0;
  }
`;

interface GenericData {
  [key: string]: any;
}

interface ExcelColumn {
  id?: string;
  accessorKey?: string;
  header: string;
  size?: number;
  readOnly?: boolean;
  type?: 'text' | 'number' | 'date' | 'select';
  selectOptions?: { value: string; label: string }[];
  getCellOptions?: (rowData: any) => { value: string; label: string }[];
  cell?: (props: { row: { original: any; index: number }; getValue: () => any }) => React.ReactNode;
}

type SortDirection = 'asc' | 'desc';
type SortingState = { id: string; desc: boolean }[];
type ColumnFiltersState = { id: string; value: string }[];
type VisibilityState = Record<string, boolean>;

interface TableColumn<T extends GenericData> {
  id: string;
  accessorKey: string;
  header: string;
  size: number;
  readOnly?: boolean;
  type?: ExcelColumn['type'];
  renderCell: (rowData: T, rowIndex: number) => React.ReactNode;
}

interface AdvancedExcelDataTableProps<T extends GenericData> {
  data: T[];
  columns: ExcelColumn[];
  loading?: boolean;
  onUpdateCell?: (rowIndex: number, columnId: string, value: any) => Promise<void>;
  onBulkUpdate?: (updates: Array<{ rowIndex: number, columnId: string, value: any }>) => Promise<void>;
  enableCopyPaste?: boolean;
  canCopyColumn?: (columnId: string) => boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnResize?: boolean;
  enableRowSelection?: boolean;
  enableUndoRedo?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  onDataChange?: (newData: T[]) => void;
}

interface CellPosition {
  row: number;
  column: string;
}

interface HistoryEntry {
  type: 'edit' | 'bulk';
  changes: Array<{ row: number; column: string; oldValue: any; newValue: any }>;
}

// Separate component for edit input to prevent re-mounting issues
const EditCellInput = React.memo(({
  initialValue,
  type,
  options,
  onSave,
  onCancel,
  inputRef
}: {
  initialValue: string;
  type?: string;
  options?: { value: string; label: string }[];
  onSave: (value: string, action: 'enter' | 'tab' | 'shift-tab' | 'blur') => void;
  onCancel: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  const [value, setValue] = React.useState(initialValue);
  const dataListId = React.useId();

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [inputRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(value, 'enter');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onSave(value, e.shiftKey ? 'shift-tab' : 'tab');
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type={type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(value, 'blur')}
        list={options && options.length > 0 ? dataListId : undefined}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          padding: '2px 4px',
          fontSize: '14px',
          lineHeight: '17px',
          fontFamily: "'Calibri', 'Arial', sans-serif",
          outline: 'none',
          background: 'white',
          boxSizing: 'border-box'
        }}
      />
      {options && options.length > 0 && (
        <datalist id={dataListId}>
          {options.map((opt, idx) => (
            <option key={`${opt.value}-${idx}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </datalist>
      )}
    </>
  );
});

function AdvancedExcelDataTable<T extends GenericData>({
  data: initialData,
  columns: initialColumns,
  loading = false,
  onUpdateCell,
  onBulkUpdate,
  enableCopyPaste = true,
  canCopyColumn,
  enableSorting = true,
  enableFiltering = true,
  enableColumnResize = true,
  enableRowSelection = true,
  enableUndoRedo = true,
  enableExport = true,
  enableImport = true,
  onDataChange,
}: AdvancedExcelDataTableProps<T>) {
  // State management
  const [data, setData] = useState<T[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<CellPosition | null>(null); // For range selection
  const lastSelectionRef = useRef<{ start: CellPosition; end: CellPosition } | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [copiedCells, setCopiedCells] = useState<any[][]>([]);
  const [copiedRange, setCopiedRange] = useState<{ start: CellPosition; end: CellPosition } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [updatedCells, setUpdatedCells] = useState<Set<string>>(new Set());
  const [columnSizes, setColumnSizes] = useState<Record<string, number>>({});
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragFillEnd, setDragFillEnd] = useState<CellPosition | null>(null);
  
  // Virtual scrolling state
  const [scrollTop, setScrollTop] = useState(0);
  const ROW_HEIGHT = 21; // Excel-like row height in pixels
  const BUFFER_ROWS = 10; // Extra rows to render above/below viewport
  const [isMouseSelecting, setIsMouseSelecting] = useState(false);
  const lastMultiSelectionRef = useRef<{ start: CellPosition; end: CellPosition } | null>(null);
  const highlightedColumns = useMemo(() => {
    const range = selectionEnd && selectedCell
      ? { start: selectedCell, end: selectionEnd }
      : selectedCell
        ? { start: selectedCell, end: selectedCell }
        : null;
    if (!range) return new Set<string>();

    const colIds = initialColumns.map(c => c.id || c.accessorKey || c.header);
    const startIdx = colIds.findIndex(id => id === range.start.column);
    const endIdx = colIds.findIndex(id => id === range.end.column);
    if (startIdx === -1 || endIdx === -1) return new Set<string>();

    const set = new Set<string>();
    const minIdx = Math.min(startIdx, endIdx);
    const maxIdx = Math.max(startIdx, endIdx);
    for (let i = minIdx; i <= maxIdx; i++) {
      if (colIds[i]) set.add(colIds[i] as string);
    }
    return set;
  }, [selectedCell, selectionEnd, initialColumns]);

  const tableRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);
  const visibleColumnsRef = useRef<TableColumn<T>[]>([]);

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Removed debug logs for performance

  // Cache column IDs for performance
  const colIdsCache = useMemo(() => {
    const ids = initialColumns.map(c => c.id || c.accessorKey || c.header);
    const indexMap = new Map<string, number>();
    ids.forEach((id, index) => {
      if (id) indexMap.set(id as string, index);
    });
    return indexMap;
  }, [initialColumns]);

  // Helper for range checking - optimized with cached column indices
  const isInRange = useCallback((row: number, col: string, range: { start: CellPosition; end: CellPosition }) => {
    const startColIdx = colIdsCache.get(range.start.column);
    const endColIdx = colIdsCache.get(range.end.column);
    const currentIdx = colIdsCache.get(col);

    if (startColIdx === undefined || endColIdx === undefined || currentIdx === undefined) return false;

    const startRow = Math.min(range.start.row, range.end.row);
    const endRow = Math.max(range.start.row, range.end.row);
    const startCol = Math.min(startColIdx, endColIdx);
    const endCol = Math.max(startColIdx, endColIdx);

    return row >= startRow && row <= endRow && currentIdx >= startCol && currentIdx <= endCol;
  }, [colIdsCache]);

  // Drag fill handler (Excel-like fill handle) - defined early for use in cell rendering
  const handleFillHandleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedCell) return;

    setIsDragging(true);
    setDragFillEnd(selectedCell);
  }, [selectedCell]);

  // Focus edit input when editing
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  // Cell interaction handlers - defined before tableColumns for use in cell renderers
  const handleCellClick = useCallback((row: number, column: string, e?: React.MouseEvent) => {
    const inExistingRange =
      selectionEnd &&
      selectedCell &&
      isInRange(row, column, { start: selectedCell, end: selectionEnd });

    // Batch state updates for instant UI response
    flushSync(() => {
      setSelectedCell({ row, column });
      if (e && e.shiftKey && selectedCell) {
        setSelectionEnd({ row, column });
      } else if (inExistingRange) {
        // Preserve current selection range when clicking inside it
        setSelectionEnd(selectionEnd);
      } else {
        setSelectionEnd(null);
      }
      setEditingCell(null);
    });
  }, [selectedCell, selectionEnd, isInRange]);

  // Handle mouse down on cell (start drag selection)
  const handleCellMouseDown = useCallback((row: number, column: string, e?: React.MouseEvent) => {
    if (e && e.button !== 0) return; // Only left click

    // If clicking inside an existing selection range, keep the range so fill applies correctly
    const inExistingRange =
      selectionEnd &&
      selectedCell &&
      isInRange(row, column, { start: selectedCell, end: selectionEnd });

    if (inExistingRange) {
      // Do not clear selectionEnd; keep selection intact
      setSelectedCell(selectedCell); // keep active cell anchor
      setEditingCell(null);
      setIsMouseSelecting(false);
      return;
    }

    setSelectedCell({ row, column });
    setSelectionEnd(null);
    setEditingCell(null);
    setIsMouseSelecting(true);
  }, [isInRange, selectedCell, selectionEnd]);

  // Handle mouse enter on cell (during drag selection)
  const handleCellMouseEnter = useCallback((row: number, column: string) => {
    if (!isMouseSelecting || !selectedCell) return;
    setSelectionEnd({ row, column });
  }, [isMouseSelecting, selectedCell]);

  // Handle mouse up (end drag selection)
  const handleMouseUp = useCallback(() => {
    setIsMouseSelecting(false);
  }, []);

  const handleCellDoubleClick = useCallback((row: number, column: string, value: any) => {
    const col = initialColumns.find(c => (c.id || c.accessorKey) === column);
    if (col?.readOnly) return;
    // Snapshot current multi-selection so fill can apply even if selectionEnd is cleared during edit
    if (selectedCell && selectionEnd) {
      lastMultiSelectionRef.current = { start: selectedCell, end: selectionEnd };
    }
    setEditingCell({ row, column });
    setEditValue(value !== undefined && value !== null ? String(value) : '');
  }, [initialColumns, selectedCell, selectionEnd]);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const handleSaveEdit = useCallback(async (row: number, column: string, newValue: string, action: 'enter' | 'tab' | 'shift-tab' | 'blur') => {
    // Find the actual accessorKey for this column
    const col = initialColumns.find(c => (c.id || c.accessorKey || c.header) === column);
    const accessorKey = col?.accessorKey || column;
    const oldValue = data[row][accessorKey];

    // Helper: apply a value to all cells in current selection range (if any)
    const applyValueToSelectionRange = async (valueToApply: string, baseData: T[]) => {
      // Use live multi-cell selection if present; otherwise fallback to last multi selection
      const range = (() => {
        if (selectedCell && selectionEnd && !(selectedCell.row === selectionEnd.row && selectedCell.column === selectionEnd.column)) {
          return { start: selectedCell, end: selectionEnd };
        }
        if (lastMultiSelectionRef.current) return lastMultiSelectionRef.current;
        return null;
      })();
      if (!range) return baseData;

      // Use visible columns to respect current column order and visibility
      const colIds = visibleColumns.map(c => c.id);
      const startColIdx = colIds.findIndex(id => id === range.start.column);
      const endColIdx = colIds.findIndex(id => id === range.end.column);
      if (startColIdx === -1 || endColIdx === -1) return baseData;

      const startRow = Math.min(range.start.row, range.end.row);
      const endRow = Math.max(range.start.row, range.end.row);
      const minColIdx = Math.min(startColIdx, endColIdx);
      const maxColIdx = Math.max(startColIdx, endColIdx);

      const newDataRange = [...baseData];
      const updates: Array<{ rowIndex: number; columnId: string; accessorKey: string; oldValue: any; newValue: any }> = [];
      const bulkUpdates: Array<{ rowIndex: number; columnId: string; value: any }> = [];

      for (let r = startRow; r <= endRow; r++) {
        for (let c = minColIdx; c <= maxColIdx; c++) {
          const columnId = colIds[c];
          const colDef = visibleColumns.find(col => col.id === columnId) ||
            initialColumns.find(col => (col.id || col.accessorKey || col.header) === columnId);
          if (!columnId || colDef?.readOnly) continue;

          const accessorKeySel = colDef?.accessorKey || columnId;
          const oldValSel = newDataRange[r][accessorKeySel];
          if (String(oldValSel ?? '') === String(valueToApply ?? '')) continue;

          (newDataRange[r] as any)[accessorKeySel] = valueToApply;
          updates.push({ rowIndex: r, columnId, accessorKey: accessorKeySel, oldValue: oldValSel, newValue: valueToApply });
          bulkUpdates.push({ rowIndex: r, columnId, value: valueToApply });

          const cellKey = `${r}-${columnId}`;
          setUpdatedCells(prev => new Set(prev).add(cellKey));
          setTimeout(() => {
            setUpdatedCells(prev => {
              const next = new Set(prev);
              next.delete(cellKey);
              return next;
            });
          }, 1000);
        }
      }

      if (updates.length === 0) return newDataRange;

      setData(newDataRange);

      if (enableUndoRedo) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          type: 'bulk',
          changes: updates.map(u => ({ row: u.rowIndex, column: u.columnId, oldValue: u.oldValue, newValue: u.newValue })),
        });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }

      if (onBulkUpdate && bulkUpdates.length > 0) {
        try {
          await onBulkUpdate(bulkUpdates);
        } catch (error) {
          console.error('Error in bulk selection apply:', error);
        }
      } else if (onUpdateCell) {
        for (const update of bulkUpdates) {
          try {
            await onUpdateCell(update.rowIndex, update.columnId, update.value);
          } catch (error) {
            console.error('Error updating cell in selection range:', error);
          }
        }
      }

      onDataChange?.(newDataRange);
      return newDataRange;
    };

    // Update data if changed
    if (newValue !== String(oldValue)) {
      const newData = [...data];
      (newData[row] as any)[accessorKey] = newValue;

      // If a multi-cell selection exists, propagate the value across the range first
      const finalData = await applyValueToSelectionRange(newValue, newData);
      setData(finalData);

      const cellKey = `${row}-${column}`;
      setUpdatedCells(prev => new Set(prev).add(cellKey));
      setTimeout(() => {
        setUpdatedCells(prev => {
          const next = new Set(prev);
          next.delete(cellKey);
          return next;
        });
      }, 1000);

      if (enableUndoRedo) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          type: 'edit',
          changes: [{ row, column, oldValue, newValue }],
        });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }

      if (onUpdateCell) {
        try {
          await onUpdateCell(row, column, newValue);
        } catch (error) {
          console.error('❌ Error in onUpdateCell:', error);
          (finalData[row] as any)[accessorKey] = oldValue;
          setData(finalData);
        }
      }

      onDataChange?.(finalData);
    }

    // Handle navigation and determine next cell
    const currentVisibleColumns = visibleColumnsRef.current;
    const colIds = currentVisibleColumns.map(c => c.id || c.accessorKey || c.header);
    const currentIndex = colIds.findIndex(id => id === column);

    let nextCell: { row: number; column: string } | null = null;

    if (action === 'enter') {
      // Enter: Move down to next row, same column
      if (row < data.length - 1) {
        nextCell = { row: row + 1, column };
      }
    } else if (action === 'tab') {
      // Tab: Move to next column (skip read-only columns)
      let nextIndex = currentIndex + 1;
      let moved = false;
      
      // Try to find next editable column in same row
      while (nextIndex < colIds.length && !moved) {
        const nextCol = currentVisibleColumns[nextIndex];
        if (!nextCol?.readOnly) {
          const newColumn = colIds[nextIndex] as string;
          nextCell = { row, column: newColumn };
          moved = true;
        } else {
          nextIndex++;
        }
      }
      
      // If at end of row, wrap to first column of next row
      if (!moved && row < data.length - 1) {
        nextIndex = 0;
        while (nextIndex < colIds.length && !moved) {
          const nextCol = currentVisibleColumns[nextIndex];
          if (!nextCol?.readOnly) {
            nextCell = { row: row + 1, column: colIds[nextIndex] as string };
            moved = true;
          } else {
            nextIndex++;
          }
        }
      }
    } else if (action === 'shift-tab') {
      // Shift+Tab: Move to previous column (skip read-only columns)
      let prevIndex = currentIndex - 1;
      let moved = false;
      
      // Try to find previous editable column in same row
      while (prevIndex >= 0 && !moved) {
        const prevCol = currentVisibleColumns[prevIndex];
        if (!prevCol?.readOnly) {
          const newColumn = colIds[prevIndex] as string;
          nextCell = { row, column: newColumn };
          moved = true;
        } else {
          prevIndex--;
        }
      }
      
      // If at start of row, wrap to last column of previous row
      if (!moved && row > 0) {
        prevIndex = colIds.length - 1;
        while (prevIndex >= 0 && !moved) {
          const prevCol = currentVisibleColumns[prevIndex];
          if (!prevCol?.readOnly) {
            nextCell = { row: row - 1, column: colIds[prevIndex] as string };
            moved = true;
          } else {
            prevIndex--;
          }
        }
      }
    }

    // Clear current edit state and move to next cell
    if (nextCell) {
      const nextRowData = data[nextCell.row];
      
      // Find the column definition to get the accessor key
      const nextColDef = currentVisibleColumns.find(c => 
        (c.id || c.accessorKey || c.header) === nextCell!.column
      );
      const nextAccessorKey = nextColDef?.accessorKey || nextCell.column;
      const nextValue = nextRowData ? String(nextRowData[nextAccessorKey] ?? '') : '';
      
      // Update all states together to avoid intermediate renders
      setSelectedCell(nextCell);
      setSelectionEnd(null);
      setEditingCell(nextCell);
      setEditValue(nextValue);
    } else {
      setEditingCell(null);
      setEditValue('');
    }
  }, [data, history, historyIndex, onUpdateCell, onDataChange, enableUndoRedo, initialColumns, columnVisibility]);

  // Define table columns without TanStack
  const tableColumns: TableColumn<T>[] = useMemo(() => {
    return initialColumns.map((col) => {
      const columnId = col.id || col.accessorKey || col.header;
      const accessorKey = col.accessorKey || col.id || col.header;
      const size = col.size || 150;

      const renderCell = (rowData: T, rowIndex: number) => {
        const cellKey = `${rowIndex}-${columnId}`;
        const isSelected = selectedCell?.row === rowIndex && selectedCell?.column === columnId;
        const isEditing = editingCell?.row === rowIndex && editingCell?.column === columnId;
        const isUpdated = updatedCells.has(cellKey);
        const value = (rowData as any)[accessorKey as string];

        // Cell rendering

        const isFillPreview =
          isDragging &&
          dragFillEnd &&
          selectedCell &&
          ((selectedCell.row !== dragFillEnd.row || selectedCell.column !== dragFillEnd.column) &&
            isInRange(rowIndex, columnId as string, { start: selectedCell, end: dragFillEnd }));

        const inSelectionRange =
          !isSelected &&
          selectionEnd &&
          selectedCell &&
          isInRange(rowIndex, columnId as string, { start: selectedCell, end: selectionEnd });

        const isCopying = copiedRange && isInRange(rowIndex, columnId as string, copiedRange);

        if (col.cell) {
          return (
            <div
              className={`
                ${isSelected ? 'cell-selected' : ''}
                ${isUpdated ? 'cell-updated' : ''}
                ${isFillPreview ? 'cell-fill-preview' : ''}
                ${inSelectionRange ? 'cell-in-range' : ''}
              `}
              onClick={(e) => handleCellClick(rowIndex, columnId as string, e)}
              onMouseDown={(e) => handleCellMouseDown(rowIndex, columnId as string, e)}
              onMouseEnter={() => handleCellMouseEnter(rowIndex, columnId as string)}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCellDoubleClick(rowIndex, columnId as string, value);
              }}
              style={{
                width: '100%',
                height: '100%',
                padding: '2px 4px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                fontSize: '14px',
                fontFamily: "'Calibri','Arial',sans-serif",
                color: '#4b5563',
              }}
            >
              {col.cell({ row: { original: rowData, index: rowIndex }, getValue: () => value })}
              {isSelected && !editingCell && !col.readOnly && (
                <div className="fill-handle" onMouseDown={handleFillHandleMouseDown} />
              )}
            </div>
          );
        }

        if (isEditing) {
          // Get options for this cell (dynamic based on row data or static)
          const cellOptions = col.getCellOptions 
            ? col.getCellOptions(rowData)
            : col.selectOptions;

          return (
            <div
              className="cell-editing"
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <EditCellInput
                initialValue={editValue}
                type={col.type}
                options={cellOptions}
                onSave={(newValue, action) => handleSaveEdit(rowIndex, columnId as string, newValue, action)}
                onCancel={handleCancelEdit}
                inputRef={editInputRef}
              />
            </div>
          );
        }

        return (
          <div
            className={`
              ${isSelected ? 'cell-selected' : ''}
              ${isUpdated ? 'cell-updated' : ''}
              ${inSelectionRange ? 'cell-in-range' : ''}
              ${isCopying ? 'cell-copying' : ''}
              ${isFillPreview ? 'cell-fill-preview' : ''}
            `}
            onClick={(e) => handleCellClick(rowIndex, columnId as string, e)}
            onMouseDown={(e) => handleCellMouseDown(rowIndex, columnId as string, e)}
            onMouseEnter={() => handleCellMouseEnter(rowIndex, columnId as string)}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCellDoubleClick(rowIndex, columnId as string, value);
            }}
            style={{
              cursor: col.readOnly ? 'default' : 'cell',
              width: '100%',
              height: '100%',
              padding: '2px 4px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              position: 'relative',
              fontSize: '14px',
              fontFamily: "'Calibri','Arial',sans-serif",
              color: '#4b5563',
            }}
            title={value !== undefined && value !== null ? String(value) : ''}
          >
            {value !== undefined && value !== null ? String(value) : ''}
            {isSelected && !editingCell && !col.readOnly && (
              <div className="fill-handle" onMouseDown={handleFillHandleMouseDown} />
            )}
          </div>
        );
      };

      return {
        id: columnId as string,
        accessorKey: accessorKey as string,
        header: col.header,
        size,
        readOnly: col.readOnly,
        type: col.type,
        renderCell,
      };
    });
  }, [
    initialColumns,
    // Removed selectedCell, editingCell, editValue, updatedCells, copiedRange, selectionEnd
    // These are accessed via closure and should not trigger column recreation
    isInRange,
    isDragging,
    dragFillEnd,
    handleFillHandleMouseDown,
    handleCellClick,
    handleCellDoubleClick,
    handleSaveEdit,
    handleCancelEdit,
    handleCellMouseDown,
    handleCellMouseEnter,
  ]);

  const visibleColumns = useMemo(
    () => {
      const cols = tableColumns.filter((col) => columnVisibility[col.id] !== false);
      visibleColumnsRef.current = cols; // Update ref
      return cols;
    },
    [tableColumns, columnVisibility]
  );

  const getFilterValue = useCallback(
    (columnId: string) => columnFilters.find((filter) => filter.id === columnId)?.value ?? '',
    [columnFilters]
  );

  const updateFilterValue = useCallback((columnId: string, value: string) => {
    setColumnFilters((prev) => {
      const next = prev.filter((filter) => filter.id !== columnId);
      if (value) {
        next.push({ id: columnId, value });
      }
      return next;
    });
  }, []);

  const filteredData = useMemo(() => {
    if (!enableFiltering || columnFilters.length === 0) return data;

    return data.filter((row) =>
      columnFilters.every((filter) => {
        const cellValue = (row as any)[filter.id];
        const textValue = cellValue !== undefined && cellValue !== null ? String(cellValue).toLowerCase() : '';
        return textValue.includes(String(filter.value ?? '').toLowerCase());
      })
    );
  }, [data, columnFilters, enableFiltering]);

  const sortedData = useMemo(() => {
    if (!enableSorting || sorting.length === 0) return filteredData;

    const [sort] = sorting;
    const direction = sort.desc ? -1 : 1;
    const sortId = sort.id;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as any)[sortId];
      const bVal = (b as any)[sortId];

      if (aVal === undefined || aVal === null) return bVal === undefined || bVal === null ? 0 : -1 * direction;
      if (bVal === undefined || bVal === null) return 1 * direction;

      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return (aNum - bNum) * direction;
      }

      return String(aVal).localeCompare(String(bVal)) * direction;
    });
  }, [filteredData, sorting, enableSorting]);

  // Virtual scrolling: Calculate visible row range
  const totalRows = sortedData.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 600;
  const visibleRowCount = Math.ceil(viewportHeight / ROW_HEIGHT);
  
  const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
  const endRow = Math.min(totalRows, startRow + visibleRowCount + (BUFFER_ROWS * 2));
  
  // Only render visible rows
  const displayedData = useMemo(() => {
    return sortedData.slice(startRow, endRow);
  }, [sortedData, startRow, endRow]);
  
  // Handle scroll event
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  const toggleSorting = useCallback((columnId: string) => {
    setSorting((prev) => {
      const current = prev.find((entry) => entry.id === columnId);
      if (!current) return [{ id: columnId, desc: false }];
      if (!current.desc) return [{ id: columnId, desc: true }];
      return [];
    });
  }, []);

  const handleEditKeyDown = useCallback(async (e: React.KeyboardEvent, row: number, column: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleEditBlur(row, column);
      // Navigation is handled by handleCellEdit with action='enter'
      // No need to navigate here as it would cause double jump
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
      setSelectedCell({ row, column });
    } else if (e.key === 'Tab') {
      e.preventDefault();
      await handleEditBlur(row, column);

      // Move to next cell
      const columns = visibleColumns;
      const currentIndex = columns.findIndex(c => c.id === column);

      if (e.shiftKey) {
        // Shift+Tab: Move to previous cell
        if (currentIndex > 0) {
          const prevColumn = columns[currentIndex - 1].id;
          const prevCol = initialColumns.find(c => (c.id || c.accessorKey) === prevColumn);
          if (!prevCol?.readOnly) {
            setSelectedCell({ row, column: prevColumn });
            handleCellDoubleClick(row, prevColumn, data[row][prevColumn]);
          } else {
            // Skip read-only columns
            let prevIndex = currentIndex - 2;
            while (prevIndex >= 0) {
              const col = columns[prevIndex].id;
              const colDef = initialColumns.find(c => (c.id || c.accessorKey) === col);
              if (!colDef?.readOnly) {
                setSelectedCell({ row, column: col });
                handleCellDoubleClick(row, col, data[row][col]);
                break;
              }
              prevIndex--;
            }
          }
        } else if (row > 0) {
          // Move to last cell of previous row
          const lastColumn = columns[columns.length - 1].id;
          setSelectedCell({ row: row - 1, column: lastColumn });
          handleCellDoubleClick(row - 1, lastColumn, data[row - 1][lastColumn]);
        }
      } else {
        // Tab: Move to next cell
        if (currentIndex < columns.length - 1) {
          const nextColumn = columns[currentIndex + 1].id;
          const nextCol = initialColumns.find(c => (c.id || c.accessorKey) === nextColumn);
          if (!nextCol?.readOnly) {
            setSelectedCell({ row, column: nextColumn });
            handleCellDoubleClick(row, nextColumn, data[row][nextColumn]);
          } else {
            // Skip read-only columns
            let nextIndex = currentIndex + 2;
            while (nextIndex < columns.length) {
              const col = columns[nextIndex].id;
              const colDef = initialColumns.find(c => (c.id || c.accessorKey) === col);
              if (!colDef?.readOnly) {
                setSelectedCell({ row, column: col });
                handleCellDoubleClick(row, col, data[row][col]);
                break;
              }
              nextIndex++;
            }
          }
        } else if (row < data.length - 1) {
          // Move to first cell of next row
          const firstColumn = columns[0].id;
          setSelectedCell({ row: row + 1, column: firstColumn });
          handleCellDoubleClick(row + 1, firstColumn, data[row + 1][firstColumn]);
        }
      }
    }
  }, [data, visibleColumns, initialColumns, handleCellDoubleClick]);

  const handleEditBlur = useCallback(async (row: number, column: string) => {
    if (editValue === String(data[row][column])) {
      setEditingCell(null);
      return;
    }

    // Update local data
    const newData = [...data];
    const oldValue = (newData[row] as any)[column];
    (newData[row] as any)[column] = editValue;
    setData(newData);

    // Mark cell as updated
    const cellKey = `${row}-${column}`;
    setUpdatedCells(prev => new Set(prev).add(cellKey));
    setTimeout(() => {
      setUpdatedCells(prev => {
        const next = new Set(prev);
        next.delete(cellKey);
        return next;
      });
    }, 1000);

    // Add to history
    if (enableUndoRedo) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        type: 'edit',
        changes: [{ row, column, oldValue, newValue: editValue }],
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    // Call update callback
    if (onUpdateCell) {
      try {
        await onUpdateCell(row, column, editValue);
      } catch (error) {
        console.error('Error updating cell:', error);
        // Revert on error
        (newData[row] as any)[column] = oldValue;
        setData(newData);
      }
    }

    setEditingCell(null);
    onDataChange?.(newData);
  }, [data, editValue, history, historyIndex, onUpdateCell, onDataChange, enableUndoRedo]);

  const handleClearSelection = useCallback(async () => {
    if (!selectedCell) return;

    const start = selectedCell;
    const end = selectionEnd || selectedCell;
    const colIds = initialColumns.map(c => c.id || c.accessorKey || c.header);
    const startColIdx = colIds.findIndex(id => id === start.column);
    const endColIdx = colIds.findIndex(id => id === end.column);
    if (startColIdx === -1 || endColIdx === -1) return;

    const startRow = Math.min(start.row, end.row);
    const endRow = Math.max(start.row, end.row);
    const minColIdx = Math.min(startColIdx, endColIdx);
    const maxColIdx = Math.max(startColIdx, endColIdx);

    const newData = [...data];
    const updates: Array<{ rowIndex: number; columnId: string; accessorKey: string; value: any; oldValue: any }> = [];

    for (let r = startRow; r <= endRow; r++) {
      for (let c = minColIdx; c <= maxColIdx; c++) {
        const columnId = colIds[c];
        const colDef = initialColumns.find(col => (col.id || col.accessorKey || col.header) === columnId);
        if (!columnId || colDef?.readOnly) continue;

        const accessorKey = colDef?.accessorKey || columnId;
        const oldValue = newData[r][accessorKey];
        if (String(oldValue ?? '') === '') continue;

        (newData[r] as any)[accessorKey] = '';
        updates.push({ rowIndex: r, columnId, accessorKey, value: '', oldValue });

        const cellKey = `${r}-${columnId}`;
        setUpdatedCells(prev => new Set(prev).add(cellKey));
        setTimeout(() => {
          setUpdatedCells(prev => {
            const next = new Set(prev);
            next.delete(cellKey);
            return next;
          });
        }, 1000);
      }
    }

    if (!updates.length) return;

    setData(newData);

    if (enableUndoRedo) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        type: 'bulk',
        changes: updates.map(u => ({ row: u.rowIndex, column: u.columnId, oldValue: u.oldValue, newValue: '' })),
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    if (onBulkUpdate) {
      try {
        await onBulkUpdate(updates.map(u => ({ rowIndex: u.rowIndex, columnId: u.columnId, value: '' })));
      } catch (error) {
        console.error('Error clearing selection (bulk):', error);
        updates.forEach(({ rowIndex, accessorKey, oldValue }) => {
          (newData[rowIndex] as any)[accessorKey] = oldValue;
        });
        setData(newData);
      }
    } else if (onUpdateCell) {
      for (const update of updates) {
        try {
          await onUpdateCell(update.rowIndex, update.columnId, '');
        } catch (error) {
          console.error('Error clearing cell:', error);
        }
      }
    }

    onDataChange?.(newData);
  }, [selectedCell, selectionEnd, data, initialColumns, enableUndoRedo, history, historyIndex, onBulkUpdate, onUpdateCell, onDataChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filterColumn) return; // When filter popover is open, ignore grid key handling
      if (!selectedCell || editingCell) return;

      // CRITICAL FIX: Ignore keyboard events if user is typing in an input/textarea/select element
      // This prevents table from capturing keystrokes meant for filter inputs or other form fields
      const target = e.target as HTMLElement;
      const isInputElement = target.tagName === 'INPUT' || 
                             target.tagName === 'TEXTAREA' || 
                             target.tagName === 'SELECT' ||
                             target.isContentEditable;
      
      if (isInputElement) {
        console.log('🚫 Ignoring keyboard event - user is typing in input field:', target.tagName);
        return;
      }

      const { row, column } = selectedCell;
      // For Shift+Arrow: move from selectionEnd if it exists, otherwise from selectedCell
      // This allows extending the selection range
      const currentHead = (e.shiftKey && selectionEnd) ? selectionEnd : selectedCell;

      const colIds = initialColumns.map(c => c.id || c.accessorKey || c.header);
      const currentColIndex = colIds.findIndex(id => id === currentHead.column);

      let newRow = currentHead.row;
      let newCol = currentHead.column;

      // Handle F2 (Edit cell in-place)
      if (e.key === 'F2') {
        e.preventDefault();
        const col = initialColumns.find(c => (c.id || c.accessorKey) === column);
        if (!col?.readOnly) {
          handleCellDoubleClick(row, column, data[row][column]);
        }
        return;
      }

      // Handle Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        const direction = e.shiftKey ? -1 : 1;
        const currentIdx = colIds.findIndex(id => id === column); // Tab always moves focusing cell
        let nextIdx = currentIdx + direction;

        if (nextIdx >= 0 && nextIdx < colIds.length) {
          setSelectedCell({ row, column: (colIds[nextIdx] as string) });
          setSelectionEnd(null);
        } else {
          // Optional: Wrap to next/prev row?
          // For now, strict Excel horizontal tab behavior within row limits
        }
        return;
      }

      let move = false;

      // Handle Arrow keys (with Shift for range selection)
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRow = Math.max(0, currentHead.row - 1);
          move = true;
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRow = Math.min(data.length - 1, currentHead.row + 1);
          move = true;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentColIndex > 0) {
            newCol = (colIds[currentColIndex - 1] as string);
            move = true;
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentColIndex < colIds.length - 1) {
            newCol = (colIds[currentColIndex + 1] as string);
            move = true;
          }
          break;
        case 'Enter':
          e.preventDefault();
          // Do NOT navigate here - navigation is handled by handleCellEdit when saving
          // If we navigate here too, it causes double row jump (row N → N+1 → N+2)
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          handleClearSelection();
          break;
        default:
          // Start editing with typed character
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const col = initialColumns.find(c => (c.id || c.accessorKey) === column);
            if (!col?.readOnly) {
              handleCellDoubleClick(row, column, e.key);
            }
          }
          break;
      }

      if (move) {
        if (e.shiftKey) {
          // Shift+Arrow: Extend selection range (anchor stays at selectedCell, move the end)
          setSelectionEnd({ row: newRow, column: newCol });
        } else {
          // Arrow without Shift: Move to new cell and clear any range selection
          setSelectedCell({ row: newRow, column: newCol });
          setSelectionEnd(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, selectionEnd, editingCell, data, initialColumns, handleCellDoubleClick, handleClearSelection, filterColumn]);

  // Keep selected/active cell in view when navigating horizontally/vertically
  // Debounced to avoid expensive operations on rapid cell selection
  useEffect(() => {
    const target = selectionEnd || selectedCell;
    if (!target || !tableRef.current) return;

    // Debounce scroll to avoid performance issues with rapid cell selection
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        const cell = tableRef.current?.querySelector(
          `[data-row-index="${target.row}"][data-col-id="${target.column}"]`
        ) as HTMLElement | null;

        if (cell) {
          cell.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
        }
      });
    }, 10); // 0ms debounce

    return () => clearTimeout(timeoutId);
  }, [selectedCell, selectionEnd]);

  // Snapshot last selection range so we can apply fills after edit even if selectionEnd changes
  // Track last multi-cell selection (used as a fallback if selectionEnd is cleared during edit)
  useEffect(() => {
    if (selectedCell && selectionEnd) {
      if (!(selectedCell.row === selectionEnd.row && selectedCell.column === selectionEnd.column)) {
        lastMultiSelectionRef.current = { start: selectedCell, end: selectionEnd };
      }
    }
  }, [selectedCell, selectionEnd]);

  // Auto-focus filter input when a column filter is opened
  useEffect(() => {
    if (filterColumn) {
      const id = `col-filter-${filterColumn}`;
      const el = document.getElementById(id) as HTMLInputElement | null;
      if (el) {
        setTimeout(() => el.focus(), 0);
      }
    }
  }, [filterColumn]);

  // Copy/Paste functionality
  const handleCopy = useCallback(() => {
    if (!selectedCell) return;

    // Determine the range to copy
    const startCell = selectedCell;
    const endCell = selectionEnd || selectedCell;

    // Get row and column indices
    const startRow = Math.min(startCell.row, endCell.row);
    const endRow = Math.max(startCell.row, endCell.row);

    const allColumns = initialColumns.map(col => col.accessorKey);
    const startColIndex = allColumns.indexOf(startCell.column);
    const endColIndex = allColumns.indexOf(endCell.column);
    const startCol = Math.min(startColIndex, endColIndex);
    const endCol = Math.max(startColIndex, endColIndex);

    // Build a 2D array of values
    const copiedData: string[][] = [];
    for (let r = startRow; r <= endRow; r++) {
      const rowData: string[] = [];
      for (let c = startCol; c <= endCol; c++) {
        const columnId = allColumns[c];
        if (!columnId) continue;
        if (canCopyColumn && !canCopyColumn(columnId)) {
          console.warn(`Copy blocked: insufficient permission for column '${columnId}'`);
          return;
        }
        const value = data[r][columnId];
        const textValue = value !== undefined && value !== null ? String(value) : '';
        rowData.push(textValue);
      }
      copiedData.push(rowData);
    }

    // Convert to tab-separated values (Excel format)
    const textValue = copiedData.map(row => row.join('\t')).join('\n');

    navigator.clipboard.writeText(textValue);
    setCopiedCells(copiedData);
    setCopiedRange({ start: startCell, end: endCell });
  }, [selectedCell, selectionEnd, data, initialColumns, canCopyColumn]);

  const handlePaste = useCallback(async () => {
    if (!selectedCell || !enableCopyPaste) return;

    try {
      const text = await navigator.clipboard.readText();
      const { row: startRow, column: startColumn } = selectedCell;

      // Parse clipboard text (tab-separated for columns, newline-separated for rows)
      const rows = text.split('\n').filter(r => r.length > 0);
      const pasteData: string[][] = rows.map(row => row.split('\t'));

      if (pasteData.length === 0) return;

      // Get column indices
      const colIds = initialColumns.map(c => c.accessorKey || c.id || c.header);
      const startColIdx = colIds.findIndex(id => id === startColumn);
      if (startColIdx === -1) return;

      const newData = [...data];
      const updates: Array<{ row: number; column: string; oldValue: any; newValue: any }> = [];
      const bulkUpdates: Array<{ rowIndex: number; columnId: string; value: any }> = [];

      // Paste data into cells
      for (let r = 0; r < pasteData.length; r++) {
        const targetRow = startRow + r;
        if (targetRow >= data.length) break; // Don't paste beyond data bounds

        for (let c = 0; c < pasteData[r].length; c++) {
          const targetColIdx = startColIdx + c;
          if (targetColIdx >= colIds.length) break; // Don't paste beyond column bounds

          const columnId = colIds[targetColIdx];
          if (!columnId) continue;

          // Check if column is read-only
          const col = initialColumns.find(col => (col.accessorKey || col.id || col.header) === columnId);
          if (col?.readOnly) continue;

          const accessorKey = col?.accessorKey || columnId;
          const oldValue = newData[targetRow][accessorKey];
          const newValue = pasteData[r][c];

          // Only update if value changed
          if (String(newValue) !== String(oldValue)) {
            (newData[targetRow] as any)[accessorKey] = newValue;
            updates.push({ row: targetRow, column: columnId, oldValue, newValue });
            bulkUpdates.push({ rowIndex: targetRow, columnId, value: newValue });

            // Mark as updated
            const cellKey = `${targetRow}-${columnId}`;
            setUpdatedCells(prev => new Set(prev).add(cellKey));
            setTimeout(() => {
              setUpdatedCells(prev => {
                const next = new Set(prev);
                next.delete(cellKey);
                return next;
              });
            }, 1000);
          }
        }
      }

      if (updates.length === 0) return;

      setData(newData);

      // Add to history
      if (enableUndoRedo) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          type: 'bulk',
          changes: updates,
        });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }

      // Use bulk update if available, otherwise fall back to individual updates
      if (onBulkUpdate && bulkUpdates.length > 0) {
        try {
          await onBulkUpdate(bulkUpdates);
          console.log(`✅ Pasted ${bulkUpdates.length} cells successfully (bulk update)`);
        } catch (error) {
          console.error('Error in bulk paste:', error);
        }
      } else if (onUpdateCell) {
        // Fall back to individual updates
        for (const update of bulkUpdates) {
          try {
            await onUpdateCell(update.rowIndex, update.columnId, update.value);
          } catch (error) {
            console.error('Error pasting cell:', error);
          }
        }
      }

      onDataChange?.(newData);

      // Clear copied range after paste
      setCopiedRange(null);
    } catch (error) {
      console.error('Error pasting:', error);
    }
  }, [selectedCell, data, history, historyIndex, onUpdateCell, onBulkUpdate, onDataChange, enableCopyPaste, enableUndoRedo, initialColumns]);

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (historyIndex < 0 || !enableUndoRedo) return;

    const entry = history[historyIndex];
    const newData = [...data];

    entry.changes.forEach(({ row, column, oldValue }) => {
      (newData[row] as any)[column] = oldValue;
    });

    setData(newData);
    setHistoryIndex(historyIndex - 1);
    onDataChange?.(newData);
  }, [history, historyIndex, data, onDataChange, enableUndoRedo]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !enableUndoRedo) return;

    const entry = history[historyIndex + 1];
    const newData = [...data];

    entry.changes.forEach(({ row, column, newValue }) => {
      (newData[row] as any)[column] = newValue;
    });

    setData(newData);
    setHistoryIndex(historyIndex + 1);
    onDataChange?.(newData);
  }, [history, historyIndex, data, onDataChange, enableUndoRedo]);

  // Export to Excel
  const handleExport = useCallback(async () => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Data');

    const headers =
      initialColumns?.length
        ? initialColumns
          .map((column) => column.accessorKey || column.id || column.header)
          .filter(Boolean)
        : (data[0] ? Object.keys(data[0]) : []);

    if (headers.length) {
      worksheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: Math.max(12, String(header).length + 2),
      }));

      data.forEach((row) => {
        const rowData: Record<string, any> = {};
        headers.forEach((header) => {
          rowData[header] = (row as any)[header] ?? '';
        });
        worksheet.addRow(rowData);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob(
      [buffer],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  }, [data, initialColumns]);

  // Import from Excel
  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.worksheets[0];
      if (!worksheet) return;

      const sheetValues = worksheet.getSheetValues().slice(1);
      if (sheetValues.length < 1) return;

      const rawHeaderRow = Array.isArray(sheetValues[0]) ? sheetValues[0].slice(1) : [];
      const headers = rawHeaderRow
        .map((cell) => (cell ?? '').toString().trim())
        .filter(Boolean);

      const importedData = sheetValues
        .slice(1)
        .map((row) => {
          if (!row) return null;
          const values = Array.isArray(row) ? row : [];
          const rowObj: Record<string, any> = {};
          headers.forEach((header, index) => {
            rowObj[header] = values[index + 1] ?? '';
          });
          return rowObj;
        })
        .filter(
          (row): row is Record<string, any> =>
            !!row && Object.values(row).some((value) => value !== null && value !== '')
        );

      setData(importedData as T[]);
      onDataChange?.(importedData as T[]);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
    } finally {
      e.target.value = '';
    }
  }, [onDataChange]);



  // Column resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, columnId: string, currentSize: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnId);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = currentSize;
  }, []);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingColumn) return;

    const diff = e.clientX - resizeStartX.current;
    const newWidth = Math.max(50, resizeStartWidth.current + diff); // Min width 50px

    setColumnSizes(prev => ({
      ...prev,
      [resizingColumn]: newWidth
    }));
  }, [resizingColumn]);

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
  }, []);

  // Add resize event listeners
  useEffect(() => {
    if (resizingColumn) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);

      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingColumn, handleResizeMove, handleResizeEnd]);

  // Drag fill move/end handlers
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedCell) return;

    // Get the cell element under the mouse
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;

    // Find the closest td or th
    const cell = element.closest('td');
    if (!cell || !tableRef.current?.contains(cell)) return;

    // Get the row index from the cell
    const row = cell.parentElement;
    if (!row) return;

    const tbody = row.parentElement;
    if (!tbody || tbody.tagName !== 'TBODY') return;

    const rowIndex = Array.from(tbody.children).indexOf(row);

    // Get column index from cell
    const cells = Array.from(row.children) as HTMLElement[];
    const cellIndex = cells.indexOf(cell as HTMLElement);

    if (cellIndex <= 0) return; // Skip row number column

    const targetColumn = visibleColumns[cellIndex - 1]; // -1 because of row number column

    if (targetColumn?.id && rowIndex >= 0) {
      setDragFillEnd({ row: rowIndex, column: targetColumn.id });
    }
  }, [isDragging, selectedCell, visibleColumns]);

  const handleDragEnd = useCallback(async () => {
    if (!isDragging || !selectedCell || !dragFillEnd) {
      setIsDragging(false);
      setDragFillEnd(null);
      return;
    }

    setIsDragging(false);

    // Get the source value
    const sourceValue = data[selectedCell.row][selectedCell.column];

    // Determine fill direction and range
    const startRow = selectedCell.row;
    const endRow = dragFillEnd.row;
    const startCol = selectedCell.column;
    const endCol = dragFillEnd.column;

    const colIds = initialColumns.map(c => c.id || c.accessorKey || c.header);
    const startColIdx = colIds.findIndex(id => id === startCol);
    const endColIdx = colIds.findIndex(id => id === endCol);

    // Create updates array
    const updates: Array<{ rowIndex: number, columnId: string, value: any, oldValue: any }> = [];
    const newData = [...data];

    // Fill vertically (same column, different rows)
    if (startCol === endCol && startRow !== endRow) {
      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);

      for (let r = minRow; r <= maxRow; r++) {
        if (r === startRow) continue; // Skip source cell

        const col = initialColumns.find(c => (c.id || c.accessorKey) === startCol);
        if (col?.readOnly) continue;

        const oldValue = newData[r][startCol];
        updates.push({ rowIndex: r, columnId: startCol, value: sourceValue, oldValue });
        (newData[r] as any)[startCol] = sourceValue;

        // Mark as updated
        const cellKey = `${r}-${startCol}`;
        setUpdatedCells(prev => new Set(prev).add(cellKey));
        setTimeout(() => {
          setUpdatedCells(prev => {
            const next = new Set(prev);
            next.delete(cellKey);
            return next;
          });
        }, 1000);
      }
    }
    // Fill horizontally (same row, different columns)
    else if (startRow === endRow && startColIdx !== endColIdx) {
      const minColIdx = Math.min(startColIdx, endColIdx);
      const maxColIdx = Math.max(startColIdx, endColIdx);

      for (let c = minColIdx; c <= maxColIdx; c++) {
        if (c === startColIdx) continue; // Skip source cell

        const columnId = colIds[c];
        if (!columnId) continue;

        const col = initialColumns.find(col => (col.id || col.accessorKey) === columnId);
        if (col?.readOnly) continue;

        const oldValue = newData[startRow][columnId];
        updates.push({ rowIndex: startRow, columnId, value: sourceValue, oldValue });
        (newData[startRow] as any)[columnId] = sourceValue;

        // Mark as updated
        const cellKey = `${startRow}-${columnId}`;
        setUpdatedCells(prev => new Set(prev).add(cellKey));
        setTimeout(() => {
          setUpdatedCells(prev => {
            const next = new Set(prev);
            next.delete(cellKey);
            return next;
          });
        }, 1000);
      }
    }
    // Fill in a rectangular area
    else if (startRow !== endRow && startColIdx !== endColIdx) {
      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);
      const minColIdx = Math.min(startColIdx, endColIdx);
      const maxColIdx = Math.max(startColIdx, endColIdx);

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minColIdx; c <= maxColIdx; c++) {
          if (r === startRow && c === startColIdx) continue; // Skip source cell

          const columnId = colIds[c];
          if (!columnId) continue;

          const col = initialColumns.find(col => (col.id || col.accessorKey) === columnId);
          if (col?.readOnly) continue;

          const oldValue = newData[r][columnId];
          updates.push({ rowIndex: r, columnId, value: sourceValue, oldValue });
          (newData[r] as any)[columnId] = sourceValue;

          // Mark as updated
          const cellKey = `${r}-${columnId}`;
          setUpdatedCells(prev => new Set(prev).add(cellKey));
          setTimeout(() => {
            setUpdatedCells(prev => {
              const next = new Set(prev);
              next.delete(cellKey);
              return next;
            });
          }, 1000);
        }
      }
    }

    if (updates.length > 0) {
      setData(newData);

      // Add to history
      if (enableUndoRedo) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          type: 'bulk',
          changes: updates.map(u => ({ row: u.rowIndex, column: u.columnId, oldValue: u.oldValue, newValue: u.value })),
        });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }

      // Call bulk update if available, otherwise individual updates
      if (onBulkUpdate) {
        try {
          await onBulkUpdate(updates.map(u => ({ rowIndex: u.rowIndex, columnId: u.columnId, value: u.value })));
        } catch (error) {
          console.error('Error in bulk update:', error);
          // Revert on error
          updates.forEach(({ rowIndex, columnId, oldValue }) => {
            (newData[rowIndex] as any)[columnId] = oldValue;
          });
          setData(newData);
        }
      } else if (onUpdateCell) {
        // Fall back to individual updates
        for (const update of updates) {
          try {
            await onUpdateCell(update.rowIndex, update.columnId, update.value);
          } catch (error) {
            console.error('Error updating cell:', error);
          }
        }
      }

      onDataChange?.(newData);
    }

    setDragFillEnd(null);
  }, [isDragging, selectedCell, dragFillEnd, data, initialColumns, onBulkUpdate, onUpdateCell, onDataChange, enableUndoRedo, history, historyIndex]);

  // Add drag event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Add mouse selection event listeners
  useEffect(() => {
    if (isMouseSelecting) {
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isMouseSelecting, handleMouseUp]);

  // Context menu
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleCopy, handlePaste, handleUndo, handleRedo]);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1 }}>
      <style>{excelStyles}</style>

      {/* Toolbar */}
      {/* <div className="excel-toolbar">
        {enableUndoRedo && (
          <>
            <button onClick={handleUndo} disabled={historyIndex < 0} title="Undo (Ctrl+Z)">
              <Undo size={14} />
              <span>Undo</span>
            </button>
            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)">
              <Redo size={14} />
              <span>Redo</span>
            </button>
            <div style={{ width: '1px', height: '18px', background: '#c0c0c0', margin: '0 4px' }} />
          </>
        )}

        {enableCopyPaste && (
          <>
            <button onClick={handleCopy} disabled={!selectedCell} title="Copy (Ctrl+C)">
              <Copy size={14} />
              <span>Copy</span>
            </button>
            <button onClick={handlePaste} disabled={!selectedCell || !enableCopyPaste} title="Paste (Ctrl+V)">
              <Clipboard size={14} />
              <span>Paste</span>
            </button>
            <div style={{ width: '1px', height: '18px', background: '#c0c0c0', margin: '0 4px' }} />
          </>
        )}

        {enableExport && (
          <button onClick={handleExport} title="Export to Excel">
            <Download size={14} />
            <span>Export</span>
          </button>
        )}

        {enableImport && (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
            border: '1px solid #adadad',
            borderRadius: '2px',
            cursor: 'pointer',
            fontSize: '11px',
            height: '22px',
            color: '#333'
          }}>
            <Upload size={14} />
            <span>Import</span>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#333', fontWeight: '400', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span title="Keyboard Shortcuts: &#10;• Arrow Keys - Navigate&#10;• Shift + Arrow - Select Range&#10;• F2 or Double-click - Edit&#10;• Enter - Confirm & Move Down&#10;• Tab - Move Right&#10;• Ctrl+C - Copy&#10;• Ctrl+V - Paste&#10;• Ctrl+Z - Undo" style={{ cursor: 'help', textDecoration: 'underline dotted' }}>
            Shortcuts
          </span>
          <span>{data.length} rows × {initialColumns.length} columns</span>
        </div>
      </div> */}

      {/* Table Container */}
      <div 
        ref={(el) => {
          (tableRef as any).current = el;
          (containerRef as any).current = el;
        }}
        className="table-container"
        onScroll={handleScroll}
        style={{ height: '100%', overflow: 'auto', position: 'relative' }}
      >
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
            Loading...
          </div>
        ) : (
          <table className={`advanced-excel-table ${isMouseSelecting ? 'selecting' : ''}`}>
            <thead>
              <tr>
                <th className="row-number">#</th>
                {visibleColumns.map((column) => {
                  const columnId = column.id;
                  const currentSize = columnSizes[columnId] || column.size;
                  const sortState = sorting.find((entry) => entry.id === columnId);
                  const hasFilterValue = Boolean(getFilterValue(columnId));
                  const isHighlighted = highlightedColumns.has(columnId);

                  return (
                    <th
                      key={columnId}
                      className={isHighlighted ? 'header-highlight' : undefined}
                      style={{
                        width: currentSize,
                        minWidth: currentSize,
                        maxWidth: currentSize,
                        position: 'sticky',
                      }}
                      onClick={() => enableSorting && toggleSorting(columnId)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          overflow: 'visible',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span className="col-header-label" style={{ flex: 1, textAlign: 'center' }}>{column.header}</span>
                        {enableSorting && sortState && (
                          <ArrowUpDown size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
                        )}
                        {enableFiltering && (
                          <Filter
                            size={12}
                            style={{
                              opacity: hasFilterValue ? 1 : 0.6,
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCell(null);
                              setFilterColumn(filterColumn === columnId ? null : columnId);
                            }}
                          />
                        )}
                      </div>
                      {filterColumn === columnId && (
                        <div className="column-filter" onClick={(e) => e.stopPropagation()}>
                          <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: '#1f2937' }}>
                            {column.header}
                          </div>
                          <input
                            id={`col-filter-${columnId}`}
                            type="text"
                            value={getFilterValue(columnId)}
                            onChange={(e) => updateFilterValue(columnId, e.target.value)}
                            placeholder="Filter..."
                          />
                        </div>
                      )}
                      {enableColumnResize && (
                        <div
                          className={`resize-handle ${resizingColumn === columnId ? 'resizing' : ''}`}
                          onMouseDown={(e) => handleResizeStart(e, columnId, currentSize)}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Spacer for virtual scrolling - rows before visible range */}
              {startRow > 0 && (
                <tr style={{ height: startRow * ROW_HEIGHT }}>
                  <td colSpan={initialColumns.length + 1} style={{ padding: 0, border: 'none' }} />
                </tr>
              )}
              {displayedData.map((row, displayIndex) => {
                const rowIndex = startRow + displayIndex; 
                return (
                <tr
                  key={rowIndex}
                  className={selectedRows.has(rowIndex) ? 'row-selected' : ''}
                >
                  <td
                    className="row-number"
                    onClick={() => {
                      if (enableRowSelection) {
                        const newSelected = new Set(selectedRows);
                        if (newSelected.has(rowIndex)) {
                          newSelected.delete(rowIndex);
                        } else {
                          newSelected.add(rowIndex);
                        }
                        setSelectedRows(newSelected);
                      }
                    }}
                  >
                    {/* Prefer provided serial fields, fallback to row index */}
                    {row?.vsno ?? row?.sr ?? rowIndex + 1}
                  </td>
                  {visibleColumns.map((column) => {
                    const columnId = column.id;
                    const currentSize = columnSizes[columnId] || column.size;
                    const isSelected = selectedCell?.row === rowIndex && selectedCell?.column === columnId;
                    const isInRange = selectionEnd && selectedCell && 
                      rowIndex >= Math.min(selectedCell.row, selectionEnd.row) && 
                      rowIndex <= Math.max(selectedCell.row, selectionEnd.row);

                    return (
                      <td
                        key={`${rowIndex}-${columnId}`}
                        data-row-index={rowIndex}
                        data-col-id={columnId}
                        data-selected={isSelected || undefined}
                        data-in-range={isInRange || undefined}
                        style={{
                          width: currentSize,
                          minWidth: currentSize,
                          maxWidth: currentSize,
                        }}
                      >
                        {column.renderCell(row, rowIndex)}
                      </td>
                    );
                  })}
                </tr>
                );
              })}
              {/* Spacer for virtual scrolling - rows after visible range */}
              {endRow < totalRows && (
                <tr style={{ height: (totalRows - endRow) * ROW_HEIGHT }}>
                  <td colSpan={initialColumns.length + 1} style={{ padding: 0, border: 'none' }} />
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Status Bar */}
      {/* <div className="status-bar">
        <div>
          {selectedCell && !selectionEnd && `Selected: Row ${selectedCell.row + 1}, Column ${selectedCell.column}`}
          {selectedCell && selectionEnd && (
            (() => {
              const colIds = initialColumns.map(c => c.id || c.accessorKey || c.header);
              const startColIdx = colIds.findIndex(id => id === selectedCell.column);
              const endColIdx = colIds.findIndex(id => id === selectionEnd.column);
              const rowCount = Math.abs(selectionEnd.row - selectedCell.row) + 1;
              const colCount = Math.abs(endColIdx - startColIdx) + 1;
              return `Range Selected: ${rowCount} row(s) × ${colCount} column(s)`;
            })()
          )}
          {selectedRows.size > 0 && ` | ${selectedRows.size} row(s) selected`}
        </div>
        <div>
          {enableUndoRedo && `History: ${historyIndex + 1}/${history.length}`}
        </div>
      </div> */}
    </div>
  );
}

export default AdvancedExcelDataTable;

