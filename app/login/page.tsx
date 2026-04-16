"use client";

import { useMemo, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  Lock,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
} from "lucide-react";
import useGuest from "../hook/useGuest";
import {
  initiateLoginApi,
  verifyDeviceOtpApi,
  verifyUserOtpApi,
} from "../../apis/api";
import { useAuth as useAuthContext } from "../../contexts/AuthContext";

interface UserData {
  id?: number;
  username?: string;
  email?: string;
  mobile_no?: string;
  role?: string;
  role_id?: number;
  permission_set_id?: number;
  [key: string]: any;
}

interface InitiateLoginResponse {
  success: boolean;
  message?: string;
  data?: {
    flow?: "SESSION_ACTIVE" | "DEVICE_OTP_SENT" | "USER_OTP_SENT" | "DIRECT_LOGIN";
    otp_required?: boolean;
    session_active?: boolean;
    otp_type?: string;
    masked_authenticated_mobile?: string;
    masked_authenticated_email?: string;
    otp_expires_at?: string;
    otp_request_id?: number;
    device_already_verified?: boolean;
    user_already_verified?: boolean;
    next_step?: "VERIFY_DEVICE_OTP" | "VERIFY_USER_OTP";
    user?: UserData;
    token?: string;
    session_token?: string;
  };
}

interface VerifyDeviceOtpResponse {
  success: boolean;
  message?: string;
  data?: {
    flow?: "DIRECT_LOGIN" | "USER_OTP_SENT";
    next_step?: "VERIFY_USER_OTP";
    otp_type?: "USER_VERIFICATION_OTP";
    otp_request_id?: number;
    masked_authenticated_mobile?: string;
    masked_authenticated_email?: string;
    otp_expires_at?: string;
    token?: string;
    session_token?: string;
    user?: UserData;
  };
}

interface VerifyUserOtpResponse {
  success: boolean;
  message?: string;
  data?: {
    flow?: "DIRECT_LOGIN";
    session_token?: string;
    token?: string;
    user?: UserData;
    expires_at?: string;
  };
}

type StepType = "LOGIN" | "DEVICE_OTP" | "USER_OTP";

interface DevicePayload {
  platform: "WEB";
  generated_device_id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  user_agent: string;
  login_access_requested: "web";
}

const MOBILE_REGEX = /^[6-9]\d{9}$/;

const getBrowserName = () => {
  if (typeof window === "undefined") return "Unknown Browser";
  const ua = navigator.userAgent;

  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";

  return "Unknown Browser";
};

const getOSName = () => {
  if (typeof window === "undefined") return "Unknown OS";
  const ua = navigator.userAgent;

  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";

  return "Unknown OS";
};

const DEVICE_INSTALLATION_ID_KEY = "app_device_installation_id";

const getOrCreateGeneratedDeviceId = () => {
  if (typeof window === "undefined") return "web_unknown_device";

  try {
    const existing = localStorage.getItem(DEVICE_INSTALLATION_ID_KEY);
    if (existing && String(existing).trim()) {
      return String(existing).trim();
    }

    const newId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

    localStorage.setItem(DEVICE_INSTALLATION_ID_KEY, newId);
    return newId;
  } catch (error) {
    return `dev_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
};

const getDevicePayload = (): DevicePayload => {
  const browser = getBrowserName();
  const os = getOSName();
  const generatedDeviceId = getOrCreateGeneratedDeviceId();

  return {
    platform: "WEB",
    generated_device_id: generatedDeviceId,
    device_id: generatedDeviceId,
    device_name: `${browser} on ${os}`,
    device_type: "Desktop",
    browser,
    os,
    ip_address: "",
    user_agent: typeof window !== "undefined" ? navigator.userAgent : "",
    login_access_requested: "web",
  };
};

export default function LoginPage() {
  const checking = useGuest();
  const router = useRouter();
  const { refreshUser } = useAuthContext();

  const [step, setStep] = useState<StepType>("LOGIN");

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [deviceOtp, setDeviceOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [otpRequestId, setOtpRequestId] = useState<number | null>(null);
  const [maskedAuthenticatedMobile, setMaskedAuthenticatedMobile] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState("");
  const [otpType, setOtpType] = useState("");
  const [deviceAlreadyVerified, setDeviceAlreadyVerified] = useState(false);

  const deviceInfo = useMemo(() => getDevicePayload(), []);

  if (checking) return null;

  const validateMobile = (value: string) => MOBILE_REGEX.test(value.trim());

  const persistLogin = async (token?: string, user?: UserData) => {
    if (typeof window !== "undefined" && token) {
      localStorage.setItem("token", token);
      localStorage.setItem("authToken", token);
      localStorage.setItem("sessionToken", token);
      localStorage.setItem("session_token", token);
    }

    if (typeof window !== "undefined" && user) {
      localStorage.setItem("userInfo", JSON.stringify(user));

      if (user.last_login) {
        localStorage.setItem("last_login", user.last_login);
      } else {
        // fallback → current time
        localStorage.setItem("last_login", new Date().toISOString());
      }
    }

    try {
      await refreshUser?.();
    } catch (err) {
      console.log("refreshUser error:", err);
    }

    router.replace("/");
    router.refresh();
  };

  const formatExpiryText = () => {
    if (!otpExpiresAt) return "";
    const date = new Date(otpExpiresAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  const resetOtpState = () => {
    setDeviceOtp("");
    setUserOtp("");
    setOtpRequestId(null);
    setMaskedAuthenticatedMobile("");
    setOtpExpiresAt("");
    setOtpType("");
    setDeviceAlreadyVerified(false);
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedMobile = mobile.trim();
    const trimmedPassword = password.trim();

    if (!validateMobile(trimmedMobile)) {
      setError("Please enter a valid 10-digit mobile number");
      setSuccess("");
      return;
    }

    if (!trimmedPassword) {
      setError("Please enter password");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res: any = (await initiateLoginApi({
        mobile_no: trimmedMobile,
        password: trimmedPassword,
        ...deviceInfo,
      })) as InitiateLoginResponse;

      if (!res?.success) {
        setError(res?.message || "Unable to login");
        return;
      }

      const flow = res?.data?.flow;
      const token = res?.data?.token || res?.data?.session_token || "";
      const user = res?.data?.user || null;

      if (flow === "SESSION_ACTIVE" || flow === "DIRECT_LOGIN") {
        setSuccess(
          flow === "DIRECT_LOGIN"
            ? "Login successful"
            : "You are already logged in on this device"
        );
        await persistLogin(token, user);
        return;
      }

      setOtpRequestId(res?.data?.otp_request_id || null);
      setMaskedAuthenticatedMobile(
        res?.data?.masked_authenticated_mobile ||
        res?.data?.masked_authenticated_email ||
        ""
      );
      setOtpExpiresAt(res?.data?.otp_expires_at || "");
      setOtpType(res?.data?.otp_type || "");
      setDeviceAlreadyVerified(!!res?.data?.device_already_verified);

      if (flow === "DEVICE_OTP_SENT") {
        setStep("DEVICE_OTP");
        setSuccess("Device OTP sent successfully");
      } else if (flow === "USER_OTP_SENT") {
        setStep("USER_OTP");
        setSuccess("User OTP sent successfully");
      } else {
        setError("Unexpected login flow response");
      }
    } catch (err) {
      setError("Something went wrong while starting login");
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!deviceOtp.trim() || deviceOtp.trim().length !== 6) {
      setError("Please enter a valid 6-digit device OTP");
      setSuccess("");
      return;
    }

    if (!otpRequestId) {
      setError("Device OTP request not found. Please try again.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res: any = (await verifyDeviceOtpApi({
        otp_request_id: otpRequestId,
        mobile_no: mobile.trim(),
        otp_code: deviceOtp.trim(),
        ...deviceInfo,
      })) as VerifyDeviceOtpResponse;

      if (!res?.success) {
        setError(res?.message || "Device OTP verification failed");
        return;
      }

      const flow = res?.data?.flow;
      const token = res?.data?.token || res?.data?.session_token || "";
      const user = res?.data?.user || null;

      if (flow === "DIRECT_LOGIN") {
        setSuccess("Login successful");
        await persistLogin(token, user);
        return;
      }

      setOtpRequestId(res?.data?.otp_request_id || null);
      setMaskedAuthenticatedMobile(
        res?.data?.masked_authenticated_mobile ||
        res?.data?.masked_authenticated_email ||
        ""
      );
      setOtpExpiresAt(res?.data?.otp_expires_at || "");
      setOtpType(res?.data?.otp_type || "USER_VERIFICATION_OTP");
      setDeviceAlreadyVerified(true);
      setDeviceOtp("");

      if (flow === "USER_OTP_SENT") {
        setStep("USER_OTP");
        setSuccess("Device verified successfully. User OTP sent.");
      } else {
        setError("Unexpected device verification response");
      }
    } catch (err) {
      setError("Something went wrong while verifying device OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleUserOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userOtp.trim() || userOtp.trim().length !== 6) {
      setError("Please enter a valid 6-digit user OTP");
      setSuccess("");
      return;
    }

    if (!otpRequestId) {
      setError("User OTP request not found. Please try again.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res: any = (await verifyUserOtpApi({
        otp_request_id: otpRequestId,
        mobile_no: mobile.trim(),
        otp_code: userOtp.trim(),
        ...deviceInfo,
      })) as VerifyUserOtpResponse;

      if (!res?.success) {
        setError(res?.message || "User OTP verification failed");
        return;
      }

      setSuccess("Login successful");
      await persistLogin(
        res?.data?.token || res?.data?.session_token || "",
        res?.data?.user || {}
      );
    } catch (err) {
      setError("Something went wrong while verifying user OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const trimmedMobile = mobile.trim();
    const trimmedPassword = password.trim();

    if (!validateMobile(trimmedMobile)) {
      setError("Please enter a valid mobile number first");
      return;
    }

    if (!trimmedPassword) {
      setError("Password is required");
      return;
    }

    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = (await initiateLoginApi({
        mobile_no: trimmedMobile,
        password: trimmedPassword,
        ...deviceInfo,
      })) as InitiateLoginResponse;

      if (!res?.success) {
        setError(res?.message || "Unable to resend OTP");
        return;
      }

      const flow = res?.data?.flow;

      if (flow === "SESSION_ACTIVE" || flow === "DIRECT_LOGIN") {
        await persistLogin(
          res?.data?.token || res?.data?.session_token || "",
          res?.data?.user || {}
        );
        return;
      }

      setOtpRequestId(res?.data?.otp_request_id || null);
      setMaskedAuthenticatedMobile(
        res?.data?.masked_authenticated_mobile ||
        res?.data?.masked_authenticated_email ||
        ""
      );
      setOtpExpiresAt(res?.data?.otp_expires_at || "");
      setOtpType(res?.data?.otp_type || "");
      setDeviceAlreadyVerified(!!res?.data?.device_already_verified);

      if (flow === "DEVICE_OTP_SENT") {
        setStep("DEVICE_OTP");
        setSuccess("Device OTP resent successfully");
      } else if (flow === "USER_OTP_SENT") {
        setStep("USER_OTP");
        setSuccess("User OTP resent successfully");
      } else {
        setError("Unable to resend OTP");
      }
    } catch (err) {
      setError("Something went wrong while resending OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const renderTitle = () => {
    if (step === "DEVICE_OTP") return "Verify Device OTP";
    if (step === "USER_OTP") return "Verify User OTP";
    return "Login";
  };

  const renderDescription = () => {
    if (step === "LOGIN") {
      return "Enter your mobile number and password to continue.";
    }

    if (step === "DEVICE_OTP") {
      return `Device OTP sent to ${maskedAuthenticatedMobile || "your registered contact"}.`;
    }

    return `User OTP sent to ${maskedAuthenticatedMobile || "your registered contact"}.`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <ShieldCheck size={22} className="text-black" />
          </div>
          <h1 className="text-2xl font-semibold text-black">{renderTitle()}</h1>
          <p className="mt-2 text-sm text-black">{renderDescription()}</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === "LOGIN" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Mobile Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                  <Smartphone size={18} />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMobile(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter mobile number"
                  className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-sm text-black outline-none focus:border-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter password"
                  className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-16 text-sm text-black outline-none focus:border-gray-500"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-sm text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-black text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Please wait...
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        )}

        {step === "DEVICE_OTP" && (
          <form onSubmit={handleDeviceOtpSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Device OTP
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                  <KeyRound size={18} />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={deviceOtp}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDeviceOtp(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter device OTP"
                  className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-sm tracking-[0.3em] text-black outline-none focus:border-gray-500"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
              <p>OTP Type: {otpType || "-"}</p>
              <p>Expires: {formatExpiryText() || "-"}</p>
              <p>Device Verified: {deviceAlreadyVerified ? "Yes" : "No"}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-black text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify Device OTP"
              )}
            </button>
          </form>
        )}

        {step === "USER_OTP" && (
          <form onSubmit={handleUserOtpSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                User OTP
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                  <KeyRound size={18} />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={userOtp}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setUserOtp(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter user OTP"
                  className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-3 text-sm tracking-[0.3em] text-black outline-none focus:border-gray-500"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
              <p>OTP Type: {otpType || "-"}</p>
              <p>Expires: {formatExpiryText() || "-"}</p>
              <p>Device Verified: {deviceAlreadyVerified ? "Yes" : "No"}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-black text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify User OTP"
              )}
            </button>
          </form>
        )}

        {step !== "LOGIN" && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("LOGIN");
                resetOtpState();
                setError("");
                setSuccess("");
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50"
            >
              Change Login
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {resendLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw size={15} />
                  Resend OTP
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}