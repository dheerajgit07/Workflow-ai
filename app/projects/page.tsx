"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, FolderKanban, CheckCircle2, Clock, X, DollarSign, UserCheck } from "lucide-react";

interface ProjectType {
  id: string;
  _id?: string;
  name: string;
  status: string;
  budget: string;
  timeline: string;
  progress: number;
  client: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    status: "In Progress",
    budget: "$12,000",
    timeline: new Date().toISOString().split("T")[0],
    progress: 10,
    client: "Internal"
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.timeline) return alert("Please fill details.");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        const data = await res.json();
        setProjects([data, ...projects]);
        setShowAddModal(false);
        setNewProject({
          name: "",
          status: "In Progress",
          budget: "$12,000",
          timeline: new Date().toISOString().split("T")[0],
          progress: 10,
          client: "Internal"
        });
      }
    } catch (err) {
      console.error("Failed to add project:", err);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Completed" ? "In Progress" : "Completed";
    const nextProgress = nextStatus === "Completed" ? 100 : 50;
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus, progress: nextProgress })
      });
      if (res.ok) {
        setProjects(projects.map(p => (p.id === id || p._id === id) ? { ...p, status: nextStatus, progress: nextProgress } : p));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id && p._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Active Projects</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage deliverables, budgets, client interfaces, and timelines.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const projId = proj.id || proj._id || "";
          return (
            <div key={projId} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-2xs relative group">
              <button 
                onClick={() => handleDelete(projId)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    proj.status === "Completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
                  }`}>
                    {proj.status}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold ml-auto">{proj.client}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <FolderKanban className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">{proj.name}</h3>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                    <span>completion</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-3 border-t border-gray-100 dark:border-gray-800/60 font-semibold text-gray-500 dark:text-gray-450">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                    <span>Budget: <b>{proj.budget}</b></span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>Limit: <b>{proj.timeline}</b></span>
                  </span>
                </div>

                <button 
                  onClick={() => handleUpdateStatus(projId, proj.status)}
                  className="w-full py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer"
                >
                  {proj.status === "Completed" ? "Re-open Project" : "Mark as Completed"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl w-[380px] shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b dark:border-gray-800 pb-3">
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">Create New Project</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Project Name</label>
              <input 
                type="text" required placeholder="Project title..." 
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500" 
                value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Client Name</label>
              <input 
                type="text" required placeholder="Acme Corp, Internal etc..." 
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500" 
                value={newProject.client} onChange={(e) => setNewProject({ ...newProject, client: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Project Budget</label>
                <input 
                  type="text" required placeholder="$12,000" 
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500" 
                  value={newProject.budget} onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Timeline Target</label>
                <input 
                  type="date" required 
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500" 
                  value={newProject.timeline} onChange={(e) => setNewProject({ ...newProject, timeline: e.target.value })} 
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98 cursor-pointer mt-2">
              INITIATE PROJECT DELIVERABLE
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
