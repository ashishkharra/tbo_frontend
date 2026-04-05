import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// 🔹 same function yaha use karo
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});


// ✅ REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config: any) => {
    const headers = getAuthHeaders();

    config.headers = {
      ...config.headers,
      ...headers,
    };

    return config;
  },
  (error) => Promise.reject(error)
);


// ✅ RESPONSE INTERCEPTOR (IMPORTANT)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    const sessionExpired = error?.response?.data?.sessionExpired;

    const shouldLogout =
      status === 401 ||
      status === 403 ||
      sessionExpired === true ||
      message === "Session expired or invalid" ||
      message === "Invalid authentication token" ||
      message === "Unauthorized access" ||
      message === "Authentication failed";

    if (shouldLogout) {
      console.log("🚫 Session expired -> clearing localStorage");

      // 🔥 LOCALSTORAGE CLEAR
      localStorage.removeItem("userinfo");
      localStorage.removeItem("token");

      // optional: sessionStorage bhi
      sessionStorage.clear();

      // 🔥 REDIRECT
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;