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
import { Icon } from "lucide-react";
import useAuth from "./hook/useAuth";

// Type Definitions
interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  link?: string;
  disabled?: boolean;
}

export default function Home(): ReactElement | null {
  const modules: Module[] = [
    {
      id: "mobile-settings",
      name: "Mobile Settings",
      description: "Configure mobile app settings and permissions",
      icon: Settings,
    },
    {
      id: "tbo-users",
      name: "TBO Users",
      description: "Manage TBO user accounts and permissions",
      icon: Users,
      link: "/tbo-users",
    },
    {
      id: "callers",
      name: "Callers",
      description: "Manage caller information and assignments",
      icon: Phone,
    },
    {
      id: "data-entry",
      name: "Data Entry",
      description: "Enter and manage voter data entries",
      icon: Pencil,
    },
    {
      id: "volunteers",
      name: "Volunteers",
      description: "Manage volunteer information and activities",
      icon: Handshake,
    },
    {
      id: "master-map-india",
      name: "Master Map - India",
      description: "Interactive map of India with administrative boundaries",
      icon: Map,
    },
    {
      id: "dataset-1",
      name: "Dataset 1",
      description: "Dataset",
      icon: Database,
      link: "/dataset",
    },
    {
      id: "live-voter-list",
      name: "Voter List",
      description: "Dataset",
      icon: Database,
      link: "/voter-list",
    },
  ];

  const handleLogout = (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
    }
  };

  const checking = useAuth();
  if (checking) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
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

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-4 gap-4">
        {modules.map((module) => {
          const IconComponent = module.icon;

          return (
            <a 
              key={module.id}
              href={module.link || "#"} 
              className={module.disabled ? "pointer-events-none" : ""}
            >
              <div
                className={`bg-white rounded-lg shadow border border-gray-200 transition
                ${
                  module.disabled
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
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}