"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Play, Plus, Trash2, Calendar, CheckCircle2, Clock, ChevronRight,
  X, User, BarChart2, Eye, Activity, RotateCw, Settings2, Sliders
} from "lucide-react";

interface HistoryLog {
  id: string | number;
  action: string;
  user: string;
  time: string;
}

interface WorkflowType {
  id: string;
  _id?: string;
  name: string;
  status: string;
  assignee: string;
  progress: number;
  timeline: string;
  analytics: {
    views: number;
    updates: number;
  };
  history: HistoryLog[];
}

export default function WorkflowPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected workflow for detail sidebar drawer
  const [selectedWf, setSelectedWf] = useState<WorkflowType | null>(null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Forms state
  const [newWf, setNewWf] = useState({
    name: "",
    assignee: "Aman Sharma",
    timeline: new Date().toISOString().split("T")[0],
    progress: 0,
    status: "In Progress"
  });

  const members = [
    { id: 1, name: "Aman Sharma" },
    { id: 2, name: "Rahul Verma" },
    { id: 3, name: "Priya Patel" }
  ];

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
      }
    } catch (err) {
      console.error("Failed to load workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    
    if (searchParams.get("add") === "true") {
      setShowAddModal(true);
    }
  }, [searchParams]);

  // Create Workflow
  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWf.name || !newWf.timeline) return alert("Please fill in name and date.");

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWf)
      });

      if (res.ok) {
        const created = await res.json();
        setWorkflows([created, ...workflows]);
        setNewWf({
          name: "",
          assignee: "Aman Sharma",
          timeline: new Date().toISOString().split("T")[0],
          progress: 0,
          status: "In Progress"
        });
        setShowAddModal(false);
        
        // Post notification
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Workflow Initiated",
            message: `Workflow "${newWf.name}" was deployed with ${newWf.progress}% initial progress.`
          })
        });
      }
    } catch (err) {
      console.error("Failed to create workflow:", err);
    }
  };

  // Select Workflow and fetch incremented views
  const handleSelectWorkflow = async (wf: WorkflowType) => {
    const wfId = wf.id || wf._id || "";
    setSelectedWf(wf);
    
    try {
      const res = await fetch(`/api/workflows/${wfId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedWf(data);
        // Sync in master list
        setWorkflows(workflows.map(w => (w.id === wfId || w._id === wfId) ? data : w));
      }
    } catch (err) {
      console.error("Failed to fetch workflow details:", err);
    }
  };

  // Update Workflow fields
  const handleUpdateWorkflow = async (id: string, field: string, value: any) => {
    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [field]: value,
          user: user?.name
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setWorkflows(workflows.map(w => (w.id === id || w._id === id) ? updated : w));
        if (selectedWf && (selectedWf.id === id || selectedWf._id === id)) {
          setSelectedWf(updated);
        }
      }
    } catch (err) {
      console.error(`Failed to update workflow ${field}:`, err);
    }
  };

  // Delete Workflow
  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow plan?")) return;

    try {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWorkflows(workflows.filter(w => w.id !== id && w._id !== id));
        if (selectedWf && (selectedWf.id === id || selectedWf._id === id)) {
          setSelectedWf(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete workflow:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full gap-6 overflow-hidden relative">
      
      {/* Master List Section */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        
        {/* Upper Heading Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Active Workflows</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">📂 Manage progress metrics, agent allocations, and view audit trails.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Deploy Workflow</span>
          </button>
        </div>

        {/* Grid Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {workflows.map((wf) => {
            const wfId = wf.id || wf._id || "";
            const isSelected = selectedWf && (selectedWf.id === wfId || selectedWf._id === wfId);
            return (
              <div 
                key={wfId} 
                onClick={() => handleSelectWorkflow(wf)}
                className={`bg-white dark:bg-gray-900 border p-5 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                  isSelected 
                    ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950/20" 
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                {/* Floating trash button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWorkflow(wfId);
                  }}
                  className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div className="space-y-4">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      wf.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                    }`}>
                      {wf.status}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold ml-auto">Limit: {wf.timeline}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight pr-6">{wf.name}</h3>

                  {/* Progress Metrics */}
                  <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wider">Flow Completion</span>
                      <span className="text-blue-600 dark:text-blue-400">{wf.progress}%</span>
                    </div>
                    {/* Range slider or bar */}
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        value={wf.progress} 
                        onChange={(e) => handleUpdateWorkflow(wfId, "progress", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Operational Footer info */}
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-gray-50 dark:border-gray-850/50">
                    <span className="font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span>Assignee:</span> <b className="text-gray-700 dark:text-gray-300">{wf.assignee}</b>
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-0.5">
                      <span>Telemetry Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Slide Drawer for details */}
      {selectedWf && (
        <div className="w-[360px] border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl flex flex-col h-full overflow-hidden shrink-0 select-none animate-slide-in">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b dark:border-gray-800 pb-4">
            <div>
              <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <BarChart2 className="h-4.5 w-4.5 text-blue-600" />
                <span>Workflow Details</span>
              </h2>
            </div>
            <button 
              onClick={() => setSelectedWf(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto py-5 space-y-6 [&::-webkit-scrollbar]:hidden">
            
            {/* Title display */}
            <div className="space-y-1.5">
              <h1 className="text-base font-black text-gray-950 dark:text-white leading-tight">{selectedWf.name}</h1>
              <p className="text-[10px] text-gray-400 font-mono">FLOW_ID: #{selectedWf.id || selectedWf._id}</p>
            </div>

            {/* Quick configurations */}
            <div className="bg-gray-50 dark:bg-gray-850 p-4 border border-gray-100 dark:border-gray-800/40 rounded-xl space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Workflow Status</label>
                <select 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-xs outline-none"
                  value={selectedWf.status}
                  onChange={(e) => handleUpdateWorkflow(selectedWf.id || selectedWf._id || "", "status", e.target.value)}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Workflow Assignee</label>
                <select 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-xs outline-none"
                  value={selectedWf.assignee}
                  onChange={(e) => handleUpdateWorkflow(selectedWf.id || selectedWf._id || "", "assignee", e.target.value)}
                >
                  {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Timeline deadline</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-xs outline-none"
                  value={selectedWf.timeline}
                  onChange={(e) => handleUpdateWorkflow(selectedWf.id || selectedWf._id || "", "timeline", e.target.value)}
                />
              </div>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50/50 dark:bg-gray-800/30 border dark:border-gray-800 rounded-xl text-center space-y-0.5">
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">VIEWS</span>
                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{selectedWf.analytics?.views || 1}</span>
                </span>
              </div>
              <div className="p-3 bg-gray-50/50 dark:bg-gray-800/30 border dark:border-gray-800 rounded-xl text-center space-y-0.5">
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">UPDATES</span>
                <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                  <RotateCw className="h-4 w-4" />
                  <span>{selectedWf.analytics?.updates || 0}</span>
                </span>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* History logs */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-purple-500" />
                <span>Change Logs History ({selectedWf.history?.length || 0})</span>
              </h3>
              
              <div className="space-y-2 border-l border-gray-150 dark:border-gray-800 pl-3 ml-1.5 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {!selectedWf.history || selectedWf.history.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">No history logs.</p>
                ) : (
                  selectedWf.history.slice().reverse().map((log: any, idx: number) => (
                    <div key={log.id || idx} className="relative">
                      <span className="absolute -left-[16.5px] mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                      <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{log.action}</p>
                      <span className="text-[9px] text-gray-400 block mt-0.5">By {log.user || "System"} • {log.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleCreateWorkflow}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl w-[380px] shadow-2xl space-y-4 animate-scale-up"
          >
            <div className="flex justify-between items-center border-b dark:border-gray-800 pb-3">
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">Deploy Workflow Module</h2>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Workflow Title</label>
              <input 
                type="text" 
                required 
                placeholder="Workflow name (e.g., API Modernization)..." 
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800"
                value={newWf.name}
                onChange={(e) => setNewWf({ ...newWf, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Assignee</label>
              <select 
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500"
                value={newWf.assignee}
                onChange={(e) => setNewWf({ ...newWf, assignee: e.target.value })}
              >
                {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Timeline Target</label>
              <input 
                type="date" 
                required 
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500"
                value={newWf.timeline}
                onChange={(e) => setNewWf({ ...newWf, timeline: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Initial Progress ({newWf.progress}%)</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={newWf.progress}
                onChange={(e) => setNewWf({ ...newWf, progress: parseInt(e.target.value) })}
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98 cursor-pointer mt-2"
            >
              DEPLOY WORKFLOW PLAN
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
