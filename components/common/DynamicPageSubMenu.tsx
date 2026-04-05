"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const menuConfig = [
  {
    baseRoute: "/voter-list",
    items: [
      { label: "Dashboard", href: "/voter-list" },
      { label: "Filter", href: "/voter-list/filter" },
      { label: "Master", href: "/voter-list/master" },
      { label: "Data Process", href: "/voter-list/data-process" },
      { label: "Import / Export", href: "/voter-list/import-export" },
      { label: "Activity", href: "/voter-list/activity" },
      { label: "Maps", href: "/voter-list/maps" },
      { label: "Setting", href: "/voter-list/setting" },
      { label: "Report", href: "/voter-list/report" },
      { label: "Printer", href: "/voter-list/printer" },
    ],
  },
];

export default function DynamicPageSubMenu() {
  const pathname: any = usePathname();

  const currentMenu =
    menuConfig.find((group) => pathname.startsWith(group.baseRoute)) || null;

  if (!currentMenu) return null;

  return (
    <div className="w-full border-t border-b border-gray-200 bg-[#f3f3f3] px-4 py-1">
      <div className="flex items-center justify-center gap-3">
        {currentMenu.items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-lg px-5 py-2 text-[15px] font-medium transition-all",
                isActive
                  ? "bg-gray-200 text-gray-900 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}