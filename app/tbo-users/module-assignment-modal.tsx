import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, Save, Loader2, Shield, Settings, Info, Copy, Check } from 'lucide-react';
import { MODULES } from '../../constants/modules';
import apiClient from '../../services/apiClient';
import { getModules } from '@/apis/api';

interface ModuleAssignmentModalProps {
    selectedUser: any;
    editedUser: any;
    setEditedUser: (user: any) => void;
    dirtyFields: Set<string>;
    setDirtyFields: (fields: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
    setShowModuleAssignModal: (show: boolean) => void;
    onSave: () => void;
    isSaving?: boolean;
    saveMessage?: string;
    users?: any[];
    onUserChange?: (user: any) => void;
}

const PERMISSIONS_MAP: Record<string, string[]> = {
    'dataset': ['read', 'create', 'update', 'delete', 'import', 'export', 'filter', 'analyze'],
    'dataset_1': ['read', 'create', 'update', 'delete', 'import', 'export', 'filter', 'analyze'],
    'mobile-settings': ['access', 'offline', 'sync', 'location', 'configure', 'manage'],
    'tbo-users': ['read', 'create', 'update', 'delete', 'manage', 'data-assign'],
    'callers': ['read', 'create', 'update', 'delete', 'assign', 'manage'],
    'data-entry': ['read', 'create', 'update', 'delete', 'validate', 'import'],
    'master-setting': ['read', 'update', 'configure', 'manage'],
    'current-voter-data': ['read', 'create', 'update', 'delete', 'analyze', 'export'],
    'blank-voter-analysis': ['read', 'analyze', 'export', 'report'],
    'volunteers': ['read', 'create', 'update', 'delete', 'assign', 'manage'],
    'result-analysis': ['read', 'analyze', 'export', 'report', 'visualize'],
    'master-map-india': ['read', 'view', 'navigate', 'analyze'],
    'leader': ['read', 'create', 'update', 'delete', 'manage', 'assign'],
    'vehicle-driver': ['read', 'create', 'update', 'delete', 'assign', 'manage'],
    'election-controller': ['read', 'create', 'update', 'delete', 'control', 'manage']
};

// Internal mapping of UI ID to Permission Prefix
const MODULE_TO_PERMISSION_PREFIX: Record<string, string> = {
    'tbo-users': 'users',
    'dataset': 'voters',
    'dataset_1': 'voters',
    'mobile-settings': 'mobile',
    'master-setting': 'settings',
    'data-entry': 'data',
    'teams': 'teams'
};

export default function ModuleAssignmentModal({
    selectedUser,
    editedUser,
    setEditedUser,
    dirtyFields,
    setDirtyFields,
    setShowModuleAssignModal,
    onSave,
    isSaving = false,
    saveMessage = '',
    users = [],
    onUserChange
}: ModuleAssignmentModalProps) {

    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [expandedNavbarSections, setExpandedNavbarSections] = useState<Set<string>>(new Set());
    const [modulesFromDb, setModulesFromDb] = useState<Array<{ id: number; module_id: string; module_name: string }>>([]);
    const [datasetsFromDb, setDatasetsFromDb] = useState<Array<{ id: number; dataset_id: string; dataset_name: string }>>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [modulesCodeMap, setModulesCodeMap] = useState<Record<string, string>>({});
    const [reverseCodeMap, setReverseCodeMap] = useState<Record<string, string>>({});
    const [configCode, setConfigCode] = useState<string>('');
    const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
    const [pasteCode, setPasteCode] = useState<string>('');
    const [pasteError, setPasteError] = useState<string>('');
    const [copiedItem, setCopiedItem] = useState<string | null>(null);

    // Auto-select first assigned module/dataset if none selected
    useEffect(() => {
        if (!selectedItemId && modulesFromDb.length > 0) {
            const assigned = editedUser?.assignedModules || [];
            if (assigned.length > 0) {
                // Check if any of assigned modules are in modulesFromDb or datasetsFromDb
                const firstAvailable = modulesFromDb.find(m => assigned.includes(m.module_id))?.module_id
                    || datasetsFromDb.find(d => assigned.includes(d.dataset_id))?.dataset_id;
                if (firstAvailable) setSelectedItemId(firstAvailable);
            }
        }
    }, [modulesFromDb, datasetsFromDb, editedUser?.assignedModules]);

    // Load modules and datasets dynamically from DB
    useEffect(() => {
        const loadData = async () => {
          const modulesRes = await getModules();
      
          console.log("Modules from API:", modulesRes);
      
          if (modulesRes?.success && Array.isArray(modulesRes.data)) {
            setModulesFromDb(modulesRes.data);
          } else {
            setModulesFromDb([]);
          }
        };
      
        loadData();
      }, []);
      

    const getModuleMeta = (moduleId: string) => MODULES.find(m => m.id === moduleId);

    const getDatasetMeta = (datasetId: string) => {
        const normalized = (datasetId || '').toLowerCase();
        const isOld = normalized === 'old' || normalized === 'old_voter_data_22' || normalized.includes('old') || normalized.includes('22');

        // Map dataset IDs to their corresponding module IDs
        let moduleId = 'dataset'; // Default to dataset module
        if (datasetId === 'live_voter_list') {
            moduleId = 'current-voter-data';
        } else if (datasetId === 'dataset_1') {
            moduleId = 'dataset';
        }

        const module = MODULES.find(m => m.id === moduleId);

        return {
            icon: isOld ? '📄' : '📊',
            title: datasetsFromDb.find(d => d.dataset_id === datasetId)?.dataset_name || datasetId,
            description: isOld ? 'Coming Soon - This module is currently under development' : 'Dataset',
            isDisabled: isOld,
            menus: module?.menus || []
        };
    };

    const handlePermissionToggle = (itemId: string, permission: string) => {
        // Parse itemId - could be "moduleId" or "moduleId:menuId"
        const [moduleId, menuId] = itemId.includes(':') ? itemId.split(':') : [itemId, null];
        
        const prefix = MODULE_TO_PERMISSION_PREFIX[moduleId] || moduleId;
        
        // Build permission string with menu context if available
        let fullPermission: string;
        if (menuId) {
            // Menu-level permission: prefix:permission:menuId
            fullPermission = `${prefix}:${permission}:${menuId}`;
        } else {
            // Module-level permission: prefix:permission
            fullPermission = `${prefix}:${permission}`;
        }

        // Map to code if available
        const permissionToStore = modulesCodeMap[fullPermission] || fullPermission;

        const currentPermissions = editedUser?.permissions || [];
        const newPermissions = currentPermissions.includes(permissionToStore)
            ? currentPermissions.filter((p: string) => p !== permissionToStore)
            : [...currentPermissions, permissionToStore];

        setEditedUser((prev: any) => prev ? ({ ...prev, permissions: newPermissions }) : prev);
        setDirtyFields((prev: Set<string>) => new Set([...prev, 'permissions']));
    };

    const getPermissionsForSelected = () => {
        if (!selectedItemId) return [];

        // Check if it's a menu page (format: "moduleId:menuId")
        if (selectedItemId.includes(':')) {
            // For menu-level permissions, return the same set for now
            // In the future, you can customize permissions per menu
            const [moduleId] = selectedItemId.split(':');
            
            // Check if it's a module
            if (PERMISSIONS_MAP[moduleId]) return PERMISSIONS_MAP[moduleId];
            
            // If it's a dataset, use 'dataset' permissions
            if (datasetsFromDb.some(d => d.dataset_id === moduleId)) {
                return PERMISSIONS_MAP['dataset'] || [];
            }
            
            return [];
        }

        // Check if it's a module
        if (PERMISSIONS_MAP[selectedItemId]) return PERMISSIONS_MAP[selectedItemId];

        // If it's a dataset, use 'dataset' permissions
        if (datasetsFromDb.some(d => d.dataset_id === selectedItemId)) {
            return PERMISSIONS_MAP['dataset'] || [];
        }

        return [];
    };

    // Generate configuration code from current modules and permissions
    const generateConfigCode = () => {
        const config = {
            modules: editedUser?.assignedModules || [],
            pages: editedUser?.assignedNavbarPages || [],
            permissions: editedUser?.permissions || []
        };
        const code = btoa(JSON.stringify(config)); // Base64 encode
        return code;
    };

    // Copy configuration code
    const handleCopyConfig = async () => {
        try {
            const code = generateConfigCode();
            setConfigCode(code);
            await navigator.clipboard.writeText(code);
            setCopiedConfig(true);
            setTimeout(() => setCopiedConfig(false), 2000);
        } catch (err) {
            console.error('Failed to copy config:', err);
        }
    };

    // Paste and apply configuration code
    const handlePasteConfig = () => {
        try {
            if (!pasteCode.trim()) {
                setPasteError('Please enter a configuration code');
                return;
            }
            
            const decoded = atob(pasteCode.trim()); // Base64 decode
            const config = JSON.parse(decoded);
            
            if (!config.modules || !Array.isArray(config.modules)) {
                setPasteError('Invalid configuration code format');
                return;
            }
            
            // Apply the configuration
            setEditedUser((prev: any) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    assignedModules: config.modules || [],
                    assignedNavbarPages: config.pages || [],
                    permissions: config.permissions || []
                };
            });
            
            setDirtyFields((prev: Set<string>) => {
                const next = new Set(prev);
                next.add('assignedModules');
                next.add('assignedNavbarPages');
                next.add('permissions');
                return next;
            });
            
            setPasteCode('');
            setPasteError('');
            alert('Configuration applied successfully! Click Save Changes to persist.');
        } catch (err) {
            console.error('Failed to paste config:', err);
            setPasteError('Invalid configuration code');
        }
    };

    // Copy individual item (module ID, permission, etc.)
    const handleCopyItem = async (item: string) => {
        try {
            await navigator.clipboard.writeText(item);
            setCopiedItem(item);
            setTimeout(() => setCopiedItem(null), 2000);
        } catch (err) {
            console.error('Failed to copy item:', err);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) setShowModuleAssignModal(false);
            }}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b bg-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800">Module & Data Assignment</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span>Managing user:</span>
                                {users && users.length > 0 && onUserChange ? (
                                    <div className="relative group flex items-center">
                                        <select
                                            value={selectedUser?.id || ''}
                                            onChange={(e) => {
                                                const uid = e.target.value;
                                                const u = users.find(user => String(user.id) === String(uid));
                                                if (u && onUserChange) onUserChange(u);
                                            }}
                                            className="appearance-none font-semibold text-blue-600 bg-transparent border-b border-dashed border-blue-300 hover:border-blue-600 focus:outline-none focus:border-blue-600 pr-6 py-0.5 cursor-pointer max-w-[250px] truncate"
                                        >
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.username} {u.mobile ? `(${u.mobile})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-3 h-3 text-blue-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                ) : (
                                    <span className="font-semibold text-blue-600">{selectedUser?.username || selectedUser?.email || 'Unknown User'}</span>
                                )}
                            </div>
                            
                            {/* Copy/Paste Configuration */}
                            <div className="mt-3 flex items-center gap-3 flex-wrap">
                                <button
                                    onClick={handleCopyConfig}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                >
                                    {copiedConfig ? (
                                        <>
                                            <Check className="w-3 h-3" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            Copy Config
                                        </>
                                    )}
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={pasteCode}
                                        onChange={(e) => {
                                            setPasteCode(e.target.value);
                                            setPasteError('');
                                        }}
                                        placeholder="Paste config code here..."
                                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                                    />
                                    <button
                                        onClick={handlePasteConfig}
                                        disabled={!pasteCode.trim()}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                                
                                {pasteError && (
                                    <span className="text-xs text-red-600">{pasteError}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setShowModuleAssignModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Main Content Split */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left Column: Modules & Datasets */}
                    <div className="w-1/2 border-r border-gray-100 flex flex-col bg-white">
                        <div className="p-4 bg-gray-50/50 border-b flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Navigation Master</h4>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Select to configure</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Modules Section */}
                            <div>
                                <h5 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-tighter">Application Modules</h5>
                                <div className="space-y-1">
                                    {modulesFromDb.map((m) => {
                                        const meta = getModuleMeta(m.module_id);
                                        const isSelected = selectedItemId === m.module_id;
                                        const isAssigned = editedUser?.assignedModules?.includes(m.module_id) || false;

                                        return (
                                            <>
                                                <div
                                                    key={m.module_id}
                                                    onClick={() => setSelectedItemId(m.module_id)}
                                                    className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isAssigned}
                                                        onChange={(e) => {
                                                            const currentModules = editedUser?.assignedModules || [];
                                                            const newModules = e.target.checked
                                                                ? [...currentModules, m.module_id]
                                                                : currentModules.filter((id: string) => id !== m.module_id);
                                                            setEditedUser((prev: any) => prev ? ({ ...prev, assignedModules: newModules }) : prev);
                                                            setDirtyFields((prev: Set<string>) => new Set([...prev, 'assignedModules']));
                                                            setSelectedItemId(m.module_id);
                                                        }}
                                                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                                                    {meta?.icon ?? '📦'} {meta?.title ?? m.module_name}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCopyItem(m.module_id);
                                                                    }}
                                                                    className="p-0.5 hover:bg-blue-100 rounded transition-colors"
                                                                    title="Copy module ID"
                                                                >
                                                                    {copiedItem === m.module_id ? (
                                                                        <Check className="w-3 h-3 text-green-600" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3 text-gray-400" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {meta?.menus && meta.menus.length > 0 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setExpandedModules(prev => {
                                                                                const next = new Set(prev);
                                                                                if (next.has(m.module_id)) {
                                                                                    next.delete(m.module_id);
                                                                                } else {
                                                                                    next.add(m.module_id);
                                                                                }
                                                                                return next;
                                                                            });
                                                                        }}
                                                                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                                                                    >
                                                                        {expandedModules.has(m.module_id) ? (
                                                                            <ChevronDown className="w-4 h-4 text-blue-600" />
                                                                        ) : (
                                                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                                                        )}
                                                                    </button>
                                                                )}
                                                                {isSelected && <ChevronRight className="w-4 h-4 text-blue-400" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Dropdown Menu Items */}
                                                {expandedModules.has(m.module_id) && meta?.menus && meta.menus.length > 0 && (
                                                    <div className="ml-10 mt-2 space-y-1 border-l-2 border-blue-200 pl-3">
                                                        {meta.menus.map((menu) => {
                                                            const menuPageId = `${m.module_id}:${menu.id}`;
                                                            const isMenuSelected = editedUser?.assignedNavbarPages?.includes(menuPageId) || false;

                                                            return (
                                                                <div
                                                                    key={menu.id}
                                                                    className="flex items-center gap-2 p-2 rounded text-xs hover:bg-blue-50 transition-colors cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // Set this menu as selected to show its permissions
                                                                        setSelectedItemId(menuPageId);
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isMenuSelected}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditedUser((prev: any) => {
                                                                                if (!prev) return prev;
                                                                                const currentPages = prev.assignedNavbarPages || [];
                                                                                const newPages = isMenuSelected
                                                                                    ? currentPages.filter((p: string) => p !== menuPageId)
                                                                                    : [...currentPages, menuPageId];
                                                                                return { ...prev, assignedNavbarPages: newPages };
                                                                            });
                                                                        }}
                                                                        className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                                                                    />
                                                                    <span className={`flex-1 ${isMenuSelected ? 'text-blue-700 font-medium' : 'text-gray-600'} ${selectedItemId === menuPageId ? 'font-bold' : ''}`}>
                                                                        {menu.title}
                                                                    </span>
                                                                    {selectedItemId === menuPageId && <ChevronRight className="w-3 h-3 text-blue-600" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Datasets Section */}
                            <div>
                                <h5 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-tighter">Data Collections</h5>
                                <div className="space-y-1">
                                    {datasetsFromDb.map((dataset) => {
                                        const datasetMeta = getDatasetMeta(dataset.dataset_id);
                                        const isSelected = selectedItemId === dataset.dataset_id;
                                        const isAssigned = editedUser?.assignedModules?.includes(dataset.dataset_id) || false;

                                        return (
                                            <>
                                                <div
                                                    key={dataset.dataset_id}
                                                    onClick={() => !datasetMeta.isDisabled && setSelectedItemId(dataset.dataset_id)}
                                                    className={`group flex items-center p-3 rounded-lg transition-all ${datasetMeta.isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                        } ${isSelected ? 'bg-purple-50 ring-1 ring-purple-200' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isAssigned}
                                                        disabled={datasetMeta.isDisabled}
                                                        onChange={(e) => {
                                                            const currentModules = editedUser?.assignedModules || [];
                                                            const newModules = e.target.checked
                                                                ? [...currentModules, dataset.dataset_id]
                                                                : currentModules.filter((id: string) => id !== dataset.dataset_id);
                                                            setEditedUser((prev: any) => prev ? ({ ...prev, assignedModules: newModules }) : prev);
                                                            setDirtyFields((prev: Set<string>) => new Set([...prev, 'assignedModules']));
                                                            if (!datasetMeta.isDisabled) setSelectedItemId(dataset.dataset_id);
                                                        }}
                                                        className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-sm font-medium ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                                                                    {datasetMeta.icon} {datasetMeta.title}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCopyItem(dataset.dataset_id);
                                                                    }}
                                                                    className="p-0.5 hover:bg-purple-100 rounded transition-colors"
                                                                    title="Copy dataset ID"
                                                                >
                                                                    {copiedItem === dataset.dataset_id ? (
                                                                        <Check className="w-3 h-3 text-green-600" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3 text-gray-400" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {datasetMeta?.menus && datasetMeta.menus.length > 0 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setExpandedModules(prev => {
                                                                                const next = new Set(prev);
                                                                                if (next.has(dataset.dataset_id)) {
                                                                                    next.delete(dataset.dataset_id);
                                                                                } else {
                                                                                    next.add(dataset.dataset_id);
                                                                                }
                                                                                return next;
                                                                            });
                                                                        }}
                                                                        className="p-1 hover:bg-purple-100 rounded transition-colors"
                                                                    >
                                                                        {expandedModules.has(dataset.dataset_id) ? (
                                                                            <ChevronDown className="w-4 h-4 text-purple-600" />
                                                                        ) : (
                                                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                                                        )}
                                                                    </button>
                                                                )}
                                                                {isSelected && <ChevronRight className="w-4 h-4 text-purple-400" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Dropdown Menu Items for Datasets */}
                                                {expandedModules.has(dataset.dataset_id) && datasetMeta?.menus && datasetMeta.menus.length > 0 && (
                                                    <div className="ml-10 mt-2 space-y-1 border-l-2 border-purple-200 pl-3">
                                                        {datasetMeta.menus.map((menu) => {
                                                            const menuPageId = `${dataset.dataset_id}:${menu.id}`;
                                                            const isMenuSelected = editedUser?.assignedNavbarPages?.includes(menuPageId) || false;

                                                            return (
                                                                <div
                                                                    key={menu.id}
                                                                    className="flex items-center gap-2 p-2 rounded text-xs hover:bg-purple-50 transition-colors cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // Set this menu as selected to show its permissions
                                                                        setSelectedItemId(menuPageId);
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isMenuSelected}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditedUser((prev: any) => {
                                                                                if (!prev) return prev;
                                                                                const currentPages = prev.assignedNavbarPages || [];
                                                                                const newPages = isMenuSelected
                                                                                    ? currentPages.filter((p: string) => p !== menuPageId)
                                                                                    : [...currentPages, menuPageId];
                                                                                return { ...prev, assignedNavbarPages: newPages };
                                                                            });
                                                                        }}
                                                                        className="w-3 h-3 text-purple-600 rounded focus:ring-purple-500"
                                                                    />
                                                                    <span className={`flex-1 ${isMenuSelected ? 'text-purple-700 font-medium' : 'text-gray-600'} ${selectedItemId === menuPageId ? 'font-bold' : ''}`}>
                                                                        {menu.title}
                                                                    </span>
                                                                    {selectedItemId === menuPageId && <ChevronRight className="w-3 h-3 text-purple-600" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Permissions */}
                    <div className="w-1/2 flex flex-col bg-gray-50/30">
                        {selectedItemId ? (
                            <>
                                <div className="p-4 bg-white border-b flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        Permissions: {(() => {
                                            // Display friendly name for selected item
                                            if (selectedItemId.includes(':')) {
                                                const [moduleId, menuId] = selectedItemId.split(':');
                                                const moduleFromDb = modulesFromDb.find(m => m.module_id === moduleId);
                                                const datasetFromDb = datasetsFromDb.find(d => d.dataset_id === moduleId);
                                                const moduleMeta = getModuleMeta(moduleId) || getDatasetMeta(moduleId);
                                                const menu = moduleMeta?.menus?.find((m: any) => m.id === menuId);
                                                const name = moduleFromDb?.module_name || datasetFromDb?.dataset_name || moduleId;
                                                return `${name} → ${menu?.title || menuId}`;
                                            }
                                            return selectedItemId;
                                        })()}
                                    </h4>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        {getPermissionsForSelected().map((permission) => {
                                            // Parse selectedItemId to get moduleId and menuId
                                            const [moduleId, menuId] = selectedItemId.includes(':') ? selectedItemId.split(':') : [selectedItemId, null];
                                            const prefix = MODULE_TO_PERMISSION_PREFIX[moduleId] || moduleId;
                                            
                                            // Build permission strings
                                            let fullPermission: string;
                                            let permissionCode: string | undefined;
                                            
                                            if (menuId) {
                                                // Menu-level permission
                                                fullPermission = `${prefix}:${permission}:${menuId}`;
                                                permissionCode = modulesCodeMap[fullPermission];
                                            } else {
                                                // Module-level permission
                                                fullPermission = `${prefix}:${permission}`;
                                                permissionCode = modulesCodeMap[fullPermission];
                                            }

                                            const isChecked = editedUser?.permissions?.some((p: string) => {
                                                // Matches if it's the exact string or the mapped code
                                                return p === fullPermission || (permissionCode && p === permissionCode);
                                            }) || false;
                                            
                                            return (
                                                <label
                                                    key={permission}
                                                    className={`flex items-start p-3 rounded-lg border transition-all cursor-pointer h-full ${isChecked ? 'bg-blue-50/50 border-blue-200 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-100'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handlePermissionToggle(selectedItemId, permission)}
                                                        className="mt-0.5 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 shrink-0"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-sm font-semibold text-gray-800 capitalize leading-tight">{permission.replace(/[-_]/g, ' ')}</span>
                                                            {permissionCode && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                                                                        {permissionCode}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleCopyItem(permissionCode);
                                                                        }}
                                                                        className="p-0.5 hover:bg-blue-100 rounded transition-colors"
                                                                        title="Copy permission code"
                                                                    >
                                                                        {copiedItem === permissionCode ? (
                                                                            <Check className="w-3 h-3 text-green-600" />
                                                                        ) : (
                                                                            <Copy className="w-3 h-3 text-gray-400" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1 leading-normal">Allows {permission} access</p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                        {getPermissionsForSelected().length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                                                <Info className="w-12 h-12 mb-4 opacity-20" />
                                                <p>No extra permissions defined for this item.</p>
                                                <p className="text-xs">Standard access is controlled by the module assignment on the left.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="bg-gray-100 p-6 rounded-full mb-6 text-gray-300">
                                    <Shield className="w-16 h-16" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-400">Manage Permissions</h4>
                                <p className="text-sm text-gray-400 max-w-xs mt-2">Select a module or dataset from the left column to configure granular access permissions.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex items-center justify-between flex-shrink-0">
                    <div>
                        {saveMessage && (
                            <div className={`text-sm px-4 py-2 rounded-lg border flex items-center gap-2 ${saveMessage.toLowerCase().includes('success')
                                ? 'text-green-700 bg-green-50 border-green-100'
                                : 'text-red-700 bg-red-50 border-red-100'
                                }`}>
                                {saveMessage.toLowerCase().includes('success') ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                {saveMessage}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowModuleAssignModal(false)}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="px-8 py-2.5 text-sm font-bold text-white bg-gray-600 hover:bg-gray-700 shadow-lg shadow-gray-200 disabled:opacity-50 disabled:shadow-none rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper icons/components if needed by parent
const CheckCircle = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const AlertTriangle = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
