'use client';

import { useState, useEffect } from 'react';
import { User, Shield, Activity, Smartphone, ChevronDown, LogOut, Settings, BarChart3, FileText, Database, Users, X, AlertTriangle, Power } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { apiService } from '../services/api';

export default function TBOUserNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState('');

  // Menu options
  const menuOptions: Array<{
    id: string;
    label: string;
    icon: any;
    path?: string;
    action?: string;
    adminOnly?: boolean;
  }> = [
      { id: 'users', label: 'Users', icon: Users, path: '/tbo-users' },
      // { id: 'permissions', label: 'Permissions', icon: Shield, action: 'permissions' },
      { id: 'activities', label: 'Activities', icon: Activity, path: '/activities' },
      { id: 'verification-requests', label: 'Verification Requests', icon: AlertTriangle, path: '/admin/verification-requests', adminOnly: true },
      { id: 'user-update-report', label: 'User Update Report', icon: FileText, path: '/user-update-report' },
      { id: 'data-update', label: 'Data Update', icon: Database, path: '/data-update' },
      // { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
      // { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
      // { id: 'data_management', label: 'Data Management', icon: Database, path: '/data-management' },
      // { id: 'import_export', label: 'Import/Export', icon: FileText, path: '/import-export' }
    ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showMenu && !target.closest('.navbar-menu')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Helper function to check if a menu item is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleMenuClick = (option: any) => {
    if (option.action === 'permissions') {
      // Navigate to permissions page
      router.push('/permissions');
      setShowMenu(false);
    } else if (option.path) {
      router.push(option.path);
      setShowMenu(false); // Only needed for mobile
    }
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Section - Left Side */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            >
              <img
                src="/logo.png"
                alt="THE BIG OWL Logo"
                className="w-10 h-10 object-contain flex-shrink-0"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-800">THE BIG OWL</h1>
              </div>
            </button>
          </div>

          {/* Menu Section - Center */}
          <div className="flex-1 flex justify-center">
            <div className="hidden lg:flex items-center space-x-1">
              {menuOptions.map((option) => {
                // Filter admin-only options
                if (option.adminOnly && user && !['super_admin', 'admin'].includes(user.role ?? '')) {
                  return null;
                }
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleMenuClick(option)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-md transition-all duration-200 font-medium text-sm cursor-pointer ${option.path && isActive(option.path)
                      ? 'bg-gray-200 text-gray-900 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <div className="relative navbar-menu">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <span className="text-gray-700 font-medium">Menu</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                </button>

                {showMenu && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      {menuOptions.map((option) => {
                        // Filter admin-only options
                        if (option.adminOnly && user && !['super_admin', 'admin'].includes(user.role ?? '')) {
                          return null;
                        }
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleMenuClick(option)}
                            className={`flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${option.path && isActive(option.path) ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500' : 'text-gray-700'
                              }`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="font-medium">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Information Section - Right Side */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {user && (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="hidden md:flex flex-col items-end">
                  <div className="flex items-center flex-col space-x-2">
                    <span className="font-bold uppercase text-[12px] text-gray-900">{user.username}</span>
                    <span className="text-xs font-extralight text-blue-800 rounded-full capitalize">
                      {user.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="flex items-center border space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                  title="Logout"
                >
                  <Power className="w-4 h-4 cursor-pointer font-bold" size={28}/>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
  );
}
