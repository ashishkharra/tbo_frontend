"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { getProfile, logout as logoutApi } from "../apis/api";

interface User {
  id: number | string;
  username?: string;
  name?: string;
  email?: string;
  mobile?: string;
  role?: string;
  role_id?: number | string;
  permissions?: any;
  module_permissions?: any;
  permission_code?: any;
  assignedModules?: string[];
  assignedSubModules?: string[];
  assignedDatasets?: string[];
  modules_code?: any;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  getAccessibleResources: () => Record<string, string[]>;
  hasModuleAccess: (moduleId: string) => boolean;
  getAssignedModules: () => string[];
  hasDatasetAccess: (datasetId: string) => boolean;
  getAssignedDatasets: () => string[];
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeArray = (value: any): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch (_) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const normalizeUser = (rawUser: any): User => {
  if (!rawUser) return rawUser;

  return {
    ...rawUser,
    assignedModules: normalizeArray(
      rawUser.assignedModules ||
        rawUser.assigned_modules ||
        rawUser.modules ||
        rawUser.module_ids
    ),
    assignedSubModules: normalizeArray(
      rawUser.assignedSubModules ||
        rawUser.assigned_sub_modules ||
        rawUser.subModules ||
        rawUser.sub_module_ids
    ),
    assignedDatasets: normalizeArray(
      rawUser.assignedDatasets ||
        rawUser.assigned_datasets ||
        rawUser.datasets ||
        rawUser.dataset_ids
    ),
    modules_code: rawUser.modules_code || null,
  };
};

const getStoredToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("sessionToken") ||
    localStorage.getItem("session_token")
  );
};

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  const storedUser = localStorage.getItem("userInfo");
  if (!storedUser) return null;

  try {
    return normalizeUser(JSON.parse(storedUser));
  } catch {
    return null;
  }
};

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setLoading(true);

      const token = getStoredToken();

      console.log('yyyyyyyyy')

      if (!token) {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("userInfo");
        }
        return;
      }

      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        return;
      }

      const res = await getProfile();
      const profileUser = res?.data?.user || res?.user || res?.data || null;

      if (profileUser) {
        const normalized = normalizeUser(profileUser);
        setUser(normalized);
        if (typeof window !== "undefined") {
          localStorage.setItem("userInfo", JSON.stringify(normalized));
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("userInfo");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const isLoginPage = pathname === "/login";
        const token = getStoredToken();

        // login page par profile call mat karo
        if (isLoginPage && !token) {
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        // token hi nahi hai to getProfile call mat karo
        if (!token) {
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        // pehle localStorage user use karo
        const storedUser = getStoredUser();
        if (storedUser) {
          if (isMounted) {
            setUser(storedUser);
            setLoading(false);
          }
          return;
        }

        const response: any = await getProfile();

        if (!isMounted) return;

        const profileUser =
          response?.data?.user || response?.user || response?.data || null;

        if (profileUser) {
          const normalized = normalizeUser(profileUser);
          setUser(normalized);
          localStorage.setItem("userInfo", JSON.stringify(normalized));
        } else {
          setUser(null);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("session_token");
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      }
    }
  };

  const hasRole = (roles: string | string[]) => {
    if (!user?.role) return false;

    if (Array.isArray(roles)) {
      return roles.includes(String(user.role));
    }

    return String(user.role) === String(roles);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;

    const permissions = user.permissions;
    if (!permissions) return false;

    if (Array.isArray(permissions)) {
      return permissions.includes(permission);
    }

    if (typeof permissions === "string") {
      try {
        const parsed = JSON.parse(permissions);
        if (Array.isArray(parsed)) return parsed.includes(permission);
      } catch (_) {
        return permissions
          .split(",")
          .map((p) => p.trim())
          .includes(permission);
      }
    }

    if (typeof permissions === "object") {
      return !!permissions[permission];
    }

    return false;
  };

  const canAccess = (resource: string, action: string) => {
    if (!user) return false;

    const modulePermissions = user.module_permissions;
    if (!modulePermissions) return false;

    let parsedPermissions: any = modulePermissions;

    if (typeof modulePermissions === "string") {
      try {
        parsedPermissions = JSON.parse(modulePermissions);
      } catch (_) {
        return false;
      }
    }

    if (
      parsedPermissions &&
      parsedPermissions[resource] &&
      Array.isArray(parsedPermissions[resource])
    ) {
      return parsedPermissions[resource].includes(action);
    }

    return false;
  };

  const getAccessibleResources = () => {
    if (!user?.module_permissions) return {};

    let parsedPermissions: any = user.module_permissions;

    if (typeof user.module_permissions === "string") {
      try {
        parsedPermissions = JSON.parse(user.module_permissions);
      } catch (_) {
        return {};
      }
    }

    return parsedPermissions || {};
  };

  const hasModuleAccess = (moduleId: string) => {
    if (!user) return false;
    const assignedModules = normalizeArray(user.assignedModules);
    return assignedModules.includes(String(moduleId));
  };

  const getAssignedModules = () => {
    if (!user) return [];
    return normalizeArray(user.assignedModules);
  };

  const hasDatasetAccess = (datasetId: string) => {
    if (!user) return false;
    const assignedDatasets = normalizeArray(user.assignedDatasets);
    return assignedDatasets.includes(String(datasetId));
  };

  const getAssignedDatasets = () => {
    if (!user) return [];
    return normalizeArray(user.assignedDatasets);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      logout,
      hasRole,
      hasPermission,
      canAccess,
      getAccessibleResources,
      hasModuleAccess,
      getAssignedModules,
      hasDatasetAccess,
      getAssignedDatasets,
      refreshUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};