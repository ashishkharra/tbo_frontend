// Fetch block, mandal, kendra options from booth-mapping hierarchy endpoint
export async function fetchBoothMappingHierarchyOptions() {
  const url = `${getBaseURL()}/booth-mapping/hierarchy-options`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('authToken') ? { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } : {})
    }
  });
  if (!response.ok) throw new Error('Failed to fetch booth mapping hierarchy options');
  return response.json();
}

import apiClient, { getBaseURL } from './apiClient';

// Re-export the centralized API client
export default apiClient;

// Keep existing interfaces for backward compatibility

// Format ISO date (YYYY-MM-DD) to backend expected format (DD-MMM-YYYY)
const formatDateForBackend = (isoDate?: string): string | undefined => {
  if (!isoDate) return undefined;
  try {
    if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(isoDate)) return isoDate;
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mon = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${mon}-${year}`;
  } catch {
    return isoDate;
  }
};

export interface Voter {
  id: number;
  name: string;
  fname?: string;
  mname?: string;
  surname?: string;
  cast_id?: string;
  cast_ida?: string;
  mobile1?: string;
  mobile2?: string;
  age?: number;
  date_of_birth?: string;
  parliament?: string;
  assembly?: string;
  district?: string;
  block?: string;
  tehsil?: string;
  village?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SurnameData {
  id: number;
  name?: string; // Make name field optional since backend might not always return it
  master_surname: string; // Changed from surname to master_surname to match SurnameDataTable
  count: number;
  castId: string;
  castIda: string;
  category_name?: string; // Optional category name field
  // New derived fields from master_surname
  master_surnameCastId?: string; // Short code derived from master_surname (e.g., जाट -> J)
  master_surnameCastName?: string; // Full name derived from master_surname
  // Master filter fields for proper table storage
  parliament?: string;
  assembly?: string;
  district?: string;
  block?: string;
  // Process tracking fields
  processStatus?: 'pending' | 'processing' | 'completed' | 'failed' | 'needs_review';
  lastProcessed?: string;
  notes?: string;
  processedBy?: string;
}

export interface VillageMappingData {
  id: number;
  ltp?: string;
  districtName?: string;
  districtId?: string;
  block?: string;
  blockId?: string;
  gp?: string;
  gpId?: string;
  villageName?: string;
  villageId?: string;
  count?: string; // Count of available candidates in village
  acId?: string;
  acName?: string;
  pcId?: string;
  pcName?: string;
  divisionId?: string;
  divisionName?: string;
  mappingStatus?: 'Mapped' | 'Unmapped' | 'Partial';
  totalVoters?: number;
  lastUpdated?: string;
  // Legacy fields for backward compatibility
  district?: string;
  assembly?: string;
  assemblyName?: string;
  parliament?: string;
  mappedStatus?: 'Mapped' | 'Unmapped' | 'Partial';
  acNo?: string;
  pcNo?: string;
  districtNo?: string;
}

export interface DivisionData {
  id: number;
  DIVISION_ID: number;
  DIVISION_CODE: string;
  DIVISION_ENG: string;
  DIVISION_MANGAL: string;
  DISTRICT_ID: number;
  DISTRICT_CODE: number;
  DISTRICT_ENG: string;
  DISTRICT_MANGAL: string;
  PC_ID: number;
  PC_CODE: number;
  PC_ENG: string;
  PC_MANGAL: string;
  AC_ID: number;
  AC_CODE: number;
  AC_ENG: string;
  AC_MANGAL: string;
  AC_TOTAL_MANDAL?: string;
  PC_SEAT?: string;
  INC_Party_Zila?: string;
}

export interface FilterOptions {
  villageCodes: string[];
  villageNames: string[];
  gramPanchayats: string[];
  patwarCircles: string[];
  lrCircles: string[];
  lbtOptions?: string[]; // LBT options from div_distt_ps_gp_v_ac_pc (area_type)
  ages: number[];
  names: string[];
  fnames: string[];
  hnos: string[];
  malefemales: string[];
  castTypes: string[];
  castIds: string[];
  motherNames: string[];
  addresses: string[];
  surnames: string[];
  religions: string[];
  categories: string[];
}

export interface FilterParams {
  parliament?: string;
  assembly?: string;
  district?: string;
  block?: string;
  tehsil?: string;
  castId?: string;
  castIda?: string;
  mobile1?: string;
  mobile2?: string;
  ageMin?: number;
  ageMax?: number;
  dateOfBirth?: string;
  village?: string;
  name?: string;
  fname?: string;
  mname?: string;
  surname?: string;
  gp?: string;
  table?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface VotersResponse {
  data: Voter[];
  pagination: PaginationInfo;
}

export interface MasterFilterOptions {
  parliamentOptions: string[];
  assemblyOptions: string[];
  districtOptions: string[];
  blockOptions: string[];
  tehsilOptions: string[];
  effectiveDistrict?: string | null;
}

export interface LoginCredentials {
  mobile: string;
  password: string;
  deviceId?: string;
  verificationCode?: string;
  deviceVerificationCode?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      username: string;
      email: string;
      mobile?: string;
      role: 'super_admin' | 'admin' | 'coordinator' | 'data_entry_operator' | 'caller' | 'driver' | 'survey' | 'printer' | 'mobile_user' | 'leader' | 'volunteer' | 'user';
      permissions: string[];
      assignedModules: string[];
      assignedSubModules: string[];
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      lastLogin?: string;
      createdBy?: number;
    };
    token: string;
    sessionToken?: string;
    accessibleResources: Record<string, string[]>;
  };
}

// Admin User Management Interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  mobile?: string;
  role: 'super_admin' | 'admin' | 'coordinator' | 'data_entry_operator' | 'caller' | 'driver' | 'survey' | 'printer' | 'mobile_user' | 'leader' | 'volunteer' | 'user';
  permissions: string[];
  assignedModules: string[];
  assignedSubModules: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  createdBy?: number;
  address?: string;
  location?: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  mobile?: string;
  role: 'super_admin' | 'admin' | 'coordinator' | 'data_entry_operator' | 'caller' | 'driver' | 'survey' | 'printer' | 'mobile_user' | 'leader' | 'volunteer' | 'user';
  permissions: string[];
  address?: string;
  location?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  mobile?: string;
  role?: 'super_admin' | 'admin' | 'coordinator' | 'data_entry_operator' | 'caller' | 'driver' | 'survey' | 'printer' | 'mobile_user' | 'leader' | 'volunteer' | 'user';
  permissions?: string[];
  isActive?: boolean;
  address?: string;
  location?: string;
  assignedModules?: string[];
  assignedSubModules?: string[];
  assignedDatasets?: string[];
  datasetAccess?: string[];
  selectedColumns?: { [key: string]: string[] };
  dataAssignment?: any;
  hierarchicalDataAssignment?: any;
  assignmentCode?: string | null;
  team_ids?: number[];
  parent_id?: number | null;
  assignedNavbarPages?: string[];
}

export interface ChangePasswordData {
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {

    // Delete all booth mapping data for a given dataId
    async deleteBoothMappingByDataId(dataId: string): Promise<ApiResponse<any>> {
      return this.request(`/booth-mapping/by-data-id/${dataId}`, 'DELETE');
    }
  private baseURL = getBaseURL();

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    // Trim token to remove any whitespace that might cause signature issues
    const cleanToken = token.trim();

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanToken}`
    };
  }

  // Check if token is valid and not expired
  private isTokenValid(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Refresh token if needed
  private async refreshTokenIfNeeded(): Promise<boolean> {
    if (this.isTokenValid()) {
      return true;
    }

    try {
      // Try to get a new token by calling profile endpoint
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return true;
      }

      // If profile fails, try to get a new token
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        // You might need to implement a refresh token endpoint
        return false;
      }

      return false;
    } catch {
      return false;
    }
  }

  // Validate current token by calling profile endpoint
  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // Try to refresh token by re-authenticating
  async refreshToken(): Promise<boolean> {
    try {
      // Get stored user credentials (if available)
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        return false;
      }

      const user = JSON.parse(userInfo);

      // Try to get a new token by calling login
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          password: 'REFRESH_TOKEN' // This won't work, but we can try
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.token) {
          localStorage.setItem('authToken', data.data.token);
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  private async handleResponse<T>(response: Response, endpoint?: string): Promise<T> {
    if (!response.ok) {
      // API Error Response
      const errorData = await response.json().catch(() => ({}));

      // Handle token expiration (401 Unauthorized)
      if (response.status === 401) {
        // Check if this is a caller-related API call that should not trigger logout
        const url = response.url;
        const isCallerAPI = url.includes('/caller-assignments') ||
          url.includes('/caller-reports') ||
          url.includes('/calling-sets') ||
          url.includes('/analytics') ||
          (endpoint && (endpoint.includes('/caller-assignments') ||
            endpoint.includes('/caller-reports') ||
            endpoint.includes('/calling-sets') ||
            endpoint.includes('/analytics')));

        // Check if this is a yojna-related API call that should not trigger logout
        const isYojnaAPI = url.includes('/yojna') ||
          url.includes('/voter-yojna') ||
          (endpoint && (endpoint.includes('/yojna') ||
            endpoint.includes('/voter-yojna')));

        if (isCallerAPI || isYojnaAPI) {
          // For caller/yojna APIs, return empty data instead of logging out
          return {} as T;
        }

        // Check if this is a profile verification call (should not trigger immediate logout)
        const isProfileVerification = url.includes('/auth/profile') ||
          (endpoint && endpoint.includes('/auth/profile'));

        if (isProfileVerification) {
          // Don't clear storage or redirect for profile verification failures
          throw new Error('Profile verification failed');
        }

        // For user management APIs, show error message instead of redirecting
        const isUserManagementAPI = url.includes('/auth/users') ||
          url.includes('/users/') ||
          (endpoint && (endpoint.includes('/auth/users') ||
            endpoint.includes('/users/')));

        if (isUserManagementAPI) {
          // Get the actual error message from the backend
          const errorMessage = errorData.message || errorData.error || 'Authentication failed';

          // Handle specific token errors - show user-friendly message instead of immediate redirect
          if (errorMessage.includes('Invalid token') || errorMessage.includes('Token expired') || errorMessage.includes('Invalid or inactive user')) {
            // Show a user-friendly error message instead of immediately redirecting
            throw new Error('Your session has expired. Please refresh the page and try again.');
          } else {
            // Show the actual backend error message for other errors
            throw new Error(`Backend error: ${errorMessage}`);
          }
        }

        // Clear stored authentication data
        localStorage.removeItem('authToken');
      //  localStorage.removeItem('userInfo');
        localStorage.removeItem('sessionToken');

        // Redirect to login page if we're in the browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        throw new Error('Authentication expired. Please log in again.');
      }

      // For database connection issues, return empty data instead of throwing error
      if (response.status === 500 && errorData.error && errorData.error.includes('database')) {
        // Database offline, returning empty data
        return {} as T;
      }

      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Ensure we send a stable deviceId for device-based verification
    try {
      if (!credentials.deviceId && typeof window !== 'undefined') {
        let did = localStorage.getItem('deviceId');
        if (!did) {
          did = Math.random().toString(36).slice(2);
          localStorage.setItem('deviceId', did);
        }
        credentials = { ...credentials, deviceId: did };
      }
    } catch { }

    const res = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : { message: await res.text() };

    if (!res.ok) {
      // If backend indicates verification is required, throw an error with a flag
      if (res.status === 403 && (data.requireVerificationCode || data.requireUserVerification || data.requireDeviceVerification || data.message?.toLowerCase().includes('verification'))) {
        const err: any = new Error(data.message || 'Verification code required');
        err.requireVerificationCode = true;
        // Pass specific verification flags from backend response
        err.requireUserVerification = data.requireUserVerification;
        err.requireDeviceVerification = data.requireDeviceVerification;
        err.messageDetail = data.message; // Store original message
        throw err;
      }
      const msg = data?.message || data?.error || `HTTP error! status: ${res.status}`;
      throw new Error(msg);
    }

    return data as LoginResponse;
  }

  async verifyLogin(token: string, action: 'approve' | 'reject', notes?: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/auth/verify-login/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({ action, notes }),
    });
    return this.handleResponse(response);
  }

  async getVerificationRequest(token: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/auth/verify-login/${token}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getVerificationRequests(): Promise<any> {
    const response = await fetch(`${this.baseURL}/auth/verification-requests`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getVerificationHistory(limit: number = 50): Promise<any> {
    const response = await fetch(`${this.baseURL}/auth/verification-history?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUserSessions(userId: number): Promise<any> {
    const response = await fetch(`${this.baseURL}/auth/user-sessions/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // async getProfile(): Promise<{ success: boolean; data: { user: User; accessibleResources: Record<string, string[]> } }> {
  //   const token = localStorage.getItem('authToken');
  //   if (!token) {
  //     throw new Error('No authentication token found');
  //   }

  //   console.log('yyyyyyyyyyyyyyyyyy')

  //   const response = await fetch(`${this.baseURL}/auth/profile`, {
  //     headers: this.getAuthHeaders(),
  //   });

  //   if (!response.ok && response.status === 401) {
  //     // Don't throw here - let the caller handle it
  //   }

  //   return this.handleResponse<{ success: boolean; data: { user: User; accessibleResources: Record<string, string[]> } }>(response, '/auth/profile');
  // }

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // Master filter options with cascading filters
  async fetchMasterFilterOptions(masterFilters?: {
    division?: string;
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
    table?: string;
  }): Promise<MasterFilterOptions> {
    try {
      let url = `${getBaseURL()}/master-filter-options`;

      // Add filter parameters to URL if provided
      if (masterFilters) {
        const params = new URLSearchParams();
        // Always include table parameter if provided, even if other values are empty
        Object.entries(masterFilters).forEach(([key, value]) => {
          if (key === 'table' && value) {
            params.append(key, value);
          } else if (value !== undefined && value !== '') {
            params.append(key, value);
          }
        });
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      console.log('🔍 Frontend API: Calling master-filter-options with URL:', url);
      const response = await fetch(url);
      console.log('🔍 Frontend API: Response status:', response.status, response.statusText);

      const result = await this.handleResponse<MasterFilterOptions>(response);
      console.log('✅ Frontend API: Parsed response:', {
        parliamentCount: result.parliamentOptions?.length || 0,
        assemblyCount: result.assemblyOptions?.length || 0,
        districtCount: result.districtOptions?.length || 0,
        blockCount: result.blockOptions?.length || 0
      });
      return result;
    } catch (error) {
      // Master filter options failed, returning empty options
      return {
        parliamentOptions: [],
        assemblyOptions: [],
        districtOptions: [],
        blockOptions: [],
        tehsilOptions: []
      };
    }
  }

  // Filter options (all data)
  async fetchFilterOptions(): Promise<FilterOptions> {
    try {
      const params = new URLSearchParams({ table: 'block_table' });
      const response = await fetch(`${getBaseURL()}/filter-options?${params}`);
      return await this.handleResponse<FilterOptions>(response);
    } catch (error) {
      // Filter options failed, returning empty options
      return {
        villageCodes: [],
        villageNames: [],
        names: [],
        fnames: [],
        motherNames: [],
        surnames: [],
        castTypes: [],
        castIds: [],
        ages: [],
        gramPanchayats: [],
        patwarCircles: [],
        lrCircles: [],
        lbtOptions: ['Rural', 'Urban'],
        hnos: [],
        malefemales: [],
        religions: [],
        categories: [],
        addresses: []
      };
    }
  }

  // Dependent filter options based on current filters (master + detailed)
  async fetchDependentFilterOptions(filters: FilterParams & {
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
  }): Promise<FilterOptions> {
    try {
      // Apply DOB formatting if present
      const payload: Record<string, any> = { ...filters };
      // Always include table for consistent dropdown data
      payload.table = 'block_table';
      if (payload.dateOfBirth) {
        payload.dateOfBirth = formatDateForBackend(String(payload.dateOfBirth));
      }
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(payload).filter(([_, value]) => value !== undefined && value !== '')
        )
      );

      const response = await fetch(`${getBaseURL()}/filter-options-dependent?${params}`);
      return await this.handleResponse<FilterOptions>(response);
    } catch (error) {
      // Dependent filter options failed, returning empty options
      return {
        villageCodes: [],
        villageNames: [],
        names: [],
        fnames: [],
        motherNames: [],
        surnames: [],
        castTypes: [],
        castIds: [],
        ages: [],
        gramPanchayats: [],
        patwarCircles: [],
        lrCircles: [],
        lbtOptions: ['Rural', 'Urban'],
        hnos: [],
        malefemales: [],
        religions: [],
        categories: [],
        addresses: []
      };
    }
  }

  // Geographic Hierarchy Methods (Added to fix assignment modal)


  // Voters
  async getVoters(
    page: number = 1,
    limit: number = 100, // Reduced default limit from 500 to 100 for better performance
    filters: FilterParams = {}
  ): Promise<VotersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const url = `${getBaseURL()}/voters?${params}`;
    // Making API request
    // With filters

    const response = await fetch(url);
    // Response status
    // Response headers

    try {
      return await this.handleResponse<VotersResponse>(response);
    } catch (error) {
      // API call failed, returning empty data
      // Return empty data structure instead of throwing error
      return {
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: limit
        }
      };
    }
  }

  // Get live voter list
  async getLiveVoterList(
    page: number = 1,
    limit: number = 50,
    filters: FilterParams & {
      dataId?: string;
      division?: string;
      parliament?: string;
      assembly?: string;
      district?: string;
      block?: string;
      mandal?: string;
      kendra?: string;
      partyDistrict?: string;
    } = {}
  ): Promise<VotersResponse> {
    // Ensure limit is a valid number
    const numericLimit = typeof limit === 'number' && !isNaN(limit) && limit > 0 ? limit : 50;
    const numericPage = typeof page === 'number' && !isNaN(page) && page > 0 ? page : 1;

    console.log('═══════════════════════════════════════════════════');
    console.log('📤 API Service getLiveVoterList called with:');
    console.log('   Page:', numericPage, 'Limit:', numericLimit);
    console.log('   Original limit:', limit);
    console.log('   ⭐ DataId in filters:', filters.dataId || '(MISSING!)');
    console.log('   All filters:', filters);
    console.log('═══════════════════════════════════════════════════');

    const params = new URLSearchParams({
      page: numericPage.toString(),
      limit: numericLimit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('📤 API Service URL params:');
    console.log('   Page:', params.get('page'), 'Limit:', params.get('limit'));
    console.log('   ⭐ DataId in params:', params.get('dataId') || '(MISSING!)');
    console.log('   Full params:', params.toString());
    console.log('═══════════════════════════════════════════════════');

    const url = `${getBaseURL()}/live-voter-list?${params}`;

    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    try {
      return await this.handleResponse<VotersResponse>(response);
    } catch (error) {
      // API call failed, returning empty data
      return {
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: limit
        }
      };
    }
  }

  // Update voter
  async updateVoter(id: number, voterData: Partial<Voter>): Promise<{ message: string }> {
    const token = localStorage.getItem('authToken');
    const endpoint = token ? `/voters/${id}` : `/voters/${id}/demo`; // Dynamic endpoint
    const headers = token ? this.getAuthHeaders() : { 'Content-Type': 'application/json' }; // Dynamic headers

    const response = await fetch(`${getBaseURL()}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(voterData),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Update live voter list cell
  async updateLiveVoterList(id: number, voterData: Record<string, any>): Promise<{ success: boolean; message: string; data: any }> {
    const response = await fetch(`${getBaseURL()}/live-voter-list/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(voterData),
    });
    return this.handleResponse<{ success: boolean; message: string; data: any }>(response);
  }

  // Get data update report
  async getDataUpdateReport(from?: string, to?: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const response = await fetch(`${getBaseURL()}/data-update-report?${params}`, {
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching data update report:', error);
      return { success: false, data: [] };
    }
  }

  // Get filter options for live voter list
  // Yojna API methods
  async getYojnaList(): Promise<Array<{ id: number; name: string }>> {
    try {
      // Use the EXACT same pattern as getLiveVoterList
      const url = `${getBaseURL()}/yojna`;
      console.log('📡 Fetching yojna list from:', url);

      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found for yojna request, returning empty list');
        return [];
      }

      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token length:', token.length);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      console.log('📥 Yojna API response status:', response.status, response.statusText);
      console.log('📥 Yojna API response ok:', response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Yojna endpoint not found, returning empty list');
          return [];
        }
        if (response.status === 401) {
          // Try to read error message from response
          try {
            const errorText = await response.text();
            console.warn('❌ Unauthorized access to yojna endpoint:', errorText);
            let errorData = {};
            try {
              errorData = errorText ? JSON.parse(errorText) : {};
            } catch (parseError) {
              console.warn('Could not parse error response as JSON');
            }
            console.warn('❌ Error details:', errorData);

            // If it's an invalid token error, throw a specific error so the UI can handle it
            if ((errorData as any).message && (errorData as any).message.includes('Invalid token')) {
              console.warn('⚠️ Token is invalid. Throwing error for UI to handle.');
              const error = new Error('Invalid token. Please refresh the page and try again.');
              (error as any).isAuthError = true;
              throw error;
            }
            // For other 401 errors, also throw but with different message
            const error = new Error('Unauthorized access. Please refresh the page and try again.');
            (error as any).isAuthError = true;
            throw error;
          } catch (e) {
            if (e instanceof Error && (e as any).isAuthError) {
              throw e; // Re-throw auth errors
            }
            console.warn('❌ Unauthorized access to yojna endpoint (could not parse error)');
            // If we couldn't parse, still throw an auth error
            const error = new Error('Unauthorized access. Please refresh the page and try again.');
            (error as any).isAuthError = true;
            throw error;
          }
        }
        // For other errors, try to parse but don't throw
        try {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Yojna API error:', errorData);
          return [];
        } catch {
          return [];
        }
      }

      // Parse successful response
      try {
        const text = await response.text();
        console.log('📄 Yojna API raw response:', text);

        // Check if response contains an error message about invalid token
        if (text && text.includes('Invalid token')) {
          console.warn('⚠️ Response contains invalid token error');
          // Return empty array but the error will be handled by the component
          return [];
        }

        const data = text ? JSON.parse(text) : [];
        console.log('✅ Yojna list parsed successfully:', data);
        console.log('✅ Yojna list type:', Array.isArray(data) ? 'array' : typeof data);
        console.log('✅ Yojna list length:', Array.isArray(data) ? data.length : 'not an array');
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('❌ Error parsing yojna list response:', error);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching yojna list:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  async getVoterYojnaSelections(voterId: number): Promise<Record<number, { labhanvit: boolean; patra: boolean; aptra: boolean }>> {
    try {
      // Use the EXACT same pattern as getLiveVoterList
      const url = `${getBaseURL()}/voter-yojna/${voterId}`;
      console.log('📡 Fetching voter yojna selections from:', url);

      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found for voter yojna request, returning empty object');
        return {};
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Voter yojna selections endpoint not found, returning empty object');
          return {};
        }
        if (response.status === 401) {
          console.warn('Unauthorized access to voter yojna endpoint, returning empty object');
          // Don't call handleResponse for 401, just return empty object
          return {};
        }
        // For other errors, try to parse but don't throw
        try {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Voter yojna API error:', errorData);
          return {};
        } catch {
          return {};
        }
      }

      // Parse successful response
      try {
        const data = await response.json();
        return (data && typeof data === 'object') ? data : {};
      } catch {
        return {};
      }
    } catch (error: any) {
      console.error('Error fetching voter yojna selections:', error);
      // Return empty object on error instead of throwing
      return {};
    }
  }

  async saveVoterYojnaSelections(voterId: number, selections: Record<number, { labhanvit: boolean; patra: boolean; aptra: boolean }>): Promise<{ success: boolean; message: string }> {
    try {
      // Use the EXACT same pattern as getLiveVoterList
      const url = `${getBaseURL()}/voter-yojna/${voterId}`;
      console.log('📡 Saving voter yojna selections to:', url);

      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found for save voter yojna request');
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ selections }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Unauthorized access to save voter yojna endpoint');
          throw new Error('Unauthorized access. Please refresh the page.');
        }
      }

      return await this.handleResponse<{ success: boolean; message: string }>(response, `/voter-yojna/${voterId}`);
    } catch (error: any) {
      console.error('Error saving voter yojna selections:', error);
      throw error; // Re-throw to show error in UI
    }
  }

  // Generate survey register PDF on backend
  async generateSurveyRegisterPDF(
    data: any[],
    placeName: string,
    areaName: string,
    groupLabel?: string,
    options?: { allowBlankTemplate?: boolean; dataId?: string }
  ): Promise<Blob> {
    try {
      const url = `${getBaseURL()}/live-voter-list/generate-pdf`;
      console.log('📡 Generating PDF on backend:', url);

      const token = localStorage.getItem('authToken');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          data,
          placeName,
          areaName,
          groupLabel,
          registerType: 'survey',
          allowBlankTemplate: options?.allowBlankTemplate ?? false,
          dataId: options?.dataId || ''
        })
      });

      if (!response.ok) {
        // Try to get error message, but don't fail if it's not JSON
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(`Backend PDF generation failed: ${errorMessage}`);
      }

      // Get the blob and verify it's a PDF
      const blob = await response.blob();

      // Verify the blob has content
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }

      // Verify it's a PDF by checking the content type
      if (blob.type && blob.type !== 'application/pdf') {
        console.warn('⚠️ Unexpected content type:', blob.type);
      }

      console.log(`✅ PDF blob received: ${blob.size} bytes, type: ${blob.type || 'application/pdf'}`);

      return blob;
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // Fetch master filter options from live_booth_mapping table for live voter list
  async fetchLiveVoterListMasterFilterOptions(filters?: {
    dataId?: string;
    division?: string;
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
    mandal?: string;
    kendra?: string;
    partyDistrict?: string;
  }): Promise<{
    divisionOptions: string[];
    parliamentOptions: string[];
    assemblyOptions: string[];
    districtOptions: string[];
    blockOptions: string[];
    mandalOptions?: string[];
    kendraOptions?: string[];
    partyDistrictOptions?: string[];
    dataIdOptions?: string[];
    relatedDivision?: string;
    relatedParliament?: string;
    relatedAssembly?: string;
    relatedDistrict?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.dataId) params.append('dataId', filters.dataId);
      if (filters?.division) params.append('division', filters.division);
      if (filters?.parliament) params.append('parliament', filters.parliament);
      if (filters?.assembly) params.append('assembly', filters.assembly);
      if (filters?.district) params.append('district', filters.district);
      if (filters?.block) params.append('block', filters.block);
      if (filters?.mandal) params.append('mandal', filters.mandal);
      if (filters?.kendra) params.append('kendra', filters.kendra);
      if (filters?.partyDistrict) params.append('partyDistrict', filters.partyDistrict);

      const url = `${getBaseURL()}/live-voter-list/master-filter-options?${params}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...(localStorage.getItem('authToken') ? { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        divisionOptions: Array.isArray(data.divisionOptions) ? data.divisionOptions : [],
        parliamentOptions: Array.isArray(data.parliamentOptions) ? data.parliamentOptions : [],
        assemblyOptions: Array.isArray(data.assemblyOptions) ? data.assemblyOptions : [],
        districtOptions: Array.isArray(data.districtOptions) ? data.districtOptions : [],
        blockOptions: Array.isArray(data.blockOptions) ? data.blockOptions : [],
        mandalOptions: Array.isArray(data.mandalOptions) ? data.mandalOptions : [],
        kendraOptions: Array.isArray(data.kendraOptions) ? data.kendraOptions : [],
        partyDistrictOptions: Array.isArray(data.partyDistrictOptions) ? data.partyDistrictOptions : [],
        dataIdOptions: Array.isArray(data.dataIdOptions) ? data.dataIdOptions : [],
        relatedDivision: data.relatedDivision ? String(data.relatedDivision) : undefined,
        relatedParliament: data.relatedParliament ? String(data.relatedParliament) : undefined,
        relatedAssembly: data.relatedAssembly ? String(data.relatedAssembly) : undefined,
        relatedDistrict: data.relatedDistrict ? String(data.relatedDistrict) : undefined
      };
    } catch (error) {
      console.error('❌ Error fetching live voter list master filter options:', error);
      return {
        divisionOptions: [],
        parliamentOptions: [],
        assemblyOptions: [],
        districtOptions: [],
        blockOptions: [],
        mandalOptions: [],
        kendraOptions: [],
        partyDistrictOptions: [],
        dataIdOptions: []
      };
    }
  }

  // Fetch master filter options specifically from data_id_master table
  async fetchDataIdMasterFilterOptions(): Promise<{
    dataIdOptions: Array<{ value: string; label: string; id: string | number; name_hi: string }>;
    partyDistrictOptions: Array<{ value: string; label: string; id: string | number; name_hi: string }>;
    parliamentOptions: Array<{ value: string; label: string; id: string | number; name_hi: string }>;
    assemblyOptions: Array<{ value: string; label: string; id: string | number; name_hi: string }>;
    districtOptions: Array<{ value: string; label: string; id: string | number; name_hi: string }>;
  }> {
    try {
      const url = `${getBaseURL()}/live-voter-list/data-id-master-options`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...(localStorage.getItem('authToken') ? { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        dataIdOptions: Array.isArray(data.dataIdOptions) ? data.dataIdOptions : [],
        partyDistrictOptions: Array.isArray(data.partyDistrictOptions) ? data.partyDistrictOptions : [],
        parliamentOptions: Array.isArray(data.parliamentOptions) ? data.parliamentOptions : [],
        assemblyOptions: Array.isArray(data.assemblyOptions) ? data.assemblyOptions : [],
        districtOptions: Array.isArray(data.districtOptions) ? data.districtOptions : [],
      };
    } catch (error) {
      console.error('❌ Error fetching data_id_master filter options:', error);
      return {
        dataIdOptions: [],
        partyDistrictOptions: [],
        parliamentOptions: [],
        assemblyOptions: [],
        districtOptions: []
      };
    }
  }

  async getLiveVoterListFilterOptions(filters?: {
    gp?: string;
    gram?: string;
    bhagNo?: string;
    sectionNo?: string;
    block?: string;
    district?: string;
    assembly?: string;
    parliament?: string;
    lbt?: string;
  }): Promise<{
    grams: string[];
    gps: string[];
    bhagNos: string[];
    sectionNos: string[];
    areaColonies: string[];
    epics: string[];
    hnos: string[];
    names: string[];
    rNames: string[];
    surnames: string[];
    mobiles: string[];
    genders: string[];
    castIds: string[];
    casts: string[];
    proffs: string[];
    edus: string[];
    aadhars: string[];
    mukhiyas: string[];
    postOffices: string[];
    pinCodes: string[];
    policeStations: string[];
  }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            params.append(key, String(value).trim());
          }
        });
      }

      const url = params.toString()
        ? `${getBaseURL()}/live-voter-list/filter-options?${params.toString()}`
        : `${getBaseURL()}/live-voter-list/filter-options`;

      const token = localStorage.getItem('authToken');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      console.log('🔍 API Response status:', response.status, response.statusText, 'URL:', url);

      if (!response.ok) {
        console.error('❌ HTTP error! status:', response.status);
        // Return empty arrays on error instead of throwing
        return {
          grams: [],
          gps: [],
          bhagNos: [],
          sectionNos: [],
          areaColonies: [],
          epics: [],
          hnos: [],
          names: [],
          rNames: [],
          surnames: [],
          mobiles: [],
          genders: [],
          castIds: [],
          casts: [],
          proffs: [],
          edus: [],
          aadhars: [],
          mukhiyas: [],
          postOffices: [],
          pinCodes: [],
          policeStations: []
        };
      }

      const data = await response.json();
      console.log('✅ Filter options received from API:', {
        grams: data.grams?.length || 0,
        gps: data.gps?.length || 0,
        bhagNos: data.bhagNos?.length || 0,
        sectionNos: data.sectionNos?.length || 0,
        areaColonies: data.areaColonies?.length || 0,
        epics: data.epics?.length || 0,
        hnos: data.hnos?.length || 0,
        names: data.names?.length || 0,
        rNames: data.rNames?.length || 0,
        surnames: data.surnames?.length || 0,
        mobiles: data.mobiles?.length || 0,
        genders: data.genders?.length || 0,
        castIds: data.castIds?.length || 0,
        casts: data.casts?.length || 0,
        proffs: data.proffs?.length || 0,
        edus: data.edus?.length || 0,
        aadhars: data.aadhars?.length || 0,
        mukhiyas: data.mukhiyas?.length || 0,
        postOffices: data.postOffices?.length || 0,
        pinCodes: data.pinCodes?.length || 0,
        policeStations: data.policeStations?.length || 0
      });

      // Ensure all fields are arrays
      return {
        grams: Array.isArray(data.grams) ? data.grams : [],
        gps: Array.isArray(data.gps) ? data.gps : [],
        bhagNos: Array.isArray(data.bhagNos) ? data.bhagNos : [],
        sectionNos: Array.isArray(data.sectionNos) ? data.sectionNos : [],
        areaColonies: Array.isArray(data.areaColonies) ? data.areaColonies : [],
        epics: Array.isArray(data.epics) ? data.epics : [],
        hnos: Array.isArray(data.hnos) ? data.hnos : [],
        names: Array.isArray(data.names) ? data.names : [],
        rNames: Array.isArray(data.rNames) ? data.rNames : [],
        surnames: Array.isArray(data.surnames) ? data.surnames : [],
        mobiles: Array.isArray(data.mobiles) ? data.mobiles : [],
        genders: Array.isArray(data.genders) ? data.genders : [],
        castIds: Array.isArray(data.castIds) ? data.castIds : [],
        casts: Array.isArray(data.casts) ? data.casts : [],
        proffs: Array.isArray(data.proffs) ? data.proffs : [],
        edus: Array.isArray(data.edus) ? data.edus : [],
        aadhars: Array.isArray(data.aadhars) ? data.aadhars : [],
        mukhiyas: Array.isArray(data.mukhiyas) ? data.mukhiyas : [],
        postOffices: Array.isArray(data.postOffices) ? data.postOffices : [],
        pinCodes: Array.isArray(data.pinCodes) ? data.pinCodes : [],
        policeStations: Array.isArray(data.policeStations) ? data.policeStations : []
      };
    } catch (error) {
      console.error('❌ Error in getLiveVoterListFilterOptions:', error);
      // Return empty arrays on error instead of throwing
      return {
        grams: [],
        gps: [],
        bhagNos: [],
        sectionNos: [],
        areaColonies: [],
        epics: [],
        hnos: [],
        names: [],
        rNames: [],
        surnames: [],
        mobiles: [],
        genders: [],
        castIds: [],
        casts: [],
        proffs: [],
        edus: [],
        aadhars: [],
        mukhiyas: [],
        postOffices: [],
        pinCodes: [],
        policeStations: []
      };
    }
  }

  // Generate family_id for existing records in live_voter_list
  async generateFamilyIdsForExistingRecords(dataIds?: string[]): Promise<{
    success: boolean;
    message: string;
    processed: number;
    familyGroups: number;
    familyIdsGenerated: number;
    recordsUpdated: number;
    errors?: string[];
  }> {
    try {
      const response = await fetch(`${getBaseURL()}/live-voter-list/generate-family-ids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeaders())
        },
        body: JSON.stringify({ dataIds: dataIds || [] })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error generating family_ids:', error);
      throw error;
    }
  }

  async castIdOnFamily(dataIds?: string[]): Promise<{
    success: boolean;
    message: string;
    processed: number;
    recordsUpdated: number;
    errors?: string[];
  }> {
    try {
      const response = await fetch(`${getBaseURL()}/live-voter-list/cast-id-on-family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeaders())
        },
        body: JSON.stringify({ dataIds: dataIds || [] })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error applying cast ID on family:', error);
      throw error;
    }
  }

  async castIdBySurnameOnFamily(dataIds?: string[]): Promise<{
    success: boolean;
    message: string;
    processed: number;
    recordsUpdated: number;
    errors?: string[];
  }> {
    try {
      const response = await fetch(`${getBaseURL()}/live-voter-list/cast-id-by-surname-on-family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeaders())
        },
        body: JSON.stringify({ dataIds: dataIds || [] })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error applying cast ID by surname on family:', error);
      throw error;
    }
  }

  // Surname data (supports master filters as well)
  async getSurnameData(filters: {
    name?: string;
    fname?: string;
    mname?: string;
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
    count?: number | string;
    sources?: string; // comma-separated: name,fname,mname
    page?: number;
    limit?: number;
  } = {}): Promise<{ data: SurnameData[]; pagination: { currentPage: number; itemsPerPage: number; totalItems: number; totalPages: number } }> {
    const entries = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)] as [string, string]);
    const params = new URLSearchParams(entries);

    const response = await fetch(`${getBaseURL()}/master_surname-data?${params}`);
    return this.handleResponse<{ data: SurnameData[]; pagination: { currentPage: number; itemsPerPage: number; totalItems: number; totalPages: number } }>(response);
  }

  // Update surname data - saves to surname table
  async updateSurnameData(id: number, data: {
    master_surname: string; // Changed from surname to master_surname
    count?: number;
    castId: string;
    castIda: string;
    religion?: string;
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
    castIdFromOtherTable?: string;
    castIdaFromOtherTable?: string;
    master_surnameCastId?: string; // Add surname cast fields
    master_surnameCastName?: string;
    processStatus?: string;
    notes?: string;
    processedBy?: string;
  }): Promise<{ message: string; table: string }> {
    const token = localStorage.getItem('authToken');
    const endpoint = token ? `/master_surname-data/${id}` : `/master_surname-data/${id}/demo`; // Dynamic endpoint
    const headers = token ? this.getAuthHeaders() : { 'Content-Type': 'application/json' }; // Dynamic headers

    const response = await fetch(`${getBaseURL()}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ message: string; table: string }>(response);
  }

  // Get saved surname data from surname table
  async getSavedSurnameData(filters: {
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ data: SurnameData[]; pagination: { currentPage: number; itemsPerPage: number; totalItems: number; totalPages: number } }> {
    const entries = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)] as [string, string]);
    const params = new URLSearchParams(entries);

    const response = await fetch(`${getBaseURL()}/saved-master_surname-data?${params}`);
    return this.handleResponse<{ data: SurnameData[]; pagination: { currentPage: number; itemsPerPage: number; totalItems: number; totalPages: number } }>(response);
  }

  // Bulk save surname data into surname table
  async saveSurnameBulk(rows: Array<{
    master_surname: string; // Changed from surname to master_surname
    count?: number;
    castId?: string;
    castIda?: string;
    religion?: string;
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
    castIdFromOtherTable?: string;
    castIdaFromOtherTable?: string;
    master_surnameCastId?: string; // Add surname cast fields
    master_surnameCastName?: string;
    processStatus?: string;
    lastProcessed?: string;
    notes?: string;
    processedBy?: string;
  }>): Promise<{ success: boolean; message: string; affectedRows: number }> {
    const response = await fetch(`${getBaseURL()}/master_surname-data/bulk-upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ rows })
    });
    return this.handleResponse<{ success: boolean; message: string; affectedRows: number }>(response);
  }

  // Export data
  async exportData(): Promise<Blob> {
    const response = await fetch(`${getBaseURL()}/export`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // Export filtered data based on master filters and column filters
  async exportFilteredData(filters: {
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
    format?: 'csv' | 'excel' | 'pdf';
    columns?: string[];
    columnFilters?: { [key: string]: any };
    // Detailed filters
    lbt?: string;
    village?: string;
    gp?: string;
    ilrCircle?: string;
    patwarCircle?: string;
    dateOfBirth?: string;
    ageMin?: number;
    ageMax?: number;
    name?: string;
    fname?: string;
    mname?: string;
    surname?: string;
    mobile1?: string;
    mobile2?: string;
    caste?: string;
    castId?: string;
    castIda?: string;
    malefemale?: string;
    religion?: string;
    category?: string;
  }): Promise<{ success: boolean; message?: string; data?: Blob }> {
    try {
      const params = new URLSearchParams();

      // Add master filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && key !== 'columns' && key !== 'columnFilters') {
          params.append(key, String(value));
        }
      });

      // Add columns as comma-separated string
      if (filters.columns && filters.columns.length > 0) {
        params.append('columns', filters.columns.join(','));
      }

      // Add column filters as JSON string
      if (filters.columnFilters && Object.keys(filters.columnFilters).length > 0) {
        params.append('columnFilters', JSON.stringify(filters.columnFilters));
      }

      const response = await fetch(`${getBaseURL()}/export-filtered?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error || `Export failed with status: ${response.status}`
        };
      }

      const blob = await response.blob();
      return {
        success: true,
        data: blob
      };
    } catch (error) {
      // Export error
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  // Save data
  async saveData(voters: Voter[]): Promise<{ message: string }> {
    const response = await fetch(`${getBaseURL()}/save`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ voters }),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Lock data
  async lockData(voterIds: number[]): Promise<{ message: string }> {
    const response = await fetch(`${getBaseURL()}/lock`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ voterIds }),
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${getBaseURL()}/health`);
    return this.handleResponse<{ status: string; message: string }>(response);
  }

  // Analyze all unmapped villages
  async analyzeUnmappedVillages(): Promise<{
    success: boolean;
    analysis?: {
      totalUnmapped: number;
      reasons: {
        districtMismatch: any[];
        blockMismatch: any[];
        gpMismatch: any[];
        villageMismatch: any[];
        missingInMaster: any[];
        partialMatches: any[];
        exactMatchButNoJoin: any[];
      };
      summary: {
        districtMismatch: number;
        blockMismatch: number;
        gpMismatch: number;
        villageMismatch: number;
        missingInMaster: number;
        partialMatches: number;
        exactMatchButNoJoin: number;
      };
      details: any[];
    };
    timestamp?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${getBaseURL()}/village-mapping/analyze-unmapped`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing unmapped villages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Village Mapping Data
  async getVillageMappingData(filters: {
    villageName?: string;
    district?: string;
    block?: string;
    gp?: string;
    assembly?: string;
    parliament?: string;
    mappedStatus?: 'Mapped' | 'Unmapped' | 'Partial';
    totalVotersMin?: number;
    totalVotersMax?: number;
    lastUpdatedMin?: string;
    lastUpdatedMax?: string;
  } = {}): Promise<VillageMappingData[]> {
    try {
      const entries = Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => [key, String(value)] as [string, string]);
      const params = new URLSearchParams(entries);

      const url = `${getBaseURL()}/village-mapping?${params}`;
      // Making API call
      // With filters

      const response = await fetch(url);

      // Response status
      // Response statusText

      if (!response.ok) {
        const errorText = await response.text();
        // API Error Response

        // Try to parse as JSON for better error details
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }

        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      // API Response data
      return data;

    } catch (error) {
      // Error in getVillageMappingData
      throw error;
    }
  }

  // Get AC/PC mapping data
  async getAcPcMapping(acNo: string, district: string): Promise<{
    success: boolean;
    data?: {
      acNo: string;
      acName: string;
      pcNo: string;
      pcName: string;
      districtNo: string;
    };
    error?: string;
  }> {
    try {
      const params = new URLSearchParams({ acNo, district });
      const response = await fetch(`${getBaseURL()}/village-mapping/acpc-mapping?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP error! status: ${response.status}`
        };
      }

      return await response.json();
    } catch (error) {
      // Error in getAcPcMapping
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Master Surname API
  async saveMasterSurname(data: any[]) {
    try {
      const response = await fetch(`${this.baseURL}/master_surname-data/bulk-upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rows: data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateMasterSurname(id: number, updateData: any) {
    try {
      const response = await fetch(`${this.baseURL}/master_surname-data/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getMasterSurname(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${this.baseURL}/master-surname?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Save village mapping data
  async saveVillageMapping(data: {
    villageName: string;
    district: string;
    block: string;
    gp: string;
    acNo: string;
    acName: string;
    pcNo: string;
    pcName: string;
    districtNo: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch(`${getBaseURL()}/village-mapping/save`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error || `HTTP error! status: ${response.status}`
        };
      }

      return await response.json();
    } catch (error) {
      // Error in saveVillageMapping
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get saved village mapping data
  async getSavedVillageMapping(filters: {
    villageName?: string;
    district?: string;
    block?: string;
    gp?: string;
  } = {}): Promise<VillageMappingData[]> {
    try {
      const entries = Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => [key, String(value)] as [string, string]);
      const params = new URLSearchParams(entries);

      const response = await fetch(`${getBaseURL()}/village-mapping/saved?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Error in getSavedVillageMapping
      throw error;
    }
  }

  // Get village mapping data with saved mappings (combines block_table + village_mapping)
  async getVillageMappingWithSaved(filters: {
    villageName?: string;
    district?: string;
    block?: string;
    gp?: string;
    assembly?: string;
    parliament?: string;
  } = {}): Promise<VillageMappingData[]> {
    try {
      // Fetching village mapping data with saved mappings

      // First get the base data from block_table
      const baseData = await this.getVillageMappingData(filters);
      // Base data from block_table

      // Then get saved mappings from village_mapping table
      const savedMappings = await this.getSavedVillageMapping({
        villageName: filters.villageName,
        district: filters.district,
        block: filters.block,
        gp: filters.gp
      });
      // Saved mappings from village_mapping

      // Create a map of saved mappings for quick lookup
      const savedMap = new Map();
      savedMappings.forEach(saved => {
        const key = `${saved.villageName}-${saved.district}-${saved.block}-${saved.gp}`;
        savedMap.set(key, saved);
      });

      // Merge base data with saved mappings
      const mergedData = baseData.map(village => {
        const key = `${village.villageName}-${village.district}-${village.block}-${village.gp}`;
        const saved = savedMap.get(key);

        if (saved) {
          return {
            ...village,
            acNo: saved.assembly || village.assembly,
            acName: saved.assembly_name || village.assemblyName,
            pcNo: saved.parliament || village.parliament,
            pcName: saved.parliament_name || '',
            districtNo: saved.district_no || '',
            mappedStatus: 'Mapped' as const
          };
        }

        return village;
      });

      // Merged data
      return mergedData;

    } catch (error) {
      // Error in getVillageMappingWithSaved
      // Fallback to base data if saved mappings fail
      return await this.getVillageMappingData(filters);
    }
  }

  // Update Village Mapping Data
  async updateVillageMapping(id: number, data: Partial<VillageMappingData>): Promise<{ success: boolean; message: string; updatedId: number; affectedRows: number }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const endpoint = `/village-mapping/${id}`; // always use real endpoint
    const headers = token ? this.getAuthHeaders() : { 'Content-Type': 'application/json' };

    const response = await fetch(`${getBaseURL()}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<{ success: boolean; message: string; updatedId: number; affectedRows: number }>(response);
  }

  // Get Division, District, PC, AC data
  async getDivisionData(): Promise<DivisionData[]> {
    const response = await fetch(`${getBaseURL()}/div_dist_pc_ac`);
    return this.handleResponse<DivisionData[]>(response);
  }

  // Admin User Management Methods
  async getUsers(): Promise<{ success: boolean; data: any[] }> {
    const headers = this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}/auth/users`, {
      headers
    });
    console.log("dgdjjnvfjndfjnfdkj",response)

    const result = await this.handleResponse<{ success: boolean; data: User[] }>(response);
    return result;
  }

  // Column-level permissions: fetch by user
  async getUserColumnPermissions(userId: number): Promise<Array<{ column_name: string; can_view: boolean; can_edit: boolean; can_mask?: boolean }>> {
    const response = await fetch(`${getBaseURL()}/user-permissions/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Array<{ column_name: string; can_view: boolean; can_edit: boolean; can_mask?: boolean }>>(response);
  }

  // Column-level permissions: bulk save
  async saveUserColumnPermissionsBulk(
    userId: number,
    permissions: Array<{ column_name: string; can_view: boolean; can_edit: boolean; can_mask?: boolean }>
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${getBaseURL()}/user-permissions/bulk`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, permissions }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async createUser(userData: CreateUserData): Promise<{ success: boolean; message: string; data: User }> {
    const response = await fetch(`${getBaseURL()}/auth/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<{ success: boolean; message: string; data: User }>(response);
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<ApiResponse<any>> {
    const response = await fetch(`${getBaseURL()}/auth/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const result = await this.handleResponse<ApiResponse<any>>(response);

    return result;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${getBaseURL()}/auth/users/${id}/password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // Assignment code: generate from current user's modules + data
  async generateAssignmentCode(userId: number): Promise<ApiResponse<{ code: string; payload: any }>> {
    const response = await fetch(`${getBaseURL()}/users/${userId}/generate-assignment-code`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<ApiResponse<{ code: string; payload: any }>>(response);
  }

  // Assignment code: apply to a user
  async applyAssignmentCode(userId: number, code: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${getBaseURL()}/users/${userId}/apply-assignment-code`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ code })
    });
    return this.handleResponse<ApiResponse<any>>(response);
  }

  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${getBaseURL()}/auth/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(), // ✅ Now includes Authorization token
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${getBaseURL()}/auth/change-password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  // Process surname data
  async processSurnameData(data: SurnameData[]): Promise<{ success: boolean; processedData: any; message: string; totalRecords: number }> {
    const response = await fetch(`${getBaseURL()}/process-master_surname-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return this.handleResponse<{ success: boolean; processedData: any; message: string; totalRecords: number }>(response);
  }

  // Table Permissions Methods
  async setupTablePermissions(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${getBaseURL()}/setup/table-permissions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async getTablePermissions(): Promise<{ success: boolean; data: any[] }> {
    const response = await fetch(`${getBaseURL()}/table-permissions`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ success: boolean; data: any[] }>(response);
  }

  async getUserTablePermissions(userId: number): Promise<{ success: boolean; data: any[] }> {
    const response = await fetch(`${getBaseURL()}/table-permissions/user/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ success: boolean; data: any[] }>(response);
  }

  async updateTablePermission(id: number, canView: boolean, canEdit: boolean): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${getBaseURL()}/table-permissions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ can_view: canView, can_edit: canEdit }),
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async bulkUpdateTablePermissions(permissions: Array<{
    user_id: number;
    table_name: string;
    can_view: boolean;
    can_edit: boolean;
  }>): Promise<{ success: boolean; message: string }> {
    // API DEBUG: bulkUpdateTablePermissions called
    // API DEBUG: Permissions to send
    // API DEBUG: API URL

    const headers = this.getAuthHeaders();
    // API DEBUG: Headers

    const response = await fetch(`${getBaseURL()}/table-permissions/bulk`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ permissions }),
    });

    // API DEBUG: Response status
    // API DEBUG: Response statusText

    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async checkTablePermission(tableName: string): Promise<{ success: boolean; data: { can_view: boolean; can_edit: boolean; source: string } }> {
    const response = await fetch(`${getBaseURL()}/table-permissions/check/${tableName}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ success: boolean; data: { can_view: boolean; can_edit: boolean; source: string } }>(response);
  }

  // Data Condition Methods
  async getFamilyData(filters: {
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();

    if (filters.parliament) queryParams.append('parliament', filters.parliament);
    if (filters.assembly) queryParams.append('assembly', filters.assembly);
    if (filters.district) queryParams.append('district', filters.district);
    if (filters.block) queryParams.append('block', filters.block);

    const response = await fetch(`${getBaseURL()}/family-data?${queryParams.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<any[]>(response);
  }

  async updateCasteData(corrections: Array<{
    id: number;
    castId: string;
    castIda: string;
  }>): Promise<{ success: boolean; message: string; updatedCount: number }> {
    const response = await fetch(`${getBaseURL()}/update-caste-data`, {
      method: 'PUT',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ corrections }),
    });
    return this.handleResponse<{ success: boolean; message: string; updatedCount: number }>(response);
  }

  async getCasteInconsistencies(filters: {
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
  }): Promise<{
    success: boolean;
    data: {
      totalFamilies: number;
      inconsistentFamilies: number;
      nullCasteFamilies: number;
      mixedFamilies: number;
      families: any[];
    };
  }> {
    const queryParams = new URLSearchParams();

    if (filters.parliament) queryParams.append('parliament', filters.parliament);
    if (filters.assembly) queryParams.append('assembly', filters.assembly);
    if (filters.district) queryParams.append('district', filters.district);
    if (filters.block) queryParams.append('block', filters.block);

    const response = await fetch(`${getBaseURL()}/caste-inconsistencies?${queryParams.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{
      success: boolean;
      data: {
        totalFamilies: number;
        inconsistentFamilies: number;
        nullCasteFamilies: number;
        mixedFamilies: number;
        families: any[];
      };
    }>(response);
  }

  // Bulk update cells for copy-paste functionality
  async bulkUpdateCells(updates: Array<{
    rowIndex: number;
    columnId: string;
    value: any;
  }>): Promise<{
    success: boolean;
    message: string;
    totalUpdated: number;
  }> {
    try {
      const response = await fetch(`${getBaseURL()}/bulk-update-cells`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ updates }),
      });

      return await this.handleResponse<{
        success: boolean;
        message: string;
        totalUpdated: number;
      }>(response);
    } catch (error) {
      // Bulk update failed
      return {
        success: false,
        message: 'Bulk update failed',
        totalUpdated: 0,
      };
    }
  }

  // Email verification methods
  async sendEmailVerification(userId: number, adminEmail: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${userId}/send-email-verification`, 'POST', { adminEmail });
  }

  async verifyEmailToken(userId: number, token: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${getBaseURL()}/users/${userId}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ token }),
      });

      return await this.handleResponse<{
        success: boolean;
        message: string;
      }>(response);
    } catch (error) {
      // Verify email token failed
      return {
        success: false,
        message: 'Failed to verify email token',
      };
    }
  }

  async getEmailVerificationStatus(userId: number): Promise<ApiResponse<{
    emailVerified: boolean;
    emailVerificationSentAt?: string;
    emailVerificationExpiresAt?: string;
    adminVerificationEmail?: string;
  }>> {
    return this.request(`/users/${userId}/email-verification-status`);
  }

  // Export village mapping data
  async exportVillageMappingData(filters: {
    format?: 'csv' | 'excel';
    parliament?: string;
    assembly?: string;
    district?: string;
    block?: string;
    mappedStatus?: string;
  } = {}): Promise<{
    success: boolean;
    message?: string;
    data?: Blob;
  }> {
    try {
      const params = new URLSearchParams();

      if (filters.format) params.append('format', filters.format);
      if (filters.parliament) params.append('parliament', filters.parliament);
      if (filters.assembly) params.append('assembly', filters.assembly);
      if (filters.district) params.append('district', filters.district);
      if (filters.block) params.append('block', filters.block);
      if (filters.mappedStatus) params.append('mappedStatus', filters.mappedStatus);

      const response = await fetch(`${getBaseURL()}/village-mapping/export?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error || `Export failed with status: ${response.status}`
        };
      }

      const blob = await response.blob();
      return {
        success: true,
        data: blob
      };
    } catch (error) {
      // Village mapping export error
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  // Caller Assignment API methods
  async initializeCallerAssignments(): Promise<ApiResponse<any>> {
    return this.request('/caller-assignments/init');
  }

  async getCallerAssignments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    caller_id?: string;
    priority?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.callerRequest(`/caller-assignments${queryString ? `?${queryString}` : ''}`);
  }

  async createCallerAssignment(assignment: {
    voter_id: string;
    voter_name: string;
    voter_phone?: string;
    voter_address?: string;
    booth?: string;
    caller_id: number;
    caller_name: string;
    question_set_id?: number;
    question_set_name?: string;
    priority?: 'high' | 'medium' | 'low';
  }): Promise<ApiResponse<any>> {
    return this.callerRequest('/caller-assignments', 'POST', assignment);
  }

  async updateCallerAssignment(id: string, updates: {
    status?: 'assigned' | 'in_progress' | 'completed' | 'failed';
    call_date?: string;
    call_duration?: number;
    notes?: string;
    priority?: 'high' | 'medium' | 'low';
    last_contact_date?: string;
    response_data?: any;
    call_outcome?: 'successful' | 'no_answer' | 'busy' | 'wrong_number' | 'refused';
    caller_id?: number;
    caller_name?: string;
    question_set_id?: number;
    question_set_name?: string;
  }): Promise<ApiResponse<any>> {
    return this.callerRequest(`/caller-assignments/${id}`, 'PUT', updates);
  }

  async deleteCallerAssignment(id: string): Promise<ApiResponse<any>> {
    return this.callerRequest(`/caller-assignments/${id}`, 'DELETE');
  }

  async getCallerAssignmentById(id: string): Promise<ApiResponse<any>> {
    return this.callerRequest(`/caller-assignments/${id}`);
  }

  async testCallerAssignments(): Promise<ApiResponse<any>> {
    return this.callerRequest('/caller-assignments/test');
  }

  async getCastes(): Promise<ApiResponse<string[]>> {
    return this.request('/voters/castes');
  }

  async getCallerAssignmentAnalytics(params?: {
    caller_id?: string;
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.callerRequest(`/caller-assignments/analytics${queryString ? `?${queryString}` : ''}`);
  }

  async importCallerAssignments(assignments: any[], callerMapping?: Record<string, number>): Promise<ApiResponse<any>> {
    return this.request('/caller-assignments/import', 'POST', { assignments, caller_mapping: callerMapping });
  }

  // Calling Sets API methods
  async getCallingSets(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/calling-sets${queryString ? `?${queryString}` : ''}`;

    const result = await this.request(endpoint);

    return result;
  }

  async getCallingSet(id: number): Promise<ApiResponse<any>> {
    return this.request(`/calling-sets/${id}`);
  }

  async createCallingSet(data: {
    name: string;
    question: string;
    selectedAction?: string;
    responseA?: string;
    responseB?: string;
    responseC?: string;
    responseD?: string;
    selectedResponses?: string[];
    description?: string;
    minTime?: number;
    maxTime?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request('/calling-sets', 'POST', data);
  }

  async updateCallingSet(id: number, data: {
    name?: string;
    question?: string;
    selectedAction?: string;
    responseA?: string;
    responseB?: string;
    responseC?: string;
    responseD?: string;
    selectedResponses?: string[];
    description?: string;
    minTime?: number;
    maxTime?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request(`/calling-sets/${id}`, 'PUT', data);
  }

  async deleteCallingSet(id: number): Promise<ApiResponse<any>> {
    return this.request(`/calling-sets/${id}`, 'DELETE');
  }

  async bulkUpdateCallingSets(updates: Array<{
    id: number;
    [key: string]: any;
  }>): Promise<ApiResponse<any>> {
    return this.request('/calling-sets/bulk/update', 'PUT', { updates });
  }

  // Calling List API methods
  async getCallingList(params?: {
    page?: number;
    limit?: number;
    action?: string;
    subject?: string;
    search?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/calling-list${queryString ? `?${queryString}` : ''}`;

    const result = await this.request(endpoint);

    return result;
  }

  async updateVoterAction(voterId: number, action: string, notes?: string): Promise<ApiResponse<any>> {
    return this.request(`/calling-list/${voterId}/action`, 'PUT', { action, notes });
  }

  async updateVoterResponseText(voterId: number, response: string): Promise<ApiResponse<any>> {
    // Ensure response is properly encoded
    const encodedResponse = encodeURIComponent(response);

    try {
      const result = await this.request(`/calling-list/${voterId}/response`, 'PUT', { response });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateFamilyDetails(voterId: number, data: { sno?: number; number2?: string; dob?: string }): Promise<ApiResponse<any>> {
    try {
      const result = await this.request(`/calling-list/${voterId}/family-details`, 'PUT', data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getCallingListStats(): Promise<ApiResponse<any>> {
    return this.request('/calling-list/stats');
  }

  async addVoterToCallingList(data: {
    name: string;
    fatherName?: string;
    motherName?: string;
    mobileNumber?: string;
    address?: string;
    village?: string;
    block?: string;
    district?: string;
    gender?: string;
    age?: number;
    subject?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/calling-list', 'POST', data);
  }

  async removeVoterFromCallingList(voterId: number): Promise<ApiResponse<any>> {
    return this.request(`/calling-list/${voterId}`, 'DELETE');
  }

  // Voter Responses API methods
  async recordVoterResponse(data: {
    questionSetId: number;
    responseSelected: string;
    responseText?: string;
    callDuration?: number;
    callOutcome?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/voter-responses', 'POST', data);
  }

  async getVoterResponses(params?: {
    page?: number;
    limit?: number;
    questionSetId?: number;
    responseSelected?: string;
    callOutcome?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/voter-responses${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getVoterResponseStats(params?: {
    questionSetId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/voter-responses/stats${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async updateVoterResponse(id: number, data: {
    responseSelected?: string;
    responseText?: string;
    callDuration?: number;
    callOutcome?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/voter-responses/${id}`, 'PUT', data);
  }

  async deleteVoterResponse(id: number): Promise<ApiResponse<any>> {
    return this.request(`/voter-responses/${id}`, 'DELETE');
  }

  // Hierarchical Data API methods
  async getHierarchicalConstituencies(): Promise<ApiResponse<any>> {
    // Return empty to force fallback to getDistricts which works with block_table
    return { success: true, data: [] };
  }

  async getHierarchicalBlocks(params?: {
    district?: string;
    ac_id?: string;
    table?: string;
  }): Promise<ApiResponse<any>> {
    if (!params?.district) return { success: true, data: [] };
    const res = await this.fetchMasterFilterOptions({
      district: params.district,
      table: params.table || 'block_table'
    });
    const blocks = (res.blockOptions || []).map(b => ({ id: b, name: b, district: params.district }));
    return { success: true, data: blocks };
  }

  async getHierarchicalGPs(data: {
    block: string;
    district: string;
    table?: string;
  }): Promise<ApiResponse<any>> {
    const res = await this.fetchDependentFilterOptions({
      block: data.block,
      district: data.district,
      table: data.table
    });
    const gps = (res.gramPanchayats || []).map(g => ({ id: g, name: g, block_id: data.block }));
    return { success: true, data: gps };
  }

  async getHierarchicalVillages(data: {
    gp: string;
    block: string;
    district: string;
    table?: string;
  }): Promise<ApiResponse<any>> {
    const res = await this.fetchDependentFilterOptions({
      gp: data.gp,
      block: data.block,
      district: data.district,
      table: data.table
    });
    const villages = (res.villageNames || []).map(v => ({ id: v, name: v, gp_id: data.gp }));
    return { success: true, data: villages };
  }

  // Bulk assignment API methods
  async createBulkAssignment(assignmentData: {
    caller_id: number;
    caller_name: string;
    question_set_id: number;
    question_set_name: string;
    assignment_type: 'district' | 'gp' | 'village' | 'booth';
    district?: string;
    gp?: string;
    village?: string;
    booth?: string;
    priority: 'high' | 'medium' | 'low';
  }): Promise<ApiResponse<any>> {
    return this.callerRequest('/caller-assignments/bulk-geographic', 'POST', assignmentData);
  }

  async getVoterCount(params: {
    district?: string;
    gp?: string;
    village?: string;
    booth?: string;
  }): Promise<ApiResponse<{ count: number }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    const queryString = queryParams.toString();
    return this.callerRequest(`/voters/count${queryString ? `?${queryString}` : ''}`);
  }

  // Geographic data API methods
  async getDistricts(): Promise<ApiResponse<string[]>> {
    return this.request('/geographic/districts');
  }

  async getGPs(): Promise<ApiResponse<string[]>> {
    return this.request('/geographic/gps');
  }

  async getVillages(): Promise<ApiResponse<string[]>> {
    return this.request('/geographic/villages');
  }

  async getBooths(): Promise<ApiResponse<string[]>> {
    return this.request('/geographic/booths');
  }

  // Get booth mapping data
  async getBoothMappingData(filters?: {
    page?: number;
    limit?: number;
    dataId?: string;
    division?: string;
    district?: string;
    block?: string;
    assembly?: string;
    parliament?: string;
    mandal?: string;
    kendra?: string;
    partyDistrict?: string;
    boothNo?: string;
    sectionNo?: string;
    sectionName?: string;
    villageName?: string;
    villageId?: string;
    gpWard?: string;
    gpWardId?: string;
    blockId?: string;
    districtId?: string;
    divisionId?: string;
    acNo?: string;
    bhagNo?: string;
    bhagHi?: string;
    bhagEng?: string;
    ru?: string;
  }): Promise<{ data: any[]; pagination?: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));

      const filterKeys = [
        'dataId', 'division', 'district', 'block', 'assembly', 'parliament',
        'mandal', 'kendra', 'partyDistrict', 'boothNo', 'sectionNo', 'sectionName',
        'villageName', 'villageId', 'gpWard', 'gpWardId', 'blockId', 'districtId', 'divisionId',
        'acNo', 'bhagNo', 'bhagHi', 'bhagEng', 'ru',
        'psbId', 'psbEn', 'psbHi', 'coordinateId', 'coordinate',
        'partyZila', 'pcId', 'pcHi', 'pcEn'
      ];

      filterKeys.forEach(key => {
        // @ts-ignore
        const value = filters?.[key as keyof typeof filters];
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const url = `${this.baseURL}/booth-mapping${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Backend returns { data: [], pagination: {} } or array directly
      if (data && Array.isArray(data.data)) {
        return { data: data.data, pagination: data.pagination };
      } else if (Array.isArray(data)) {
        return { data: data };
      }
      return { data: [] };
    } catch (error) {
      console.error('Error fetching booth mapping data:', error);
      return { data: [] };
    }
  }

  // Update booth mapping data
  async updateBoothMapping(id: number, data: { columnName: string; value: any }): Promise<ApiResponse<any>> {
    return this.request(`/booth-mapping/${id}`, 'PUT', data);
  }

  // Generic request method for API calls
  private async request<T>(endpoint: string, method: string = 'GET', data?: any): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: this.getAuthHeaders(),
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      return await this.handleResponse<ApiResponse<T>>(response, endpoint);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Special request method for caller APIs that should not trigger logout
  private async callerRequest<T>(endpoint: string, method: string = 'GET', data?: any): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: this.getAuthHeaders(),
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      return await this.handleCallerResponse<ApiResponse<T>>(response);
    } catch (error) {
      // Handle different types of network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Network error. Please check your internet connection.',
          error: 'Network connection failed'
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Team Management API methods
  async getTeams(params?: { parent_id?: number | null; is_active?: boolean }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.parent_id !== undefined) {
        queryParams.append('parent_id', params.parent_id === null ? 'null' : params.parent_id.toString());
      }
      if (params.is_active !== undefined) {
        queryParams.append('is_active', params.is_active.toString());
      }
    }
    const queryString = queryParams.toString();
    const endpoint = `/teams${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async getTeam(id: number): Promise<ApiResponse<any>> {
    return this.request(`/teams/${id}`);
  }

  async createTeam(data: {
    name: string;
    description?: string;
    parent_id?: number | null;
    team_code?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/teams', 'POST', data);
  }

  async updateTeam(id: number, data: {
    name?: string;
    description?: string;
    parent_id?: number | null;
    team_code?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request(`/teams/${id}`, 'PUT', data);
  }

  async deleteTeam(id: number): Promise<ApiResponse<any>> {
    return this.request(`/teams/${id}`, 'DELETE');
  }

  async assignUserToTeam(teamId: number, data: {
    user_id: number;
    parent_user_id?: number | null;
  }): Promise<ApiResponse<any>> {
    return this.request(`/teams/${teamId}/assign-user`, 'POST', data);
  }

  async getTeamUsers(teamId: number): Promise<ApiResponse<any>> {
    return this.request(`/teams/${teamId}/users`);
  }

  async getTeamHierarchy(teamId: number): Promise<ApiResponse<any>> {
    return this.request(`/teams/${teamId}/hierarchy`);
  }

  async getMyTeam(): Promise<ApiResponse<any>> {
    return this.request('/auth/users/my-team');
  }

  // User Parents API methods (many-to-many relationship)
  async getUserParents(userId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/auth/users/${userId}/parents`);
  }

  async addUserParent(userId: number, parentId: number): Promise<ApiResponse<any>> {
    return this.request(`/auth/users/${userId}/parents`, 'POST', { parent_id: parentId });
  }

  async removeUserParent(userId: number, parentId: number): Promise<ApiResponse<any>> {
    return this.request(`/auth/users/${userId}/parents/${parentId}`, 'DELETE');
  }

  async updateUserParents(userId: number, parentIds: number[]): Promise<ApiResponse<any>> {
    return this.request(`/auth/users/${userId}/parents`, 'PUT', { parent_ids: parentIds });
  }

  // Get all members (children) of a parent user
  async getUserMembers(parentId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/auth/users/${parentId}/members`);
  }

  // Sync all children's permissions to a parent (fix existing relationships)
  async syncParentPermissions(parentId: number): Promise<ApiResponse<any>> {
    return this.request(`/auth/users/${parentId}/sync-permissions`, 'POST');
  }

  // Sync permissions for ALL existing parent-child relationships (bulk fix)
  async syncAllPermissions(): Promise<ApiResponse<any>> {
    return this.request('/auth/users/sync-all-permissions', 'POST');
  }

  // Get detailed permissions status for a parent (diagnostic)
  async getParentPermissionsStatus(parentId: number): Promise<ApiResponse<any>> {
    return this.request(`/auth/users/${parentId}/permissions-status`);
  }

  // Special response handler for caller APIs
  private async handleCallerResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // API Error Response
      const errorData = await response.json().catch(() => ({}));

      // Handle token expiration (401 Unauthorized) - but don't logout for caller APIs
      if (response.status === 401) {
        return {
          success: false,
          message: 'Session expired. Please refresh the page to continue.',
          error: 'Authentication expired'
        } as T;
      }

      // For database connection issues, return empty data instead of throwing error
      if (response.status === 500 && errorData.error && errorData.error.includes('database')) {
        return {
          success: false,
          message: 'Database connection issue. Please try again later.',
          error: 'Database connection failed'
        } as T;
      }

      // For network errors, return empty data
      if (response.status === 0 || response.status >= 500) {
        return {
          success: false,
          message: 'Network error. Please check your internet connection.',
          error: 'Network error'
        } as T;
      }

      // For other errors, return empty data with error message
      return {
        success: false,
        message: errorData.message || errorData.error || 'Unable to load data',
        error: errorData.error || `HTTP error! status: ${response.status}`
      } as T;
    }
    return response.json();
  }

  // Data ID Assignment Methods
  async getDataIdMasterList(params?: { search?: string; state?: string; ac_no?: string; limit?: number }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.state) queryParams.append('state', params.state);
    if (params?.ac_no) queryParams.append('ac_no', params.ac_no);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${getBaseURL()}/data-id-assignments/data-id-master?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<ApiResponse<any[]>>(response);
  }

  async assignDataIds(data: { userId: number; dataIds: string[]; datasetId?: string }): Promise<ApiResponse<any>> {
    const response = await fetch(`${getBaseURL()}/data-id-assignments/assign`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<ApiResponse<any>>(response);
  }

  async getUserDataIdAssignments(userId: number, datasetId: string = 'data_id_master'): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${getBaseURL()}/data-id-assignments/user/${userId}?datasetId=${datasetId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<ApiResponse<any[]>>(response);
  }

  async deleteUserDataIdAssignments(userId: number, data: { dataIds: string[]; datasetId?: string }): Promise<ApiResponse<any>> {
    const response = await fetch(`${getBaseURL()}/data-id-assignments/user/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<ApiResponse<any>>(response);
  }

  async bulkAssignDataIds(data: { userIds: number[]; dataIds: string[]; datasetId?: string }): Promise<ApiResponse<any>> {
    const response = await fetch(`${getBaseURL()}/data-id-assignments/bulk-assign`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<ApiResponse<any>>(response);
  }
}

export const apiService = new ApiService();
