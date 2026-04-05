export const clearUserSession = () => {
  try {
    localStorage.removeItem("userinfo");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userinfo");
    sessionStorage.removeItem("token");
  } catch (error) {
    console.log("clearUserSession error:", error);
  }
};

export const forceLogout = () => {
  clearUserSession();

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};