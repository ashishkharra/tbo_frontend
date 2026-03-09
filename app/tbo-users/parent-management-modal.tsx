import React, { useState, useEffect, useCallback } from 'react';
import { X, UserCog, Search, UserPlus, Trash2, CheckCircle, AlertCircle, User as UserIcon, Phone, Users } from 'lucide-react';
import { apiService } from '../../services/api';
import { DeleteTboTeamMembers, getTboTeams, getTboUsers, PostTboTeamMembers } from '@/apis/api';

// Type Definitions
export type UserRole = 'super_admin' | 'admin' | 'coordinator' | 'data_entry_operator' | 'caller' | 'driver' | 'survey' | 'printer' | 'mobile_user' | 'leader' | 'volunteer' | 'user';

interface User {
  id: number;
  username: string;
  email: string;
  mobile?: string;
  role: UserRole;
  assignedModules?: string[];
  otherParents?: Array<{ id: number; username: string; role: UserRole }>;
  sub_members?: Array<{ id: number; username: string; role: UserRole }>;
}

interface ParentManagementModalProps {
  selectedUser: User | null;
  onClose: () => void;
  onSave: () => void;
  hasPermission: (permission: string) => boolean;
}

interface TeamMember extends User {
  otherParents?: Array<{ id: number; username: string; role: UserRole }>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T[];
  message?: string;
}

interface RoleOption {
  value: UserRole;
  label: string;
}

const AVAILABLE_ROLES: RoleOption[] = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'data_entry_operator', label: 'Data Entry Operator' },
  { value: 'caller', label: 'Caller' },
  { value: 'driver', label: 'Driver' },
  { value: 'survey', label: 'Survey' },
  { value: 'printer', label: 'Printer' },
  { value: 'mobile_user', label: 'Mobile User' },
  { value: 'leader', label: 'Leader' },
  { value: 'volunteer', label: 'Volunteer' }
];

export default function ParentManagementModal({
  selectedUser,
  onClose,
  onSave,
  hasPermission
}: ParentManagementModalProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [loginRole, setLoginRole] = useState<UserRole | ''>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [memberUsers, setMemberUsers] = useState<TeamMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Get user role from localStorage safely
  const getUserRole = (): UserRole | '' => {
    if (typeof window === 'undefined') return '';
    
    const user_info = localStorage.getItem('userInfo');
    if (!user_info) return '';
    
    try {
      const parsedUser = JSON.parse(user_info);
      return parsedUser.role || '';
    } catch {
      return '';
    }
  };

  const user_role = getUserRole();

  const filteredRoles = AVAILABLE_ROLES.filter(role => {
    // admin → super_admin hide
    if (user_role === 'admin') {
      return role.value !== 'super_admin';
    }
  
    // leader → admin & super_admin hide
    if (user_role === 'leader') {
      return role.value !== 'admin' && role.value !== 'super_admin';
    }
  
    return true;
  });

  // Debug logging
  console.log('ParentManagementModal rendered');
  console.log('selectedUser:', selectedUser);
  console.log('allUsers count:', allUsers.length);

  const fetchMemberUsers = useCallback(async (): Promise<void> => {
    if (!selectedUser) return;
    
    try {
      console.log('fetchMemberUsers called');
      setLoading(true);
      const res = await getTboTeams(selectedUser.id) as ApiResponse<User>;
      console.log('getUserMembers response:', res);
      
      if (res.success && res.data) {
        console.log('Members data received:', res.data);
        const membersWithParents = await Promise.all(
          res.data.map(async (member: User) => {
            try {
              const parentsRes = await getTboTeams(member.id) as ApiResponse<User>;
              console.log("parent res--->", parentsRes);
              
              if (parentsRes.success && parentsRes.data) {
                const otherParents = parentsRes.data.filter(
                  (parent: User) => parent.id !== selectedUser.id
                );
                return {
                  ...member,
                  otherParents: otherParents.map((p: User) => ({
                    id: p.id,
                    username: p.username,
                    role: p.role
                  }))
                } as TeamMember;
              }
              return { ...member, otherParents: [] } as TeamMember;
            } catch {
              console.error(`Error fetching parents for member ${member.id}`);
              return { ...member, otherParents: [] } as TeamMember;
            }
          })
        );
        console.log('Setting memberUsers:', membersWithParents.length);
        setMemberUsers(membersWithParents);
      } else {
        console.log('No members data or unsuccessful response');
        setMemberUsers([]);
      }
    } catch (error) {
      console.error('Error in fetchMemberUsers:', error);
      setMessage('Failed to fetch member users');
      setMemberUsers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  const fetchAllUsers = useCallback(async (): Promise<void> => {
    if (!selectedUser) return;
    
    try {
      console.log('fetchAllUsers called');
      setLoading(true);
      const res = await getTboUsers() as ApiResponse<User>;
      console.log('getTboUsers response:', res);
      
      if (res.success && res.data) {
        console.log('Total users received:', res.data.length);
        // Filter out the current user
        const filteredUsers = res.data.filter((u: User) => u.id !== selectedUser.id);
        console.log('Filtered users (excluding self):', filteredUsers.length);
        console.log('Sample users:', filteredUsers.slice(0, 3));
        setAllUsers(filteredUsers);
      } else {
        console.log('getTboUsers unsuccessful:', res);
        setMessage('Failed to fetch users - API returned unsuccessful');
        setAllUsers([]);
      }
    } catch (error) {
      console.error('Error in fetchAllUsers:', error);
      setMessage('Failed to fetch users - Network error');
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    console.log('useEffect triggered for data fetching');
    console.log('selectedUser exists:', !!selectedUser);
    
    if (selectedUser) {
      console.log('Fetching data for user:', selectedUser.id);
      const fetchData = async (): Promise<void> => {
        try {
          await fetchAllUsers();
          await fetchMemberUsers();
          console.log('Data fetching completed');
        } catch (error) {
          console.error('Error in data fetching:', error);
        }
      };
      
      fetchData();
    }
  }, [selectedUser, fetchAllUsers, fetchMemberUsers]);

  const handleAddMember = async (): Promise<void> => {
    if (!selectedMemberId) {
      setMessage('Please select a user to add as member');
      return;
    }

    if (!selectedUser) {
      setMessage('No user selected');
      return;
    }

    const alreadyExists = memberUsers.some(m => m.id === selectedMemberId);
    if (alreadyExists) {
      setMessage('This user is already a member');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const res = await PostTboTeamMembers({
        userId: selectedMemberId,
        parent_id: selectedUser.id
      }) as ApiResponse;
      
      if (res.success) {
        const memberUser = allUsers.find(u => u.id === selectedMemberId);
        
        // If loginRole exists (is truthy), it must be a UserRole (not empty string)
        if (loginRole && memberUser && memberUser.role !== loginRole) {
          // TypeScript now knows loginRole is UserRole here because we checked it's truthy
          await apiService.updateUser(selectedMemberId, { role: loginRole });
        }
        
        setMessage(`✅ User ${memberUser?.username || 'member'} added successfully!`);
        setSelectedMemberId(null);
        setLoginRole('');
        await Promise.all([fetchMemberUsers(), fetchAllUsers()]);
        setTimeout(() => {
          onSave();
        }, 1000);
      } else {
        setMessage(`❌ Error: ${res.message || 'Failed to add member'}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error?.message || 'Failed to add member'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: number): Promise<void> => {
    if (!selectedUser) return;
    
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const res = await DeleteTboTeamMembers(memberId, selectedUser.id) as ApiResponse;
      
      if (res.success) {
        setMessage('✅ Member removed successfully!');
        await Promise.all([fetchMemberUsers(), fetchAllUsers()]);
        setTimeout(() => {
          onSave();
        }, 1000);
      } else {
        setMessage(`❌ Error: ${res.message || 'Failed to remove member'}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error?.message || 'Failed to remove member'}`);
    } finally {
      setSaving(false);
    }
  };

  // Filter potential members
  const currentMemberIds = new Set(memberUsers.map(m => m.id));
  const filteredPotentialMembers = allUsers.filter(user => {
    // Exclude users who are already members
    if (currentMemberIds.has(user.id)) {
      return false;
    }
    
    // Filter by role if role is selected
    if (loginRole && user.role !== loginRole) {
      return false;
    }
    
    // Filter by search term
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.mobile && user.mobile.toLowerCase().includes(search)) ||
      user.role.toLowerCase().includes(search)
    );
  });

  console.log('filteredPotentialMembers count:', filteredPotentialMembers.length);
  console.log('loginRole:', loginRole);

  const getSelectOptionsText = (): string => {
    if (!loginRole) return '-- Please select a role first --';
    
    if (allUsers.length === 0) {
      return '-- Loading users... --';
    }
    
    const usersWithSelectedRole = allUsers.filter(user => user.role === loginRole);
    const availableUsers = usersWithSelectedRole.filter(user => !currentMemberIds.has(user.id));
    
    if (availableUsers.length === 0) {
      return `-- No users found for role: ${loginRole} --`;
    }
    
    if (searchTerm && filteredPotentialMembers.length === 0) {
      return `-- No users match your search for role: ${loginRole} --`;
    }
    
    return '-- Select a user to add as member --';
  };

  if (!selectedUser) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 w-[900px] max-h-[95vh] flex flex-col"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCog className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Team Management</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="font-medium">Parent: {selectedUser?.username} ({selectedUser?.role})</span>
                {selectedUser?.mobile && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <Phone className="w-3 h-3" />
                    {selectedUser.mobile}
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-600">
                  <Users className="w-3 h-3" />
                  Total Members: {memberUsers.length}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.includes('✅') ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Debug info */}
        <div className="mb-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Debug Info: All Users: {allUsers.length} | 
          Selected Role: {loginRole || 'None'} | 
          Filtered Users: {filteredPotentialMembers.length}
        </div>

        {/* Second Section: Login Role, Search, Select User, Add Member */}
        <div className="mb-4 flex-shrink-0">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login Role
              </label>
              <select
                value={loginRole}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const selectedRole = e.target.value as UserRole | '';
                  console.log('Role changed to:', selectedRole);
                  setLoginRole(selectedRole);
                  setSelectedMemberId(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
              >
                <option value="">-- Select Role --</option>
                {filteredRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <select
                value={selectedMemberId || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const memberId = e.target.value ? parseInt(e.target.value) : null;
                  console.log('Selected member ID:', memberId);
                  setSelectedMemberId(memberId);
                }}
                disabled={!loginRole || allUsers.length === 0}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                  !loginRole || allUsers.length === 0 
                    ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
                    : 'bg-white'
                }`}
              >
                <option value="" className="text-gray-500">
                  {getSelectOptionsText()}
                </option>
                {filteredPotentialMembers.map(user => (
                  <option key={user.id} value={user.id} className="text-gray-800">
                    {user.username} ({user.role}) {user.email ? `- ${user.email}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddMember}
                disabled={saving || !selectedMemberId || !loginRole}
                className={`w-full px-4 py-2 rounded-md text-white transition-colors flex items-center justify-center gap-2 font-medium ${
                  saving || !selectedMemberId || !loginRole
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{saving ? 'Adding...' : 'Add Member'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="flex-1 overflow-y-auto min-h-0 border border-gray-200 rounded-md">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading members...</p>
            </div>
          ) : memberUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No members yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    User Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Other Users
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Remove
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {memberUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {user.role || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {user.assignedModules && user.assignedModules.length > 0 
                        ? user.assignedModules.join(', ') 
                        : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <span className="text-gray-600">-</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {user.otherParents && user.otherParents.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.otherParents.map((parent) => (
                            <span
                              key={parent.id}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
                            >
                              {parent.username}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                      <button
                        onClick={() => handleRemoveMember(user.id)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}