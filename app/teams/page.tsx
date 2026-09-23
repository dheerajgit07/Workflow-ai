"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Search, Trash2, Shield, Mail, Loader2,
  UserPlus, X, Briefcase, Star, LayoutGrid, SlidersHorizontal,
  RefreshCw, CheckCircle2, ChevronDown
} from "lucide-react";

// --- STRICT TYPE CONFIGURATION ---
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Agent" | "Collaborator";
  status: "Active" | "Invited";
  teamName: string;
  initial: string;
  color: string;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 1, name: "Aman Sharma", email: "aman@workflow.ai", role: "Admin", status: "Active", teamName: "Dev Team", initial: "AS", color: "bg-indigo-500" },
  { id: 2, name: "Rahul Verma", email: "rahul@workflow.ai", role: "Collaborator", status: "Active", teamName: "Design Team", initial: "RV", color: "bg-emerald-500" },
  { id: 3, name: "Priya Patel", email: "priya@workflow.ai", role: "Agent", status: "Active", teamName: "Dev Team", initial: "PP", color: "bg-pink-500" },
  { id: 4, name: "Rohan Das", email: "rohan@workflow.ai", role: "Agent", status: "Invited", teamName: "Management", initial: "RD", color: "bg-amber-500" },
];

export default function TeamsPage() {
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [apiLoading, setApiLoading] = useState(true);
  const [actionProcessingId, setActionProcessingId] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("All");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"Admin" | "Agent" | "Collaborator">("Agent");
  const [newMemberTeam, setNewMemberTeam] = useState("Dev Team");

  // Available Teams List for Grid Dropdown Update
  const AVAILABLE_TEAMS = ["Dev Team", "Design Team", "Management", "QA Engineers"];

  // --- 🔄 1. GET: Fetch Members ---
  const fetchMembers = useCallback(async () => {
    try {
      setApiLoading(true);
      const res = await fetch("/api/teams", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else {
        if(members.length === 0) setMembers(DEFAULT_MEMBERS);
      }
    } catch (err) {
      if(members.length === 0) setMembers(DEFAULT_MEMBERS);
    } finally {
      setApiLoading(false);
    }
  }, [members.length]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --- ➕ 2. POST: Invite Member ---
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const initials = newMemberName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const tailwindColors = ["bg-indigo-500", "bg-emerald-500", "bg-pink-500", "bg-amber-500", "bg-blue-500"];
    const randomColor = tailwindColors[Math.floor(Math.random() * tailwindColors.length)];

    const payload: TeamMember = {
      id: Date.now(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      teamName: newMemberTeam,
      initial: initials || "U",
      color: randomColor,
      status: "Invited"
    };

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) await fetchMembers();
      else setMembers(prev => [...prev, payload]);
      
      setNewMemberName("");
      setNewMemberEmail("");
      setShowAddMemberModal(false);
    } catch (err) {
      setMembers(prev => [...prev, payload]);
      setShowAddMemberModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 👤 3. PUT: Role Update ---
  const handleRoleChange = async (id: number, newRole: "Admin" | "Agent" | "Collaborator") => {
    setActionProcessingId(id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));

    try {
      await fetch("/api/teams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole })
      });
    } catch (err) {
      console.warn("Local update fallback synchronized.");
    } finally {
      setTimeout(() => setActionProcessingId(null), 400);
    }
  };

  // --- 🏢 PUT: Team Name Live Update ---
  const handleTeamChange = async (id: number, newTeamName: string) => {
    setActionProcessingId(id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, teamName: newTeamName } : m));

    try {
      await fetch("/api/teams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, teamName: newTeamName })
      });
    } catch (err) {
      console.warn("Local team update synced.");
    } finally {
      setTimeout(() => setActionProcessingId(null), 400);
    }
  };

  // --- 🔄 4. PUT: Status Toggle ---
  const handleStatusToggle = async (id: number) => {
    const target = members.find(m => m.id === id);
    if (!target) return;

    setActionProcessingId(id);
    const nextStatus = target.status === "Active" ? "Invited" : "Active";
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus } : m));

    try {
      await fetch("/api/teams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus })
      });
    } catch (err) {
      console.warn("Local status toggle synchronized.");
    } finally {
      setTimeout(() => setActionProcessingId(null), 400);
    }
  };

  // --- ❌ 5. DELETE: Remove Member ---
  const handleDeleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    setActionProcessingId(id);
    setMembers(prev => prev.filter(m => m.id !== id));

    try {
      await fetch(`/api/teams?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Local purge synchronized.");
    } finally {
      setActionProcessingId(null);
    }
  };

  // --- FILTER MATRIX LOGIC ---
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = selectedTeamFilter === "All" || member.teamName === selectedTeamFilter;
    return matchesSearch && matchesTeam;
  });

  const uniqueTeams = ["All", ...AVAILABLE_TEAMS];

  if (apiLoading && members.length === 0) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#f5f6f8]">
        <RefreshCw className="h-8 w-8 text-[#0073ea] animate-spin" />
        <p className="mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Framework...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-gray-800 font-sans antialiased selection:bg-[#0073ea]/20">
      
      {/* Sub Header Panel */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
              <span>Workspace Administration</span> / <span>Users Hub</span>
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5 text-gray-900 tracking-tight">
              <Users className="w-6 h-6 text-[#0073ea]" /> Teams Management
            </h1>
          </div>

          <button 
            onClick={() => setShowAddMemberModal(true)}
            className="bg-[#0073ea] hover:bg-[#0060c4] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Invite New Member
          </button>
        </div>

        {/* Filter Navigation Engine */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0073ea] transition-colors" />
              <input 
                type="text" 
                placeholder="Search name, corporate mail..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0073ea] focus:ring-2 focus:ring-blue-100 w-64 transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
              {uniqueTeams.map((team) => (
                <button
                  key={team}
                  onClick={() => setSelectedTeamFilter(team)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 cursor-pointer ${
                    selectedTeamFilter === team 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
            <LayoutGrid className="w-4 h-4" />
            <span>Total Headcount: <b className="text-gray-800">{filteredMembers.length}</b></span>
          </div>
        </div>
      </div>

      {/* Main Grid Sheet Board View */}
      <div className="p-8 max-w-[1600px] mx-auto animate-[fadeIn_0.4s_ease-out]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Spreadsheet Header Layer */}
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 p-3.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest select-none">
            <div className="col-span-4 pl-3">Member Details</div>
            <div className="col-span-3 pl-2">Department / Workspace Team</div>
            <div className="col-span-2 text-center">System Authority</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-right pr-4">Actions</div>
          </div>

          {/* Spreadsheet Row Layer */}
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 italic">
              No workflow team members found matching your filtration criteria.
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className={`grid grid-cols-12 p-4 items-center border-b border-gray-100 hover:bg-slate-50/80 transition-all duration-200 group relative ${
                  actionProcessingId === member.id ? "opacity-60 bg-blue-50/30" : ""
                }`}
              >
                {/* 1. Member Profile Cell */}
                <div className="col-span-4 flex items-center gap-3 pl-1">
                  <div className={`h-9 w-9 ${member.color} text-white font-black text-xs rounded-xl flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105 select-none relative shrink-0`}>
                    {actionProcessingId === member.id ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <span>{member.initial}</span>
                    )}
                  </div>
                  <div className="truncate pr-4">
                    <h4 className="font-semibold text-gray-900 truncate flex items-center gap-1.5 transition-colors duration-200 group-hover:text-[#0073ea]">
                      {member.name}
                      {member.role === "Admin" && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-[spin_4s_linear_infinite]" />}
                    </h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1 truncate mt-0.5"><Mail className="w-3 h-3" />{member.email}</p>
                  </div>
                </div>

                {/* 2. LIVE UPDATED TEAM DROPDOWN */}
                <div className="col-span-3 pr-4">
                  <div className="relative flex items-center gap-1.5 bg-gray-50/50 border border-gray-200/80 hover:border-gray-300 rounded-lg px-2.5 py-1.5 transition-all duration-200 focus-within:border-[#0073ea] w-full max-w-[200px]">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <select
                      value={member.teamName}
                      onChange={(e) => handleTeamChange(member.id, e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-gray-700 focus:outline-none cursor-pointer appearance-none pr-4"
                    >
                      {AVAILABLE_TEAMS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 pointer-events-none transition-transform duration-200" />
                  </div>
                </div>

                {/* 3. Authority Permissions Dropdown */}
                <div className="col-span-2 flex justify-center">
                  <div className="relative flex items-center gap-1.5 bg-gray-50/50 border border-gray-200/80 hover:border-gray-300 rounded-lg px-2.5 py-1.5 w-full max-w-[140px] transition-all duration-200 focus-within:border-[#0073ea]">
                    <Shield className="w-3.5 h-3.5 text-gray-400" />
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                      className="w-full bg-transparent text-xs font-bold text-gray-600 focus:outline-none cursor-pointer appearance-none pr-4"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Agent">Agent</option>
                      <option value="Collaborator">Collaborator</option>
                    </select>
                    <SlidersHorizontal className="w-3 h-3 text-gray-400 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* 4. Status Switcher Trigger */}
                <div className="col-span-2 flex justify-center">
                  <button
                    onClick={() => handleStatusToggle(member.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1 ${
                      member.status === "Active" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70" 
                        : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100/70 animate-pulse"
                    }`}
                  >
                    {member.status === "Active" && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                    {member.status}
                  </button>
                </div>

                {/* 5. Destructive Action - Smooth Hover Fade-in Slide */}
                <div className="col-span-1 flex justify-end pr-2">
                  <button 
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 cursor-pointer"
                    title="Remove User completely"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* --- INVITE MODAL POPUP --- */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 animate-[slideUp_0.3s_ease-out]">
            
            <div className="bg-[#f5f6f8] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0073ea]" /> Invite to Core Workspace
              </h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Aman Sharma" 
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white text-gray-800 focus:outline-none focus:border-[#0073ea]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Corporate Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com" 
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white text-gray-800 focus:outline-none focus:border-[#0073ea]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Initial Department</label>
                  <select 
                    value={newMemberTeam}
                    onChange={(e) => setNewMemberTeam(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#0073ea]"
                  >
                    {AVAILABLE_TEAMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Permissions Level</label>
                  <select 
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#0073ea]"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Agent">Agent</option>
                    <option value="Collaborator">Collaborator</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold bg-[#0073ea] hover:bg-[#0060c4] text-white rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

    </div>
  );
}