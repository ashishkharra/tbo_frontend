// Centralized API Client for Frontend
// Single source of truth for all API calls

// API Configuration
const API_CONFIG = {
  // Base URLs for different environments
  BASE_URLS: {
    development: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500/api',
    production: process.env.NEXT_PUBLIC_API_URL || 'https://api.tbo.services/api',
    staging: process.env.NEXT_PUBLIC_API_URL || 'https://api.tbo.services/api'
  },

  // Current environment (change this to switch environments)
  CURRENT_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',

  // API Routes Configuration
  ROUTES: {
    // Authentication Routes
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
      VERIFY_LOGIN: '/auth/verify-login',
      VERIFY_LOGIN_TOKEN: '/auth/verify-login/:token',
      VERIFICATION_REQUESTS: '/auth/verification-requests',
      VERIFICATION_HISTORY: '/auth/verification-history',
      USER_SESSIONS: '/auth/user-sessions/:userId',
      CHANGE_PASSWORD: '/auth/change-password'
    },

    // New: Modules & Datasets Routes
    MODULES: {
      LIST: '/modules'
    },
    DATASETS: {
      LIST: '/datasets'
    },
    USER_ASSIGNMENTS: {
      SAVE: '/user-assignments',
      GET_BY_USER: '/user-assignments/:userId',
      GET_ALL: '/user-assignments'
    },

    // User Management Routes
    USERS: {
      LIST: '/auth/users',
      CREATE: '/auth/users',
      UPDATE: '/auth/users/:id',
      DELETE: '/auth/users/:id',
      UPDATE_PASSWORD: '/auth/users/:id/password',
      SEND_EMAIL_VERIFICATION: '/users/:userId/send-email-verification',
      VERIFY_EMAIL: '/users/:userId/verify-email',
      EMAIL_VERIFICATION_STATUS: '/users/:userId/email-verification-status',
      ME: '/users/me'
    },

    // Master Surname Routes
    MASTER_SURNAME: {
      LIST: '/master_surname-data',
      UPDATE: '/master_surname-data/:id',
      BULK_UPSERT: '/master_surname-data/bulk-upsert',
      SAVED_DATA: '/saved-master_surname-data',
      PROCESS: '/process-master_surname-data'
    },

    // Voter Data Routes
    VOTERS: {
      LIST: '/voters',
      UPDATE: '/voters',
      EXPORT: '/export',
      EXPORT_FILTERED: '/export-filtered',
      SAVE: '/save',
      LOCK: '/lock'
    },

    // Filter Routes
    FILTERS: {
      MASTER_OPTIONS: '/master-filter-options',
      OPTIONS: '/filter-options',
      DEPENDENT_OPTIONS: '/filter-options-dependent'
    },

    // Village Mapping Routes
    VILLAGE_MAPPING: {
      LIST: '/village-mapping',
      SAVE: '/village-mapping/save',
      SAVED: '/village-mapping/saved',
      UPDATE: '/village-mapping/:id',
      EXPORT: '/village-mapping/export',
      ACPC_MAPPING: '/village-mapping/acpc-mapping',
      TEST_SAVE: '/village-mapping/test-save',
      DEBUG_TABLE: '/village-mapping/debug-table',
      UPLOAD: '/upload-village-mapping',
      BULK_UPDATE: '/village-mapping/bulk',
      TEST: '/village-mapping/test'
    },

    // Division Data Routes
    DIVISION: {
      LIST: '/div_dist_pc_ac',
      UPDATE: '/div_dist_pc_ac/:id'
    },

    // Table Permissions Routes
    TABLE_PERMISSIONS: {
      SETUP: '/setup/table-permissions',
      LIST: '/table-permissions',
      USER_PERMISSIONS: '/table-permissions/user',
      UPDATE: '/table-permissions',
      BULK_UPDATE: '/table-permissions/bulk',
      CHECK: '/table-permissions/check'
    },

    // User Permissions Routes
    USER_PERMISSIONS: {
      GET: '/user-permissions/:userId',
      BULK_SAVE: '/user-permissions/bulk'
    },

    // Data Condition Routes
    DATA_CONDITION: {
      FAMILY_DATA: '/family-data',
      CASTE_INCONSISTENCIES: '/caste-inconsistencies',
      UPDATE_CASTE_DATA: '/update-caste-data'
    },

    // Caller Assignment Routes
    CALLER_ASSIGNMENTS: {
      INIT: '/caller-assignments/init',
      LIST: '/caller-assignments',
      CREATE: '/caller-assignments',
      BULK_CREATE: '/caller-assignments/bulk',
      UPDATE: '/caller-assignments',
      DELETE: '/caller-assignments',
      ANALYTICS: '/caller-assignments/analytics',
      IMPORT: '/caller-assignments/import',
      TEST: '/caller-assignments/test',
      GET_BY_ID: '/caller-assignments/:id'
    },

    // Calling Sets Routes
    CALLING_SETS: {
      LIST: '/calling-sets',
      GET_BY_ID: '/calling-sets/:id',
      CREATE: '/calling-sets',
      UPDATE: '/calling-sets/:id',
      DELETE: '/calling-sets/:id',
      BULK_UPDATE: '/calling-sets/bulk/update'
    },

    // Calling List Routes
    CALLING_LIST: {
      LIST: '/calling-list',
      STATS: '/calling-list/stats',
      ADD_VOTER: '/calling-list',
      UPDATE_ACTION: '/calling-list/:id/action',
      UPDATE_RESPONSE: '/calling-list/:id/response',
      REMOVE_VOTER: '/calling-list/:id'
    },

    // Voter Responses Routes
    VOTER_RESPONSES: {
      INIT: '/voter-responses/init',
      RECORD: '/voter-responses',
      LIST: '/voter-responses',
      STATS: '/voter-responses/stats',
      UPDATE: '/voter-responses/:id',
      DELETE: '/voter-responses/:id'
    },

    // Activity Logs Routes
    ACTIVITY_LOGS: {
      LIST: '/activity-logs',
      CREATE: '/log'
    },

    // Campaign Management Routes
    CAMPAIGNS: {
      LIST: '/campaigns',
      CREATE: '/campaigns',
      UPDATE: '/campaigns/:id',
      COMPLETE: '/campaigns/:id/complete',
      REACTIVATE: '/campaigns/:id/reactivate',
      DELETE: '/campaigns/:id',
      STATS_OVERVIEW: '/campaigns/stats/overview',
      BY_STATUS: '/campaigns/status/:status',
      DATE_RANGE: '/campaigns/date-range',
      SEARCH: '/campaigns/search'
    },

    // Setup Routes
    SETUP: {
      CALLING_LIST_TABLE: '/setup/calling-list-table',
      VOTER_RESPONSES_TABLE: '/setup/voter-responses-table',
      CALLING_SETS_TABLE: '/setup/calling-sets-table',
      MASTER_SURNAME_COLUMNS: '/setup/master_surname-columns',
      MASTER_SURNAME_UNIQUE_KEY: '/setup/master_surname-unique-key'
    },

    // Debug Routes
    DEBUG: {
      USERS: '/debug/users',
      MASTER_SURNAME_TABLE: '/debug/master_surname-table',
      CREATE_USER: '/debug/create-user',
      CREATE_MASTER_SURNAME_TABLE: '/debug/create-master_surname-table',
      AREA_MAPPING_STRUCTURE: '/debug/area-mapping-structure',
      BLOCK_VALUES: '/debug/block-values',
      FAMILY_DATA: '/debug/family-data'
    },

    // Family Data Routes
    FAMILY: {
      MEMBERS_BY_ID: '/family-members-by-id',
      MEMBERS: '/family-members',
      GENERATE_IDS: '/generate-family-ids'
    },

    // Column Values Routes
    COLUMNS: {
      VALUES: '/column-values/:columnName',
      DEPENDENT_VALUES: '/dependent-column-values/:columnName'
    },

    // Voter Update Routes
    VOTER_UPDATES: {
      UPDATE: '/update-voters',
      BULK_UPDATE_CELLS: '/bulk-update-cells'
    },

    // Filter Presets Routes
    FILTER_PRESETS: {
      LIST: '/filter-presets',
      CREATE: '/filter-presets',
      DELETE: '/filter-presets/:id'
    },

    // Caste Map Routes
    CASTE_MAP: {
      GET: '/caste-map'
    },

    // Master Surname Data Routes
    MASTER_SURNAME_DATA: {
      LIST: '/master_surname-data',
      UPDATE: '/master_surname-data/:id',
      UPDATE_DEMO: '/master_surname-data/:id/demo',
      BULK_UPSERT: '/master_surname-data/bulk-upsert',
      SAVED_DATA: '/saved-master_surname-data',
      PROCESS: '/process-master_surname-data',
      IGNORE: '/master-surname/ignore'
    },

    // Health Check Routes
    HEALTH: {
      CHECK: '/health',
      DATABASE: '/health/database'
    },

    // Mobile Authentication Routes
    MOBILE_AUTH: {
      LOGIN: '/mobile/auth/login',
      REGISTER_DEVICE: '/mobile/auth/register-device',
      PROFILE: '/mobile/auth/profile',
      CHANGE_PASSWORD: '/mobile/auth/change-password'
    },

    // Mobile Settings Routes
    MOBILE_SETTINGS: {
      GET: '/mobile/settings',
      UPDATE: '/mobile/settings'
    },

    // Mobile Device Routes
    MOBILE_DEVICES: {
      LIST: '/mobile/devices',
      DELETE: '/mobile/devices/:deviceId'
    },

    // Mobile User Permissions Routes
    MOBILE_USER_PERMISSIONS: {
      UPDATE: '/mobile/users/:userId/permissions'
    },

    // Mobile Contacts Routes
    MOBILE_CONTACTS: {
      LIST: '/mobile/contacts',
      SYNC: '/mobile/contacts/sync'
    },

    // Mobile WhatsApp Routes
    MOBILE_WHATSAPP: {
      SEND: '/mobile/whatsapp/send'
    },

    // Email Verification Routes
    EMAIL_VERIFICATION: {
      VERIFY_TOKEN: '/verify-email-token'
    },

    // ACPC Mapping Routes
    ACPC_MAPPING: {
      GET: '/acpc-mapping',
      RESOLVE_CODES: '/resolve-ac-codes'
    },

    // Division Data Routes (Extended)
    DIVISION_DATA: {
      LIST: '/div_dist_pc_ac',
      UPDATE: '/div_dist_pc_ac/:id'
    },

    // Block Table Routes
    BLOCK_TABLE: {
      DELETE_ALL: '/block_table/delete-all',
      COUNT: '/block_table/count',
      UPDATE: '/block_table/:id',
      BACKFILL_MASTER_SURNAME: '/block_table/backfill-master_surname',
      BACKFILL_CASTE_CATEGORY: '/block_table/backfill-caste-category'
    },

    // Export Routes
    EXPORTS: {
      FILTERED: '/export-filtered',
      EXPORT: '/export',
      EXPORT_COUNT: '/export-count'
    },

    // User Permissions Routes (Extended)
    USER_PERMISSIONS: {
      GET: '/user-permissions/:userId',
      BULK_SAVE: '/user-permissions/bulk'
    },

    // Hierarchical Data Routes
    HIERARCHICAL: {
      CONSTITUENCIES: '/hierarchical/constituencies',
      BLOCKS: '/hierarchical/blocks',
      GPS: '/hierarchical/gps',
      VILLAGES: '/hierarchical/villages',
      DEBUG: '/hierarchical/debug'
    },

    // Blocks Routes
    BLOCKS: {
      CREATE: '/blocks'
    },

    // Import History Routes
    IMPORT_HISTORY: {
      LIST: '/import-history',
      CREATE: '/import-history',
      UPDATE: '/import-history/:id',
      DELETE: '/import-history/:id',
      DELETE_ALL: '/import-history'
    },

    // Export History Routes
    EXPORT_HISTORY: {
      LIST: '/export-history',
      CREATE: '/export-history',
      UPDATE: '/export-history/:id',
      DELETE: '/export-history/:id',
      DELETE_ALL: '/export-history'
    },

    // Activity Logs Routes (Extended)
    LOGS: {
      LIST: '/logs',
      CREATE: '/log',
      STATS: '/logs/stats'
    },

    // Data Processing Routes
    DATA_PROCESSING: {
      DATA_FILL: '/data-fill',
      IMPORT: '/import',
      IMPORTED_DATA: '/imported-data/:sessionId',
      SAVE_IMPORTED_DATA: '/save-imported-data/:sessionId',
      CLEANUP_IMPORT_SESSIONS: '/cleanup-import-sessions'
    },

    // Test Routes
    TEST: {
      REQUEST_BODY: '/test/request-body',
      FIELD_PROCESSING: '/test/field-processing',
      MODULE_ASSIGNMENT: '/test/module-assignment',
      DATABASE: '/test-db',
      CAMPAIGNS_TABLE: '/test-campaigns-table'
    },

    // Dashboard Routes
    DASHBOARD: {
      DISTRICTS: '/dashboard/districts',
      SUMMARY: '/dashboard/summary',
      PARTY_PERFORMANCE: '/dashboard/party-performance',
      VOTER_DEMOGRAPHICS: '/dashboard/voter-demographics',
      DEMOGRAPHICS_AGE: '/dashboard/demographics/age',
      DEMOGRAPHICS_EDUCATION: '/dashboard/demographics/education',
      DEMOGRAPHICS_OCCUPATION: '/dashboard/demographics/occupation',
      DEMOGRAPHICS_CASTE: '/dashboard/demographics/caste',
      MONTHLY_ACTIVITY: '/dashboard/monthly-activity',
      RECENT_ACTIVITY: '/dashboard/recent-activity'
    },

    // Database Routes
    DATABASE: {
      TABLES: '/tables',
      TABLE_DESCRIBE: '/table/:tableName/describe'
    },

    // Mobile Groups Routes
    MOBILE_GROUPS: {
      LIST: '/mobile/groups',
      CREATE: '/mobile/groups',
      ADD_USERS: '/mobile/groups/:clientId/users',
      REPORTS: '/mobile/groups/:clientId/reports'
    }
  },

  // HTTP Methods
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
  },

  // Default Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },

  // Request Timeout (in milliseconds)
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),

  // Retry Configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000 // milliseconds
  }
};

// Helper function to get current base URL
const getBaseURL = () => {
  return API_CONFIG.BASE_URLS[API_CONFIG.CURRENT_ENV];
};

// Helper function to build full URL
const buildURL = (route, params = {}) => {
  const baseURL = getBaseURL();
  let finalRoute = route;

  // Replace parameters in route (e.g., /users/:id -> /users/123)
  Object.keys(params).forEach(key => {
    finalRoute = finalRoute.replace(`:${key}`, params[key]);
  });

  return `${baseURL}${finalRoute}`;
};

// Helper function to get route by category and action
const getRoute = (category, action, params = {}) => {
  const route = API_CONFIG.ROUTES[category]?.[action];
  if (!route) {
    throw new Error(`Route not found: ${category}.${action}`);
  }

  return buildURL(route, params);
};

// Centralized API Client Class
class APIClient {
  constructor() {
    this.baseURL = getBaseURL();
    this.routes = API_CONFIG.ROUTES;
    this.methods = API_CONFIG.METHODS;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${token}`
    };
  }

  // Get headers based on authentication status
  getHeaders(requireAuth = true) {
    return requireAuth ? this.getAuthHeaders() : this.defaultHeaders;
  }

  // Handle response
  async handleResponse(response, endpoint = '') {
    // Clone response to read body multiple times if needed
    const clonedResponse = response.clone();

    if (!response.ok) {
      // Handle token expiration (401 Unauthorized)
      if (response.status === 401) {
        // Check if this is a user management API call
        const url = response.url || endpoint;
        const isUserManagementAPI = url.includes('/auth/users') ||
          url.includes('/users/');

        // Check if this is a profile verification call (should not trigger immediate logout)
        const isProfileVerification = url.includes('/auth/profile') || endpoint.includes('/auth/profile');

        // Check if this is a modules/datasets call (should not require auth)
        const isModulesCall = url.includes('/modules') || url.includes('') ||
          endpoint.includes('/modules') || endpoint.includes('/datasets');

        // Check if this is a table-columns call (should not trigger immediate logout)
        const isTableColumnsCall = url.includes('/table-columns') || endpoint.includes('/table-columns');

        if (isUserManagementAPI) {
          console.warn('🔒 API Client: Authentication expired for user management API');
          throw new Error('Your session has expired. Please refresh the page and try again.');
        }

        // For profile verification, don't automatically logout - let AuthContext handle it
        if (isProfileVerification) {
          console.warn('🔒 API Client: Profile verification failed - token may be expired');
          console.log('ℹ️ API Client: This is non-critical, will not trigger logout');
          throw new Error('Profile verification failed');
        }

        // For table-columns, don't automatically logout - let component handle it gracefully
        if (isTableColumnsCall) {
          console.warn('🔒 API Client: Table columns fetch failed - token may be expired or invalid');
          console.log('ℹ️ API Client: This is non-critical, will not trigger logout');
          // Return error data instead of redirecting
          try {
            const errorData = await clonedResponse.json();
            const errorMsg = errorData.message || 'Failed to fetch table columns';
            // Check if it's an invalid token signature error
            if (errorMsg.includes('Invalid token') || errorMsg.includes('invalid signature')) {
              throw new Error('Invalid token signature. Please refresh the page and log in again.');
            }
            throw new Error(errorMsg);
          } catch (e) {
            if (e.message && e.message.includes('Invalid token signature')) {
              throw e; // Re-throw the specific error
            }
            throw new Error('Failed to fetch table columns');
          }
        }

        localStorage.removeItem('authToken');
       // localStorage.removeItem('userInfo');
        localStorage.removeItem('sessionToken');

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        throw new Error('Authentication expired. Please log in again.');
      }

      let errorData = {};
      try {
        const text = await clonedResponse.text();
        console.log(`❌ Error response body:`, text);
        errorData = text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn('⚠️ Could not parse error response as JSON:', e);
      }

      const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
      console.error(`❌ API Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Parse response body
    let result;
    try {
      const text = await response.text();
      result = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('❌ Failed to parse response as JSON:', e);
      throw new Error('Invalid JSON response from server');
    }

    return result;
  }

  // Make HTTP request
  async request(endpoint, method = 'GET', data = null, requireAuth = false) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(requireAuth);

    // Disable caching for GET requests to user-assignments
    const isUserAssignmentsRequest = url.includes('/user-assignments');

    const options = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) }),
      // Disable cache for user-assignments requests
      ...(isUserAssignmentsRequest && method === 'GET' && {
        cache: 'no-store',
        headers: {
          ...headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
    };

    console.log('[APIClient] API Request:', { url, method, data, headers: options.headers });

    try {
      const response = await fetch(url, options);

      const result = await this.handleResponse(response, endpoint);
      return result;
    } catch (error) {
      console.error(`❌ API Request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  // Get route by category and action
  getRoute(category, action, params = {}) {
    return getRoute(category, action, params);
  }

  // Switch environment
  switchEnvironment(env) {
    if (!API_CONFIG.BASE_URLS[env]) {
      throw new Error(`Environment '${env}' not found`);
    }
    API_CONFIG.CURRENT_ENV = env;
    this.baseURL = getBaseURL();
    console.log(`🔄 Switched to ${env} environment: ${this.baseURL}`);
  }

  // Get current environment
  getCurrentEnvironment() {
    return API_CONFIG.CURRENT_ENV;
  }

  // Get all available environments
  getEnvironments() {
    return Object.keys(API_CONFIG.BASE_URLS);
  }

  // ===== AUTHENTICATION METHODS =====
  async login(credentials) {
    return this.request(this.getRoute('AUTH', 'LOGIN'), 'POST', credentials, false);
  }

  async logout() {
    return this.request(this.getRoute('AUTH', 'LOGOUT'), 'POST', null, true);
  }

  // async getProfile() {
  //   return this.request(this.getRoute('AUTH', 'PROFILE'), 'GET', null, true);
  // }

  async changePassword(currentPassword, newPassword) {
    return this.request(this.getRoute('AUTH', 'CHANGE_PASSWORD'), 'PUT', { currentPassword, newPassword });
  }

  // Login verification flows
  async verifyLoginToken(token) {
    return this.request(this.getRoute('AUTH', 'VERIFY_LOGIN_TOKEN', { token }), 'GET', null, false);
  }

  async approveVerifyLogin(token) {
    return this.request(this.getRoute('AUTH', 'VERIFY_LOGIN_TOKEN', { token }), 'POST', null, true);
  }

  async getVerificationRequests() {
    return this.request(this.getRoute('AUTH', 'VERIFICATION_REQUESTS'), 'GET', null, true);
  }

  async getVerificationHistory() {
    return this.request(this.getRoute('AUTH', 'VERIFICATION_HISTORY'), 'GET', null, true);
  }

  async getUserSessions(userId) {
    return this.request(this.getRoute('AUTH', 'USER_SESSIONS', { userId }), 'GET', null, true);
  }

  // ===== USER MANAGEMENT METHODS =====
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/auth/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url, 'GET', null, false);
  }

  async createUser(userData) {
    return this.request('/auth/users', 'POST', userData, true); // ✅ Added auth
  }

  async updateUser(id, userData) {
    return this.request(`/auth/users/${id}`, 'PUT', userData, true); // ✅ Added auth
  }

  async deleteUser(id) {
    return this.request(`/auth/users/${id}`, 'DELETE', null, true); // ✅ Added auth
  }

  async updateUserPassword(id, passwordData) {
    // If passwordData is a string, wrap it in { newPassword }
    const payload = typeof passwordData === 'string' ? { newPassword: passwordData } : passwordData;
    return this.request(`/auth/users/${id}/password`, 'PUT', payload, true); // ✅ Added auth
  }

  async sendEmailVerification(userId) {
    return this.request(`/users/${userId}/send-email-verification`, 'POST', null, true);
  }

  async verifyEmail(userId, token) {
    return this.request(`/users/${userId}/verify-email`, 'POST', { token }, false);
  }

  async getEmailVerificationStatus(userId) {
    return this.request(`/users/${userId}/email-verification-status`, 'GET', null, true);
  }

  async getCurrentUser() {
    return this.request('/users/me', 'GET', null, true);
  }

  // ===== MASTER SURNAME METHODS =====
  async getMasterSurnameData(filters = {}) {
    const params = new URLSearchParams(filters);
    const url = `${this.getRoute('MASTER_SURNAME', 'LIST')}?${params}`;
    return this.request(url, 'GET', null, false);
  }

  async updateMasterSurname(id, data) {
    return this.request(this.getRoute('MASTER_SURNAME', 'UPDATE', { id }), 'PUT', data, false);
  }

  async bulkUpsertMasterSurname(rows) {
    // Map frontend row keys to DB schema for master_surname (snake_case)
    const toDbRow = (r) => ({
      id: r.id,
      master_surname: r.master_surname ?? r.surname ?? null,
      count: r.count,
      religion: r.religion,
      // Master filter fields - required for unique key constraint
      parliament: r.parliament ?? null,
      assembly: r.assembly ?? null,
      district: r.district ?? null,
      block: r.block ?? null,
      process_status: r.processStatus ?? r.process_status,
      last_processed: r.lastProcessed ?? r.last_processed,
      processed_by: r.processedBy ?? r.processed_by,
      // Send both generic and master_ prefixed keys to match backend expectations
      // CRITICAL: Ensure master_surname_cast_id is always set from surnameCastId
      // Convert undefined/null to empty string explicitly to avoid NULL in database
      surname_cast_id: (r.surnameCastId ?? r.surname_cast_id ?? '') || '',
      surname_cast_name: (r.surnameCastName ?? r.surname_cast_name ?? '') || '',
      master_surname_cast_id: (r.master_surnameCastId ?? r.master_surname_cast_id ?? r.surnameCastId ?? r.surname_cast_id ?? '') || '',
      master_surname_cast_name: (r.master_surnameCastName ?? r.master_surname_cast_name ?? r.surnameCastName ?? r.surname_cast_name ?? '') || '',
      cast: r.castId ?? r.cast,
      cast_name: r.castIda ?? r.cast_name,
      cast_id_from_other_table: r.castIdFromOtherTable ?? r.cast_id_from_other_table,
      cast_ida_from_other_table: r.castIdaFromOtherTable ?? r.cast_ida_from_other_table,
    });
    const clean = (obj) => {
      const out = {};
      Object.entries(obj).forEach(([k, v]) => {
        if (v !== undefined) out[k] = v;
      });
      return out;
    };
    const dbRows = Array.isArray(rows) ? rows.map((r) => clean(toDbRow(r))) : [];

    return this.request(this.getRoute('MASTER_SURNAME', 'BULK_UPSERT'), 'POST', { rows: dbRows }, false);
  }

  async getSavedMasterSurnameData(filters = {}) {
    const params = new URLSearchParams(filters);
    const url = `${this.getRoute('MASTER_SURNAME', 'SAVED_DATA')}?${params}`;
    return this.request(url, 'GET', null, false);
  }

  async processMasterSurnameData(data) {
    return this.request(this.getRoute('MASTER_SURNAME', 'PROCESS'), 'POST', { data }, false);
  }

  // ===== VOTER METHODS =====
  async getVoters(page = 1, limit = 100, filters = {}) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), ...filters });
    const url = `${this.getRoute('VOTERS', 'LIST')}?${params}`;
    return this.request(url, 'GET', null, false);
  }

  async updateVoter(id, voterData) {
    return this.request(this.getRoute('VOTERS', 'UPDATE', { id }), 'PUT', voterData, false);
  }

  // ===== FILTER METHODS =====
  async getMasterFilterOptions(masterFilters = {}) {
    const params = new URLSearchParams(masterFilters);
    const url = `${this.getRoute('FILTERS', 'MASTER_OPTIONS')}?${params}`;
    return this.request(url, 'GET', null, false);
  }

  async getFilterOptions() {
    return this.request(this.getRoute('FILTERS', 'OPTIONS'), 'GET', null, false);
  }

  async getDependentFilterOptions(filters = {}) {
    const params = new URLSearchParams(filters);
    const url = `${this.getRoute('FILTERS', 'DEPENDENT_OPTIONS')}?${params}`;
    return this.request(url, 'GET', null, false);
  }

  // ===== HEALTH CHECK METHODS =====
  async healthCheck() {
    return this.request(this.getRoute('HEALTH', 'CHECK'), 'GET', null, false);
  }

  async healthCheckDatabase() {
    return this.request(this.getRoute('HEALTH', 'DATABASE'), 'GET', null, false);
  }

  // ===== DEBUG METHODS =====
  async debugUsers() {
    return this.request(this.getRoute('DEBUG', 'USERS'), 'GET', null, false);
  }

  async debugMasterSurnameTable() {
    return this.request(this.getRoute('DEBUG', 'MASTER_SURNAME_TABLE'), 'GET', null, false);
  }

  async createDebugUser(userData) {
    return this.request(this.getRoute('DEBUG', 'CREATE_USER'), 'POST', userData, false);
  }

  async createMasterSurnameTable() {
    return this.request(this.getRoute('DEBUG', 'CREATE_MASTER_SURNAME_TABLE'), 'POST', null, false);
  }

  async getAreaMappingStructure() {
    return this.request(this.getRoute('DEBUG', 'AREA_MAPPING_STRUCTURE'), 'GET', null, false);
  }

  async getBlockValues() {
    return this.request(this.getRoute('DEBUG', 'BLOCK_VALUES'), 'GET', null, false);
  }

  async getFamilyData() {
    return this.request(this.getRoute('DEBUG', 'FAMILY_DATA'), 'GET', null, false);
  }

  // ===== FAMILY DATA METHODS =====
  async getFamilyMembersById(id) {
    return this.request(this.getRoute('FAMILY', 'MEMBERS_BY_ID'), 'GET', null, false);
  }

  async getFamilyMembers(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('FAMILY', 'MEMBERS')}?${queryParams}`;
    return this.request(url, 'GET', null, false);
  }

  async generateFamilyIds(data) {
    return this.request(this.getRoute('FAMILY', 'GENERATE_IDS'), 'POST', data, false);
  }

  // ===== COLUMN VALUES METHODS =====
  async getColumnValues(columnName) {
    return this.request(this.getRoute('COLUMNS', 'VALUES', { columnName }), 'GET', null, false);
  }

  async getDependentColumnValues(columnName) {
    return this.request(this.getRoute('COLUMNS', 'DEPENDENT_VALUES', { columnName }), 'GET', null, false);
  }

  // ===== VOTER UPDATE METHODS =====
  async updateVoters(data) {
    return this.request(this.getRoute('VOTER_UPDATES', 'UPDATE'), 'POST', data, false);
  }

  async bulkUpdateCells(data) {
    return this.request(this.getRoute('VOTER_UPDATES', 'BULK_UPDATE_CELLS'), 'POST', data, false);
  }

  // ===== FILTER PRESETS METHODS =====
  async getFilterPresets() {
    return this.request(this.getRoute('FILTER_PRESETS', 'LIST'), 'GET', null, false);
  }

  async createFilterPreset(data) {
    return this.request(this.getRoute('FILTER_PRESETS', 'CREATE'), 'POST', data, false);
  }

  async deleteFilterPreset(id) {
    return this.request(this.getRoute('FILTER_PRESETS', 'DELETE', { id }), 'DELETE', null, false);
  }

  // ===== CASTE MAP METHODS =====
  async getCasteMap() {
    return this.request(this.getRoute('CASTE_MAP', 'GET'), 'GET', null, false);
  }

  // ===== MASTER SURNAME DATA METHODS =====
  async getMasterSurnameDataList(filters = {}) {
    const params = new URLSearchParams(filters);
    const url = `${this.getRoute('MASTER_SURNAME_DATA', 'LIST')}?${params}`;
    return this.request(url, 'GET', null, false);
  }

  async updateMasterSurnameData(id, data) {
    return this.request(this.getRoute('MASTER_SURNAME_DATA', 'UPDATE', { id }), 'PUT', data, false);
  }

  async updateMasterSurnameDataDemo(id, data) {
    return this.request(this.getRoute('MASTER_SURNAME_DATA', 'UPDATE_DEMO', { id }), 'PUT', data, false);
  }

  async bulkUpsertMasterSurnameData(rows) {
    return this.request(this.getRoute('MASTER_SURNAME_DATA', 'BULK_UPSERT'), 'POST', { rows }, false);
  }

  async getSavedMasterSurnameData(filters = {}) {
    const params = new URLSearchParams(filters);
    const url = `${this.getRoute('MASTER_SURNAME_DATA', 'SAVED_DATA')}?${params}`;
    return this.request(url, 'GET', null, false);
  }

  async processMasterSurnameData(data) {
    return this.request(this.getRoute('MASTER_SURNAME_DATA', 'PROCESS'), 'POST', data, false);
  }

  async ignoreMasterSurname(data) {
    return this.request(this.getRoute('MASTER_SURNAME_DATA', 'IGNORE'), 'POST', data, false);
  }

  // ===== MOBILE AUTH METHODS =====
  async mobileLogin(credentials) {
    return this.request(this.getRoute('MOBILE_AUTH', 'LOGIN'), 'POST', credentials, false);
  }

  async registerMobileDevice(data) {
    return this.request(this.getRoute('MOBILE_AUTH', 'REGISTER_DEVICE'), 'POST', data, true);
  }

  async getMobileProfile() {
    return this.request(this.getRoute('MOBILE_AUTH', 'PROFILE'), 'GET', null, true);
  }

  async changeMobilePassword(data) {
    return this.request(this.getRoute('MOBILE_AUTH', 'CHANGE_PASSWORD'), 'POST', data, true);
  }

  // ===== MOBILE SETTINGS METHODS =====
  async getMobileSettings() {
    return this.request(this.getRoute('MOBILE_SETTINGS', 'GET'), 'GET', null, true);
  }

  async updateMobileSettings(data) {
    return this.request(this.getRoute('MOBILE_SETTINGS', 'UPDATE'), 'PUT', data, true);
  }

  // ===== MOBILE DEVICE METHODS =====
  async getMobileDevices() {
    return this.request(this.getRoute('MOBILE_DEVICES', 'LIST'), 'GET', null, true);
  }

  async deleteMobileDevice(deviceId) {
    return this.request(this.getRoute('MOBILE_DEVICES', 'DELETE', { deviceId }), 'DELETE', null, true);
  }

  // ===== MOBILE USER PERMISSIONS METHODS =====
  async updateMobileUserPermissions(userId, data) {
    return this.request(this.getRoute('MOBILE_USER_PERMISSIONS', 'UPDATE', { userId }), 'PUT', data, true);
  }

  // ===== MOBILE CONTACTS METHODS =====
  async getMobileContacts(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('MOBILE_CONTACTS', 'LIST')}?${queryParams}`;
    return this.request(url, 'GET', null, true);
  }

  async syncMobileContacts(data) {
    return this.request(this.getRoute('MOBILE_CONTACTS', 'SYNC'), 'POST', data, true);
  }

  // ===== MOBILE WHATSAPP METHODS =====
  async sendWhatsAppMessage(data) {
    return this.request(this.getRoute('MOBILE_WHATSAPP', 'SEND'), 'POST', data, true);
  }

  // ===== EMAIL VERIFICATION METHODS =====
  async verifyEmailToken(token) {
    return this.request(this.getRoute('EMAIL_VERIFICATION', 'VERIFY_TOKEN'), 'GET', null, false);
  }

  // ===== ACPC MAPPING METHODS =====
  async getAcpcMapping() {
    return this.request(this.getRoute('ACPC_MAPPING', 'GET'), 'GET', null, false);
  }

  async resolveAcCodes(data) {
    return this.request(this.getRoute('ACPC_MAPPING', 'RESOLVE_CODES'), 'POST', data, false);
  }

  // ===== DIVISION DATA METHODS =====
  async getDivisionData(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('DIVISION_DATA', 'LIST')}?${queryParams}`;
    return this.request(url, 'GET', null, false);
  }

  async updateDivisionData(id, data) {
    return this.request(this.getRoute('DIVISION_DATA', 'UPDATE', { id }), 'PUT', data, false);
  }

  // ===== BLOCK TABLE METHODS =====
  async deleteAllBlockTable() {
    return this.request(this.getRoute('BLOCK_TABLE', 'DELETE_ALL'), 'DELETE', null, false);
  }

  async getBlockTableCount() {
    return this.request(this.getRoute('BLOCK_TABLE', 'COUNT'), 'GET', null, false);
  }

  async updateBlockTable(id, data) {
    return this.request(this.getRoute('BLOCK_TABLE', 'UPDATE', { id }), 'PUT', data, false);
  }

  async backfillMasterSurname() {
    return this.request(this.getRoute('BLOCK_TABLE', 'BACKFILL_MASTER_SURNAME'), 'POST', null, false);
  }

  async backfillCasteCategory() {
    return this.request(this.getRoute('BLOCK_TABLE', 'BACKFILL_CASTE_CATEGORY'), 'POST', null, false);
  }

  // ===== EXPORT METHODS =====
  async exportFilteredData(filters = {}) {
    const params = new URLSearchParams(filters);
    const url = `${this.getRoute('EXPORTS', 'FILTERED')}?${params}`;

    const response = await fetch(url, {
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
  }

  async exportData(data) {
    const response = await fetch(this.getRoute('EXPORTS', 'EXPORT'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  async getExportCount(data) {
    return this.request(this.getRoute('EXPORTS', 'EXPORT_COUNT'), 'POST', data, true);
  }

  // ===== VILLAGE MAPPING METHODS =====
  async getVillageMapping(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('VILLAGE_MAPPING', 'LIST')}?${queryParams}`;
    return this.request(url, 'GET', null, false);
  }

  async saveVillageMapping(data) {
    return this.request(this.getRoute('VILLAGE_MAPPING', 'SAVE'), 'POST', data, false);
  }

  async getSavedVillageMapping(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('VILLAGE_MAPPING', 'SAVED')}?${queryParams}`;
    return this.request(url, 'GET', null, false);
  }

  async updateVillageMapping(id, data) {
    return this.request(this.getRoute('VILLAGE_MAPPING', 'UPDATE', { id }), 'PUT', data, false);
  }

  async exportVillageMapping(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('VILLAGE_MAPPING', 'EXPORT')}?${queryParams}`;
    return this.request(url, 'GET', null, false);
  }

  async getAcpcMappingVillage() {
    return this.request(this.getRoute('VILLAGE_MAPPING', 'ACPC_MAPPING'), 'GET', null, false);
  }

  async testSaveVillageMapping(data) {
    return this.request(this.getRoute('VILLAGE_MAPPING', 'TEST_SAVE'), 'POST', data, false);
  }

  async getVillageMappingDebugTable() {
    return this.request(this.getRoute('VILLAGE_MAPPING', 'DEBUG_TABLE'), 'GET', null, false);
  }

  async uploadVillageMapping(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}${this.getRoute('VILLAGE_MAPPING', 'UPLOAD')}`, {
      method: 'POST',
      body: formData
    });

    return this.handleResponse(response);
  }

  async bulkUpdateVillageMapping(data) {
    return this.request(this.getRoute('VILLAGE_MAPPING', 'BULK_UPDATE'), 'PUT', data, false);
  }

  async testVillageMapping() {
    return this.request(this.getRoute('VILLAGE_MAPPING', 'TEST'), 'GET', null, false);
  }

  // ===== USER PERMISSIONS METHODS =====
  async getUserPermissions(userId) {
    return this.request(this.getRoute('USER_PERMISSIONS', 'GET', { userId }), 'GET', null, false);
  }

  async bulkSaveUserPermissions(data) {
    return this.request(this.getRoute('USER_PERMISSIONS', 'BULK_SAVE'), 'POST', data, false);
  }

  // ===== HIERARCHICAL DATA METHODS =====
  async getHierarchicalConstituencies() {
    return this.request(this.getRoute('HIERARCHICAL', 'CONSTITUENCIES'), 'GET', null, false);
  }

  async getHierarchicalBlocks() {
    return this.request(this.getRoute('HIERARCHICAL', 'BLOCKS'), 'GET', null, false);
  }

  async createHierarchicalGps(data) {
    return this.request(this.getRoute('HIERARCHICAL', 'GPS'), 'POST', data, false);
  }

  async createHierarchicalVillages(data) {
    return this.request(this.getRoute('HIERARCHICAL', 'VILLAGES'), 'POST', data, false);
  }

  async getHierarchicalDebug() {
    return this.request(this.getRoute('HIERARCHICAL', 'DEBUG'), 'GET', null, false);
  }

  // ===== BLOCKS METHODS =====
  async createBlock(data) {
    return this.request(this.getRoute('BLOCKS', 'CREATE'), 'POST', data, false);
  }

  // ===== IMPORT HISTORY METHODS =====
  async getImportHistory(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('IMPORT_HISTORY', 'LIST')}?${queryParams}`;
    return this.request(url, 'GET', null, true);
  }

  async createImportHistory(data) {
    return this.request(this.getRoute('IMPORT_HISTORY', 'CREATE'), 'POST', data, true);
  }

  async updateImportHistory(id, data) {
    return this.request(this.getRoute('IMPORT_HISTORY', 'UPDATE', { id }), 'PUT', data, true);
  }

  async deleteImportHistory(id) {
    return this.request(this.getRoute('IMPORT_HISTORY', 'DELETE', { id }), 'DELETE', null, true);
  }

  async deleteAllImportHistory() {
    return this.request(this.getRoute('IMPORT_HISTORY', 'DELETE_ALL'), 'DELETE', null, true);
  }

  // ===== EXPORT HISTORY METHODS =====
  async getExportHistory(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('EXPORT_HISTORY', 'LIST')}?${queryParams}`;
    return this.request(url, 'GET', null, true);
  }

  async createExportHistory(data) {
    return this.request(this.getRoute('EXPORT_HISTORY', 'CREATE'), 'POST', data, true);
  }

  async updateExportHistory(id, data) {
    return this.request(this.getRoute('EXPORT_HISTORY', 'UPDATE', { id }), 'PUT', data, true);
  }

  async deleteExportHistory(id) {
    return this.request(this.getRoute('EXPORT_HISTORY', 'DELETE', { id }), 'DELETE', null, true);
  }

  async deleteAllExportHistory() {
    return this.request(this.getRoute('EXPORT_HISTORY', 'DELETE_ALL'), 'DELETE', null, true);
  }

  // ===== LOGS METHODS =====
  async getLogs(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('LOGS', 'LIST')}?${queryParams}`;
    return this.request(url, 'GET', null, false);
  }

  async createLog(data) {
    return this.request(this.getRoute('LOGS', 'CREATE'), 'POST', data, false);
  }

  async getLogsStats(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('LOGS', 'STATS')}?${queryParams}`;
    return this.request(url, 'GET', null, false);
  }

  // ===== DATA PROCESSING METHODS =====
  async dataFill(data) {
    return this.request(this.getRoute('DATA_PROCESSING', 'DATA_FILL'), 'POST', data, false);
  }

  async importData(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}${this.getRoute('DATA_PROCESSING', 'IMPORT')}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData
    });

    return this.handleResponse(response);
  }

  async getImportedData(sessionId) {
    return this.request(this.getRoute('DATA_PROCESSING', 'IMPORTED_DATA', { sessionId }), 'GET', null, false);
  }

  async saveImportedData(sessionId, data) {
    return this.request(this.getRoute('DATA_PROCESSING', 'SAVE_IMPORTED_DATA', { sessionId }), 'POST', data, false);
  }

  async cleanupImportSessions() {
    return this.request(this.getRoute('DATA_PROCESSING', 'CLEANUP_IMPORT_SESSIONS'), 'POST', null, false);
  }

  // ===== TEST METHODS =====
  async testRequestBody(data) {
    return this.request(this.getRoute('TEST', 'REQUEST_BODY'), 'POST', data, false);
  }

  async testFieldProcessing(data) {
    return this.request(this.getRoute('TEST', 'FIELD_PROCESSING'), 'POST', data, false);
  }

  async testModuleAssignment(data) {
    return this.request(this.getRoute('TEST', 'MODULE_ASSIGNMENT'), 'POST', data, false);
  }

  async testDatabase() {
    return this.request(this.getRoute('TEST', 'DATABASE'), 'GET', null, false);
  }

  async testCampaignsTable() {
    return this.request(this.getRoute('TEST', 'CAMPAIGNS_TABLE'), 'GET', null, false);
  }

  // ===== DASHBOARD METHODS =====
  async getDashboardDistricts() {
    return this.request(this.getRoute('DASHBOARD', 'DISTRICTS'), 'GET', null, false);
  }

  async getDashboardSummary() {
    return this.request(this.getRoute('DASHBOARD', 'SUMMARY'), 'GET', null, false);
  }

  async getDashboardPartyPerformance() {
    return this.request(this.getRoute('DASHBOARD', 'PARTY_PERFORMANCE'), 'GET', null, false);
  }

  async getDashboardVoterDemographics() {
    return this.request(this.getRoute('DASHBOARD', 'VOTER_DEMOGRAPHICS'), 'GET', null, false);
  }

  async getDashboardDemographicsAge() {
    return this.request(this.getRoute('DASHBOARD', 'DEMOGRAPHICS_AGE'), 'GET', null, false);
  }

  async getDashboardDemographicsEducation() {
    return this.request(this.getRoute('DASHBOARD', 'DEMOGRAPHICS_EDUCATION'), 'GET', null, false);
  }

  async getDashboardDemographicsOccupation() {
    return this.request(this.getRoute('DASHBOARD', 'DEMOGRAPHICS_OCCUPATION'), 'GET', null, false);
  }

  async getDashboardDemographicsCaste() {
    return this.request(this.getRoute('DASHBOARD', 'DEMOGRAPHICS_CASTE'), 'GET', null, false);
  }

  async getDashboardMonthlyActivity() {
    return this.request(this.getRoute('DASHBOARD', 'MONTHLY_ACTIVITY'), 'GET', null, false);
  }

  async getDashboardRecentActivity() {
    return this.request(this.getRoute('DASHBOARD', 'RECENT_ACTIVITY'), 'GET', null, false);
  }

  // ===== MODULES & DATASETS =====
  async getModules() {
    return this.request(this.getRoute('MODULES', 'LIST'), 'GET', null, false);
  }

  async getDatasets() {
    return this.request(this.getRoute('DATASETS', 'LIST'), 'GET', null, false);
  }

  // ===== USER ASSIGNMENTS =====
  async saveUserAssignments(userId, assignments) {
    return this.request(this.getRoute('USER_ASSIGNMENTS', 'SAVE'), 'POST', { userId, assignments }, true);
  }

  async getUserAssignments(userId) {
    // Add cache-busting parameter to prevent 304 responses
    const route = this.getRoute('USER_ASSIGNMENTS', 'GET_BY_USER', { userId });
    const url = `${route}?_t=${Date.now()}`;
    return this.request(url, 'GET', null, true);
  }

  async getAllUserAssignments() {
    // Add cache-busting parameter to prevent 304 responses
    const route = this.getRoute('USER_ASSIGNMENTS', 'GET_ALL');
    const url = `${route}?_t=${Date.now()}`;
    return this.request(url, 'GET', null, true);
  }

  async getUserAssignmentsByToken(token) {
    // Add cache-busting parameter to prevent 304 responses
    const url = `${this.baseURL}/user-assignments/token/${token}?_t=${Date.now()}`;
    return this.request(url, 'GET', null, true);
  }

  async generateTokensForExistingAssignments() {
    return this.request(`${this.baseURL}/user-assignments/generate-tokens`, 'POST', {}, true);
  }

  // ===== DATABASE METHODS =====
  async getTables() {
    return this.request(this.getRoute('DATABASE', 'TABLES'), 'GET', null, false);
  }

  async getTableDescribe(tableName) {
    return this.request(this.getRoute('DATABASE', 'TABLE_DESCRIBE', { tableName }), 'GET', null, false);
  }

  // ===== MOBILE GROUPS METHODS =====
  async getMobileGroups(params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('MOBILE_GROUPS', 'LIST')}?${queryParams}`;
    return this.request(url, 'GET', null, true);
  }

  async createMobileGroup(data) {
    return this.request(this.getRoute('MOBILE_GROUPS', 'CREATE'), 'POST', data, true);
  }

  async addUsersToMobileGroup(clientId, data) {
    return this.request(this.getRoute('MOBILE_GROUPS', 'ADD_USERS', { clientId }), 'POST', data, true);
  }

  async getMobileGroupReports(clientId, params = {}) {
    const queryParams = new URLSearchParams(params);
    const url = `${this.getRoute('MOBILE_GROUPS', 'REPORTS', { clientId })}?${queryParams}`;
    return this.request(url, 'GET', null, true);
  }

  // ===== CALLERS MODULE API METHODS =====

  // Calling Sets API Methods
  async getCallingSets(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/calling-sets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url, 'GET', null, true);
  }

  async getCallingSet(id) {
    return this.request(`/calling-sets/${id}`, 'GET', null, true);
  }

  async createCallingSet(data) {
    return this.request('/calling-sets', 'POST', data, true);
  }

  async updateCallingSet(id, data) {
    return this.request(`/calling-sets/${id}`, 'PUT', data, true);
  }

  async deleteCallingSet(id) {
    return this.request(`/calling-sets/${id}`, 'DELETE', null, true);
  }

  async bulkUpdateCallingSets(updates) {
    return this.request('/calling-sets/bulk/update', 'PUT', { updates }, true);
  }

  // Calling List API Methods
  async getCallingList(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/calling-list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url, 'GET', null, false);
  }

  async getCallingListStats(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/calling-list/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url, 'GET', null, false);
  }

  async addVoterToCallingList(data) {
    return this.request('/calling-list', 'POST', data, false);
  }

  async updateVoterAction(voterId, action, notes) {
    return this.request(`/calling-list/${voterId}/action`, 'PUT', { action, notes }, false);
  }

  async updateVoterResponse(voterId, response) {
    return this.request(`/calling-list/${voterId}/response`, 'PUT', { response }, false);
  }

  async removeVoterFromCallingList(voterId) {
    return this.request(`/calling-list/${voterId}`, 'DELETE', null, false);
  }

  // Voter Responses API Methods
  async initializeVoterResponses() {
    return this.request('/voter-responses/init', 'POST', null, false);
  }

  async recordVoterResponse(data) {
    return this.request('/voter-responses', 'POST', data, false);
  }

  async getVoterResponses(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/voter-responses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url, 'GET', null, false);
  }

  async getVoterResponseStats(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/voter-responses/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url, 'GET', null, false);
  }

  async updateVoterResponse(id, data) {
    return this.request(`/voter-responses/${id}`, 'PUT', data, false);
  }

  async deleteVoterResponse(id) {
    return this.request(`/voter-responses/${id}`, 'DELETE', null, false);
  }

  // Caller Assignment API Methods
  async initializeCallerAssignments() {
    return this.request('/caller-assignments/init', 'POST', null, false);
  }

  async getCallerAssignments(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/caller-assignments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url, 'GET', null, false);
  }

  async createCallerAssignment(data) {
    return this.request('/caller-assignments', 'POST', data, false);
  }

  async updateCallerAssignment(id, data) {
    return this.request(`/caller-assignments/${id}`, 'PUT', data, false);
  }

  async deleteCallerAssignment(id) {
    return this.request(`/caller-assignments/${id}`, 'DELETE', null, false);
  }

  async getCallerAssignmentById(id) {
    return this.request(`/caller-assignments/${id}`, 'GET', null, false);
  }

  async testCallerAssignments() {
    return this.request('/caller-assignments/test', 'GET', null, false);
  }

  async getCallerAssignmentAnalytics(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/caller-assignments/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url, 'GET', null, false);
  }

  async createBulkAssignment(data) {
    return this.request('/caller-assignments/bulk', 'POST', data, false);
  }

  async importCallerAssignments(assignments, callerMapping = {}) {
    return this.request('/caller-assignments/import', 'POST', { assignments, caller_mapping: callerMapping }, false);
  }

  // ===== CAMPAIGN MANAGEMENT API METHODS =====

  // Get all campaigns
  async getCampaigns(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `/campaigns${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url, 'GET', null, false);
  }

  // Create new campaign
  async createCampaign(campaignData) {
    return this.request('/campaigns', 'POST', campaignData, false);
  }

  // Update campaign
  async updateCampaign(id, campaignData) {
    return this.request(`/campaigns/${id}`, 'PUT', campaignData, false);
  }

  // Complete campaign
  async completeCampaign(id) {
    return this.request(`/campaigns/${id}/complete`, 'PUT', null, true);
  }

  // Reactivate campaign
  async reactivateCampaign(id) {
    return this.request(`/campaigns/${id}/reactivate`, 'PUT', null, true);
  }

  // Delete campaign
  async deleteCampaign(id) {
    return this.request(`/campaigns/${id}`, 'DELETE', null, true);
  }

  // Extra campaign analytics/search endpoints
  async getCampaignStatsOverview() {
    return this.request(this.getRoute('CAMPAIGNS', 'STATS_OVERVIEW'), 'GET', null, false);
  }

  async getCampaignsByStatus(status) {
    return this.request(this.getRoute('CAMPAIGNS', 'BY_STATUS', { status }), 'GET', null, false);
  }

  async getCampaignsByDateRange(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    const url = `${this.getRoute('CAMPAIGNS', 'DATE_RANGE')}?${queryParams}`;
    return this.request(url, 'GET', null, false);
  }

  async searchCampaigns(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    const url = `${this.getRoute('CAMPAIGNS', 'SEARCH')}?${queryParams}`;
    return this.request(url, 'GET', null, false);
  }
}

// Create singleton instance
const apiClient = new APIClient();

// Export both the class and instance
export { APIClient, API_CONFIG, getBaseURL, buildURL, getRoute };
export default apiClient;