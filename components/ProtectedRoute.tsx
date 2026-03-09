'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string;
  requiredResource?: string;
  requiredAction?: string;
  fallback?: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  requiredResource,
  requiredAction,
  fallback = <div>Access Denied</div>,
  redirectTo = '/login'
}) => {
  const { user, loading, hasRole, hasPermission, canAccess } = useAuth();
  const router = useRouter();

  console.log('🔍 ProtectedRoute - loading:', loading, 'user:', user, 'requiredRole:', requiredRole);

  useEffect(() => {
    if (!loading && !user) {
      // Check localStorage as fallback - sometimes state hasn't updated yet
      const storedUser = localStorage.getItem('userInfo');
      const storedToken = localStorage.getItem('authToken');
      
      if (!storedUser || !storedToken) {
        console.log('🔍 ProtectedRoute - redirecting to login, no user found in state or localStorage');
        router.push(redirectTo);
      } else {
        console.log('ℹ️ ProtectedRoute - User found in localStorage but not in state, waiting for state update...');
        // Give it a moment for state to update
        const timeout = setTimeout(() => {
          if (!user) {
            console.log('🔍 ProtectedRoute - State still not updated, redirecting to login');
            router.push(redirectTo);
          }
        }, 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [loading, user, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    console.log('🔍 ProtectedRoute - role check failed. User role:', user?.role, 'Required:', requiredRole);
    return fallback;
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback;
  }

  // Check resource access requirements
  if (requiredResource && requiredAction && !canAccess(requiredResource, requiredAction)) {
    return fallback;
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Convenience components for common use cases
export const SuperAdminOnly: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="super_admin">
    {children}
  </ProtectedRoute>
);

export const AdminOnly: React.FC<{ children: ReactNode; moduleId?: string }> = ({ children, moduleId = 'tbo-users' }) => {
  const { user, hasRole, hasModuleAccess, hasPermission } = useAuth();
  
  // Super admin and admin always have access
  if (user && (hasRole('super_admin') || hasRole('admin'))) {
    console.log(`✅ AdminOnly: User is ${user.role}, allowing access`);
    return <>{children}</>;
  }
  
  if (!user) {
    return <div>Access Denied</div>;
  }
  
  // Check if user has module access (checks both assignedModules and permissions)
  if (hasModuleAccess && typeof hasModuleAccess === 'function') {
    const hasAccess = hasModuleAccess(moduleId);
    console.log(`🔍 AdminOnly: Checking module access for ${moduleId}:`, {
      userRole: user.role,
      assignedModules: user.assignedModules,
      permissions: user.permissions,
      hasAccess
    });
    
    if (hasAccess) {
      console.log(`✅ AdminOnly: User has module access to ${moduleId}, allowing access`);
      return <>{children}</>;
    }
  }
  
  // Also check for permission-based access (e.g., "tbo-users:read", "tbo_users:read")
  if (hasPermission && typeof hasPermission === 'function') {
    const moduleIdVariants = [
      moduleId,
      moduleId.replace('-', '_'),
      moduleId.replace('_', '-')
    ];
    
    for (const variant of moduleIdVariants) {
      // Check for common permission patterns
      const permissionPatterns = [
        `${variant}:read`,
        `${variant}:write`,
        `${variant}:create`,
        `${variant}:update`,
        `${variant}:delete`,
        `${variant}:admin`,
        variant
      ];
      
      for (const perm of permissionPatterns) {
        if (hasPermission(perm)) {
          console.log(`✅ AdminOnly: User has permission ${perm}, allowing access`);
          return <>{children}</>;
        }
      }
    }
  }
  
  // Check if user has the module in their permissions array directly
  if (user.permissions && Array.isArray(user.permissions)) {
    const moduleIdVariants = [
      moduleId,
      moduleId.replace('-', '_'),
      moduleId.replace('_', '-'),
      moduleId.toLowerCase(),
      moduleId.replace('-', '_').toLowerCase()
    ];
    
    const hasModulePermission = user.permissions.some((perm: string) => {
      const permLower = perm.toLowerCase();
      return moduleIdVariants.some(variant => {
        const variantLower = variant.toLowerCase();
        return permLower.includes(variantLower) || 
               permLower.startsWith(`${variantLower}:`) ||
               permLower === variantLower;
      });
    });
    
    if (hasModulePermission) {
      console.log(`✅ AdminOnly: User has module permission in permissions array, allowing access`);
      return <>{children}</>;
    }
  }
  
  // No access
  console.log(`🚫 AdminOnly: Access denied. User role: ${user.role}, Module: ${moduleId}`, {
    assignedModules: user.assignedModules,
    permissions: user.permissions
  });
  return <div>Access Denied</div>;
};

export const AuthenticatedOnly: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    {children}
  </ProtectedRoute>
);
