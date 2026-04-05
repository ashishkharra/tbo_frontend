// components/voterList/CommonPagination.tsx
'use client';

import React, { ChangeEvent, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number | "All";
  currentPageItemCount: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number | "All") => void;
  loading: boolean;
  showRefreshButton: boolean;
  onRefresh: () => void;
}

export const CommonPagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  currentPageItemCount,
  onPageChange,
  onItemsPerPageChange,
  loading,
  showRefreshButton,
  onRefresh,
}) => {
  const [goToPage, setGoToPage] = useState<string>(String(currentPage));

  useEffect(() => {
    setGoToPage(String(currentPage));
  }, [currentPage]);

  // Calculate start and end indices correctly
  const getStartIndex = (): number => {
    if (totalItems === 0) return 0;
    if (itemsPerPage === "All") return 1;
    return (currentPage - 1) * (itemsPerPage as number) + 1;
  };

  const getEndIndex = (): number => {
    if (totalItems === 0) return 0;
    if (itemsPerPage === "All") return totalItems;
    return (currentPage - 1) * (itemsPerPage as number) + currentPageItemCount;
  };

  const startIndex = getStartIndex();
  const endIndex = getEndIndex();

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(goToPage);
      if (page >= 1 && page <= totalPages && !loading) {
        onPageChange(page);
      }
    }
  };

  const handleGoToPageBlur = () => {
    const page = parseInt(goToPage);
    if (page >= 1 && page <= totalPages && !loading) {
      onPageChange(page);
    } else {
      setGoToPage(String(currentPage));
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
      {/* Left side - Status text */}
      <span className="text-gray-600 font-medium">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Loading...
          </span>
        ) : totalItems === 0 ? (
          <span className="text-gray-500">No entries found</span>
        ) : (
          <>
            <span className="text-gray-900">Page {currentPage}</span>
            <span className="text-gray-400 mx-1.5">of</span>
            <span className="text-gray-900">{totalPages}</span>
            <span className="text-gray-400 mx-2.5">•</span>
            <span className="text-gray-600">
              Showing{' '}
              <span className="text-gray-900 font-semibold">{startIndex.toLocaleString()}</span>
              {' '}to{' '}
              <span className="text-gray-900 font-semibold">{endIndex.toLocaleString()}</span>
              {' '}of{' '}
              <span className="text-gray-900 font-semibold">{totalItems.toLocaleString()}</span>
              {' '}entries
              {itemsPerPage === "All" && (
                <span className="text-gray-500 ml-2">(All)</span>
              )}
            </span>
          </>
        )}
      </span>

      {/* Right side - Pagination controls */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading || totalItems === 0}
          className={`
            px-3 py-2 rounded-lg border transition-all duration-200 flex items-center gap-1
            ${currentPage === 1 || loading || totalItems === 0
              ? "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50"
              : "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow"
            }
          `}
        >
          <ChevronLeft size={16} />
          <span className="text-xs font-medium">Prev</span>
        </button>

        {/* Page numbers - only show if there are pages */}
        {totalPages > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                if (i < 5) pageNum = i + 1;
                else if (i === 5) return <span key="ellipsis1" className="px-2 text-gray-400 font-medium">...</span>;
                else pageNum = totalPages;
              } else if (currentPage >= totalPages - 3) {
                if (i === 0) pageNum = 1;
                else if (i === 1) return <span key="ellipsis2" className="px-2 text-gray-400 font-medium">...</span>;
                else pageNum = totalPages - (6 - i);
              } else {
                if (i === 0) pageNum = 1;
                else if (i === 1) return <span key="ellipsis3" className="px-2 text-gray-400 font-medium">...</span>;
                else if (i >= 2 && i <= 4) pageNum = currentPage - 2 + i;
                else if (i === 5) return <span key="ellipsis4" className="px-2 text-gray-400 font-medium">...</span>;
                else pageNum = totalPages;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`
                    min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200
                    ${currentPage === pageNum
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                      : 'text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                    }
                    ${loading ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                  `}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading || totalItems === 0}
          className={`
            px-3 py-2 rounded-lg border transition-all duration-200 flex items-center gap-1
            ${currentPage === totalPages || loading || totalItems === 0
              ? "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50"
              : "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow"
            }
          `}
        >
          <span className="text-xs font-medium">Next</span>
          <ChevronRight size={16} />
        </button>

        {/* Go to page */}
        {totalPages > 0 && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-gray-500 text-sm">Go to:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={goToPage}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setGoToPage(value);
                }
              }}
              onKeyDown={handleGoToPage}
              onBlur={handleGoToPageBlur}
              className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white 
                       focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                       transition-all duration-200 text-center outline-none"
              disabled={loading}
            />
          </div>
        )}

        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              const value = e.target.value;
              onItemsPerPageChange(value === "All" ? "All" : Number(value));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white 
                     focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                     transition-all duration-200 outline-none cursor-pointer"
            disabled={loading}
          >
            <option value={1000}>1000</option>
            <option value={2000}>2000</option>
            <option value={5000}>5000</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="All">All</option>
          </select>
        </div>

        {/* Refresh button */}
        {showRefreshButton && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`
              p-2 rounded-lg border transition-all duration-200
              ${loading
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-600 hover:text-indigo-600 shadow-sm hover:shadow'
              }
            `}
          >
            <RefreshCw 
              size={16} 
              className={`transition-all duration-300 ${loading ? 'animate-spin text-indigo-600' : ''}`} 
            />
          </button>
        )}
      </div>
    </div>
  );
};