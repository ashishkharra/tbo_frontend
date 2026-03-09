import { getAPIURL, getAPIBaseURL } from '../utils/apiUrl';
/**
 * Comprehensive Activity Logging Utility
 * Logs all user activities across the application
 */

interface ActivityLogData {
  user_id?: number;
  username?: string;
  actual_username?: string;
  user_role?: string;
  action_type: string;
  action_details: string;
  filters_applied?: Record<string, any>;
  data_count?: number;
  file_name?: string;
  file_path?: string;
  ip_address?: string;
  user_agent?: string;
  status?: string;
}

// import { getAPIBaseURL } from './apiUrl';

class ActivityLogger {
  private static instance: ActivityLogger;
  private apiBaseUrl: string;

  private constructor() {
    this.apiBaseUrl = getAPIBaseURL();
  }

  public static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  /**
   * Log user activity
   */
  public async logActivity(activityData: ActivityLogData): Promise<boolean> {
    try {
      // Get current user info if not provided
      const userInfo = await this.getCurrentUserInfo();
      
      const logData = {
        user_id: activityData.user_id || userInfo.user_id,
        username: activityData.username || userInfo.username,
        actual_username: activityData.actual_username || userInfo.username,
        user_role: activityData.user_role || userInfo.user_role,
        action_type: activityData.action_type,
        action_details: activityData.action_details,
        filters_applied: activityData.filters_applied || {},
        data_count: activityData.data_count || 0,
        file_name: activityData.file_name || null,
        file_path: activityData.file_path || null,
        ip_address: activityData.ip_address || null,
        user_agent: activityData.user_agent || navigator.userAgent,
        status: activityData.status || 'completed'
      };

      console.log('📝 Logging activity:', logData);

      const response = await fetch(`${this.apiBaseUrl}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (response.ok) {
        console.log('✅ Activity logged successfully');
        return true;
      } else {
        console.error('❌ Failed to log activity:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      return false;
    }
  }

  /**
   * Get current user information
   */
  private async getCurrentUserInfo(): Promise<{ user_id: number; username: string; user_role?: string }> {
    try {
      // Try to get user info from localStorage or session
      // Prefer 'userInfo' which is where AuthContext stores user
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const user = JSON.parse(storedUserInfo);
        return {
          user_id: user.id || user.user_id || 1,
          username: user.username || user.email || user.name || 'Unknown',
          user_role: user.role || user.user_role || 'user'
        };
      }

      // Fallback to legacy key 'user'
      const legacyUser = localStorage.getItem('user');
      if (legacyUser) {
        const user = JSON.parse(legacyUser);
        return {
          user_id: user.id || user.user_id || 1,
          username: user.username || user.email || user.name || 'Unknown',
          user_role: user.role || user.user_role || 'user'
        };
      }
    } catch (error) {
      console.warn('Could not get user info:', error);
    }
    
    // Fallback values
    return {
      user_id: 1,
      username: 'Unknown',
      user_role: 'user'
    };
  }

  /**
   * Log save activity
   */
  public async logSave(
    details: string, 
    dataCount: number = 1, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'save',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log edit activity
   */
  public async logEdit(
    details: string, 
    dataCount: number = 1, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'edit',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log delete activity
   */
  public async logDelete(
    details: string, 
    dataCount: number = 1, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'delete',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log import activity
   */
  public async logImport(
    details: string, 
    fileName: string, 
    dataCount: number = 0, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'import',
      action_details: details,
      data_count: dataCount,
      file_name: fileName,
      filters_applied: filters
    });
  }

  /**
   * Log export activity
   */
  public async logExport(
    details: string, 
    fileName: string, 
    dataCount: number = 0, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'export',
      action_details: details,
      data_count: dataCount,
      file_name: fileName,
      filters_applied: filters
    });
  }

  /**
   * Log download activity
   */
  public async logDownload(
    details: string, 
    fileName: string, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'download',
      action_details: details,
      file_name: fileName,
      filters_applied: filters
    });
  }

  /**
   * Log upload activity
   */
  public async logUpload(
    details: string, 
    fileName: string, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'upload',
      action_details: details,
      file_name: fileName,
      filters_applied: filters
    });
  }

  /**
   * Log process activity
   */
  public async logProcess(
    details: string, 
    dataCount: number = 0, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'process',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log village mapping activity
   */
  public async logVillageMapping(
    details: string, 
    dataCount: number = 0, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'village_mapping',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log dashboard activity
   */
  public async logDashboard(
    details: string, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'dashboard',
      action_details: details,
      filters_applied: filters
    });
  }

  /**
   * Log replace activity
   */
  public async logReplace(
    details: string, 
    dataCount: number = 0, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'replace',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log data fill activity
   */
  public async logDataFill(
    details: string, 
    dataCount: number = 0, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'data_fill',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log surname activity
   */
  public async logSurname(
    details: string, 
    dataCount: number = 0, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'surname',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log filter activity
   */
  public async logFilter(
    details: string, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'filter',
      action_details: details,
      filters_applied: filters
    });
  }

  /**
   * Log login activity
   */
  public async logLogin(
    details: string = 'User logged into the system'
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'login',
      action_details: details
    });
  }

  /**
   * Log logout activity
   */
  public async logLogout(
    details: string = 'User logged out of the system'
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'logout',
      action_details: details
    });
  }

  /**
   * Log user management activity
   */
  public async logUserManagement(
    details: string, 
    dataCount: number = 1, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'user_management',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log settings activity
   */
  public async logSettings(
    details: string, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'settings',
      action_details: details,
      filters_applied: filters
    });
  }

  /**
   * Log permissions activity
   */
  public async logPermissions(
    details: string, 
    dataCount: number = 1, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'permissions',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log data alteration activity
   */
  public async logDataAlteration(
    details: string, 
    dataCount: number = 0, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'data_alteration',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log master data activity
   */
  public async logMasterData(
    details: string, 
    dataCount: number = 0, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'master_data',
      action_details: details,
      data_count: dataCount,
      filters_applied: filters
    });
  }

  /**
   * Log mobile app activity
   */
  public async logMobileApp(
    details: string, 
    filters?: Record<string, any>
  ): Promise<boolean> {
    return this.logActivity({
      action_type: 'mobile_app',
      action_details: details,
      filters_applied: filters
    });
  }

  /**
   * Log custom activity
   */
  public async logCustom(
    actionType: string,
    details: string, 
    dataCount: number = 0, 
    filters?: Record<string, any>,
    fileName?: string
  ): Promise<boolean> {
    return this.logActivity({
      action_type: actionType,
      action_details: details,
      data_count: dataCount,
      filters_applied: filters,
      file_name: fileName
    });
  }
}

// Export singleton instance
export const activityLogger = ActivityLogger.getInstance();

// Export individual methods for convenience
export const {
  logActivity,
  logSave,
  logEdit,
  logDelete,
  logImport,
  logExport,
  logDownload,
  logUpload,
  logProcess,
  logVillageMapping,
  logDashboard,
  logReplace,
  logDataFill,
  logSurname,
  logFilter,
  logLogin,
  logLogout,
  logUserManagement,
  logSettings,
  logPermissions,
  logDataAlteration,
  logMasterData,
  logMobileApp,
  logCustom
} = activityLogger;

export default activityLogger;
