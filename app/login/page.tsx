"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { loginApi } from "../../apis/api";
import { useRouter } from "next/navigation";
import useGuest from "../hook/useGuest";
import { validatePhone } from "../../utils/helper";

// Type Definitions
interface LoginResponse {
  success: boolean;
  token?: string;
  user?: UserData;
  message?: string;
}

interface UserData {
  id?: number;
  username?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

export default function LoginPage() {
  const [contact_no, setContactNo] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const checking = useGuest();

  if (checking) return null;

  const handleMobileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;

    // sirf numbers allow
    if (!/^\d*$/.test(value)) return;

    // max 10 digits
    if (value.length > 10) return;

    setContactNo(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validatePhone(contact_no)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await loginApi({ contact_no, password }) as LoginResponse;

      if (!res.success) {
        setError(res.message || "Login failed");
        setLoading(false);
        return;
      }

      console.log('req user ->>>>>>> ', res.user);

      if (typeof window !== "undefined") {
        console.log("Login successful, token:", res.token);
        localStorage.setItem("token", res.token || "");
        localStorage.setItem("userInfo", JSON.stringify(res.user || {}));
        window.location.replace("/");
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="absolute top-20 left-10 w-32 h-32 bg-gray-300 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-gray-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-20 w-16 h-16 bg-gray-500 rounded-full opacity-10 animate-pulse delay-500"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
            <div className="flex items-center justify-end">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm">
                Sign in to access your dashboard
              </p>
            </div>

            {error && (
              <div className="mb-4 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail
                      size={18}
                      className="text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200"
                    />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={contact_no}
                    onChange={handleMobileChange}
                    className="block w-full pl-12 pr-4 py-3.5 border-2 rounded-xl shadow-sm placeholder-black text-black focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 bg-white/50 backdrop-blur-sm border-gray-200"
                    placeholder="Enter your mobile number"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      size={18}
                      className="text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200"
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl shadow-sm placeholder-black text-black focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 bg-white/50 backdrop-blur-sm border-gray-200"
                    placeholder="Enter your password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}