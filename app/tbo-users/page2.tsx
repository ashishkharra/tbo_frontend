'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  UserPlus,
  Plus,
  Copy,
  Check,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Settings,
  Eye,
  EyeOff,
  Edit,
  Database,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  Activity,
  AlertTriangle,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Crown,
  Zap,
  LogOut,
  Building2,
  Network,
  ChevronRight,
  ChevronDown,
  ClipboardPaste,
} from 'lucide-react';

// SearchableSelect Component (Integrated)
function SearchableSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  label, 
  disabled, 
  id, 
  activeDropdown, 
  onDropdownToggle 
}: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<(string | number)[]>([]);

  const isOpen = activeDropdown === id;

  React.useEffect(() => {
    const baseOptions = ['All', ...options];
    const lower = searchTerm.toLowerCase();
    let filtered = baseOptions.filter(option => 
      option.toString().toLowerCase().includes(lower)
    );
    if (searchTerm && !baseOptions.some(o => o.toString().toLowerCase() === lower)) {
      filtered = [searchTerm, ...filtered];
    }
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  const handleSelect = (option: string | number) => {
    onChange(option.toString());
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      if (isOpen) {
        onDropdownToggle(null);
        setSearchTerm('');
      } else {
        onDropdownToggle(id);
        setSearchTerm('');
      }
    }
  };

  const handleCloseDropdown = () => {
    onDropdownToggle(null);
    setSearchTerm('');
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest(`[data-dropdown-id="${id}"]`)) {
        onDropdownToggle(null);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, id, onDropdownToggle]);

  return (
    <div className="relative" data-dropdown-id={id}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-left flex items-center justify-between"
        >
          <span className={`${value ? 'text-gray-900' : 'text-gray-500'} truncate`} title={value || placeholder}>
            {value || placeholder}
          </span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden min-w-[200px]">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    const baseOptions = ['All', ...options];
                    const lower = value.toLowerCase();
                    let filtered = baseOptions.filter(option => 
                      option.toString().toLowerCase().includes(lower)
                    );
                    if (value && !baseOptions.some(o => o.toString().toLowerCase() === lower)) {
                      filtered = [value, ...filtered];
                    }
                    setFilteredOptions(filtered);
                  }}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={handleCloseDropdown}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Close dropdown"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none whitespace-nowrap overflow-hidden text-ellipsis"
                    title={option.toString()}
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Password Cell Component
const PasswordCell = ({ row, rowIndex, onUpdate }: any) => {
  const user = row.original;
  if (user.id && String(user.id).startsWith('blank-')) {
    return <span className="text-gray-300 italic">Optional</span>;
  }

  const [val, setVal] = useState(user.password || '');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setVal(user.password || '');
  }, [user.password]);

  const handleBlur = () => {
    if (val !== user.password) {
      if (onUpdate) {
        onUpdate(rowIndex, 'password', val);
      }
    }
  };

  return (
    <div className="relative flex items-center w-full h-full">
      <input
        type={showPassword ? "text" : "password"}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        className="w-full h-full p-1 bg-transparent focus:outline-none placeholder:text-gray-400 text-sm"
        placeholder={user.id && !String(user.id).startsWith('new') && !String(user.id).startsWith('blank') && !showPassword ? "••••••••" : "Change (opt)"}
      />
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
        className="absolute right-0 p-1 text-gray-400 hover:text-gray-600"
      >
        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </div>
  );
};

// Assignment Token Cell Component
const AssignmentTokenCell = ({ tokens }: { tokens: string[] }) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 items-center max-w-full">
      {tokens.map((token, index) => (
        <div key={index} className="flex items-center gap-1 text-xs shrink-0">
          <span
            title={token}
            className="truncate max-w-[100px] font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded"
          >
            {token}
          </span>
          <button
            className="p-0.5 hover:bg-gray-200 rounded transition-colors shrink-0"
            title="Copy token"
            onClick={() => handleCopyToken(token)}
          >
            {copiedToken === token ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3 text-gray-600" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
};

// Modules Code Cell Component
const ModulesCodeCell = ({ 
  user, 
  modulesCodeMap, 
  handleUpdateRow, 
  paginatedUsers,
  users,
  setMessage,
  setLoading,
  fetchUsers
}: any) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPasteInput, setShowPasteInput] = useState<boolean>(false);
  const [pasteValue, setPasteValue] = useState<string>('');

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handlePasteCode = async () => {
    if (!pasteValue.trim()) {
      setMessage('Please enter a valid code to paste');
      return;
    }
    
    setShowPasteInput(false);
    setPasteValue('');
  };

  if (user.id && String(user.id).startsWith('blank-')) {
    return <span className="text-gray-300">-</span>;
  }

  const mods: string[] = (user.assignedModules || user.assigned_modules || []) as string[];
  const dbCode = (user.modules_code || '').trim();
  const hasAssignedModules = Array.isArray(mods) && mods.length > 0;

  if (dbCode && (hasAssignedModules || user.role === 'super_admin')) {
    return (
      <div className="flex items-center gap-1">
        {showPasteInput ? (
          <>
            <input
              type="text"
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePasteCode();
                if (e.key === 'Escape') {
                  setShowPasteInput(false);
                  setPasteValue('');
                }
              }}
              placeholder="Enter code..."
              autoFocus
              className="text-xs border border-blue-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handlePasteCode}
              className="p-0.5 hover:bg-green-100 rounded transition-colors"
              title="Apply"
            >
              <Check className="w-3 h-3 text-green-600" />
            </button>
            <button
              onClick={() => {
                setShowPasteInput(false);
                setPasteValue('');
              }}
              className="p-0.5 hover:bg-red-100 rounded transition-colors"
              title="Cancel"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-700 truncate block font-mono" title={dbCode}>
              {dbCode}
            </span>
            <button
              onClick={() => handleCopyCode(dbCode)}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors shrink-0"
              title="Copy code"
            >
              {copiedCode === dbCode ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setShowPasteInput(true)}
              className="p-0.5 hover:bg-blue-100 rounded transition-colors shrink-0"
              title="Paste code"
            >
              <ClipboardPaste className="w-3 h-3 text-blue-600" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {showPasteInput ? (
        <>
          <input
            type="text"
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePasteCode();
              if (e.key === 'Escape') {
                setShowPasteInput(false);
                setPasteValue('');
              }
            }}
            placeholder="Enter code..."
            autoFocus
            className="text-xs border border-blue-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handlePasteCode}
            className="p-0.5 hover:bg-green-100 rounded transition-colors"
            title="Apply"
          >
            <Check className="w-3 h-3 text-green-600" />
          </button>
          <button
            onClick={() => {
              setShowPasteInput(false);
              setPasteValue('');
            }}
            className="p-0.5 hover:bg-red-100 rounded transition-colors"
            title="Cancel"
          >
            <X className="w-3 h-3 text-red-600" />
          </button>
        </>
      ) : (
        <>
          <span className="text-gray-400 text-xs">No code</span>
          <button
            onClick={() => setShowPasteInput(true)}
            className="p-0.5 hover:bg-blue-100 rounded transition-colors shrink-0"
            title="Paste code"
          >
            <ClipboardPaste className="w-3 h-3 text-blue-600" />
          </button>
        </>
      )}
    </div>
  );
};

// Permission Code Cell Component
const PermissionCodeCell = ({ 
  user, 
  handleUpdateRow, 
  paginatedUsers,
  users,
  setMessage,
  setLoading,
  fetchUsers
}: any) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPasteInput, setShowPasteInput] = useState<boolean>(false);
  const [pasteValue, setPasteValue] = useState<string>('');

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handlePasteCode = async () => {
    if (!pasteValue.trim()) {
      setMessage('Please enter a valid code to paste');
      return;
    }
    
    setShowPasteInput(false);
    setPasteValue('');
  };

  if (user.id && String(user.id).startsWith('blank-')) {
    return <span className="text-gray-300">-</span>;
  }

  const code = user.permission_code || user.permissionCode;

  if (!code) {
    return (
      <div className="flex items-center gap-1">
        {showPasteInput ? (
          <>
            <input
              type="text"
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePasteCode();
                if (e.key === 'Escape') {
                  setShowPasteInput(false);
                  setPasteValue('');
                }
              }}
              placeholder="Enter code..."
              autoFocus
              className="text-xs border border-blue-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handlePasteCode}
              className="p-0.5 hover:bg-green-100 rounded transition-colors"
              title="Apply"
            >
              <Check className="w-3 h-3 text-green-600" />
            </button>
            <button
              onClick={() => {
                setShowPasteInput(false);
                setPasteValue('');
              }}
              className="p-0.5 hover:bg-red-100 rounded transition-colors"
              title="Cancel"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </>
        ) : (
          <>
            <span className="text-gray-400 text-xs">-</span>
            <button
              onClick={() => setShowPasteInput(true)}
              className="p-0.5 hover:bg-blue-100 rounded transition-colors shrink-0"
              title="Paste code"
            >
              <ClipboardPaste className="w-3 h-3 text-blue-600" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {showPasteInput ? (
        <>
          <input
            type="text"
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePasteCode();
              if (e.key === 'Escape') {
                setShowPasteInput(false);
                setPasteValue('');
              }
            }}
            placeholder="Enter code..."
            autoFocus
            className="text-xs border border-blue-300 rounded px-1 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handlePasteCode}
            className="p-0.5 hover:bg-green-100 rounded transition-colors"
            title="Apply"
          >
            <Check className="w-3 h-3 text-green-600" />
          </button>
          <button
            onClick={() => {
              setShowPasteInput(false);
              setPasteValue('');
            }}
            className="p-0.5 hover:bg-red-100 rounded transition-colors"
            title="Cancel"
          >
            <X className="w-3 h-3 text-red-600" />
          </button>
        </>
      ) : (
        <>
          <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-semibold">
            {code}
          </span>
          <button
            onClick={() => handleCopyCode(code)}
            className="p-0.5 hover:bg-gray-200 rounded transition-colors shrink-0"
            title="Copy code"
          >
            {copiedCode === code ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setShowPasteInput(true)}
            className="p-0.5 hover:bg-blue-100 rounded transition-colors shrink-0"
            title="Paste code"
          >
            <ClipboardPaste className="w-3 h-3 text-blue-600" />
          </button>
        </>
      )}
    </div>
  );
};

// Main TBO Users Page Component
export default function TBOUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [generalSearch, setGeneralSearch] = useState('');
  const [usernameFilter, setUsernameFilter] = useState<string>('all');
  const [searchReadOnly, setSearchReadOnly] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showModuleAssignModal, setShowModuleAssignModal] = useState(false);
  const [editedUser, setEditedUser] = useState<any | null>(null);
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [newRows, setNewRows] = useState<any[]>([]);
  const [showHierarchicalAssignModal, setShowHierarchicalAssignModal] = useState(false);
  const [hierarchicalAssignUser, setHierarchicalAssignUser] = useState<any | null>(null);
  const [showParentManagementModal, setShowParentManagementModal] = useState(false);
  const [parentManagementUser, setParentManagementUser] = useState<any | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [parentFilter, setParentFilter] = useState<'all' | number>('all');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [isModalSaving, setIsModalSaving] = useState(false);
  const [modalSaveMessage, setModalSaveMessage] = useState('');

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0,
  });

  // User roles for dropdown
  const USER_ROLES = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'coordinator', label: 'Coordinator' },
    { value: 'data_entry_operator', label: 'Data Entry Operator' },
    { value: 'caller', label: 'Caller' },
    { value: 'driver', label: 'Driver' },
    { value: 'survey', label: 'Survey' },
    { value: 'printer', label: 'Printer' },
    { value: 'mobile_user', label: 'Mobile User' },
    { value: 'leader', label: 'Leader' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'user', label: 'User' }
  ];

  // Get users filtered by role for username dropdown
  const usersByRole = useMemo(() => {
    if (roleFilter === 'all') {
      return users;
    }
    return users.filter(user => user.role === roleFilter);
  }, [users, roleFilter]);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    const combined: any[] = [...(newRows as any[]), ...(users as any[])];
    let filtered = combined;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (generalSearch) {
      const searchTerm = generalSearch.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.mobile && user.mobile.includes(searchTerm)) ||
        user.role.toLowerCase().includes(searchTerm)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    if (usernameFilter !== 'all') {
      filtered = filtered.filter(user => user.username === usernameFilter);
    }

    if (parentFilter !== 'all') {
      filtered = filtered.filter(user => Number(user.parent_id) === Number(parentFilter));
    }

    const actualUsers = filtered.filter(user => !user.id || !String(user.id).startsWith('blank-'));

    return actualUsers;
  }, [users, newRows, searchTerm, generalSearch, roleFilter, statusFilter, usernameFilter, parentFilter]);

  // Paginated data
  const paginatedUsers = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const pageData = filteredUsers.slice(startIndex, endIndex);

    const minRows = Math.max(10, pagination.itemsPerPage);
    const blankRowsNeeded = Math.max(0, minRows - pageData.length);
    const blankRows = Array.from({ length: blankRowsNeeded }, (_, index) => ({
      id: `blank-${startIndex + pageData.length + index}`,
      username: '',
      email: '',
      mobile: '',
      role: roleFilter !== 'all' ? roleFilter : 'user',
      isActive: true,
      createdAt: '',
      updatedAt: '',
      permissions: []
    }));

    return [...pageData, ...blankRows];
  }, [filteredUsers, pagination.currentPage, pagination.itemsPerPage, roleFilter]);

  // Column definitions for ExcelDataTable
  const getColumns = () => [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 30,
      readOnly: true,
      cell: ({ row }: any) => {
        const id = row.original.id;
        if (id && String(id).startsWith('blank-')) {
          return <span className="text-gray-300">-</span>;
        }
        return <span>{id}</span>;
      },
    },
    {
      accessorKey: 'role',
      header: 'Role *',
      size: 120,
      readOnly: false,
      type: 'select',
      selectOptions: USER_ROLES,
      cell: ({ row }: any) => {
        const user = row.original;

        if (user.id && String(user.id).startsWith('blank-')) {
          return <span className="text-gray-300 italic">Select role</span>;
        }

        const roleLabel = USER_ROLES.find(r => r.value === user.role)?.label || user.role;
        return (
          <span className="text-gray-800">
            {roleLabel}
          </span>
        );
      },
    },
    {
      accessorKey: 'username',
      header: 'Username',
      size: 100,
      readOnly: false,
      type: 'text',
      cell: ({ row }: any) => {
        const user = row.original;

        if (user.id && String(user.id).startsWith('blank-')) {
          return <span className="text-gray-300 italic">Click to add username</span>;
        }

        return (
          <span
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(user);
              setEditedUser({
                ...user,
                password: '',
                assignedDatasets: user.assignedDatasets || [],
                datasetAccess: user.datasetAccess || [],
                selectedColumns: user.selectedColumns || {},
                assignedModules: user.assignedModules || [],
                assignedSubModules: user.assignedSubModules || [],
                permissions: user.permissions || [],
                team_ids: user.team_ids || []
              });
              setDirtyFields(new Set());
              setShowUserDetails(true);
            }}
          >
            {user.username}
          </span>
        );
      },
    },
    {
      accessorKey: 'mobile',
      header: 'Mobile',
      size: 100,
      readOnly: false,
      type: 'text',
      cell: ({ row }: any) => {
        const user = row.original;
        if (user.id && String(user.id).startsWith('blank-')) {
          return <span className="text-gray-300 italic">Click to add mobile</span>;
        }
        return <span>{user.mobile}</span>;
      },
    },
    {
      accessorKey: 'password',
      header: 'Password',
      size: 120,
      readOnly: false,
      type: 'password',
      cell: ({ row }: any) => <PasswordCell row={row} rowIndex={row.index} onUpdate={() => {}} />
    },
    {
      accessorKey: 'modulesCode',
      header: 'Modules Code',
      size: 150,
      readOnly: false,
      editable: true,
      type: 'text',
      cell: ({ row }: any) => (
        <ModulesCodeCell 
          user={row.original} 
          modulesCodeMap={{}}
          handleUpdateRow={() => {}}
          paginatedUsers={paginatedUsers}
          users={users}
          setMessage={setMessage}
          setLoading={setLoading}
          fetchUsers={() => {}}
        />
      )
    },
    {
      accessorKey: 'permission_code',
      header: 'Permission Code',
      size: 120,
      readOnly: false,
      editable: true,
      type: 'text',
      cell: ({ row }: any) => (
        <PermissionCodeCell 
          user={row.original} 
          handleUpdateRow={() => {}}
          paginatedUsers={paginatedUsers}
          users={users}
          setMessage={setMessage}
          setLoading={setLoading}
          fetchUsers={() => {}}
        />
      )
    },
    {
      accessorKey: 'assignmentCode',
      header: 'Assign Code',
      size: 200,
      readOnly: false,
      type: 'text',
      editable: true,
      cell: ({ row }: any) => {
        const user = row.original;
        if (user.id && String(user.id).startsWith('blank-')) return <span className="text-gray-300">-</span>;

        let primaryTokens: string[] = [];
        if (user.assignment_tokens) {
          if (Array.isArray(user.assignment_tokens)) {
            primaryTokens = user.assignment_tokens.filter((t: string) => t && t.trim() !== '' && t !== 'null');
          } else if (typeof user.assignment_tokens === 'string') {
            primaryTokens = user.assignment_tokens.split(',').filter((t: string) => t && t.trim() !== '' && t !== 'null');
          }
        }

        if (primaryTokens.length > 0) {
          return <AssignmentTokenCell tokens={primaryTokens} />;
        }

        return <span className="text-gray-400 text-xs">Paste token to copy assignment</span>;
      }
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      size: 230,
      readOnly: true,
      cell: ({ row }: any) => {
        const user = row.original;

        if (user.id && String(user.id).startsWith('blank-')) {
          return <span className="text-gray-300">-</span>;
        }

        return (
          <div className="flex items-center gap-1 flex-wrap" style={{ minWidth: '200px' }}>
            <button
              onClick={() => {
                setSelectedUser(user);
                setEditedUser({
                  ...user,
                  assignedModules: user.assignedModules || [],
                  assignedSubModules: user.assignedSubModules || [],
                  assignedDatasets: user.assignedDatasets || [],
                  assignedNavbarPages: user.assignedNavbarPages || []
                });
                setDirtyFields(new Set());
                setShowModuleAssignModal(true);
              }}
              className="px-2 py-1 text-xs font-medium text-white bg-gray-600 hover:bg-gray-700 rounded whitespace-nowrap shadow-sm"
              title="Assign Modules & Datasets"
            >
              Modules
            </button>

            <button
              onClick={async () => {
                setHierarchicalAssignUser(user);
                setShowHierarchicalAssignModal(true);
              }}
              className="px-2 py-1 text-xs font-medium text-white bg-gray-600 hover:bg-gray-700 rounded whitespace-nowrap shadow-sm"
              title="Assign Hierarchical Data"
            >
              Data Assign
            </button>

            {user.id && !String(user.id).startsWith('new') && !String(user.id).startsWith('blank-') && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setParentManagementUser(user);
                  setShowParentManagementModal(true);
                }}
                className="px-2 py-1 text-xs font-medium text-white bg-gray-600 hover:bg-gray-700 rounded whitespace-nowrap shadow-sm"
                title="Manage User Parent"
              >
                Team
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="p-0">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-0">
          <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-4">
            {/* Filters Section - Left Side */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              {/* Role Filter using SearchableSelect */}
              <div>
                <SearchableSelect
                  value={roleFilter}
                  onChange={(value: string) => {
                    setRoleFilter(value);
                    setUsernameFilter('all');
                  }}
                  options={USER_ROLES.map(role => role.value)}
                  placeholder="All Roles"
                  id="role-filter"
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                />
              </div>

              {/* Parent Filter */}
              <div>
                <SearchableSelect
                  value={parentFilter === 'all' ? 'all' : String(parentFilter)}
                  onChange={(value: string) => {
                    setParentFilter(value === 'all' ? 'all' : Number(value));
                  }}
                  options={[]}
                  placeholder="All Parents"
                  id="parent-filter"
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                />
              </div>

              {/* Username Filter */}
              <div>
                <SearchableSelect
                  value={usernameFilter}
                  onChange={setUsernameFilter}
                  options={usersByRole.map(user => user.username)}
                  placeholder="All Users"
                  id="username-filter"
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                />
              </div>

              {/* Status Filter */}
              <div>
                <SearchableSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={['all', 'active', 'inactive']}
                  placeholder="All Status"
                  id="status-filter"
                  activeDropdown={activeDropdown}
                  onDropdownToggle={setActiveDropdown}
                />
              </div>

              {/* General Search */}
              <div>
                <input
                  type="search"
                  id="user_general_search"
                  name="user_general_search_field_random_v2"
                  autoComplete="off"
                  data-lpignore="true"
                  value={generalSearch}
                  onChange={(e) => setGeneralSearch(e.target.value)}
                  readOnly={searchReadOnly}
                  onFocus={() => setSearchReadOnly(false)}
                  placeholder="Search by name, mobile, role..."
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                />
              </div>

              {/* Save Changes Button */}
              <div>
                <button
                  onClick={() => {
                    setMessage('Save functionality would be implemented here');
                  }}
                  className="py-2 px-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm cursor-pointer whitespace-nowrap"
                  title="Save all changes"
                >
                  💾 Save Changes
                </button>
              </div>

              {/* Refresh/Clear Button */}
              <div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setGeneralSearch('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                    setUsernameFilter('all');
                    setParentFilter('all');
                  }}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-sm cursor-pointer flex items-center space-x-1"
                  title="Clear all filters"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Side - Add User Button */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 ml-auto">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNewUserModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  title="Open form to create a new user"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Users Table Area */}
          <div className="bg-white rounded-lg shadow-lg mb-0 mt-6" style={{ padding: 0 }}>
            <div className="p-0" style={{ margin: 0, padding: 0 }}>
              <div style={{ height: 'calc(100vh - 420px)', minHeight: '650px', margin: 0, padding: 0 }}>
                {/* Users Table */}
                <div style={{ height: 'calc(100% - 20px)', marginBottom: '20px' }}>
                  {/* Note: AdvancedExcelDataTable component would be imported from your components */}
                  <div className="border border-gray-300 rounded-lg p-4 text-center">
                    <p className="text-gray-600">Advanced Excel Data Table Component Area</p>
                    <p className="text-sm text-gray-500">This area would contain the Excel-like table with {paginatedUsers.length} rows</p>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex-shrink-0 mt-4">
                  <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{Math.min(paginatedUsers.length, pagination.itemsPerPage)}</span> of{' '}
                      <span className="font-medium">{filteredUsers.length}</span> users
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className="bg-white rounded-lg shadow-lg p-4 mb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {message.includes('session has expired') ? (
                    <X className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <span className="text-gray-800">{message}</span>
                </div>
                <button
                  onClick={() => setMessage('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New User Form Modal (Placeholder) */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New User</h3>
              <button onClick={() => setShowNewUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Username" className="w-full p-2 border rounded" />
              <input type="email" placeholder="Email" className="w-full p-2 border rounded" />
              <input type="password" placeholder="Password" className="w-full p-2 border rounded" />
              <select className="w-full p-2 border rounded">
                {USER_ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowNewUserModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal (Placeholder) */}
      {showUserDetails && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">User Details</h3>
              <button onClick={() => setShowUserDetails(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Username" className="p-2 border rounded" />
                <input type="email" placeholder="Email" className="p-2 border rounded" />
                <input type="text" placeholder="Mobile" className="p-2 border rounded" />
                <select className="p-2 border rounded">
                  {USER_ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowUserDetails(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module Assignment Modal (Placeholder) */}
      {showModuleAssignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[700px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Module Assignment</h3>
              <button onClick={() => setShowModuleAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p>Module assignment interface would appear here</p>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowModuleAssignModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Save Modules</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}