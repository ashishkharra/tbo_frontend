export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  matcher: string[];
  items: NavItem[];
}

export const pageNavConfig: NavGroup[] = [
  {
    matcher: ["/dashboard"],
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Filter", href: "/dashboard/filter" },
      { label: "Master", href: "/dashboard/master" },
      { label: "Data Process", href: "/dashboard/data-process" },
      { label: "Import / Export", href: "/dashboard/import-export" },
      { label: "Activity", href: "/dashboard/activity" },
      { label: "Maps", href: "/dashboard/maps" },
      { label: "Setting", href: "/dashboard/setting" },
      { label: "Report", href: "/dashboard/report" },
      { label: "Printer", href: "/dashboard/printer" },
    ],
  },

  {
    matcher: ["/voter-list", "/live-voter-list"],
    items: [
      { label: "Dashboard", href: "/live-voter-list" },
      { label: "Filter", href: "/live-voter-list/filter" },
      { label: "Master", href: "/live-voter-list/master" },
      { label: "Data Process", href: "/live-voter-list/data-process" },
      { label: "Import / Export", href: "/live-voter-list/import-export" },
      { label: "Activity", href: "/live-voter-list/activity" },
      { label: "Maps", href: "/live-voter-list/maps" },
      { label: "Setting", href: "/live-voter-list/setting" },
      { label: "Report", href: "/live-voter-list/report" },
      { label: "Printer", href: "/live-voter-list/printer" },
    ],
  },

  {
    matcher: ["/users"],
    items: [
      { label: "Users", href: "/users" },
      { label: "Roles", href: "/users/roles" },
      { label: "Permissions", href: "/users/permissions" },
      { label: "Settings", href: "/users/settings" },
    ],
  },
];