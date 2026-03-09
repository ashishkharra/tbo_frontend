// components/dataset/TablePagination.tsx
'use client';

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  entriesPerPage: number;
  startIndex: number;
  endIndex: number;
  isPageChanging: boolean;
  onPageChange: (page: number) => void;
  onEntriesPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const TablePagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  totalRecords,
  entriesPerPage,
  startIndex,
  endIndex,
  isPageChanging,
  onPageChange,
  onEntriesPerPageChange,
}) => {
  return (
    <div className="bg-white border-t px-4 py-3 flex items-center justify-between text-sm text-gray-600">
      <span>{isPageChanging ? "Loading..." : `Page ${currentPage} of ${totalPages} · Showing ${startIndex} to ${endIndex} entries of ${totalRecords}`}</span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isPageChanging}
          className={`px-3 py-1 border rounded-md flex items-center ${
            currentPage === 1 || isPageChanging ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 7) {
            pageNum = i + 1;
          } else if (currentPage <= 4) {
            if (i < 5) pageNum = i + 1;
            else if (i === 5) return <span key="ellipsis1" className="px-2 py-1">...</span>;
            else pageNum = totalPages;
          } else if (currentPage >= totalPages - 3) {
            if (i === 0) pageNum = 1;
            else if (i === 1) return <span key="ellipsis2" className="px-2 py-1">...</span>;
            else pageNum = totalPages - (6 - i);
          } else {
            if (i === 0) pageNum = 1;
            else if (i === 1) return <span key="ellipsis3" className="px-2 py-1">...</span>;
            else if (i >= 2 && i <= 4) pageNum = currentPage - 2 + i;
            else if (i === 5) return <span key="ellipsis4" className="px-2 py-1">...</span>;
            else pageNum = totalPages;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isPageChanging}
              className={`px-3 py-1 rounded-md ${
                currentPage === pageNum ? "bg-gray-600 text-white" : "border hover:bg-gray-50"
              } ${isPageChanging ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isPageChanging}
          className={`px-3 py-1 border rounded-md flex items-center ${
            currentPage === totalPages || isPageChanging ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          <ChevronRight size={14} />
        </button>

        <span className="ml-3">Go to:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= totalPages && !isPageChanging) onPageChange(page);
          }}
          className="w-16 border rounded-md px-2 py-1 text-gray-700 bg-gray-50 text-center"
          disabled={isPageChanging}
        />

        <span>Show:</span>
        <select value={entriesPerPage} onChange={onEntriesPerPageChange} className="border rounded-md px-2 py-1 text-gray-700 bg-gray-50" disabled={isPageChanging}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};