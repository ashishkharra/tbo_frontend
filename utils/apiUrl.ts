// API URL Utility
// Centralized way to get API base URL across all components

import apiClient, { getBaseURL } from '../services/apiClient';

// Get the current API base URL
export const getAPIBaseURL = () => {
  return getBaseURL();
};

// Get API URL for a specific endpoint
export const getAPIURL = (endpoint: string) => {
  const baseURL = getAPIBaseURL();
  return `${baseURL}${endpoint}`;
};

// Legacy support - for components that still use the old pattern
export const getLegacyAPIURL = () => {
  return getAPIBaseURL();
};

// Environment-aware API URL getter
export const getEnvironmentAPIURL = (env?: string) => {
  if (env) {
    const originalEnv = apiClient.getCurrentEnvironment();
    apiClient.switchEnvironment(env);
    const url = getBaseURL();
    apiClient.switchEnvironment(originalEnv);
    return url;
  }
  return getAPIBaseURL();
};

// Export the apiClient for direct usage
export { apiClient };
export default getAPIBaseURL;
