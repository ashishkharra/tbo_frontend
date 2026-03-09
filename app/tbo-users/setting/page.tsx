"use client";
import React, { useState } from "react";
import { Home, Settings, ChevronDown, Check, Copy, X, ChevronRight, Shield } from "lucide-react";

// Static dummy data
const staticModules = [
  { module_id: "m1", module_name: "Dashboard", icon: "📊", menus: [{ id: "menu1", title: "Overview" }] },
  { module_id: "m2", module_name: "User Management", icon: "👥", menus: [{ id: "menu2", title: "All Users" }] },
];

const staticDatasets = [
  { dataset_id: "d1", dataset_name: "Elections Data", icon: "🗳️", menus: [] },
  { dataset_id: "d2", dataset_name: "Voter Data", icon: "📝", menus: [] },
];

const staticUsers = [{ id: "1", username: "Admin User", mobile: "9876543210" }];

const TBOUsersSetting = () => {
  const [activeTab, setActiveTab] = useState("module_permissions");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [assignedModules, setAssignedModules] = useState([]);
  const [copiedItem, setCopiedItem] = useState("");
  const [pasteCode, setPasteCode] = useState("");

  const handleCopyItem = (id) => {
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(""), 2000);
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    const next = new Set(expandedModules);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedModules(next);
  };

  const toggleAssign = (id, checked) => {
    if (checked) setAssignedModules([...assignedModules, id]);
    else setAssignedModules(assignedModules.filter(mId => mId !== id));
    setSelectedItemId(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="p-0">
        <div className="bg-white rounded-lg shadow-lg px-6 py-0 pt-1 mt-2 mb-0">
          <div className="flex align-center justify-between">
            <div className="text-gray-700">
              <Home size={24} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  <div>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-700">
                      <option value="all">All Roles</option>
                    </select>
                  </div>
                  <div>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800">
                      <option value="all">All Parents</option>
                    </select>
                  </div>
                  <div>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800">
                      <option value="all">All Users</option>
                    </select>
                  </div>
                  <div>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800">
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="working-empty"></div>
          </div>
        </div>
      </div>
      <div className="row mt-5">
        <div className="flex text-black gap-[30px] px-6">
          <div
            onClick={() => setActiveTab("module_permissions")}
            className={`px-4 py-1 text-[13px] font-medium rounded whitespace-nowrap shadow-sm cursor-pointer ${
              activeTab === "module_permissions" ? "text-white bg-black" : "text-white bg-gray-700 hover:bg-gray-800"
            }`}
          >
            Module & Permissions
          </div>
          <div
            onClick={() => setActiveTab("data_assign")}
            className={`px-4 py-1 text-[13px] font-medium rounded whitespace-nowrap shadow-sm cursor-pointer ${
              activeTab === "data_assign" ? "text-white bg-black" : "text-white bg-gray-700 hover:bg-gray-800"
            }`}
          >
            Data Assign & Column Permission
          </div>
          <div
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-1 text-[13px] font-medium rounded whitespace-nowrap shadow-sm cursor-pointer ${
              activeTab === "teams" ? "text-white bg-black" : "text-white bg-gray-700 hover:bg-gray-800"
            }`}
          >
            Teams Management
          </div>
          <div
            onClick={() => setActiveTab("coming_soon")}
            className={`px-4 py-1 text-[13px] font-medium rounded whitespace-nowrap shadow-sm cursor-pointer ${
              activeTab === "coming_soon" ? "text-white bg-black" : "text-white bg-gray-700 hover:bg-gray-800"
            }`}
          >
            Coming Soon
          </div>
        </div>
      </div>

      {activeTab === "module_permissions" && (
        <div className="px-6 mt-4 pb-6">
          <div className="bg-white rounded-xl shadow border w-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">Module & Data Assignment</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    {/* <span>Managing user:</span>
                    <div className="relative group flex items-center">
                      <select className="appearance-none font-semibold text-blue-600 bg-transparent border-b border-dashed border-blue-300 hover:border-blue-600 focus:outline-none focus:border-blue-600 pr-6 py-0.5 cursor-pointer max-w-[250px] truncate">
                        {staticUsers.map((u) => (
                          <option key={u.id} value={u.id}>{u.username} {u.mobile ? `(${u.mobile})` : ""}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-blue-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div> */}
                  </div>

                  {/* Copy/Paste Configuration */}
                  {/* <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                      <Copy className="w-3 h-3" /> Copy Config
                    </button>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pasteCode}
                        onChange={(e) => setPasteCode(e.target.value)}
                        placeholder="Paste config code here..."
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                      />
                      <button
                        disabled={!pasteCode.trim()}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Main Content Split */}
            <div className="flex flex-col md:flex-row overflow-hidden min-h-[500px]">
              {/* Left Column */}
              <div className="w-full md:w-1/2 border-r border-gray-100 flex flex-col bg-white">
                <div className="p-4 bg-gray-50/50 border-b flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Navigation Master</h4>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Select to configure</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Modules Section */}
                  <div>
                    <h5 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-tighter">Application Modules</h5>
                    <div className="space-y-1">
                      {staticModules.map((m) => {
                        const isSelected = selectedItemId === m.module_id;
                        const isAssigned = assignedModules.includes(m.module_id);

                        return (
                          <div key={m.module_id}>
                            <div
                              onClick={() => setSelectedItemId(m.module_id)}
                              className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                                isSelected ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={(e) => toggleAssign(m.module_id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                                      {m.icon} {m.module_name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {m.menus.length > 0 && (
                                      <button onClick={(e) => toggleExpand(m.module_id, e)} className="p-1 hover:bg-blue-100 rounded">
                                        {expandedModules.has(m.module_id) ? <ChevronDown className="w-4 h-4 text-blue-600" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Dropdown Menu Items */}
                            {expandedModules.has(m.module_id) && m.menus.length > 0 && (
                              <div className="ml-10 mt-2 space-y-1 border-l-2 border-blue-200 pl-3">
                                {m.menus.map((menu) => (
                                  <div key={menu.id} className="flex items-center gap-2 p-2 rounded text-xs hover:bg-blue-50 cursor-pointer">
                                    <span className="text-gray-600">{menu.title}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Datasets Section */}
                  <div>
                    <h5 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-tighter">Data Collections</h5>
                    <div className="space-y-1">
                      {staticDatasets.map((dataset) => {
                        const isSelected = selectedItemId === dataset.dataset_id;
                        const isAssigned = assignedModules.includes(dataset.dataset_id);

                        return (
                          <div
                            key={dataset.dataset_id}
                            onClick={() => setSelectedItemId(dataset.dataset_id)}
                            className={`group flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                              isSelected ? "bg-purple-50 ring-1 ring-purple-200" : "hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={(e) => toggleAssign(dataset.dataset_id, e.target.checked)}
                              className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            />
                            <div className="ml-3 flex-1">
                              <span className={`text-sm font-medium ${isSelected ? "text-purple-700" : "text-gray-700"}`}>
                                {dataset.icon} {dataset.dataset_name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Permissions */}
              <div className="w-full md:w-1/2 flex flex-col bg-gray-50/30">
                {selectedItemId ? (
                  <>
                    <div className="p-4 bg-white border-b flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Permissions for Selected Item
                      </h4>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Static Permissions List */}
                        {["read", "write", "delete", "export"].map((perm) => (
                          <label key={perm} className="flex items-start p-3 rounded-lg border bg-white border-gray-200 cursor-pointer hover:border-blue-100">
                            <input type="checkbox" className="mt-0.5 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 shrink-0" />
                            <div className="ml-3 flex-1">
                              <span className="text-sm font-semibold text-gray-800 capitalize leading-tight">{perm}</span>
                              <p className="text-xs text-gray-500 mt-1">Allows {perm} access</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="bg-gray-100 p-6 rounded-full mb-6 text-gray-300">
                      <Shield className="w-16 h-16" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-400">Manage Permissions</h4>
                    <p className="text-sm text-gray-400 max-w-xs mt-2">
                      Select a module or dataset from the left column to configure
                      granular access permissions.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-end flex-shrink-0 gap-3">
              <button className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all">
                Cancel
              </button>
              <button className="px-8 py-2.5 text-sm font-bold text-white bg-gray-600 hover:bg-gray-700 shadow-lg shadow-gray-200 rounded-lg transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render dummy content for other tabs */}
      {activeTab === "data_assign" && (
        <div className="px-6 mt-4 pb-6">
          <div className="bg-white rounded-xl shadow border w-full flex flex-col p-6 items-center justify-center min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-600">Data Assign & Column Permission</h3>
            <p className="text-gray-400 mt-2">Configure data assignments here.</p>
          </div>
        </div>
      )}

      {activeTab === "teams" && (
        <div className="px-6 mt-4 pb-6">
          <div className="bg-white rounded-xl shadow border w-full flex flex-col p-6 items-center justify-center min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-600">Teams Management</h3>
            <p className="text-gray-400 mt-2">Manage team roles and users.</p>
          </div>
        </div>
      )}

      {activeTab === "coming_soon" && (
        <div className="px-6 mt-4 pb-6">
          <div className="bg-white rounded-xl shadow border w-full flex flex-col p-6 items-center justify-center min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-600">Coming Soon</h3>
            <p className="text-gray-400 mt-2">Future features will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TBOUsersSetting;
