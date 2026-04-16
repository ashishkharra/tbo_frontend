"use client";

import React, { ReactElement } from "react";
import {
  Users,
  Handshake,
  Map,
  Database,
  ShieldCheck,
  PhoneCall,
  UserCog,
  Building2,
  ChevronRight,
  Lock,
  LogOut,
  Activity,
  Layers3
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import useAuth from "./hook/useAuth";
import { CheckAccess } from "@/apis/api";
import { useAuth as useAuthContext } from "../contexts/AuthContext";

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  link?: string;
  accessKey?: string;
  disabled?: boolean;
  badge?: string;
}

interface ModuleSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  modules: Module[];
}

export default function Home(): ReactElement | null {
  const router = useRouter();
  const { user, logout } = useAuthContext();

  const formatLastLogin = (value?: string | null) => {
    if (!value) return "No login data";

    const loginDate = new Date(value);
    if (Number.isNaN(loginDate.getTime())) return "First time login";

    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const loginDayStart = new Date(
      loginDate.getFullYear(),
      loginDate.getMonth(),
      loginDate.getDate()
    );

    const timeText = loginDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    if (loginDayStart.getTime() === todayStart.getTime()) {
      return `Today, ${timeText}`;
    }

    if (loginDayStart.getTime() === yesterdayStart.getTime()) {
      return `Yesterday, ${timeText}`;
    }

    return loginDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ` at ${timeText}`;
  };

  const sections: ModuleSection[] = [
    {
      id: "user-management",
      title: "User Management",
      subtitle: "Manage users, teams and access control",
      icon: ShieldCheck,
      modules: [
        {
          id: "tbo-users",
          name: "User Admin",
          description: "Manage TBO user accounts and permissions",
          icon: UserCog,
          link: "/tbo-users",
          accessKey: "tbo_users",
          badge: "Active",
        },
        {
          id: "mobile-settings",
          name: "Mobile User",
          description: "Manage mobile users",
          icon: Users,
          link: "/mobile-users",
          accessKey: "mobile_users",
          badge: "Active",
        },
        {
          id: "coordinator",
          name: "Coordinator",
          description: "Manage coordinators",
          icon: Building2,
          link: "/coordinator",
          accessKey: "coordinator",
          badge: "Active",
        },
        {
          id: "callers",
          name: "Tele Callers",
          description: "Manage callers and assignments",
          icon: PhoneCall,
          link: "/callers",
          accessKey: "callers",
          badge: "Active",
        },
        {
          id: "data-entry",
          name: "Data Entry",
          description: "Manage data entry operators",
          icon: Layers3,
          link: "/data-entry",
          accessKey: "data_entry",
          badge: "Active",
        },
        {
          id: "volunteers",
          name: "Volunteers",
          description: "Manage volunteer activities",
          icon: Handshake,
          link: "/volunteers",
          accessKey: "volunteers",
          badge: "Active",
        },
      ],
    },
    // {
    //   id: "mapping",
    //   title: "Mapping",
    //   subtitle: "Location and region based modules",
    //   icon: Map,
    //   modules: [
    //     {
    //       id: "master-map-india",
    //       name: "Master Map - India",
    //       description: "Administrative map and boundaries",
    //       icon: Map,
    //       disabled: true,
    //       badge: "Soon",
    //     },
    //   ],
    // },
    {
      id: "data-systems",
      title: "Data Systems",
      subtitle: "Dataset and voter related modules",
      icon: Database,
      modules: [
        {
          id: "dataset-1",
          name: "Dataset",
          description: "Manage system datasets",
          icon: Database,
          link: "/dataset",
          accessKey: "dataset",
          badge: "Live",
        },
        {
          id: "live-voter-list",
          name: "Voter List",
          description: "Open live voter records",
          icon: Activity,
          link: "/voter-list",
          accessKey: "voter_list",
          badge: "Live",
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("session_token");
    localStorage.removeItem("userInfo");

    window.location.replace("/login");
  };

  const handleModuleClick = async (module: Module): Promise<void> => {
    try {
      if (module.disabled) return;
      if (!module.link) return;

      if (!module.accessKey) {
        router.push(module.link);
        return;
      }

      const res = await CheckAccess(module.accessKey);

      if (res?.success && res?.allowed) {
        router.push(module.link);
      } else {
        alert(res?.message || "You do not have access to open this module");
      }
    } catch (error) {
      console.error("Module access check failed:", error);
      alert("Unable to verify access right now");
    }
  };

  const checking = useAuth();
  if (checking) return null;

  return (
    <div className="min-h-screen bg-[#eef1f5] relative lg:h-screen lg:overflow-hidden">
      {/* Soft balanced background */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f3f5f8_0%,#edf1f5_45%,#e8edf3_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_32%)]" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/25 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-slate-200/35 blur-3xl rounded-full" />

      <div className="relative z-10 flex min-h-screen flex-col lg:h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 shrink-0 border-b border-white/45 bg-white/38 backdrop-blur-xl shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-5 lg:px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/45 border border-white/60 shadow-sm flex items-center justify-center backdrop-blur-xl">
                <img src="/logo.png" className="w-9 h-9 rounded object-contain" alt="Logo" />
              </div>

              <div>
                <h1 className="text-base sm:text-lg font-semibold text-black">
                  THE BIG OWL
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-gray-300 bg-white/34 px-3 py-2 backdrop-blur-xl">
                <div className="h-9 w-9 rounded-xl bg-slate-700 text-white flex items-center justify-center text-sm font-semibold">
                  {(user?.name || user?.username || "U")
                    .split(" ")
                    .map((part: string) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="leading-tight">
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-sm font-medium text-black">
                      {user?.name || user?.username || "User"}
                    </p>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                      {user?.role?.replace('_', ' ') || "User"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Last login: {formatLastLogin(user?.last_login)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-300 bg-white/34 px-4 py-2 text-sm font-medium text-black backdrop-blur-xl transition hover:bg-white/48"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-5 lg:px-6 py-1.5 space-y-1.5 lg:flex-1 lg:min-h-0 lg:grid lg:auto-rows-min lg:content-start lg:gap-1.5 lg:space-y-0">
          {sections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;

            return (
              <motion.section
                key={section.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: sectionIndex * 0.05 }}
                className="rounded-[18px] border border-gray-300 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.05)] lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden"
              >
                <div className="px-4 sm:px-5 py-1.5 border-b border-white/45">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="h-4 w-5 mt-1.5 rounded-2xl border border-white/60 bg-white/42 backdrop-blur-xl flex items-center justify-center">
                        <SectionIcon className="h-5 w-5 text-black" />
                      </div>

                      <div>
                        <h2 className="text-lg sm:text-md font-semibold text-black">
                          {section.title}
                        </h2>
                        {/* <p className="text-sm text-black">{section.subtitle}</p> */}
                      </div>
                    </div>

                    <div className="inline-flex items-center rounded-full border border-white/60 bg-white/38 px-3 py-1 text-xs font-medium text-black backdrop-blur-xl w-fit">
                      {section.modules.length} module
                      {section.modules.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <div className="p-1.5 sm:p-2 lg:flex-1 lg:min-h-0">
                  <div className="grid h-full content-start auto-rows-max grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-1.5">
                    {section.modules.map((module, index) => {
                      const IconComponent = module.icon;
                      const isDisabled = !!module.disabled;

                      return (
                        <motion.button
                          key={module.id}
                          type="button"
                          onClick={() => handleModuleClick(module)}
                          disabled={isDisabled}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.24,
                            delay: sectionIndex * 0.05 + index * 0.025,
                          }}
                          whileHover={!isDisabled ? { y: -2 } : {}}
                          whileTap={!isDisabled ? { scale: 0.985 } : {}}
                          className={`group text-left cursor-pointer rounded-[14px] border px-3 py-2 min-h-[92px] flex flex-col gap-2 self-start backdrop-blur-xl transition-all duration-300 ${isDisabled
                            ? "border-slate-200/70 bg-white/18 cursor-not-allowed opacity-80"
                            : "border-slate-300/60 bg-white/34 hover:bg-white/42 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]"
                            }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <div
                                className={`h-7 w-7 rounded-2xl flex items-center justify-center border backdrop-blur-xl ${isDisabled
                                  ? "border-white/45 bg-white/22"
                                  : "border-white/60 bg-white/48"
                                  }`}
                              >
                                <IconComponent
                                  size={26}
                                  className={isDisabled ? "text-red-700" : "text-green-700"}
                                />
                              </div>

                              <span
                                className={`text-[10px] px-2.5 rounded-full font-medium border whitespace-nowrap ${isDisabled
                                  ? "border-slate-200 bg-slate-100/70 text-black"
                                  : "border-slate-200 bg-slate-50/80 text-black"
                                  }`}
                              >
                                {module.badge || (isDisabled ? "Locked" : "Active")}
                              </span>
                            </div>

                            <div className="mt-1.5">
                              <h3 className="text-[15px] font-semibold text-black leading-4">
                                {module.name}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-medium ${isDisabled ? "text-black" : "text-black"
                                }`}
                            >
                              {isDisabled ? "Unavailable" : "Open Module"}
                            </span>

                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center transition ${isDisabled
                                ? "bg-white/30 text-black"
                                : "bg-white/55 text-black group-hover:translate-x-0.5"
                                }`}
                            >
                              {isDisabled ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            );
          })}
        </main>
      </div>
    </div>
  );
}