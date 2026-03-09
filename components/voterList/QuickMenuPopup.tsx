// components/voterList/QuickMenuPopup.tsx
'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Settings as SettingsIcon,
  Import as ImportIcon,
  PrinterIcon,
  FileText as FileTextIcon,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickMenuPopup: React.FC<Props> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  if (!isOpen) return null;

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/live-voter-list/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "voterlist",
      label: "Voterlist",
      path: "/voter-list",
      icon: ListChecks,
    },
    {
      id: "master",
      label: "Master",
      defaultPath: "/voter-list/master",
      icon: SettingsIcon,
      children: [
        { label: "Master Data", path: "/voter-list/master" },
        { label: "Booth Mapping", path: "/voter-list/booth-maping" },
        { label: "Live Cast ID Master", path: "/live-voter-list/master/cast-id" },
      ],
    },
    {
      id: "importExport",
      label: "Import / Export",
      defaultPath: "/voter-list/import-data",
      icon: ImportIcon,
      children: [
        { label: "Import Data", path: "/voter-list/import-data" },
        { label: "Export Data", path: "/voter-list/import-data" },
        { label: "Export Process", path: "/voter-list/import-data" },
      ],
    },
    {
      id: "print",
      label: "Print",
      defaultPath: "/live-voter-list/print-1",
      icon: PrinterIcon,
      children: [
        { label: "Print 1", path: "/live-voter-list/print-1" },
        { label: "Print 2", path: "/live-voter-list/print-2" },
        { label: "Print 3", path: "/live-voter-list/print-3" },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      path: "/live-voter-list/settings",
      icon: SettingsIcon,
    },
    {
      id: "report",
      label: "Report",
      path: "/live-voter-list/report",
      icon: FileTextIcon,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[999999] bg-black/70 flex items-center justify-center p-10"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[125vh] overflow-visible border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="text-sm font-semibold text-gray-800">
            Quick Navigation
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition"
          >
            Close
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(95vh-60px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {menuItems.map((item) => {
              const hasChildren = !!(item.children?.length);
              const Icon = item.icon;

              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        setOpenSubmenu(
                          openSubmenu === item.id ? null : item.id
                        );
                      } else {
                        router.push(item.path || item.defaultPath || "#");
                        onClose();
                      }
                    }}
                    className="w-full flex flex-col items-start justify-center px-4 py-3 rounded-lg border bg-white border-gray-200 text-gray-800 hover:bg-gray-50 text-left transition shadow-sm hover:shadow-md"
                  >
                    <div className="w-full flex items-start justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        {Icon && <Icon size={16} className="text-gray-600" />}
                        {item.label}
                      </span>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSubmenu(
                              openSubmenu === item.id ? null : item.id
                            );
                          }}
                          className="text-gray-500 hover:text-gray-800 text-lg leading-none px-1"
                        >
                          ⋯
                        </button>
                      )}
                    </div>
                  </button>

                  {hasChildren && openSubmenu === item.id && (
                    <div className="absolute top-2 right-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
                      <div className="py-1">
                        {item.children?.map((child) => (
                          <button
                            key={child.path}
                            onClick={() => {
                              router.push(child.path);
                              onClose();
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-800"
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};