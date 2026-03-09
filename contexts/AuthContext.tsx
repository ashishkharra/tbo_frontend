"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiService } from "../services/api";
import { activityLogger } from "../utils/activityLogger";
import { getProfile } from "@/apis/api";

export interface User {
  id: number;
  username: string;
  email: string;
  mobile?: string;
  role:
    | "super_admin"
    | "admin"
    | "coordinator"
    | "data_entry_operator"
    | "caller"
    | "driver"
    | "survey"
    | "printer"
    | "mobile_user"
    | "leader"
    | "volunteer"
    | "user";
  permissions: string[];
  assignedModules: string[];
  assignedSubModules: string[];
  assignedDatasets?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  createdBy?: number;
  address?: string;
  location?: string;
  hierarchicalDataAssignment?: any;
  modules_code?: string | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  sessionToken: string | null;
  loading: boolean;
  login: (
    mobile: string,
    password: string,
    options?: {
      deviceId?: string;
      verificationCode?: string;
      deviceVerificationCode?: string;
    }
  ) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  getAccessibleResources: () => Record<string, string[]>;
  hasModuleAccess: (moduleId: string) => boolean;
  getAssignedModules: () => string[];
  hasDatasetAccess: (datasetId: string) => boolean;
  getAssignedDatasets: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  // Debug log (optional - remove in production)
  useEffect(() => {
    if (context) {
      console.log("🔍 useAuth context:", {
        user: context.user ? `ID: ${context.user.id}` : "null",
        token: context.token ? "exists" : "null",
        loading: context.loading,
      });
    }
  }, [context]);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  console.log("AuthProvider: user state initialized to", user?.id || "null");
  const [token, setToken] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  // Check for existing token on mount
  useEffect(() => {
    // Safety timeout to ensure loading is always set to false
    const timeoutId = setTimeout(() => {
      console.warn("⚠️ Auth initialization timeout - forcing loading to false");
      setLoading(false);
    }, 10000); // 10 second timeout

    const initAuth = async () => {
      // Ensure we're in the browser (not SSR)
      if (typeof window === "undefined") {
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }

      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("userInfo");
        const storedSessionToken = localStorage.getItem("sessionToken");
        if (storedToken && storedUser) {
          try {
            const userData = JSON.parse(storedUser);

            setUser(userData);
            setToken(storedToken);

            if (storedSessionToken) {
              setSessionToken(storedSessionToken);
            }
            console.log(" AuthContext: Attempting profile verification...");
            getProfile()
              .then((response) => {
                console.log("AuthContext: Profile verification successful");
                // Update user with fresh data from server
                const userWithModules = {
                  ...response.data.user,
                  assignedModules: response.data.user.assignedModules || [],
                  assignedSubModules:
                    response.data.user.assignedSubModules || [],
                };
                setUser(userWithModules);
                localStorage.setItem(
                  "userInfo",
                  JSON.stringify(userWithModules)
                );
              })
              .catch((error) => {
                console.warn(
                  "AuthContext: Profile verification failed (non-critical):",
                  error.message
                );
                console.log("ℹ️ AuthContext: Continuing with stored user data");
              });
          } catch (error) {
            console.error("Invalid stored user data:", error);
            // Optional: Clear invalid storage
            // localStorage.removeItem('token');
            // localStorage.removeItem('userInfo');
            // localStorage.removeItem('sessionToken');
          }
        } else {
          console.log("ℹ️ AuthContext: No stored auth data found");
        }
      } catch (error) {
        console.error("Error in initAuth:", error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initAuth();
    return () => {
      clearTimeout(timeoutId);
    };
  }, []); 

  const login = async (
    mobile: string,
    password: string,
    options?: {
      deviceId?: string;
      verificationCode?: string;
      deviceVerificationCode?: string;
    }
  ) => {
    try {
      console.log(" AuthContext: Starting login process for mobile:", mobile);
      const response = await apiService.login({
        mobile,
        password,
        deviceId: options?.deviceId,
        verificationCode: options?.verificationCode,
        deviceVerificationCode: options?.deviceVerificationCode,
      });

      console.log("AuthContext: Login response received:", {
        success: response.success,
        hasData: !!response.data,
        hasUser: !!response.data?.user,
        hasToken: !!response.data?.token,
      });

      if (!response.success || !response.data) {
        console.error("❌ AuthContext: Invalid login response structure");
        throw new Error("Invalid login response");
      }

      const userWithModules: User = {
        ...response.data.user,
        assignedModules: (response.data.user as any).assignedModules || [],
        assignedSubModules:
          (response.data.user as any).assignedSubModules || [],
        assignedDatasets: (response.data.user as any).assignedDatasets || [],
        modules_code: (response.data.user as any).modules_code || null,
      };

      console.log("🔐 AuthContext: Setting user state and token");
      setUser(userWithModules);
      setToken(response.data.token);
      if (response.data.sessionToken) {
        setSessionToken(response.data.sessionToken);
        localStorage.setItem("sessionToken", response.data.sessionToken);
        console.log("🔐 AuthContext: Session token stored");
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      console.log(
        "AuthContext: Login successful, token and user info stored"
      );

      try {
        await activityLogger.logLogin(
          `User logged in: ${response.data.user.username} (${
            response.data.user.email || response.data.user.mobile || "n/a"
          })`
        );
      } catch (logError) {
        console.warn(
          "AuthContext: Activity logging failed (non-critical):",
          logError
        );
      }
    } catch (error: any) {
      console.error("AuthContext: Login error:", error);
      if (error?.requireVerificationCode) {
        throw error;
      }
      throw error;
    }
  };

  const logout = async () => {
    if (user) {
      await activityLogger.logLogout(
        `User logged out: ${user.username} (${
          user.email || user.mobile || "n/a"
        })`
      );
    }

    setUser(null);
    setToken(null);
    setSessionToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("sessionToken");
    window.location.href = "/login";
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  };

  const hasPermission = (permission: string): boolean => {
    console.log(
      `🔍 Checking permission: "${permission}" for user: ${user || "n/a"}`
    );
    
    if (!user) return false;
  
    if (user.role === "super_admin") return true;
    
    if (user.role === "admin") {
      if (
        !user.permissions ||
        user.permissions.length === 0 ||
        user.permissions.includes("*")
      ) {
        return true;
      }
      return user.permissions ? user.permissions.includes(permission) : false;
    }
    
    if (!user.permissions || !Array.isArray(user.permissions)) {
      return false;
    }
    return user.permissions.includes(permission);
  };

  const canAccess = (resource: string, action: string): boolean => {
    const permission = `${resource}:${action}`;
    return hasPermission(permission);
  };

  const getAccessibleResources = (): Record<string, string[]> => {
    if (!user) return {};

    const resources = {
      users: ["read", "create", "update", "delete"],
      voters: ["read", "create", "update", "delete"],
      surnames: ["read", "create", "update", "delete"],
      reports: ["read", "generate"],
      settings: ["read", "update"],
      master_filters: ["read", "update"],
    };

    if (user.role === "super_admin") {
      return resources;
    }

    const accessible: Record<string, string[]> = {};
    for (const [resource, actions] of Object.entries(resources)) {
      accessible[resource] = actions.filter((action) =>
        canAccess(resource, action)
      );
    }

    return accessible;
  };

  const hasModuleAccess = (moduleId: string): boolean => {
    if (!user) return false;

    // Super admin has access to all modules
    if (user.role === "super_admin") return true;

    // Check if user has this module assigned
    if (
      user.assignedModules &&
      Array.isArray(user.assignedModules) &&
      user.assignedModules.includes(moduleId)
    ) {
      return true;
    }

    // Also check permissions - if user has any permission related to this module
    if (user.permissions && Array.isArray(user.permissions)) {
      // Check for module-specific permissions (e.g., "tbo-users:read", "tbo_users:read")
      const moduleIdVariants = [
        moduleId,
        moduleId.replace("-", "_"),
        moduleId.replace("_", "-"),
      ];

      const hasModulePermission = user.permissions.some((perm: string) => {
        // Check if permission contains the module ID (e.g., "tbo-users:read" contains "tbo-users")
        return moduleIdVariants.some(
          (variant) =>
            perm.toLowerCase().includes(variant.toLowerCase()) ||
            perm.toLowerCase().startsWith(`${variant.toLowerCase()}:`)
        );
      });

      if (hasModulePermission) {
        return true;
      }
    }

    return false;
  };

  const getAssignedModules = (): string[] => {
    if (!user) return [];

    // Super admin has access to all modules
    if (user.role === "super_admin") {
      return [
        "dataset",
        "mobile-settings",
        "tbo-users",
        "callers",
        "data-entry",
        "master-setting",
        "current-voter-data",
        "blank-voter-analysis",
        "volunteers",
        "result-analysis",
        "master-map-india",
        "leader",
        "vehicle-driver",
        "election-controller",
      ];
    }

    return user.assignedModules || [];
  };

  const hasDatasetAccess = (datasetId: string): boolean => {
    if (!user) return false;

    // Super admin has access to all datasets
    if (user.role === "super_admin") return true;

    // Check if user has this dataset assigned
    // Datasets are now stored in assignedModules, but also check assignedDatasets for backward compatibility
    const hasInModules = !!(
      user.assignedModules && user.assignedModules.includes(datasetId)
    );
    const hasInDatasets = !!(
      user.assignedDatasets && user.assignedDatasets.includes(datasetId)
    );

    return hasInModules || hasInDatasets;
  };

  const getAssignedDatasets = (): string[] => {
    if (!user) return [];

    // Super admin has access to all datasets (will be filtered by available datasets)
    if (user.role === "super_admin") {
      return []; // Return empty array - super admin sees all datasets
    }

    // Get datasets from assignedModules (new way) and assignedDatasets (backward compatibility)
    const fromModules = user.assignedModules || [];
    const fromDatasets = user.assignedDatasets || [];

    // Combine and deduplicate
    const allDatasets = [...new Set([...fromModules, ...fromDatasets])];

    // Filter to only return dataset IDs (you can customize this logic based on your dataset ID patterns)
    // For now, return all IDs - the filtering will happen at the display level
    return allDatasets;
  };

  const value: AuthContextType = {
    user,
    token,
    sessionToken,
    loading,
    login,
    logout,
    hasRole,
    hasPermission,
    canAccess,
    getAccessibleResources,
    hasModuleAccess,
    getAssignedModules,
    hasDatasetAccess,
    getAssignedDatasets,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
