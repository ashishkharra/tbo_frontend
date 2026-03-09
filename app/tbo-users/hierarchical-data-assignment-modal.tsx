// Fallback type definitions (replace with actual types if available)
type Constituency = { id: string; name: string; pc?: string; pc_id?: string; district?: string };
type Block = { id: string; name: string };
type GP = { id: string; name: string };
type Village = { id: string; name: string };
import React, { useState, useEffect, useRef } from 'react';
import MultiSelectCheckbox from './MultiSelectCheckbox';
import { X, ChevronDown, ChevronRight, MapPin, Building, Users, Home, CheckCircle, Loader2, XCircle, Search, Copy, Check, Trash2 } from 'lucide-react';
// import apiService from '../../services/api';
import { getAPIURL } from '../../utils/apiUrl';
import apiClient from '../../services/apiClient';
// import MasterFilter from '../../components/MasterFilter';
// import ColumnPermissions from '../../components/ColumnPermissions';
import { ColumnPermissionsManager } from '../../components/ColumnPermissionsManager';

interface HierarchicalDataAssignmentModalProps {
  selectedUser: any;
  onClose: () => void;
  onSave?: (payload?: any) => void;
  isSaving?: boolean;
  saveMessage?: string;
  isBulkMode?: boolean;
}

function HierarchicalDataAssignmentModal(props: HierarchicalDataAssignmentModalProps) {
  const { selectedUser, onClose, onSave, isSaving = false, saveMessage = '', isBulkMode = false } = props;

  // State for assigned data popup
  const [showAssignedDataPopup, setShowAssignedDataPopup] = useState(false);

  // Handler to open assigned data popup
  const handleViewAssignedData = () => {
    setShowAssignedDataPopup(true);
  };

  // Handler to close assigned data popup
  const handleCloseAssignedDataPopup = () => {
    setShowAssignedDataPopup(false);
  };
  // Key to force assignments reload
  const [assignmentsRefreshKey, setAssignmentsRefreshKey] = useState(0);
  const [assignmentRows, setAssignmentRows] = useState([{
    id: 1,
    selectedType: '',
    selectedValue: '',
    selectedDataType: '', // New: for second filter
    selectedDataValue: [] as string[], // New: for third filter, always array
    selectedBlock: '',
    selectedGP: '',
    selectedVillages: [],
    selectedCast: '',
    selectedAgeFrom: '',
    selectedAgeTo: '',
    assignment_token: null as string | null
  }]);

  // Token input functionality removed - now handled directly in table column
  // Dataset selection and per-dataset rows storage - fetch from DB dynamically
  const [datasetsFromDb, setDatasetsFromDb] = useState<Array<{ id: number; dataset_id: string; dataset_name: string }>>([]);
  const [datasetsLoading, setDatasetsLoading] = useState<boolean>(false);

  // Fetch datasets from DB
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setDatasetsLoading(true);
        const res = await apiClient.getDatasets();
        console.log('Fetched datasets response:', res);
        if (res && res.success && Array.isArray(res.data)) {
          console.log('Datasets from DB:', res.data);
          setDatasetsFromDb(res.data);
        } else {
          console.warn('Datasets fetch did not return expected data:', res);
          setDatasetsFromDb([]);
        }
      } catch (e) {
        console.error('Failed to fetch datasets:', e);
        setDatasetsFromDb([]);
      } finally {
        setDatasetsLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  // Fetch data IDs from data_id_master
  useEffect(() => {
    const fetchDataIds = async () => {
      try {
        setLoadingDataIds(true);
        // Fetch from data_id_master table
        const authToken = localStorage.getItem('token');
        const response = await fetch('http://localhost:5004/api/data-id-assignments/data-id-master?limit=1000', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        const res = await response.json();
        
        if (res && res.success && Array.isArray(res.data)) {
          const formattedDataIds = res.data.map((item: any) => ({
            id: item.data_id?.toString() || item.id?.toString(),
            name: `${item.data_id || item.id}${item.data_name ? ' - ' + item.data_name : ''}${item.ac_name ? ' (' + item.ac_name + ')' : ''}`,
            data_name: item.data_name,
            state: item.state,
            ac_name: item.ac_name,
            ac_no: item.ac_no
          }));
          setDataIdOptions(formattedDataIds);
          console.log('✅ Loaded data IDs from data_id_master:', formattedDataIds.length);
        }
      } catch (error) {
        console.error('Error fetching data IDs:', error);
      } finally {
        setLoadingDataIds(false);
      }
    };
    fetchDataIds();
  }, []);

  // Use dataset_ids from DB
  const availableDatasetIds = datasetsFromDb.length > 0
    ? datasetsFromDb.map(d => d.dataset_id)
    : [];

  const [selectedModule, setSelectedModule] = useState<string>('');

  // Helper to determine table based on selected dataset
  const getTableForSelectedDataset = () => {
    const dataset = datasetsFromDb.find(d => d.dataset_id === selectedModule);
    if (dataset && (dataset.dataset_name === 'Live Voter List' || dataset.dataset_name.includes('Live Voter'))) {
      return 'live_voter_list';
    }
    return 'block_table';
  };
  const [assignmentsByModule, setAssignmentsByModule] = useState<Record<string, any[]>>({});

  // Hierarchy filters per dataset
  const [hierarchyFiltersByDataset, setHierarchyFiltersByDataset] = useState<Record<string, {
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
  }>>({});

  // Initialize selectedModule and assignmentsByModule when datasets are loaded
  useEffect(() => {
    if (availableDatasetIds.length > 0) {
      // Set first dataset as selected if none is selected
      if (!selectedModule || !availableDatasetIds.includes(selectedModule)) {
        setSelectedModule(availableDatasetIds[0]);
      }

      // Initialize assignments for any new datasets
      setAssignmentsByModule(prev => {
        const updated = { ...prev };
        availableDatasetIds.forEach((d: string) => {
          // Only set a single empty row if there is no data for this dataset
          if (!updated[d] || !Array.isArray(updated[d]) || updated[d].length === 0) {
            updated[d] = [
              { id: 1, selectedType: '', selectedValue: '', selectedBlock: '', selectedGP: '', selectedVillages: [], selectedCast: '', selectedAgeFrom: '', selectedAgeTo: '' }
            ];
          }
        });
        return updated;
      });
    }
  }, [availableDatasetIds.join(',')]); // Re-run when dataset list changes
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['constituency']));

  // Search states for each row
  const [searchStates, setSearchStates] = useState<{ [key: string]: { [field: string]: string } }>({});

  // Data states
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gps, setGps] = useState<GP[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [castOptions, setCastOptions] = useState<Record<number, { id: string; name: string }[]>>({});
  const [ageOptions, setAgeOptions] = useState<Record<number, { id: string; name: string }[]>>({});

  // Data ID options
  const [dataIdOptions, setDataIdOptions] = useState<Array<{ id: string; name: string; data_name?: string; state?: string; ac_name?: string; ac_no?: string }>>([]);
  const [loadingDataIds, setLoadingDataIds] = useState(false);

  // Master filter options (like MasterFilter.tsx)
  const [parliamentOptions, setParliamentOptions] = useState<string[]>([]);
  const [assemblyOptions, setAssemblyOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [blockOptions, setBlockOptions] = useState<string[]>([]);

  // Loading states
  const [loadingConstituencies, setLoadingConstituencies] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingGPs, setLoadingGPs] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [loadingCasts, setLoadingCasts] = useState<Record<number, boolean>>({});
  const [loadingAges, setLoadingAges] = useState<Record<number, boolean>>({});

  // Error states
  const [error, setError] = useState<string>('');
  const [isLocalSaving, setIsLocalSaving] = useState<boolean>(false);

  // Refs to prevent infinite loops
  const hasLoadedInitialData = useRef<boolean>(false);
  const isLoadingRelatedData = useRef<boolean>(false);
  const castAgeFetchTimeouts = useRef<Record<number, NodeJS.Timeout>>({});

  // Module-specific settings (for non-dataset modules)
  const [moduleSettingsByModule, setModuleSettingsByModule] = useState<Record<string, any>>({});

  const updateModuleSetting = (mod: string, key: string, value: any) => {
    setModuleSettingsByModule(prev => ({
      ...prev,
      [mod]: {
        ...(prev[mod] || {}),
        [key]: value
      }
    }));
  };

  // Load all assignments from API when modal opens or after save
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedUser?.id) return;
      hasLoadedInitialData.current = false;
      isLoadingRelatedData.current = false;
      Object.values(castAgeFetchTimeouts.current).forEach(timeout => clearTimeout(timeout));
      castAgeFetchTimeouts.current = {};
      try {
        console.log('🔍 Fetching assignments for user:', selectedUser.id);
        const res = await apiClient.getUserAssignments(selectedUser.id);
        console.log('📥 API Response:', res);
        
        if (res && res.success && res.data && typeof res.data === 'object') {
          const assignmentsByDataset = res.data;
          console.log('📊 Assignments by dataset:', assignmentsByDataset);
          
          const moduleAssignments: Record<string, any[]> = {};
          Object.entries(assignmentsByDataset).forEach(([datasetId, rows]) => {
            if (Array.isArray(rows)) {
              console.log(`📦 Processing dataset ${datasetId}, ${rows.length} rows`);
              const formattedRows = rows.map((row: any, index: number) => {
                // Ensure id is properly preserved from database
                const dbId = row.id || row.rowId;
                const formattedRow = {
                  ...row,
                  id: dbId || (index + 1),
                  rowId: dbId,
                  assignment_token: row.assignment_token || null
                };
                console.log(`   Row ${index}: DB ID=${row.id}, rowId=${row.rowId}, final id=${formattedRow.id}, token=${row.assignment_token}`);
                return formattedRow;
              });
              moduleAssignments[datasetId] = formattedRows;
            }
          });
          
          console.log('✅ Setting assignmentsByModule:', moduleAssignments);
          setAssignmentsByModule(moduleAssignments);
          const datasetKeys = Object.keys(moduleAssignments);
          if (datasetKeys.length > 0) {
            setSelectedModule(datasetKeys[0]);
            // Don't populate form with existing assignments - keep form empty for new assignments
            // Existing assignments will show in "Already Assigned Data" table only
            setAssignmentRows([{
              id: Date.now(),
              selectedType: '',
              selectedValue: '',
              selectedDataType: '',
              selectedDataValue: [],
              selectedBlock: '',
              selectedGP: '',
              selectedVillages: [],
              selectedCast: '',
              selectedAgeFrom: '',
              selectedAgeTo: '',
              assignment_token: null
            }]);
          }
        } else {
          setAssignmentRows([{
            id: 1,
            selectedType: '',
            selectedValue: '',
            selectedDataType: '',
            selectedDataValue: [],
            selectedBlock: '',
            selectedGP: '',
            selectedVillages: [],
            selectedCast: '',
            selectedAgeFrom: '',
            selectedAgeTo: '',
            assignment_token: null
          }]);
        }
      } catch (e) {
        setAssignmentRows([{
          id: 1,
          selectedType: '',
          selectedValue: '',
          selectedDataType: '',
          selectedDataValue: [],
          selectedBlock: '',
          selectedGP: '',
          selectedVillages: [],
          selectedCast: '',
          selectedAgeFrom: '',
          selectedAgeTo: '',
          assignment_token: null
        }]);
      }
    };
    fetchAssignments();
  }, [selectedUser?.id, assignmentsRefreshKey]);

  // Log assignmentRows changes
  useEffect(() => {
    console.log('🟢 assignmentRows changed:', assignmentRows);
  }, [assignmentRows]);

  // Ensure there's always at least one empty row for new assignments
  useEffect(() => {
    if (selectedModule && assignmentRows.length > 0) {
      const hasNewRow = assignmentRows.some(row => 
        !row.assignment_token && 
        !row.selectedValue && 
        !row.selectedDataType
      );
      
      if (!hasNewRow) {
        // Add an empty row to assignmentRows for creating new assignments
        const emptyRow = {
          id: Date.now(),
          selectedType: '',
          selectedValue: '',
          selectedDataType: '',
          selectedDataValue: [],
          selectedBlock: '',
          selectedGP: '',
          selectedVillages: [],
          selectedCast: '',
          selectedAgeFrom: '',
          selectedAgeTo: '',
          assignment_token: null
        };
        
        console.log('➕ Adding empty row to assignmentRows');
        setAssignmentRows(prev => [...prev, emptyRow]);
      }
    }
  }, [selectedModule, assignmentRows]);

  // Load related data when assignment rows are loaded with existing data (ONLY ONCE on initial load)
  useEffect(() => {
    // Only load related data once when existing assignments are first loaded
    if (hasLoadedInitialData.current || isLoadingRelatedData.current) {
      return;
    }

    const loadRelatedData = async () => {
      const rowsWithData = assignmentRows.filter(row => row.selectedType && row.selectedValue);
      if (rowsWithData.length === 0) {
        return;
      }

      isLoadingRelatedData.current = true;
      hasLoadedInitialData.current = true;

      try {
        for (const row of rowsWithData) {
          // Load blocks based on selected value
          const districtName = getDistrictFromSelection(row.selectedType, row.selectedValue);

          if (row.selectedType === 'District' ||
            row.selectedType === 'Parliament' || row.selectedType === 'Assembly' ||
            row.selectedType === 'AC' || row.selectedType === 'PC') {
            if (districtName) {
              // For Assembly/AC and Parliament/PC, we might need ac_id
              let acId = '';
              if (row.selectedType === 'Assembly' || row.selectedType === 'AC') {
                const constituency = constituencies.find(c => c.id === row.selectedValue || c.name === (getFilteredValues(row.selectedType).find((v: any) => v.id === row.selectedValue)?.name || ''));
                acId = constituency?.id || '';
              } else if (row.selectedType === 'Parliament' || row.selectedType === 'PC') {
                const constituency = constituencies.find(c => c.pc === (getFilteredValues(row.selectedType).find((v: any) => v.id === row.selectedValue)?.name || '') || c.pc_id === row.selectedValue);
                acId = constituency?.pc_id || '';
              }
              await fetchBlocks(acId, districtName);
            }
          } else if (row.selectedType === 'Block') {
            // If Block is selected, we don't need to fetch blocks
            // But we might need to fetch GPs if block is already selected
          }

          // Load GPs if block is selected
          if (row.selectedBlock) {
            const district = getDistrictFromSelection(row.selectedType, row.selectedValue);
            const blockObj = blocks.find(b => b.id === row.selectedBlock);
            const blockName = blockObj?.name || row.selectedBlock;
            if (blockName && district) {
              await fetchGPs(blockName, district);
            }
          }

          // Load villages if GP is selected
          if (row.selectedGP) {
            const district = getDistrictFromSelection(row.selectedType, row.selectedValue);
            const blockObj = blocks.find(b => b.id === row.selectedBlock);
            const gpObj = gps.find(g => g.id === row.selectedGP);
            const blockName = blockObj?.name || row.selectedBlock;
            const gpName = gpObj?.name || row.selectedGP;
            if (gpName && blockName && district) {
              await fetchVillages(gpName, blockName, district);
            }
          }
        }
      } finally {
        isLoadingRelatedData.current = false;
      }
    };

    // Only run if we have rows with data and constituencies are loaded
    if (assignmentRows.length > 0 && assignmentRows.some(row => row.selectedType) && constituencies.length > 0) {
      loadRelatedData();
    }
  }, [selectedUser?.id]); // Only depend on user ID, not on assignmentRows or constituencies

  // API functions
  const fetchConstituencies = async () => {
    setLoadingConstituencies(true);
    setError('');

    try {
      const table = getTableForSelectedDataset();

      // If using live_voter_list, fetch districts via master filter options
      if (table === 'live_voter_list') {
        const options = await apiClient.getMasterFilterOptions({ table: 'live_voter_list' });
        if (options && options.districtOptions && options.districtOptions.length > 0) {
          const built = options.districtOptions.map((d: any, i: any) => ({
            id: `dist_${i + 1}`,
            name: String(d),
            pc: '', pc_id: '', district: String(d), state: ''
          }));
          setConstituencies(built);
          setLoadingConstituencies(false);
          return;
        }
      }

      // Primary source: block_table-backed districts (authoritative)
      const distRes = await apiClient.getDashboardDistricts();
      if (distRes.success && Array.isArray(distRes.data) && distRes.data.length > 0) {
        const built = (distRes.data as any[]).map((d, i) => ({
          id: `dist_${i + 1}`,
          name: String(d),
          pc: '',
          pc_id: '',
          district: String(d),
          state: ''
        }));
        setConstituencies(built);
        setLoadingConstituencies(false);
        return;
      }

      // Fallback: hierarchical constituencies if block_table list is empty
      const response = await apiClient.getHierarchicalConstituencies();
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        setConstituencies(response.data || []);
        setLoadingConstituencies(false);
        return;
      }
    } catch (err) {
      // proceed to fallback
    }
    // Fallback: fetch simple district list
    try {
      const distRes = await apiClient.getDashboardDistricts();
      if (distRes.success && Array.isArray(distRes.data) && distRes.data.length > 0) {
        const fallback = (distRes.data as any[]).map((d, i) => ({
          id: `dist_${i + 1}`,
          name: '',
          pc: '',
          pc_id: '',
          district: String(d),
          state: ''
        }));
        setConstituencies(fallback);
      } else {
        setError('Failed to fetch constituencies');
      }
    } catch (e) {
      console.error('Fallback districts fetch failed:', e);
      setError('Failed to fetch constituencies');
    } finally {
      setLoadingConstituencies(false);
    }
  };

  const fetchBlocks = async (acId: string, district: string): Promise<Block[]> => {
    try {
      setLoadingBlocks(true);
      setError('');

      if (!district || district.trim() === '') {
        console.warn('⚠️ fetchBlocks called without district');
        setBlocks([]);
        setLoadingBlocks(false);
        return [];
      }

      const params: any = { district: district.trim(), table: getTableForSelectedDataset() };
      if (acId && acId.trim() !== '') {
        params.ac_id = acId.trim();
      }

      const response = await apiClient.getHierarchicalBlocks(); // Adjust params if needed

      if (response.success) {
        const blocksData = response.data || [];
        if (Array.isArray(blocksData) && blocksData.length > 0) {
          setBlocks(blocksData);
          return blocksData;
        } else {
          setBlocks([]);
          setError('No blocks found for the selected district');
          return [];
        }
      } else {
        setError(response.error || 'Failed to fetch blocks');
        setBlocks([]);
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error fetching blocks:', error);
      setError(`Failed to fetch blocks: ${error.message || 'Unknown error'}`);
      setBlocks([]);
      return [];
    } finally {
      setLoadingBlocks(false);
    }
  };

  const fetchGPs = async (block: string, district: string): Promise<GP[]> => {
    try {
      setLoadingGPs(true);
      setError('');

      if (!block || block.trim() === '' || !district || district.trim() === '') {
        console.warn('⚠️ fetchGPs called without block or district');
        setGps([]);
        setLoadingGPs(false);
        return [];
      }

      const response = await apiClient.createHierarchicalGps({ block: block.trim(), district: district.trim(), table: getTableForSelectedDataset() });

      if (response.success) {
        const gpsData = response.data || [];
        if (Array.isArray(gpsData) && gpsData.length > 0) {
          setGps(gpsData);
          return gpsData;
        } else {
          setGps([]);
          setError('No GPs found for the selected block');
          return [];
        }
      } else {
        setError(response.error || 'Failed to fetch GPs');
        setGps([]);
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error fetching GPs:', error);
      setError(`Failed to fetch GPs: ${error.message || 'Unknown error'}`);
      setGps([]);
      return [];
    } finally {
      setLoadingGPs(false);
    }
  };

  const fetchVillages = async (gp: string, block: string, district: string): Promise<Village[]> => {
    try {
      setLoadingVillages(true);
      setError('');
      const response = await apiClient.createHierarchicalVillages({ gp, block, district, table: getTableForSelectedDataset() });

      const data = (response as any)?.data || [];
      const villagesData = Array.isArray(data) ? data : [];
      setVillages(villagesData);
      if (Array.isArray(data) && data.length > 0) {
        setError('');
        return villagesData;
      } else {
        setError('Failed to fetch villages');
        return [];
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
      setError('Failed to fetch villages');
      return [];
    } finally {
      setLoadingVillages(false);
    }
  };

  // Load assignment by 6-digit code
  const handleLoadByCode = async (code: string) => {
    try {
      setIsLocalSaving(true);
      const res = await fetch(`/api/user-assignments/by-code/${code}`);
      if (!res.ok) throw new Error('Failed to load assignment');
      const data = await res.json();
      
      if (data && data.success && data.assignment) {
        const assignment = data.assignment;
        
        // Populate form with the loaded assignment data (without assignment_token so it's treated as new)
        const loadedRow = {
          id: Date.now(),
          selectedType: assignment.assignment_type || 'Data ID',
          selectedValue: assignment.assignment_value || '',
          selectedDataType: assignment.selectedDataType || '',
          selectedDataValue: assignment.selectedDataValue || [],
          selectedBlock: '',
          selectedGP: '',
          selectedVillages: [],
          selectedCast: assignment.selectedCast || '',
          selectedAgeFrom: assignment.selectedAgeFrom || '',
          selectedAgeTo: assignment.selectedAgeTo || '',
          assignment_token: null // No token - this is a NEW assignment for current user
        };
        
        setAssignmentRows([loadedRow]);
        alert(`Assignment loaded from code ${code}! Review and click "Assign Data to User" to save.`);
        
        // Clear the input
        const input = document.getElementById('paste-code-input') as HTMLInputElement;
        if (input) input.value = '';
      } else {
        throw new Error(data?.message || 'Assignment not found');
      }
    } catch (error: any) {
      console.error('❌ Error loading assignment by code:', error);
      alert(`Error: ${error.message || 'Failed to load assignment'}`);
    } finally {
      setIsLocalSaving(false);
    }
  };

  // Fetch cast values based on row filters - works with any selected field
  const fetchCastOptions = async (rowId: number, row: any) => {
    if (loadingCasts[rowId]) return;
    try {
      setLoadingCasts(prev => ({ ...prev, [rowId]: true }));
      setError('');

      // Only fetch if wise filter is selected
      if (!row.selectedDataType || !row.selectedDataValue || !row.selectedValue) {
        setCastOptions(prev => ({ ...prev, [rowId]: [] }));
        setLoadingCasts(prev => ({ ...prev, [rowId]: false }));
        return;
      }

      // Use first selected value for wise
      const wiseValue = Array.isArray(row.selectedDataValue) ? row.selectedDataValue[0] : row.selectedDataValue;
      const url = `/api/booth-mapping/cast-options?dataId=${encodeURIComponent(row.selectedValue)}&wiseType=${encodeURIComponent(row.selectedDataType)}&wiseValue=${encodeURIComponent(wiseValue)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch cast options');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        const castOptionsList = data.data.map((cast: any) => ({
          id: cast.castid || cast.cast_id_by_surname,
          name: [cast.castid, cast.cast_id_by_surname].filter(Boolean).join(' / ')
        }));
        setCastOptions(prev => ({ ...prev, [rowId]: castOptionsList }));
      } else {
        setCastOptions(prev => ({ ...prev, [rowId]: [] }));
      }
    } catch (error) {
      console.error('❌ Error fetching cast options:', error);
      setCastOptions(prev => ({ ...prev, [rowId]: [] }));
    } finally {
      setLoadingCasts(prev => ({ ...prev, [rowId]: false }));
    }
  };

  // Fetch age values based on row filters - works with any selected field
  const fetchAgeOptions = async (rowId: number, row: any) => {
    // Prevent duplicate calls
    if (loadingAges[rowId]) {
      return;
    }

    try {
      setLoadingAges(prev => ({ ...prev, [rowId]: true }));
      setError('');

      // Build query params - need at least one field selected
      const params = new URLSearchParams();
      let hasAnyFilter = false;

      // District
      const districtName = getDistrictFromSelection(row.selectedType, row.selectedValue);
      if (districtName) {
        params.append('district', districtName);
        hasAnyFilter = true;
      }

      // Parliament
      if ((row.selectedType === 'Parliament' || row.selectedType === 'PC') && row.selectedValue) {
        const selectedOption = getFilteredValues(row.selectedType).find((v: any) => v.id === row.selectedValue);
        if (selectedOption?.name) {
          params.append('parliament', selectedOption.name);
          hasAnyFilter = true;
        }
      }

      // Assembly
      if ((row.selectedType === 'Assembly' || row.selectedType === 'AC') && row.selectedValue) {
        const selectedOption = getFilteredValues(row.selectedType).find((v: any) => v.id === row.selectedValue);
        if (selectedOption?.name) {
          params.append('assembly', selectedOption.name);
          hasAnyFilter = true;
        }
      }

      // Block
      if (row.selectedBlock) {
        const block = blocks.find(b => b.id === row.selectedBlock);
        if (block?.name) {
          params.append('block', block.name);
          hasAnyFilter = true;
        }
      }

      // GP
      if (row.selectedGP) {
        const gp = gps.find(g => g.id === row.selectedGP);
        if (gp?.name) {
          params.append('gp', gp.name);
          hasAnyFilter = true;
        }
      }

      // Village
      if (row.selectedVillages && row.selectedVillages.length > 0) {
        const village = villages.find(v => v.id === row.selectedVillages[0]);
        if (village?.name) {
          params.append('village', village.name);
          hasAnyFilter = true;
        }
      }

      // Only fetch if we have at least one filter
      if (!hasAnyFilter) {
        setAgeOptions(prev => ({ ...prev, [rowId]: [] }));
        setLoadingAges(prev => ({ ...prev, [rowId]: false }));
        return;
      }

      // Always include table
      params.append('table', getTableForSelectedDataset());

      // Hit generic column-values endpoint for age
      const url = getAPIURL(`/column-values/age?${params.toString()}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Age fetch failed: ${res.status}`);
      const json = await res.json();
      const values: string[] = json?.data || [];
      const options = values
        .filter(v => v !== null && v !== undefined && String(v).trim() !== '')
        .map(v => ({ id: String(v), name: String(v) }));

      // Add "All" option at the beginning
      const ageOptionsList = [
        { id: 'ALL', name: 'All' },
        ...options
      ];

      setAgeOptions(prev => ({ ...prev, [rowId]: ageOptionsList }));
    } catch (e) {
      console.error('❌ Error fetching age options:', e);
      setAgeOptions(prev => ({ ...prev, [rowId]: [] }));
    } finally {
      setLoadingAges(prev => ({ ...prev, [rowId]: false }));
    }
  };

  // Load constituencies and master filter options on component mount or module change
  useEffect(() => {
    fetchConstituencies();
    fetchMasterFilterOptions();
  }, [selectedModule]);

  // Refetch master filter options when they're needed but empty
  useEffect(() => {
    const hasEmptyOptions =
      (parliamentOptions.length === 0 &&
        assemblyOptions.length === 0 && districtOptions.length === 0 &&
        blockOptions.length === 0);

    if (hasEmptyOptions) {
      console.log('⚠️ All master filter options are empty, refetching...');
      fetchMasterFilterOptions();
    }
  }, [parliamentOptions.length, assemblyOptions.length, districtOptions.length, blockOptions.length]);

  // Fetch master filter options (like MasterFilter.tsx)
  const fetchMasterFilterOptions = async () => {
    try {
      console.log('🚀 Fetching master filter options...');
      const options = await apiClient.getMasterFilterOptions({ table: getTableForSelectedDataset() });
      console.log('✅ Master filter options received:', {
        parliamentOptions: options.parliamentOptions?.length || 0,
        assemblyOptions: options.assemblyOptions?.length || 0,
        districtOptions: options.districtOptions?.length || 0,
        blockOptions: options.blockOptions?.length || 0,
        fullOptions: options
      });
      setParliamentOptions(options.parliamentOptions || []);
      setAssemblyOptions(options.assemblyOptions || []);
      setDistrictOptions(options.districtOptions || []);
      setBlockOptions(options.blockOptions || []);
      console.log('✅ Master filter options state updated');
    } catch (error) {
      console.error('❌ Error fetching master filter options:', error);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(castAgeFetchTimeouts.current).forEach(timeout => clearTimeout(timeout));
      castAgeFetchTimeouts.current = {};
    };
  }, []);

  // Sync search state when blocks are loaded and rows have selected blocks (only update if missing)
  useEffect(() => {
    if (blocks.length > 0 && !isLoadingRelatedData.current) {
      assignmentRows.forEach(row => {
        if (row.selectedBlock) {
          const selectedBlock = blocks.find(b => b.id === row.selectedBlock);
          const currentSearchValue = getSearchValue(row.id.toString(), 'selectedBlock');
          if (selectedBlock && currentSearchValue !== selectedBlock.name && !currentSearchValue) {
            updateSearchState(row.id.toString(), 'selectedBlock', selectedBlock.name);
          }
        }
      });
    }
  }, [blocks.length]); // Only depend on blocks length, not the full array

  // Row management functions
  const addNewRow = () => {
    const newRow = {
      id: Date.now(),
      selectedType: '',
      selectedValue: '',
      selectedDataType: '',
      selectedDataValue: [] as string[],
      selectedBlock: '',
      selectedGP: '',
      selectedVillages: [],
      selectedCast: '',
      selectedAgeFrom: '',
      selectedAgeTo: '',
      assignment_token: null
    };
    setAssignmentRows(prev => {
      const next = [...prev, newRow];
      if (selectedModule) {
        setAssignmentsByModule(m => ({ ...m, [selectedModule]: next }));
      }
      return next;
    });
  };

  const removeRow = (rowId: number) => {
    if (assignmentRows.length > 1) {
      setAssignmentRows(prev => {
        const next = prev.filter(row => row.id !== rowId);
        if (selectedModule) setAssignmentsByModule(m => ({ ...m, [selectedModule]: next }));
        return next;
      });
    }
  };

  const updateRow = (rowId: number, field: string, value: any) => {
    setAssignmentRows(rows => {
      const next = rows.map(row => row.id === rowId ? { ...row, [field]: value } : row);
      if (selectedModule) setAssignmentsByModule(m => ({ ...m, [selectedModule]: next }));
      return next;
    });
  };

  // Reset dependent fields when type changes
  const handleTypeChange = (rowId: number, newType: string) => {
    console.log('🔄 Type changed:', { rowId, newType });
    updateRow(rowId, 'selectedType', newType);
    updateRow(rowId, 'selectedValue', '');
    updateRow(rowId, 'selectedBlock', '');
    updateRow(rowId, 'selectedGP', '');
    updateRow(rowId, 'selectedVillages', []);
    updateRow(rowId, 'selectedCast', '');
    updateRow(rowId, 'selectedAgeFrom', '');
    updateRow(rowId, 'selectedAgeTo', '');

    // Clear search state for selectedValue
    updateSearchState(rowId.toString(), 'selectedValue', '');

    // If options are empty, try to refetch them
    if (newType && (
      (newType === 'Parliament' && parliamentOptions.length === 0) ||
      (newType === 'Assembly' && assemblyOptions.length === 0) ||
      (newType === 'District' && districtOptions.length === 0) ||
      (newType === 'Block' && blockOptions.length === 0)
    )) {
      console.log('⚠️ Options empty for type:', newType, '- refetching...');
      fetchMasterFilterOptions();
    }
  };

  // Reset dependent fields when value changes
  const handleValueChange = (rowId: number, newValue: string, selectedType: string) => {
    updateRow(rowId, 'selectedValue', newValue);
    updateRow(rowId, 'selectedBlock', '');
    updateRow(rowId, 'selectedGP', '');
    updateRow(rowId, 'selectedVillages', []);
    updateRow(rowId, 'selectedCast', ''); // Reset cast
    updateRow(rowId, 'selectedAgeFrom', ''); // Reset age
    updateRow(rowId, 'selectedAgeTo', ''); // Reset age

    // Update search state to show selected value name
    const selectedOption = getFilteredValues(selectedType).find(item => item.id === newValue);
    if (selectedOption) {
      updateSearchState(rowId.toString(), 'selectedValue', selectedOption.name);
    }

    // Skip block fetching for Data ID type (it doesn't use hierarchical structure)
    if (selectedType === 'Data ID') {
      return;
    }

    // Fetch blocks based on selected type and value
    const districtName = getDistrictFromSelection(selectedType, newValue);

    if (districtName) {
      let acId = '';
      if (selectedType === 'Assembly' || selectedType === 'AC') {
        const constituency = constituencies.find(c => c.id === newValue || c.name === (getFilteredValues(selectedType).find((v: any) => v.id === newValue)?.name || ''));
        acId = constituency?.id || '';
      } else if (selectedType === 'Parliament' || selectedType === 'PC') {
        const constituency = constituencies.find(c => c.pc === (getFilteredValues(selectedType).find((v: any) => v.id === newValue)?.name || '') || c.pc_id === newValue);
        acId = constituency?.pc_id || '';
      }
      fetchBlocks(acId, districtName);
    } else if (selectedType === 'Block') {
      // If Block is selected as type, the selectedValue is the block name
      // We can fetch GPs directly if we have the block name
      const selectedOption = getFilteredValues(selectedType).find((v: any) => v.id === newValue);
      const blockName = selectedOption?.name || newValue;
      if (blockName) {
        // We need district to fetch GPs, but we don't have it from Block alone
        // For now, try to fetch blocks to get district info, or skip GP fetching
        // This is a limitation - Block type might need district context
      }
    }

    // Clear any existing timeout for this row
    if (castAgeFetchTimeouts.current[rowId]) {
      clearTimeout(castAgeFetchTimeouts.current[rowId]);
    }

    // Fetch cast options when value is selected (debounced)
    castAgeFetchTimeouts.current[rowId] = setTimeout(() => {
      setAssignmentRows(currentRows => {
        const row = currentRows.find(r => r.id === rowId);
        if (row && row.selectedValue) {
          fetchCastOptions(rowId, row);
        }
        return currentRows;
      });
      delete castAgeFetchTimeouts.current[rowId];
    }, 300);
  };

  // Handle block change for a specific row
  const handleBlockChange = (rowId: number, newBlock: string, selectedType: string, selectedValue: string) => {
    updateRow(rowId, 'selectedBlock', newBlock);
    updateRow(rowId, 'selectedGP', '');
    updateRow(rowId, 'selectedVillages', []);
    updateRow(rowId, 'selectedCast', ''); // Reset cast when block changes
    updateRow(rowId, 'selectedAgeFrom', ''); // Reset age when block changes
    updateRow(rowId, 'selectedAgeTo', ''); // Reset age when block changes

    // Update search state to show selected block name
    const selectedBlock = getFilteredBlocks().find(b => b.id === newBlock);
    if (selectedBlock) {
      updateSearchState(rowId.toString(), 'selectedBlock', selectedBlock.name);
    }

    // Fetch GPs for selected block
    const block = blocks.find(b => b.id === newBlock);
    const district = getDistrictFromSelection(selectedType, selectedValue);

    if (block && district) {
      fetchGPs(block.name, district);
    }

    // Clear any existing timeout for this row
    if (castAgeFetchTimeouts.current[rowId]) {
      clearTimeout(castAgeFetchTimeouts.current[rowId]);
    }

    // Fetch cast options when block is selected (debounced)
    castAgeFetchTimeouts.current[rowId] = setTimeout(() => {
      setAssignmentRows(currentRows => {
        const row = currentRows.find(r => r.id === rowId);
        if (row && row.selectedValue) {
          fetchCastOptions(rowId, row);
        }
        return currentRows;
      });
      delete castAgeFetchTimeouts.current[rowId];
    }, 300);
  };

  // Handle GP change for a specific row
  const handleGPChange = (rowId: number, newGP: string, selectedType: string, selectedValue: string, selectedBlock: string) => {
    updateRow(rowId, 'selectedGP', newGP);
    updateRow(rowId, 'selectedVillages', []);
    updateRow(rowId, 'selectedCast', ''); // Reset cast when GP changes
    updateRow(rowId, 'selectedAgeFrom', ''); // Reset age when GP changes
    updateRow(rowId, 'selectedAgeTo', ''); // Reset age when GP changes

    // Update search state to show selected GP name
    const selectedGP = getFilteredGPs().find(gp => gp.id === newGP);
    if (selectedGP) {
      updateSearchState(rowId.toString(), 'selectedGP', selectedGP.name);
    }

    // Fetch villages for selected GP
    const gp = gps.find(g => g.id === newGP);
    const block = blocks.find(b => b.id === selectedBlock);
    const district = getDistrictFromSelection(selectedType, selectedValue);

    if (gp && block && district) {
      fetchVillages(gp.name, block.name, district);
    }

    // Clear any existing timeout for this row
    if (castAgeFetchTimeouts.current[rowId]) {
      clearTimeout(castAgeFetchTimeouts.current[rowId]);
    }

    // Fetch cast options when GP is selected (debounced)
    castAgeFetchTimeouts.current[rowId] = setTimeout(() => {
      setAssignmentRows(currentRows => {
        const row = currentRows.find(r => r.id === rowId);
        if (row && row.selectedValue) {
          fetchCastOptions(rowId, row);
        }
        return currentRows;
      });
      delete castAgeFetchTimeouts.current[rowId];
    }, 300);
  };

  // Handle Village change for a specific row
  const handleVillageChange = (rowId: number, newVillage: string) => {
    updateRow(rowId, 'selectedVillages', newVillage ? [newVillage] : []);
    updateRow(rowId, 'selectedCast', ''); // Reset cast when village changes
    updateRow(rowId, 'selectedAgeFrom', ''); // Reset age when village changes
    updateRow(rowId, 'selectedAgeTo', ''); // Reset age when village changes

    // Update search state to show selected village name
    const selectedVillage = getFilteredVillages().find(v => v.id === newVillage);
    if (selectedVillage) {
      updateSearchState(rowId.toString(), 'selectedVillages', selectedVillage.name);
    }

    // Clear any existing timeout for this row
    if (castAgeFetchTimeouts.current[rowId]) {
      clearTimeout(castAgeFetchTimeouts.current[rowId]);
    }

    // Fetch cast options when village is selected or cleared (debounced)
    castAgeFetchTimeouts.current[rowId] = setTimeout(() => {
      setAssignmentRows(currentRows => {
        const row = currentRows.find(r => r.id === rowId);
        if (row && row.selectedValue) {
          fetchCastOptions(rowId, row);
        }
        return currentRows;
      });
      delete castAgeFetchTimeouts.current[rowId];
    }, 300);
  };

  // Get filtered data based on selections (like MasterFilter.tsx)
  const getFilteredValues = (selectedType: string) => {
    if (!selectedType) return [];

    console.log('🔍 getFilteredValues called with type:', selectedType, {
      parliamentOptions: parliamentOptions.length,
      assemblyOptions: assemblyOptions.length,
      districtOptions: districtOptions.length,
      blockOptions: blockOptions.length,
      dataIdOptions: dataIdOptions.length
    });

    if (selectedType === 'Data ID') {
      console.log('🔍 Data ID options:', dataIdOptions);
      return dataIdOptions;

    } else if (selectedType === 'Parliament') {
      // Handle "Name (CODE)" format - use the full string as both id and name for now
      const options = parliamentOptions.map(pc => {
        // If format is "Name (CODE)", extract name and code
        if (pc.includes(' (')) {
          const [name, codePart] = pc.split(' (');
          const code = codePart?.replace(')', '') || '';
          return { id: code || pc, name: pc }; // Use code as id, full string as name
        }
        return { id: pc, name: pc };
      });
      console.log('🔍 Parliament options:', options);
      return options;
    } else if (selectedType === 'Assembly') {
      // Handle "Name (CODE)" format - use the full string as both id and name for now
      const options = assemblyOptions.map(ac => {
        // If format is "Name (CODE)", extract name and code
        if (ac.includes(' (')) {
          const [name, codePart] = ac.split(' (');
          const code = codePart?.replace(')', '') || '';
          return { id: code || ac, name: ac }; // Use code as id, full string as name
        }
        return { id: ac, name: ac };
      });
      console.log('🔍 Assembly options:', options);
      return options;
    } else if (selectedType === 'District') {
      const options = districtOptions.map(dist => ({ id: dist, name: dist }));
      console.log('🔍 District options:', options);
      return options;
    } else if (selectedType === 'Block') {
      const options = blockOptions.map(block => ({ id: block, name: block }));
      console.log('🔍 Block options:', options);
      return options;
    }

    // Fallback to old logic for backward compatibility
    if (selectedType === 'AC') {
      return constituencies.map(c => ({ id: c.id, name: c.name }));
    } else if (selectedType === 'PC') {
      const uniquePCs = constituencies.reduce((acc, c) => {
        if (!acc.find(pc => pc.name === c.pc)) {
          acc.push({ id: c.pc_id || '', name: c.pc || '' });
        }
        return acc;
      }, [] as { id: string; name: string }[]);
      return uniquePCs;
    }

    return [];
  };

  // Helper function to get district name from selected type and value
  const getDistrictFromSelection = (selectedType: string, selectedValue: string): string => {
    if (!selectedType || !selectedValue) return '';

    const selectedOption = getFilteredValues(selectedType).find((v: any) => v.id === selectedValue);
    const valueName = selectedOption?.name || selectedValue;

    // For new types, we need to fetch district from the API
    // For now, return the value name if it's District, otherwise try to get from constituencies
    if (selectedType === 'District') {
      return valueName;
    } else if (selectedType === 'Assembly' || selectedType === 'AC') {
      // Try to find district from constituencies
      const constituency = constituencies.find(c => c.id === selectedValue || c.name === valueName);
      return constituency?.district || '';
    } else if (selectedType === 'Parliament' || selectedType === 'PC') {
      // Try to find district from constituencies
      const constituency = constituencies.find(c => c.pc === valueName || c.pc_id === selectedValue);
      return constituency?.district || '';
    } else if (selectedType === 'Block') {
      // For Block, we might need to fetch district from API
      // For now, return empty and let the calling code handle it
      return '';
    }

    return '';
  };

  const getFilteredBlocks = () => {
    return blocks;
  };

  const getFilteredGPs = () => {
    return gps;
  };

  const getFilteredVillages = () => {
    return villages;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleVillageToggle = (rowId: number, villageId: string) => {
    updateRow(rowId, 'selectedVillages', (prev: string[]) => {
      if (prev.includes(villageId)) {
        return prev.filter(id => id !== villageId);
      } else {
        return [...prev, villageId];
      }
    });
  };

  const handleSelectAllVillages = (rowId: number) => {
    const villages = getFilteredVillages();
    updateRow(rowId, 'selectedVillages', villages.map(v => v.id));
  };

  const handleClearAllVillages = (rowId: number) => {
    updateRow(rowId, 'selectedVillages', []);
  };

  const getSelectedConstituencyInfo = (row: any) => {
    if (row.selectedType === 'AC' || row.selectedType === 'PC' ||
      row.selectedType === 'Assembly' || row.selectedType === 'Parliament') {
      return constituencies.find(c => c.id === row.selectedValue);
    }
    return null;
  };

  const getSelectedBlockInfo = (row: any) => {
    return blocks.find(b => b.id === row.selectedBlock);
  };

  const getSelectedGPInfo = (row: any) => {
    return gps.find(gp => gp.id === row.selectedGP);
  };

  const getSelectedVillagesInfo = (row: any) => {
    return villages.filter(v => row.selectedVillages.includes(v.id));
  };

  const [showColumnPermissions, setShowColumnPermissions] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const permissionsRef = useRef<{ save: () => Promise<void> } | null>(null);

  const handleSave = async () => {
    console.log('💾 handleSave called - saving assignment with permissions to database');
    
    try {
      setIsLocalSaving(true);
      setError('');

      // Get current module data
      const currentModule = selectedModule || availableDatasetIds[0] || 'dataset';
      const rows = assignmentsByModule[selectedModule] || assignmentRows;
      const isDatasetModule = currentModule === 'dataset' || currentModule.startsWith('dataset_') || availableDatasetIds.includes(currentModule);

      if (!isDatasetModule && !selectedModule) {
        throw new Error('Please select a valid dataset module');
      }

      // Only take the FIRST row (the one being displayed in the form)
      const currentRow = rows && rows.length > 0 ? rows[0] : null;
      
      if (!currentRow) {
        throw new Error('No assignment data to save');
      }

      // Validate that required data is present
      const hasDataID = currentRow.selectedType && currentRow.selectedValue;
      const hasFilterBy = currentRow.selectedDataType && currentRow.selectedDataType !== '';
      const hasFilterValues = currentRow.selectedDataValue && Array.isArray(currentRow.selectedDataValue) && currentRow.selectedDataValue.length > 0;
      
      console.log('📊 Validation for final save:', { hasDataID, hasFilterBy, hasFilterValues });

      if (!hasDataID) {
        throw new Error('Please select a Data ID before assigning');
      }

      if (!hasFilterBy) {
        throw new Error('Please select a Filter By option (Block/GP/Village/Bhag/Party Kendra) before assigning');
      }

      if (!hasFilterValues) {
        throw new Error('Please select at least one value for the selected filter before assigning');
      }

      // Build payload - send only this ONE row
      const payload: Record<string, any[]> = {};
      const moduleKey = selectedModule || 'dataset';

      payload[moduleKey] = [{
        rowId: currentRow.id,
        rowNumber: 1,
        selectedType: currentRow.selectedType,
        selectedValue: currentRow.selectedValue,
        selectedDataType: currentRow.selectedDataType || '',
        selectedDataValue: currentRow.selectedDataValue || [],
        selectedCast: currentRow.selectedCast || '',
        selectedAgeFrom: currentRow.selectedAgeFrom || '',
        selectedAgeTo: currentRow.selectedAgeTo || '',
        savedAt: new Date().toISOString(),
        userId: selectedUser.id
      }];

      console.log('🚀 Sending final assignment to API:', payload);

      // Save to user_assignments table via API - this creates assignment_token
      const result = await apiClient.saveUserAssignments(selectedUser.id, payload);
      console.log('📥 API result:', result);
      
      if (result && result.success) {
        alert('Data assigned successfully to user!');
        
        // Reset permissions section
        setShowColumnPermissions(false);
        
        // Notify parent to refresh data
        onSave?.(payload);
        
        // Refresh assignments from server - this will re-fetch all assignments and update the table
        setAssignmentsRefreshKey(prev => prev + 1);
        
        // Wait for the fetch to complete before resetting form
        setTimeout(async () => {
          // Reset form rows after data is loaded
          const emptyRow = {
            id: Date.now(),
            selectedType: '',
            selectedValue: '',
            selectedDataType: '',
            selectedDataValue: [],
            selectedBlock: '',
            selectedGP: '',
            selectedVillages: [],
            selectedCast: '',
            selectedAgeFrom: '',
            selectedAgeTo: '',
            assignment_token: null
          };
          
          setAssignmentRows([emptyRow]);
        }, 500);
      } else if (result && result.isDuplicate) {
        // Handle duplicate assignment
        alert('⚠️ This assignment already exists for this user. Please select different data.');
        setError(result.message || 'Duplicate assignment');
      } else {
        throw new Error(result?.message || 'Failed to save assignment');
      }
    } catch (error: any) {
      console.error('💥 Error saving assignment:', error);
      const errorMessage = error?.message || 'Failed to save assignment';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLocalSaving(false);
    }
  };

  const handleSavePartial = async () => {
    console.log('📝 handleSavePartial called - validating data for draft');
    try {
      // Validate current module data (do NOT save to database yet)
      const isDatasetModule = selectedModule === 'dataset' || selectedModule.startsWith('dataset_') || availableDatasetIds.includes(selectedModule);

      if (isDatasetModule || !selectedModule) {
        const rows = assignmentsByModule[selectedModule] || assignmentRows;
        const moduleKey = selectedModule || 'dataset';

        console.log('📊 ALL rows in state:', rows);
        console.log('📊 Number of rows:', rows.length);

        // Only take the FIRST row (the one being displayed in the form)
        const currentRow = rows && rows.length > 0 ? rows[0] : null;
        
        if (!currentRow) {
          alert('No data to validate');
          return;
        }

        // Check if this row has valid data
        const hasDataID = currentRow.selectedType && currentRow.selectedValue;
        const hasFilterBy = currentRow.selectedDataType && currentRow.selectedDataType !== '';
        const hasFilterValues = currentRow.selectedDataValue && Array.isArray(currentRow.selectedDataValue) && currentRow.selectedDataValue.length > 0;
        
        console.log('📊 Current row:', currentRow);
        console.log('📊 Validation:', { hasDataID, hasFilterBy, hasFilterValues });

        if (!hasDataID) {
          alert('Please select a Data ID before continuing');
          return;
        }

        if (!hasFilterBy) {
          alert('Please select a Filter By option (Block/GP/Village/Bhag/Party Kendra) before continuing');
          return;
        }

        if (!hasFilterValues) {
          alert('Please select at least one value for the selected filter before continuing');
          return;
        }

        console.log('✅ Validation passed - proceeding to permissions section');
        
        // Just show permissions section, do NOT save to database yet
        setShowColumnPermissions(true);
      } else {
        // Just show permissions for non-dataset modules
        setShowColumnPermissions(true);
      }
    } catch (error) {
      console.error('💥 Error validating draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${errorMessage}`);
    }
  };

  const isAssignmentComplete = assignmentRows.some(row =>
    row.selectedType && row.selectedValue && row.selectedBlock && row.selectedGP && row.selectedVillages.length > 0
  );

  // All selections are datasets, so use dataset assignment logic
  const effectiveIsComplete = isAssignmentComplete;
  
  // Updated logic: Button enabled only when user has selected Data ID + Filter By + at least one value
  // IMPORTANT: Only check NEW rows (without assignment_token), ignore already saved assignments
  const effectiveHasPartial = assignmentRows
    .filter(row => !row.assignment_token || row.assignment_token === null || row.assignment_token === '')
    .some(row => {
      const hasDataID = row.selectedValue && row.selectedValue !== '';
      const hasFilterBy = row.selectedDataType && row.selectedDataType !== '';
      const hasFilterValues = row.selectedDataValue && Array.isArray(row.selectedDataValue) && row.selectedDataValue.length > 0;
      
      // Save Draft button should only be enabled when all three are present
      return hasDataID && hasFilterBy && hasFilterValues;
    });

  // Search functionality
  const updateSearchState = (rowId: string, field: string, value: string) => {
    setSearchStates(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value
      }
    }));
  };

  const getSearchValue = (rowId: string, field: string): string => {
    return searchStates[rowId]?.[field] || '';
  };

  // Remove assigned data handler
  const handleRemoveAssignedRow = async (dataset: string, row: any, idx: number) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;
    try {
      console.log('[REMOVE] ========== DELETE OPERATION START ==========');
      console.log('[REMOVE] Full row data:', JSON.stringify(row, null, 2));
      console.log('[REMOVE] Row keys:', Object.keys(row));
      console.log('[REMOVE] Row.id:', row.id, 'Type:', typeof row.id);
      console.log('[REMOVE] Row.rowId:', row.rowId, 'Type:', typeof row.rowId);
      console.log('[REMOVE] Row.assignment_token:', row.assignment_token);
      
      // Use database row ID (id) as the primary identifier, fallback to assignment_token
      const assignmentId = row.id || row.rowId || row.assignment_token;
      
      if (!assignmentId) {
        console.error('[REMOVE] No valid assignmentId found. Row data:', {
          id: row.id,
          rowId: row.rowId,
          assignment_token: row.assignment_token
        });
        alert('Cannot remove: No valid assignment ID found.');
        return;
      }
      
      const authToken = localStorage.getItem('token') || '';
      console.log('[REMOVE] Removing assignment:', {
        userId: selectedUser.id,
        datasetId: dataset,
        assignmentId: assignmentId,
        assignmentIdType: typeof assignmentId,
        identifierUsed: row.id ? 'id' : (row.rowId ? 'rowId' : 'assignment_token')
      });
      
      const apiRes = await fetch('http://localhost:5004/api/user-assignments/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ 
          userId: selectedUser.id, 
          datasetId: dataset, 
          assignmentId: assignmentId 
        })
      });
      const res = await apiRes.json();
      console.log('[REMOVE] API response:', res);
      
      if (res && res.success) {
        alert('Assignment removed successfully!');
        
        // Remove from local state immediately using the same ID we used for deletion
        setAssignmentsByModule(prev => {
          const updated = { ...prev };
          if (updated[dataset]) {
            updated[dataset] = updated[dataset].filter((r: any) => {
              const rId = r.id || r.rowId || r.assignment_token;
              return rId !== assignmentId;
            });
            // If no assignments left for this dataset, remove the dataset key
            if (updated[dataset].length === 0) {
              delete updated[dataset];
            }
          }
          return updated;
        });
        
        // Also update assignmentRows if it's the current module
        if (dataset === selectedModule) {
          setAssignmentRows(prev => prev.filter((r: any) => {
            const rId = r.id || r.rowId || r.assignment_token;
            return rId !== assignmentId;
          }));
        }
        
        // Refresh assignments from server
        setAssignmentsRefreshKey(prev => prev + 1);
        
        // Notify parent to refresh
        onSave?.();
      } else {
        alert(res?.message || 'Failed to remove assignment');
      }
    } catch (err) {
      console.error('[REMOVE] Error:', err);
      alert('Error removing assignment');
    }
  };

  console.log('🎯 Component render - showColumnPermissions:', showColumnPermissions);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 w-[1200px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Assignment Section (only visible when NOT showing column permissions) */}
        {!showColumnPermissions && (
        <>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Hierarchical Data Assignment</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Assigning data to:</strong> {selectedUser?.username || selectedUser?.email || 'Selected User'}
              </p>
            </div>

            {/* Already Assigned Data */}
            {(() => {
              const hasAssignments = Object.keys(assignmentsByModule).length > 0;
              console.log('🎨 Rendering Already Assigned Data section, hasAssignments:', hasAssignments);
              console.log('🎨 assignmentsByModule:', assignmentsByModule);
              return hasAssignments;
            })() && (
              <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#2563eb' }}>Already Assigned Data</div>
                {Object.entries(assignmentsByModule)
                  .map(([dataset, rowsRaw]) => {
                    const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
                    console.log(`🔍 Processing dataset ${dataset}, total rows:`, rows.length);
                    console.log(`🔍 Full rows data for dataset ${dataset}:`, JSON.stringify(rows, null, 2));
                    
                    // IMPORTANT: Only show rows that have assignment_token (previously saved assignments)
                    // Assignment token is the definitive marker that a row was saved to database
                    const validRows = rows.filter(row => {
                      const hasAssignmentToken = row.assignment_token && 
                                                  row.assignment_token !== null && 
                                                  row.assignment_token !== '' &&
                                                  row.assignment_token !== undefined;
                      
                      console.log(`🔍 Row ${row.id || 'no-id'} - hasAssignmentToken: ${hasAssignmentToken}, token: ${row.assignment_token}`);
                      
                      // Only show if it has assignment_token (this means it was saved to DB)
                      return hasAssignmentToken;
                    });
                    
                    console.log(`✅ Dataset ${dataset} - valid rows with tokens:`, validRows.length);
                    
                    // Only return this dataset section if there are valid rows
                    if (validRows.length === 0) {
                      console.log(`⚠️ Skipping dataset ${dataset} - no valid rows`);
                      return null;
                    }
                    
                    return (
                      <div key={dataset} style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 500, color: '#334155', marginBottom: 4 }}>Dataset: {dataset}</div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', fontSize: 14, background: '#fff', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                              <tr style={{ background: '#f1f5f9' }}>
                                <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Code</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Data ID</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Filter By</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Selected Value(s)</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Cast</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Age Range</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {validRows.map((row, idx) => {
                              const dataId = row.selectedValue || row.selectedType || '-';
                              const filterBy = row.selectedDataType || '-';
                              const selectedValues = row.selectedDataValue && Array.isArray(row.selectedDataValue) && row.selectedDataValue.length > 0
                                ? row.selectedDataValue.join(', ')
                                : '-';
                              let castDisplay = '-';
                              if (row.selectedCast) {
                                if (Array.isArray(row.selectedCast) && row.selectedCast.length > 0) {
                                  castDisplay = row.selectedCast.join(', ');
                                } else if (typeof row.selectedCast === 'string' && row.selectedCast.trim()) {
                                  castDisplay = row.selectedCast;
                                }
                              } else if (row.cast) {
                                castDisplay = row.cast;
                              }
                              const ageFrom = row.selectedAgeFrom ?? '';
                              const ageTo = row.selectedAgeTo ?? '';
                              const ageRange = ageFrom || ageTo
                                ? `${ageFrom || '-'} to ${ageTo || '-'}`
                                : (row.age ? (typeof row.age === 'object' ? `${row.age.from || '-'} to ${row.age.to || '-'}` : row.age) : '-');
                              return (
                                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontWeight: 600, color: '#2563eb' }}>{row.assignment_token}</span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(row.assignment_token);
                                          alert(`Code ${row.assignment_token} copied!`);
                                        }}
                                        className="text-gray-600 hover:text-blue-600"
                                        title="Copy Code"
                                      >
                                        📋
                                      </button>
                                    </div>
                                  </td>
                                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{dataId}</td>
                                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{filterBy}</td>
                                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px', maxWidth: '300px', wordWrap: 'break-word' }}>{selectedValues}</td>
                                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{castDisplay}</td>
                                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>{ageRange}</td>
                                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 12px' }}>
                                    <button
                                      onClick={() => handleRemoveAssignedRow(dataset, row, idx)}
                                      className="text-red-600 hover:text-red-800"
                                      title="Remove Assignment"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
                .filter(section => section !== null) // Remove null sections (datasets with no valid rows)
                }
              </div>
            )}

            {/* Dataset Selection */}
            {datasetsFromDb.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Dataset</label>
                <select
                  value={selectedModule || ''}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={datasetsLoading}
                >
                  <option value="">Choose a dataset...</option>
                  {datasetsFromDb.map(ds => (
                    <option key={ds.id} value={ds.dataset_id}>
                      {ds.dataset_name} (ID: {ds.dataset_id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Assignment Rows */}
            {selectedModule && (
              <div className="space-y-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700">Data Assignments</h4>
                
                {/* Paste Code Section */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Copy Existing Assignment (Paste 6-digit code)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      id="paste-code-input"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const code = (e.target as HTMLInputElement).value.trim();
                          if (code.length === 6) {
                            handleLoadByCode(code);
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('paste-code-input') as HTMLInputElement;
                        const code = input?.value.trim();
                        if (code && code.length === 6) {
                          handleLoadByCode(code);
                        } else {
                          alert('Please enter a valid 6-digit code');
                        }
                      }}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                    >
                      Load
                    </button>
                  </div>
                </div>
                
                {/* <p className="text-xs text-gray-500 mt-1">Configure data access filters for the selected dataset.</p> */}
                {
                  (() => {
                    // Get rows for this module
                    const rows = assignmentsByModule[selectedModule] || assignmentRows;
                    
                    // IMPORTANT: Filter out already-assigned rows (those with assignment_token)
                    // Only show NEW rows (without assignment_token) in the form
                    const newRows = rows.filter(row => !row.assignment_token || row.assignment_token === null || row.assignment_token === '');
                    
                    console.log('🎯 Assignment form - total rows:', rows.length, 'new rows (no token):', newRows.length);
                    
                    // Display logic: show first new row or create empty row for display only
                    let displayRows;
                    if (newRows && newRows.length > 0) {
                      displayRows = [newRows[0]];
                    } else {
                      // Create empty row for display ONLY (not added to state during render)
                      const emptyRow = {
                        id: Date.now(),
                        selectedType: '',
                        selectedValue: '',
                        selectedDataType: '',
                        selectedDataValue: [],
                        selectedBlock: '',
                        selectedGP: '',
                        selectedVillages: [],
                        selectedCast: '',
                        selectedAgeFrom: '',
                        selectedAgeTo: '',
                        assignment_token: null
                      };
                      
                      displayRows = [emptyRow];
                    }
                    
                    console.log('🎯 Displaying row:', displayRows[0]);
                    
                    return displayRows.map((row, index) => (
                      <div key={`${selectedModule}-assignment-${index}-${row.id || 'new'}`} className="border border-gray-200 rounded-lg p-2 bg-white flex items-center justify-between" style={{flexWrap: 'nowrap'}}>
                        <div style={{display: 'flex', width: '100%'}}>
                          {/* Data ID Selector */}
                          <div className="flex flex-col flex-1 mx-2 min-w-[180px] max-w-[240px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Data ID</label>
                            <select
                              value={row.selectedValue || ''}
                              onChange={async (e) => {
                                const newValue = e.target.value;
                                updateRow(row.id, 'selectedValue', newValue);
                                updateRow(row.id, 'selectedType', 'Data ID');
                                updateRow(row.id, 'selectedDataType', '');
                                updateRow(row.id, 'selectedDataValue', []);
                                
                                // Fetch blocks, GPs, villages, bhag, party kendra when Data ID is selected
                                if (newValue) {
                                  try {
                                    // Fetch all hierarchical data for this Data ID
                                    await fetchBlocks('', ''); // Fetch all blocks
                                    await fetchGPs('', ''); // Will be filtered based on block selection
                                  } catch (error) {
                                    console.error('Error fetching hierarchical data:', error);
                                  }
                                }
                              }}
                              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              disabled={loadingDataIds}
                            >
                              <option value="">Select Data ID...</option>
                              {dataIdOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                  {option.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {/* Filter By */}
                          <div className="flex flex-col flex-1 mx-2 min-w-[180px] max-w-[240px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Filter By</label>
                            <select
                              value={row.selectedDataType || ''}
                              onChange={(e) => {
                                updateRow(row.id, 'selectedDataType', e.target.value);
                                updateRow(row.id, 'selectedDataValue', []);
                                // Clear old filter fields to prevent conflicts
                                updateRow(row.id, 'bhag', '');
                                updateRow(row.id, 'partyKendra', '');
                                updateRow(row.id, 'selectedBlock', '');
                                updateRow(row.id, 'selectedGP', '');
                                updateRow(row.id, 'selectedVillages', []);
                              }}
                              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              disabled={!row.selectedValue}
                            >
                              <option value="">Select filter type...</option>

                              <option value="Bhag">Bhag Wise</option>
                              <option value="Block">Block Wise</option>
                              <option value="GP">GP Wise</option>
                              <option value="Village">Village Wise</option>
                              <option value="Party Kendra">Party Kendra Wise</option>
                            </select>
                          </div>
                            {/* Multi-Select Values (now also for Bhag and Party Kendra) */}
                          <div className="flex flex-col flex-1 mx-2 min-w-[180px] max-w-[240px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">{row.selectedDataType ? `Select ${row.selectedDataType} Values` : 'Values'}</label>
                            <MultiSelectCheckbox
                              rowId={row.id}
                              type={row.selectedDataType}
                              dataId={row.selectedValue}
                              selected={row.selectedDataValue || []}
                              onChange={(value: string[]) => {
                                updateRow(row.id, 'selectedDataValue', value);
                                if (value.length > 0) {
                                  const updatedRow = { ...row, selectedDataValue: value };
                                  fetchCastOptions(row.id, updatedRow);
                                }
                              }}
                              closeOnSelect={false}
                            />
                          </div>
                          {/* Cast Field - Custom dropdown that fetches based on Filter By selection */}
                          <div className="flex flex-col flex-1 mx-2 min-w-[180px] max-w-[240px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Caste (castida)</label>
                            <select
                              value={row.selectedCast || ''}
                              onChange={(e) => updateRow(row.id, 'selectedCast', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              disabled={!row.selectedValue || !row.selectedDataType || !row.selectedDataValue || row.selectedDataValue.length === 0}
                            >
                              <option value="">Select...</option>
                              {loadingCasts[row.id] ? (
                                <option value="">Loading...</option>
                              ) : (
                                (castOptions[row.id] || []).map(opt => (
                                  <option key={opt.id} value={opt.id}>{opt.id}</option>
                                ))
                              )}
                            </select>
                          </div>
                          {/* Age Range */}
                          <div className="flex flex-col flex-1 mx-2 min-w-[180px] max-w-[240px]">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Age Range</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                placeholder="From"
                                value={row.selectedAgeFrom || ''}
                                onChange={(e) => updateRow(row.id, 'selectedAgeFrom', e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                min="0"
                                max="150"
                              />
                              <span className="text-gray-500 text-sm">to</span>
                              <input
                                type="number"
                                placeholder="To"
                                value={row.selectedAgeTo || ''}
                                onChange={(e) => updateRow(row.id, 'selectedAgeTo', e.target.value)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                min="0"
                                max="150"
                              />
                            </div>
                          </div>
                        </div>
                        {/* Remove Row Button */}
                        {displayRows.length > 1 && (
                          <button
                            onClick={() => removeRow(row.id)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 mt-6"
                            title="Remove Assignment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {/* Add Assignment Button (Plus Icon) - only on last row */}
                        {index === displayRows.length - 1 && (
                          <button
                            onClick={() => addNewRow()}
                            className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1 mt-6"
                            title="Add Another Assignment"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ));
                  })()
                }
              </div>
            )}

            {isAssignmentComplete && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Assignment Summary
                  </h5>
                  <div className="space-y-3">
                    {assignmentRows.map((row, index) => {
                      if (!row.selectedType || !row.selectedValue || !row.selectedBlock || !row.selectedGP || row.selectedVillages.length === 0) {
                        return null;
                      }

                      return (
                        <div key={row.id} className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="text-sm font-medium text-gray-700 mb-2">Assignment {index + 1}</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span><strong>{row.selectedType}:</strong> {getFilteredValues(row.selectedType).find(v => v.id === row.selectedValue)?.name || 'Not selected'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-green-600" />
                              <span><strong>Block:</strong> {getFilteredBlocks().find(b => b.id === row.selectedBlock)?.name || 'Not selected'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-purple-600" />
                              <span><strong>GP:</strong> {getFilteredGPs().find(gp => gp.id === row.selectedGP)?.name || 'Not selected'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4 text-orange-600" />
                              <span><strong>Village:</strong> {getFilteredVillages().find(v => v.id === row.selectedVillages[0])?.name || 'None selected'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Save Message Display */}
            {saveMessage && (
                <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 text-sm font-medium">{saveMessage}</span>
                  </div>
                </div>
              )}

            {/* Button Descriptions */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span><strong>Save Draft:</strong> Validates data and opens permissions section (no database save)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                className="px-4 py-2 rounded text-white bg-purple-600 hover:bg-purple-700"
                style={{ marginRight: 8 }}
                onClick={handleViewAssignedData}
              >
                View Assigned Data
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePartial}
                disabled={!effectiveHasPartial || isSaving}
                className={`px-4 py-2 rounded text-white flex items-center space-x-2 ${effectiveHasPartial && !isSaving
                    ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed'
                  }`
                }
                title="Validate data and show permissions section"
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{isSaving ? 'Validating...' : 'Save Draft'}</span>
              </button>
            </div>
        </>
        )}

        {/* Assigned Data Popup */}
        {showAssignedDataPopup && (
          <div className="assigned-data-popup" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 400, maxWidth: 600 }}>
              <h3>Already Assigned Data</h3>
              {/* Data will be shown here */}
              <button type="button" className="btn btn-outline" style={{ marginTop: 16 }} onClick={handleCloseAssignedDataPopup}>Close</button>
            </div>
          </div>
        )}

        {/* Permissions Section: only show after Save Draft (showColumnPermissions) */}
        {(() => {
          console.log('🔍 Render check - showColumnPermissions:', showColumnPermissions);
          return null;
        })()}
        {showColumnPermissions && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Manage Column Permissions</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Set view, edit, and mask permissions for live_voter_list table columns
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Success Message after draft save (optional) */}
            {saveMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Draft saved successfully!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Now configure column permissions for the user's data access.
                </p>
              </div>
            )}
            <div className="max-h-[calc(90vh-280px)] overflow-y-auto">
              <ColumnPermissionsManager
                ref={permissionsRef}
                tableName="live_voter_list"
                userId={selectedUser?.id || 0}
                userLabel={selectedUser?.username || selectedUser?.email || `User ${selectedUser?.id}`}
                onSave={() => {
                  // Success handled in button click
                }}
              />
            </div>
            <div className="flex justify-end mt-6 space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  // Go back to assignment form
                  setShowColumnPermissions(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Form
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setSavingPermissions(true);
                    
                    // First save permissions
                    if (permissionsRef.current) {
                      await permissionsRef.current.save();
                    }
                    
                    // Then save assignment data to database (creates assignment_token)
                    await handleSave();
                    
                  } catch (err) {
                    console.error('Error saving assignment:', err);
                    alert('Failed to save assignment');
                  } finally {
                    setSavingPermissions(false);
                  }
                }}
                disabled={savingPermissions || isLocalSaving}
                className={`px-4 py-2 rounded text-white flex items-center space-x-2 ${
                  savingPermissions || isLocalSaving
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
                title="Save permissions and assign data to user"
              >
                {(savingPermissions || isLocalSaving) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <CheckCircle className="w-4 h-4" />
                <span>{(savingPermissions || isLocalSaving) ? 'Assigning...' : 'Assign Data to User'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
       </div>
  );
}

export default HierarchicalDataAssignmentModal;
