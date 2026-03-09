export interface MenuItem {
  id: string;
  title: string;
  path?: string;
  icon?: string;
}

export interface SubModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  menus?: MenuItem[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  subModules?: SubModule[];
  menus?: MenuItem[];
}

export const MODULES: Module[] = [
  {
    id: 'dataset',
    title: 'Data Set',
    description: 'Manage and view voter data with advanced filtering options',
    icon: '📋',
    subModules: [
      { id: 'dataset_1', title: 'Dataset 1', description: 'Primary voter dataset', icon: '📊' }
    ],
    menus: [
      { id: 'dashboard', title: 'Dashboard', path: '/dashboard', icon: '📊' },
      { id: 'filter', title: 'Filter', path: '/', icon: '🔍' },
      { id: 'master', title: 'Master', path: '/master', icon: '🗂️' },
      { id: 'by-surname', title: 'By Surname', path: '/surname', icon: '👤' },
      { id: 'data-alteration', title: 'Data Alteration', path: '/data-alteration', icon: '✏️' },
      { id: 'village-mapping', title: 'Village Mapping', path: '/village-mapping', icon: '🗺️' },
      { id: 'data-condition', title: 'Data Condition', path: '/data-condition', icon: '⚙️' },
      { id: 'import-export', title: 'Import / Export', path: '/import_export', icon: '📥' },
      { id: 'activity', title: 'Activity', path: '/activity', icon: '📋' },
      { id: 'maps', title: 'Maps', path: '/maps', icon: '🗺️' },
      { id: 'settings', title: 'Setting', path: '/settings', icon: '⚙️' },
      { id: 'report', title: 'Report', path: '/report', icon: '📄' },
      { id: 'printer', title: 'Printer', path: '/printer', icon: '🖨️' }
    ]
  },
  {
    id: 'mobile-settings',
    title: 'Mobile Settings',
    description: 'Configure mobile app settings and permissions',
    icon: '⚙️',
    menus: [
      { id: 'user-login', title: 'User Login', path: '/mobile-settings', icon: '🔐' },
      { id: 'setting', title: 'Setting', path: '/mobile-settings', icon: '⚙️' },
      { id: 'group', title: 'Group', path: '/mobile-settings', icon: '👥' },
      { id: 'report', title: 'Report', path: '/mobile-settings', icon: '📊' },
      { id: 'campaign', title: 'Campaign', path: '/mobile-settings', icon: '🎯' }
    ]
  },
  {
    id: 'tbo-users',
    title: 'TBO Users',
    description: 'Manage TBO user accounts and permissions',
    icon: '👥',
    menus: [
      { id: 'users', title: 'Users', path: '/tbo-users', icon: '👥' },
      { id: 'permissions', title: 'Permissions', path: '/permissions', icon: '🔐' },
      { id: 'activities', title: 'Activities', path: '/activities', icon: '📊' },
      { id: 'verification-requests', title: 'Verification Requests', path: '/admin/verification-requests', icon: '⚠️' }
    ]
  },
  {
    id: 'callers',
    title: 'Callers',
    description: 'Manage caller information and assignments',
    icon: '📞',
    menus: [
      { id: 'caller-management', title: 'Caller Management', path: '/callers', icon: '👥' },
      { id: 'caller-reports', title: 'Caller Reports', path: '/callers/caller-reports', icon: '📊' },
      { id: 'calling-set', title: 'Calling Set', path: '/callers/calling-set', icon: '⚙️' },
      { id: 'caller-interface', title: 'Caller Interface', path: '/callers/caller-interface', icon: '💬' },
      { id: 'callers-db', title: 'Callers DB', path: '/callers/callers-db', icon: '🗄️' }
    ]
  },
  {
    id: 'data-entry',
    title: 'Data Entry',
    description: 'Enter and manage voter data entries',
    icon: '✏️',
    menus: [
      { id: 'data-entry', title: 'Data Entry', path: '/data-entry-operator', icon: '✏️' }
    ]
  },
  {
    id: 'master-setting',
    title: 'Master Setting',
    description: 'Configure system master settings',
    icon: '⚙️',
    menus: [
      { id: 'master-setting', title: 'Master Settings', path: '/master-setting', icon: '⚙️' }
    ]
  },
  {
    id: 'current-voter-data',
    title: 'Current Voter Data',
    description: 'View and manage current voter information',
    icon: '🗳️',
    menus: [
      { id: 'dashboard', title: 'Dashboard', path: '/live-voter-list/dashboard', icon: '📊' },
      { id: 'voterlist', title: 'Voterlist', path: '/live-voter-list', icon: '📋' },
      { id: 'master', title: 'Master', path: '/live-voter-list/master', icon: '🗂️' },
      { id: 'import-export', title: 'Import / Export', path: '/live-voter-list-import-export', icon: '📥' },
      { id: 'print', title: 'Print', path: '/live-voter-list/print-1', icon: '🖨️' },
      { id: 'settings', title: 'Settings', path: '/live-voter-list/settings', icon: '⚙️' },
      { id: 'report', title: 'Report', path: '/live-voter-list/report', icon: '📄' }
    ]
  },
  {
    id: 'blank-voter-analysis',
    title: 'Blank Voter Data Analysis',
    description: 'Analyze blank voter data patterns',
    icon: '📊',
    menus: [
      { id: 'analysis', title: 'Analysis', path: '/voter-analysis', icon: '📊' }
    ]
  },
  {
    id: 'volunteers',
    title: 'Volunteers',
    description: 'Manage volunteer information and activities',
    icon: '🤝',
    menus: [
      { id: 'volunteers', title: 'Volunteers', path: '/volunteers', icon: '🤝' },
      { id: 'volunteer-management', title: 'Volunteer Management', path: '/volunteer/management', icon: '👥' },
      { id: 'volunteer-assignments', title: 'Volunteer Assignments', path: '/volunteer/assignments', icon: '📌' }
    ]
  },
  {
    id: 'result-analysis',
    title: 'Result Analysis',
    description: 'Analyze election results and trends',
    icon: '📈',
    menus: [
      { id: 'results', title: 'Results', path: '/results', icon: '📊' },
      { id: 'result-analysis', title: 'Result Analysis', path: '/result-analysis', icon: '📈' }
    ]
  },
  {
    id: 'master-map-india',
    title: 'Master Map - India',
    description: 'Interactive map of India with administrative boundaries',
    icon: '🗺️',
    menus: [
      { id: 'map', title: 'Map', path: '/map', icon: '🗺️' }
    ]
  },
  {
    id: 'leader',
    title: 'Leader',
    description: 'Manage leader information and profiles',
    icon: '👑',
    menus: [
      { id: 'leader-dashboard', title: 'Leader Dashboard', path: '/leader', icon: '📊' },
      { id: 'data-entry-operators', title: 'Data Entry Operators', path: '/leader/data-entry-operators', icon: '👥' }
    ]
  },
  {
    id: 'vehicle-driver',
    title: 'Vehicle Driver',
    description: 'Manage vehicle and driver assignments',
    icon: '🚗',
    menus: [
      { id: 'driver', title: 'Driver', path: '/driver', icon: '🚗' },
      { id: 'vehicle-management', title: 'Vehicle Management', path: '/vehicle/management', icon: '🚙' }
    ]
  },
  {
    id: 'election-controller',
    title: 'Election Controller',
    description: 'Election management and control system',
    icon: '🗳️',
    menus: [
      { id: 'dashboard', title: 'Dashboard', path: '/election-controller', icon: '📊' },
      { id: 'monitoring', title: 'Monitoring Dashboard', path: '/election-controller/monitoring-dashboard', icon: '👁️' },
      { id: 'booth-management', title: 'Booth Management', path: '/election-controller/booth-management', icon: '🏢' },
      { id: 'candidate-management', title: 'Candidate Management', path: '/election-controller/candidate-management', icon: '👤' },
      { id: 'voter-data', title: 'Voter Data', path: '/election-controller/voter-data', icon: '📋' },
      { id: 'voting-process', title: 'Voting Process', path: '/election-controller/voting-process', icon: '🗳️' },
      { id: 'election-results', title: 'Election Results', path: '/election-controller/election-results', icon: '📈' },
      { id: 'reports-analytics', title: 'Reports & Analytics', path: '/election-controller/reports-analytics', icon: '📊' },
      { id: 'election-schedule', title: 'Election Schedule', path: '/election-controller/election-schedule', icon: '📅' },
      { id: 'security-compliance', title: 'Security & Compliance', path: '/election-controller/security-compliance', icon: '🔒' }
    ]
  }
];
