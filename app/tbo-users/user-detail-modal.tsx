import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, CheckCircle, Clock, AlertCircle, Send, Users, Shield, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { ChangeOwnPassword } from '@/apis/api';

interface UserDetailModalProps {
  selectedUser: any;
  editedUser: any;
  setEditedUser: (user: any) => void;
  dirtyFields: Set<string>;
  setDirtyFields: (fields: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setShowUserDetails: (show: boolean) => void;
  onSave: () => void;
  onDelete: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole?: (roles: string | string[]) => boolean;
  USER_ROLES: Array<{ value: string; label: string }>;
  availableDatasets?: any[];
  datasetColumns?: any;
  availablePermissions?: string[];
  isSaving?: boolean;
  saveMessage?: string;
}

export default function UserDetailModal({
  selectedUser,
  editedUser,
  setEditedUser,
  dirtyFields,
  setDirtyFields,
  setShowUserDetails,
  onSave,
  onDelete,
  hasPermission,
  hasRole,
  USER_ROLES,
  availablePermissions = [],
  isSaving = false,
  saveMessage = ''
}: UserDetailModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordFields, setChangePasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Email verification state
  const [adminEmail, setAdminEmail] = useState('');
  const [emailVerificationStatus, setEmailVerificationStatus] = useState({
    emailVerified: false,
    emailVerificationSentAt: '',
    emailVerificationExpiresAt: '',
    adminVerificationEmail: ''
  });
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  
  useEffect(() => {
    if (selectedUser?.id && (hasRole?.('super_admin') || hasRole?.('admin'))) {
      loadEmailVerificationStatus();
    }
  }, [selectedUser?.id]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserDetails(false);
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [setShowUserDetails]);

  const loadEmailVerificationStatus = async () => {
    try {
      const response = await apiService.getEmailVerificationStatus(selectedUser.id);
      if (response.success && response.data) {
        setEmailVerificationStatus({
          emailVerified: response.data.emailVerified || false,
          emailVerificationSentAt: response.data.emailVerificationSentAt || '',
          emailVerificationExpiresAt: response.data.emailVerificationExpiresAt || '',
          adminVerificationEmail: response.data.adminVerificationEmail || ''
        });
        setAdminEmail(response.data.adminVerificationEmail || '');
      }
    } catch (error) {
      console.error('Failed to load email verification status:', error);
    }
  };

  const handleSendEmailVerification = async () => {
    if (!adminEmail.trim()) {
      setVerificationMessage('Please enter admin email address');
      return;
    }
    setIsSendingVerification(true);
    setVerificationMessage('');
    try {
      const response = await apiService.sendEmailVerification(selectedUser.id, adminEmail);
      if (response.success) {
        setVerificationMessage('Verification email sent successfully!');
        await loadEmailVerificationStatus();
        setDirtyFields((prev: Set<string>) => new Set([...prev, 'adminVerificationEmail']));
      } else {
        setVerificationMessage(response.message || 'Failed to send verification email');
      }
    } catch (error) {
      setVerificationMessage('Failed to send verification email');
    } finally {
      setIsSendingVerification(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowUserDetails(false);
        }}
      >
        <div
          className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h3 className="text-xl font-semibold text-gray-800">User Settings • {selectedUser?.username || selectedUser?.email || 'Unknown User'}</h3>
            <button onClick={() => setShowUserDetails(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={editedUser?.username || ''}
                    onChange={(e) => {
                      setEditedUser((prev: any) => prev ? ({ ...prev, username: e.target.value }) : prev);
                      setDirtyFields((prev: Set<string>) => new Set([...prev, 'username']));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedUser?.email || ''}
                    onChange={(e) => {
                      setEditedUser((prev: any) => prev ? ({ ...prev, email: e.target.value }) : prev);
                      setDirtyFields((prev: Set<string>) => new Set([...prev, 'email']));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authenticated Email</label>
                  <input
                    type="email"
                    value={editedUser?.authenticatedEmail || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                    placeholder="No authenticated email set"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editedUser?.mobile || ''}
                    onChange={(e) => {
                      setEditedUser((prev: any) => prev ? ({ ...prev, mobile: e.target.value }) : prev);
                      setDirtyFields((prev: Set<string>) => new Set([...prev, 'mobile']));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={editedUser?.password || ''}
                      onChange={(e) => {
                        setEditedUser((prev: any) => prev ? ({ ...prev, password: e.target.value }) : prev);
                        setDirtyFields((prev: Set<string>) => new Set([...prev, 'password']));
                      }}
                      placeholder={selectedUser && selectedUser.id > 0 && !showPassword ? "••••••••" : "Enter new password"}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {selectedUser && selectedUser.id > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Existing password is hidden for security. To leave it unchanged, keep this field blank.
                    </p>
                  )}
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                      onClick={() => setShowChangePasswordModal(true)}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editedUser?.role || 'user'}
                    onChange={(e) => {
                      setEditedUser((prev: any) => prev ? ({ ...prev, role: e.target.value }) : prev);
                      setDirtyFields((prev: Set<string>) => new Set([...prev, 'role']));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {USER_ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editedUser?.isActive ? 'active' : 'inactive'}
                    onChange={(e) => {
                      setEditedUser((prev: any) => prev ? ({ ...prev, isActive: e.target.value === 'active' }) : prev);
                      setDirtyFields((prev: Set<string>) => new Set([...prev, 'isActive']));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Login Access Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Login Access</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(!editedUser?.permissions?.includes('login:web') && !editedUser?.permissions?.includes('login:app')) || editedUser?.permissions?.includes('login:web')}
                    onChange={(e) => {
                      const perms = editedUser?.permissions || [];
                      const hasWeb = perms.includes('login:web');
                      const hasApp = perms.includes('login:app');
                      const isLegacy = !hasWeb && !hasApp;
                      const currentApp = isLegacy || hasApp;
                      let newPerms = perms.filter((p: string) => p !== 'login:web' && p !== 'login:app');
                      if (e.target.checked) newPerms.push('login:web');
                      if (currentApp) newPerms.push('login:app');
                      setEditedUser((prev: any) => ({ ...prev, permissions: newPerms }));
                      setDirtyFields((prev: Set<string>) => new Set([...prev, 'permissions']));
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Web Login</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(!editedUser?.permissions?.includes('login:web') && !editedUser?.permissions?.includes('login:app')) || editedUser?.permissions?.includes('login:app')}
                    onChange={(e) => {
                      const perms = editedUser?.permissions || [];
                      const hasWeb = perms.includes('login:web');
                      const hasApp = perms.includes('login:app');
                      const isLegacy = !hasWeb && !hasApp;
                      const currentWeb = isLegacy || hasWeb;
                      let newPerms = perms.filter((p: string) => p !== 'login:web' && p !== 'login:app');
                      if (currentWeb) newPerms.push('login:web');
                      if (e.target.checked) newPerms.push('login:app');
                      setEditedUser((prev: any) => ({ ...prev, permissions: newPerms }));
                      setDirtyFields((prev: Set<string>) => new Set([...prev, 'permissions']));
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>App Login</span>
                </label>
              </div>
              {(hasRole?.('super_admin') || hasRole?.('admin')) && (
                <p className="text-xs text-gray-500 mt-2">
                  Note: Unchecking both options will reset to default access (both allowed). To block access, set Status to Inactive.
                </p>
              )}
            </div>
            {/* Email Verification Section */}
            <div className="border-t pt-4">
              {verificationMessage && (
                <div className={`p-2 rounded-lg text-sm mt-2 ${verificationMessage.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {verificationMessage}
                </div>
              )}
            </div>
          </div>
          {/* Email Linking Status */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Email Status:</span>
              </div>
              <div className="flex items-center gap-2">
                {emailVerificationStatus.emailVerified ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Linked</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-700">Not Linked</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 flex-shrink-0">
            {saveMessage && (
              <div className={`text-sm px-3 py-2 rounded flex items-center ${saveMessage.toLowerCase().includes('success') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {saveMessage}
              </div>
            )}
            <button
              onClick={onSave}
              disabled={!editedUser || dirtyFields.size === 0 || isSaving}
              className={`px-4 py-2 rounded text-white ${dirtyFields.size > 0 && !isSaving ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            {hasPermission('users:delete') && (
              <button
                onClick={onDelete}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
            )}
            <button onClick={() => setShowUserDetails(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </div>
      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowChangePasswordModal(false)}>
          <div className="bg-white rounded-lg p-6 w-[400px] flex flex-col relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowChangePasswordModal(false)}>
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h4>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setChangePasswordError('');
                setChangePasswordSuccess('');
                const { currentPassword, newPassword, confirmPassword } = changePasswordFields;
                if (!currentPassword || !newPassword || !confirmPassword) {
                  setChangePasswordError('All fields are required.');
                  return;
                }
                if (newPassword.length < 6) {
                  setChangePasswordError('New password must be at least 6 characters.');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setChangePasswordError('New password and confirm password do not match.');
                  return;
                }
                setIsChangingPassword(true);
                try {
                  const response = await ChangeOwnPassword(selectedUser?.id,{currentPassword, newPassword});
                  if (response.success) {
                    setChangePasswordSuccess('Password changed successfully!');
                    setChangePasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  } else {
                    setChangePasswordError(response.message || 'Failed to change password.');
                  }
                } catch (err) {
                  setChangePasswordError('Failed to change password.');
                } finally {
                  setIsChangingPassword(false);
                }
              }}
            >
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={changePasswordFields.currentPassword}
                  onChange={e => setChangePasswordFields(f => ({ ...f, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="current-password"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={changePasswordFields.newPassword}
                    onChange={e => setChangePasswordFields(f => ({ ...f, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={changePasswordFields.confirmPassword}
                  onChange={e => setChangePasswordFields(f => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="new-password"
                />
              </div>
              {changePasswordError && (
                <div className="text-sm text-red-600 mb-2">{changePasswordError}</div>
              )}
              {changePasswordSuccess && (
                <div className="text-sm text-green-600 mb-2">{changePasswordSuccess}</div>
              )}
              <button
                type="submit"
                disabled={isChangingPassword}
                className={`w-full py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 ${isChangingPassword ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
