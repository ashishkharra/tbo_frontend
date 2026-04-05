"use client";

import React, { ReactElement } from "react";
import {
  Settings,
  Users,
  Phone,
  Pencil,
  Handshake,
  Map,
  Database,
} from "lucide-react";
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
}

export default function Home(): ReactElement | null {
  const router = useRouter();
  const { logout } = useAuthContext();

  const modules: Module[] = [
    {
      id: "mobile-settings",
      name: "Mobile Settings",
      description: "Configure mobile app settings and permissions",
      icon: Settings,
      disabled: true,
    },
    {
      id: "tbo-users",
      name: "TBO Users",
      description: "Manage TBO user accounts and permissions",
      icon: Users,
      link: "/tbo-users",
      accessKey: "tbo_users",
    },
    {
      id: "callers",
      name: "Callers",
      description: "Manage caller information and assignments",
      icon: Phone,
      disabled: true,
    },
    {
      id: "data-entry",
      name: "Data Entry",
      description: "Enter and manage voter data entries",
      icon: Pencil,
      disabled: true,
    },
    {
      id: "volunteers",
      name: "Volunteers",
      description: "Manage volunteer information and activities",
      icon: Handshake,
      disabled: true,
    },
    {
      id: "master-map-india",
      name: "Master Map - India",
      description: "Interactive map of India with administrative boundaries",
      icon: Map,
      disabled: true,
    },
    {
      id: "dataset-1",
      name: "Dataset 1",
      description: "Dataset",
      icon: Database,
      link: "/dataset",
      accessKey: "dataset",
    },
    {
      id: "live-voter-list",
      name: "Voter List",
      description: "Dataset",
      icon: Database,
      link: "/voter-list",
      accessKey: "voter_list",
    },
  ];

  const handleLogout = async () => {
    try {
      // await logout();
    } catch (error) { }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="font-semibold text-gray-800 uppercase">John Doe</p>

          <div className="flex items-center space-x-3">
            <img src="/logo.png" className="w-10 h-10" alt="Logo" />
            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
              THE BIG OWL
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="p-3 bg-gray-100 rounded-lg hover:scale-110 transition cursor-pointer"
            aria-label="Logout"
          >
            <img src="/logout.png" className="w-6 h-6" alt="Logout" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-4 gap-4">
        {modules.map((module) => {
          const IconComponent = module.icon;

          return (
            <button
              key={module.id}
              type="button"
              onClick={() => handleModuleClick(module)}
              disabled={module.disabled}
              className={`text-left w-full bg-white rounded-lg shadow border border-gray-200 transition
              ${module.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-md cursor-pointer"
                }`}
            >
              <div className="p-4 text-center">
                <div className="mx-auto mb-3 w-12 h-12 flex items-center justify-center bg-gray-50 rounded-md">
                  <IconComponent size={22} className="text-gray-600" />
                </div>

                <h3 className="text-sm font-medium text-gray-800">
                  {module.name}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {module.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}