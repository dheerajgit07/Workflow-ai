"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, User, Shield, Users, Bell, Sliders, 
  Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, 
  Lock, Key, Globe, Mail, Moon, Sun, Monitor, 
  ChevronDown, Layers, ShieldCheck, Eye, EyeOff,
  History, CreditCard, ChevronRight, Download, HelpCircle
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Member" | "Viewer";
  joinedDate: string;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  category: "Security" | "Team" | "Workspace";
}

export default function EnhancedMondaySettingsDashboard() {
  const [activeTab, setActiveTab] = useState<"general" | "team" | "permissions" | "security" | "billing" | "audit">("general");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // ─── WORKSPACE STATE ───
  const [currentWorkspace, setCurrentWorkspace] = useState("Dikota Operations Main");
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Dikota Operations Suite");
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("light");
  const [regionalLanguage, setRegionalLanguage] = useState("en-IN");

  // ─── SECURITY & TOKENS ───
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [apiTokenVisible, setApiTokenVisible] = useState(false);
  const [apiToken, setApiToken] = useState("dk_live_2026_98s2f_sys_master_matrix_ecosystem");

  // ─── AUDIT TRAIL LOGS (IMMUTABLE STATE) ───
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "LOG-901", action: "Global API Token regenerated", user: "Dheeraj Kamboj", timestamp: "2026-07-02 14:22:05", category: "Security" },
    { id: "LOG-902", action: "Invited new member (Aarav Sharma)", user: "Dheeraj Kamboj", timestamp: "2026-07-02 11:45:12", category: "Team" },
    { id: "LOG-903", action: "Workspace parameters modified", user: "System Engine", timestamp: "2026-07-01 09:00:00", category: "Workspace" },
  ]);

  // ─── TEAM DATA ───
  const [team, setTeam] = useState<TeamMember[]>([
    { id: "USR-81", name: "Dheeraj Kamboj", email: "dheeraj.kamboj@dikota.in", role: "Admin", joinedDate: "2026-01-01" },
    { id: "USR-02", name: "Aarav Sharma", email: "aarav.s@dikota.in", role: "Member", joinedDate: "2026-02-15" },
    { id: "USR-03", name: "Neha Verma", email: "neha.v@dikota.in", role: "Viewer", joinedDate: "2026-03-20" },
  ]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"Admin" | "Member" | "Viewer">("Member");

  // ─── PERMISSIONS MATRIX STATE ───
  const [permissions, setPermissions] = useState({
    admin: { createBoards: true, deleteItems: true, inviteUsers: true, exportData: true },
    member: { createBoards: true, deleteItems: false, inviteUsers: true, exportData: true },
    viewer: { createBoards: false, deleteItems: false, inviteUsers: false, exportData: false }
  });

  // ─── TOAST NOTIFIER SYSTEM ───
  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const pushAuditLog = (action: string, category: "Security" | "Team" | "Workspace") => {
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      action,
      user: "Dheeraj Kamboj",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // ─── LOGIC HANDLERS ───
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      return showToast("Name and Email fields are required", "error");
    }
    const newMember: TeamMember = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setTeam((prev) => [...prev, newMember]);
    pushAuditLog(`Provisioned user access for ${newMember.name}`, "Team");
    setNewMemberName("");
    setNewMemberEmail("");
    showToast(`Access granted to "${newMember.name}"`);
  };

  const handleUpdateRole = (id: string, role: "Admin" | "Member" | "Viewer", name: string) => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    pushAuditLog(`Changed ${name}'s role clearance level to ${role}`, "Team");
    showToast(`Updated clearance level to ${role}`, "info");
  };

  const handlePurgeMember = (id: string, name: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    pushAuditLog(`Revoked workspace access tokens for ${name}`, "Team");
    showToast(`Revoked tokens for ${name}`, "info");
  };

  const regenerateToken = () => {
    const newSecToken = `dk_live_2026_${Math.random().toString(36).substring(2, 7)}_master_${Math.random().toString(36).substring(2, 7)}`;
    setApiToken(newSecToken);
    pushAuditLog("Regenerated core application API handshake token", "Security");
    showToast("Application security key successfully cycled", "success");
  };

  const togglePermission = (role: "admin" | "member" | "viewer", key: string) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role][key as keyof typeof prev.admin]
      }
    }));
    pushAuditLog(`Modified permission grid parameters for role group: ${role}`, "Security");
    showToast("Granular access control settings synced", "success");
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#323338] font-sans antialiased pb-24 selection:bg-[#0073ea]/25">
      
      {/* Dynamic Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1c1f23] text-white text-xs px-4 py-3 rounded-md shadow-xl flex items-center gap-3 border border-gray-800 pointer-events-auto"
            >
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-[#00c875]" />}
              {t.type === "error" && <AlertCircle className="w-4 h-4 text-[#df2f4a]" />}
              {t.type === "info" && <AlertCircle className="w-4 h-4 text-[#0073ea]" />}
              <span className="font-medium tracking-wide">{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Monday-Native Professional Header Layout */}
      <div className="bg-white border-b border-[#c3c6cd] sticky top-0 z-40 px-6 lg:px-10 py-4 shadow-2xs">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#0073ea]/10 rounded-lg text-[#0073ea]">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#676879] uppercase tracking-wider">
                <span>Administration Suite</span> 
                <ChevronRight className="w-3 h-3" /> 
                <span className="text-[#0073ea]">Ecosystem Matrix</span>
              </div>
              
              {/* Workspace Quick Switcher Selector */}
              <div className="relative mt-0.5">
                <button 
                  onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                  className="text-xl font-bold text-[#1c1f23] flex items-center gap-1.5 hover:bg-gray-100 px-1 py-0.5 rounded transition-all cursor-pointer"
                >
                  {currentWorkspace}
                  <ChevronDown className="w-4 h-4 text-[#676879]" />
                </button>
                {isWorkspaceDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white border border-[#c3c6cd] shadow-xl rounded-lg py-1 z-50 animate-fadeIn">
                    {["Dikota Operations Main", "Dikota Marketing Sandbox", "Dikota Developer Sandbox"].map((ws) => (
                      <button
                        key={ws}
                        onClick={() => { setCurrentWorkspace(ws); setIsWorkspaceDropdownOpen(false); showToast(`Context switched to ${ws}`, "info"); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 ${currentWorkspace === ws ? "text-[#0073ea] bg-[#0073ea]/5" : "text-gray-700"}`}
                      >
                        <Layers className="w-3.5 h-3.5" /> {ws}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Current Billing tier</span>
              <span className="text-xs font-bold text-[#784bd1] bg-[#784bd1]/10 px-2 py-0.5 rounded-full border border-[#784bd1]/20">Enterprise Plan</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Structural Layout Grid */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 mt-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Navigation Tab Drawer (Left Panel) */}
          <div className="w-full lg:w-68 bg-white rounded-lg border border-[#c3c6cd] p-2 flex flex-row lg:flex-col gap-0.5 overflow-x-auto shrink-0 shadow-3xs">
            {[
              { id: "general", label: "General Environment", icon: Sliders },
              { id: "team", label: "User Control Directory", icon: Users },
              { id: "permissions", label: "Granular Access Matrix", icon: ShieldCheck },
              { id: "security", label: "Cryptographic Safe", icon: Shield },
              { id: "billing", label: "Resource Usage & Plans", icon: CreditCard },
              { id: "audit", label: "Security Audit Logs", icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-md text-xs font-bold transition-all flex items-center gap-3 whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? "bg-[#0073ea] text-white shadow-sm" 
                      : "text-[#323338] hover:bg-[#f5f6f8] hover:text-black"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Core Content Layout Workstation (Right Panel) */}
          <div className="flex-1 w-full bg-white rounded-lg border border-[#c3c6cd] shadow-3xs min-h-[600px] overflow-hidden">
            <div className="p-6 lg:p-8">
              
              {/* TAB 1: GENERAL SYSTEM PARAMETERS */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-extrabold text-[#1c1f23]">General Settings</h2>
                    <p className="text-xs text-[#676879] mt-0.5">Control global identities, styling attributes, and core parameters.</p>
                  </div>
                  <hr className="border-[#e1e4e8]" />

                  <div className="space-y-4 max-w-xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#323338] block">Workspace Core Identifier</label>
                      <input 
                        type="text" 
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#c8d0d8] focus:border-[#0073ea] focus:ring-4 focus:ring-[#0073ea]/5 rounded-md text-xs focus:outline-none transition-all font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#323338] block">Visual Architecture Rendering Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "light", label: "Pure Light", icon: Sun },
                          { id: "dark", label: "High Contrast Dark", icon: Moon },
                          { id: "system", label: "Default System OS", icon: Monitor },
                        ].map((t) => {
                          const Icon = t.icon;
                          return (
                            <button
                              key={t.id}
                              onClick={() => { setThemeMode(t.id as any); showToast(`System theme modified to ${t.id}`, "info"); }}
                              className={`p-3 rounded-md border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                                themeMode === t.id 
                                  ? "border-[#0073ea] bg-[#0073ea]/5 text-[#0073ea]" 
                                  : "border-[#c8d0d8] hover:bg-gray-50 text-[#676879]"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-[#323338] block">Regional Mapping & Time Engine</label>
                      <div className="relative">
                        <select 
                          value={regionalLanguage}
                          onChange={(e) => setRegionalLanguage(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#c8d0d8] focus:border-[#0073ea] rounded-md text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="en-IN">English (India) - IST (UTC+05:30)</option>
                          <option value="en-US">English (United States) - EST</option>
                        </select>
                        <Globe className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => { pushAuditLog("Committed workspace identity parameters update", "Workspace"); showToast("Workspace modifications verified & committed", "success"); }}
                        className="bg-[#0073ea] hover:bg-[#0060c4] text-white px-4 py-2 rounded-md text-xs font-bold transition-all shadow-3xs cursor-pointer"
                      >
                        Commit Environment Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USER DIRECTORY CONTROL */}
              {activeTab === "team" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-extrabold text-[#1c1f23]">Users & Authorization Management</h2>
                    <p className="text-xs text-[#676879] mt-0.5">Provision node access tokens and regulate granular profile clearances.</p>
                  </div>
                  <hr className="border-[#e1e4e8]" />

                  {/* Add Member Inline Block */}
                  <form onSubmit={handleAddMember} className="bg-[#f5f6f8] border border-[#c3c6cd] p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#676879] uppercase tracking-wider">Legal Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Aarav Sharma"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#c8d0d8] focus:border-[#0073ea] rounded-md text-xs focus:outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#676879] uppercase tracking-wider">Corporate Email</label>
                      <input 
                        type="email" 
                        placeholder="name@dikota.in"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#c8d0d8] focus:border-[#0073ea] rounded-md text-xs focus:outline-none font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#676879] uppercase tracking-wider">Clearance Group</label>
                      <select 
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white border border-[#c8d0d8] focus:border-[#0073ea] rounded-md text-xs font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="Admin">Administrator</option>
                        <option value="Member">Regular Member</option>
                        <option value="Viewer">Guest Viewer</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-[#0073ea] hover:bg-[#0060c4] text-white font-bold text-xs py-1.5 px-4 rounded-md transition-all flex items-center justify-center gap-1.5 shadow-3xs h-9 cursor-pointer">
                      <Plus className="w-4 h-4" /> Provision User
                    </button>
                  </form>

                  {/* Spreadsheet Grid Mapping */}
                  <div className="border border-[#c3c6cd] rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-[#f5f6f8] border-b border-[#c3c6cd] text-[10px] font-bold text-[#676879] uppercase tracking-wider h-10">
                          <th className="px-4 w-1/3">Corporate Employee Node</th>
                          <th className="px-4">Clearance Role Mapping</th>
                          <th className="px-4">System Provision Date</th>
                          <th className="w-16 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e4e8]">
                        {team.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50/70 h-12 text-xs">
                            <td className="px-4 font-semibold text-[#1c1f23]">
                              <div className="flex flex-col">
                                <span>{member.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono">{member.email}</span>
                              </div>
                            </td>
                            <td className="px-4">
                              <select 
                                value={member.role}
                                onChange={(e) => handleUpdateRole(member.id, e.target.value as any, member.name)}
                                className={`px-2 py-0.5 rounded font-bold text-[11px] border bg-transparent ${
                                  member.role === "Admin" ? "text-purple-600 bg-purple-50 border-purple-200" :
                                  member.role === "Member" ? "text-[#0073ea] bg-blue-50 border-blue-200" :
                                  "text-gray-600 bg-gray-50 border-gray-200"
                                }`}
                              >
                                <option value="Admin">Admin</option>
                                <option value="Member">Member</option>
                                <option value="Viewer">Viewer</option>
                              </select>
                            </td>
                            <td className="px-4 font-mono text-gray-400 font-medium">{member.joinedDate}</td>
                            <td className="text-center">
                              <button 
                                onClick={() => handlePurgeMember(member.id, member.name)}
                                className="p-1.5 text-gray-400 hover:text-[#df2f4a] rounded cursor-pointer disabled:opacity-20"
                                disabled={member.name === "Dheeraj Kamboj"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ADVANCED PERMISSIONS GRID MATRIX */}
              {activeTab === "permissions" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-extrabold text-[#1c1f23]">Granular Access Security Matrix</h2>
                    <p className="text-xs text-[#676879] mt-0.5">Define operational boundaries for different organizational tiers.</p>
                  </div>
                  <hr className="border-[#e1e4e8]" />

                  <div className="border border-[#c3c6cd] rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse table-fixed min-w-[500px]">
                      <thead>
                        <tr className="bg-[#f5f6f8] border-b border-[#c3c6cd] text-[10px] font-bold text-[#676879] uppercase tracking-wider h-10">
                          <th className="px-4 w-2/5">Capability Framework</th>
                          <th className="px-2 text-center">Administrator</th>
                          <th className="px-2 text-center">Regular Member</th>
                          <th className="px-2 text-center">Guest Viewer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e4e8] text-xs font-semibold">
                        {[
                          { key: "createBoards", label: "Create Workspaces & Project Boards" },
                          { key: "deleteItems", label: "Hard Purge Data / Items permanently" },
                          { key: "inviteUsers", label: "Invite & Provision External Contractors" },
                          { key: "exportData", label: "Export Ecosystem Analytics (CSV/JSON)" },
                        ].map((perm) => (
                          <tr key={perm.key} className="hover:bg-gray-50 h-12">
                            <td className="px-4 text-[#323338] text-[11px] font-bold">{perm.label}</td>
                            
                            {/* Admin Switch */}
                            <td className="text-center">
                              <input 
                                type="checkbox" 
                                checked={permissions.admin[perm.key as keyof typeof permissions.admin]} 
                                onChange={() => togglePermission("admin", perm.key)}
                                className="w-4 h-4 rounded text-[#0073ea] border-gray-300 focus:ring-0 cursor-pointer"
                              />
                            </td>

                            {/* Member Switch */}
                            <td className="text-center">
                              <input 
                                type="checkbox" 
                                checked={permissions.member[perm.key as keyof typeof permissions.member]} 
                                onChange={() => togglePermission("member", perm.key)}
                                className="w-4 h-4 rounded text-[#0073ea] border-gray-300 focus:ring-0 cursor-pointer"
                              />
                            </td>

                            {/* Viewer Switch */}
                            <td className="text-center">
                              <input 
                                type="checkbox" 
                                checked={permissions.viewer[perm.key as keyof typeof permissions.viewer]} 
                                onChange={() => togglePermission("viewer", perm.key)}
                                className="w-4 h-4 rounded text-[#0073ea] border-gray-300 focus:ring-0 cursor-pointer"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: HIGH RISK CRYPTOGRAPHIC TOKENS */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-extrabold text-[#1c1f23]">Security & Cryptography</h2>
                    <p className="text-xs text-[#676879] mt-0.5">Control multi-factor handshakes, authorization keys, and sessions.</p>
                  </div>
                  <hr className="border-[#e1e4e8]" />

                  <div className="space-y-6 max-w-xl">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div className="space-y-0.5">
                        <label className="text-xs font-bold text-[#323338] block">Two-Factor Passcode Handshake (2FA)</label>
                        <span className="text-[11px] text-[#676879] block">Mandate mobile verification logs for every administrator session root.</span>
                      </div>
                      <button 
                        onClick={() => { setTwoFactor(!twoFactor); pushAuditLog(`Changed 2FA parameter to ${!twoFactor}`, "Security"); showToast(`2FA validation protocol ${!twoFactor ? 'activated' : 'offline'}`, "info"); }}
                        className={`w-10 h-5 rounded-full p-0.5 transition-all cursor-pointer flex ${twoFactor ? "bg-[#00c875] justify-end" : "bg-gray-300 justify-start"}`}
                      >
                        <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-xs" />
                      </button>
                    </div>

                    <div className="space-y-1.5 border-b border-gray-100 pb-4">
                      <label className="text-xs font-bold text-[#323338] block">Automatic Idle Session Expiry Termination</label>
                      <div className="relative max-w-xs mt-1.5">
                        <select 
                          value={sessionTimeout}
                          onChange={(e) => { setSessionTimeout(e.target.value); showToast(`Session lifespan updated`, "success"); }}
                          className="w-full px-3 py-2 bg-white border border-[#c8d0d8] focus:border-[#0073ea] rounded-md text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="15">Terminate after 15 Minutes</option>
                          <option value="60">Terminate after 1 Hour</option>
                        </select>
                        <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-[#323338] block">Global Cryptographic REST Master API Credentials</label>
                      <div className="bg-[#1c1f23] p-4 rounded-lg text-white font-mono text-[11px] relative overflow-hidden group border border-gray-800 flex items-center justify-between">
                        <div>
                          <div className="text-gray-500 uppercase font-bold tracking-widest text-[9px] mb-1 flex items-center gap-1.5">
                            <Key className="w-3 h-3 text-[#e2b13c]" /> Active Token Handshake
                          </div>
                          <span className="block text-gray-200 select-all font-bold tracking-wider">
                            {apiTokenVisible ? apiToken : "••••••••••••••••••••••••••••••••••••••••••••••••"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setApiTokenVisible(!apiTokenVisible)}
                            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-all cursor-pointer"
                          >
                            {apiTokenVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                            onClick={regenerateToken}
                            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-all cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BILLING & RESOURCE TIERS */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-extrabold text-[#1c1f23]">Resource Allocation & Subscriptions</h2>
                    <p className="text-xs text-[#676879] mt-0.5">Monitor current compute overheads and enterprise subscription limits.</p>
                  </div>
                  <hr className="border-[#e1e4e8]" />

                  {/* Resource Utilization Gauges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <div className="p-4 border border-[#c3c6cd] rounded-lg bg-[#f5f6f8]/40">
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span>Database Row Limits</span>
                        <span className="text-gray-500">62,401 / 1,000,000</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#0073ea] h-full rounded-full" style={{ width: "6.2%" }}></div>
                      </div>
                    </div>

                    <div className="p-4 border border-[#c3c6cd] rounded-lg bg-[#f5f6f8]/40">
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span>API Call Threshold (Monthly)</span>
                        <span className="text-gray-500">845,200 / Unlimited</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#784bd1] h-full rounded-full" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#784bd1]/10 to-[#0073ea]/5 border border-[#784bd1]/20 p-5 rounded-lg max-w-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#1c1f23]">Premium Support Framework Enabled</h4>
                      <p className="text-xs text-[#676879] mt-0.5">Your Enterprise account has a direct 15-minute SLA pipeline with engineering handlers.</p>
                    </div>
                    <button className="bg-[#784bd1] hover:bg-[#663cb6] text-white font-bold text-xs px-4 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer">
                      Contact Account Executive
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: AUDIT TRAIL LOGS */}
              {activeTab === "audit" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-[#1c1f23]">Ecosystem Infrastructure Audit Trail</h2>
                      <p className="text-xs text-[#676879] mt-0.5">Immutable structural tracking log of administrative context operations.</p>
                    </div>
                    <button 
                      onClick={() => showToast("Exporting security matrix log spreadsheet...", "success")}
                      className="text-xs font-bold border border-[#c3c6cd] hover:bg-gray-50 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Logs
                    </button>
                  </div>
                  <hr className="border-[#e1e4e8]" />

                  {/* Audit Logs Dynamic List Stack */}
                  <div className="space-y-2 max-w-3xl">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3 border border-[#e1e4e8] hover:border-[#c3c6cd] rounded-md bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all">
                        <div className="flex items-start sm:items-center gap-3">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                            log.category === "Security" ? "bg-red-50 text-red-600 border border-red-100" :
                            log.category === "Team" ? "bg-blue-50 text-[#0073ea] border border-blue-100" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {log.category}
                          </span>
                          <span className="text-xs font-bold text-[#1c1f23]">{log.action}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-medium text-gray-400 self-end sm:self-auto">
                          <span>Operator: <strong className="text-gray-700 font-semibold">{log.user}</strong></span>
                          <span className="font-mono">{log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}