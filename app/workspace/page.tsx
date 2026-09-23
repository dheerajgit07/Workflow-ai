"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Plus, Trash2, Calendar, CheckCircle, Clock, ChevronDown, 
  X, Home, Users, CreditCard, Settings, Ticket, 
  FileText, UserPlus, ShieldCheck, Edit2, UserCheck, Search, Activity
} from "lucide-react";

interface Log {
  id: string | number;
  text: string;
  time: string;
}

interface TicketType {
  id: string;
  _id?: string;
  name: string;
  status: string;
  owner: string;
  date: string;
  group: string;
  description: string;
  logs: Log[];
}

export default function WorkspacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  
  const [newTicket, setNewTicket] = useState({ 
    name: "", 
    owner: "Aman Sharma", 
    date: new Date().toISOString().split("T")[0],
    description: "" 
  });

  const members = [
    { id: 1, name: "Aman Sharma", role: "Admin/Agent", initial: "AS", color: "bg-indigo-500" },
    { id: 2, name: "Rahul Verma", role: "Collaborator", initial: "RV", color: "bg-emerald-500" },
    { id: 3, name: "Priya Patel", role: "Agent", initial: "PP", color: "bg-pink-500" },
  ];

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    
    // Automatically open "Add Ticket" modal if redirected with add=true param
    if (searchParams.get("add") === "true") {
      setShowAddTaskModal(true);
    }
  }, [searchParams]);

  // Create Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.name || !newTicket.date) return alert("Please fill in all details!");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTicket.name,
          owner: newTicket.owner,
          date: newTicket.date,
          description: newTicket.description || "No custom diagnostic parameters defined yet.",
          status: "In Progress",
          group: "active"
        })
      });

      if (res.ok) {
        const created = await res.json();
        setTickets([created, ...tickets]);
        setNewTicket({ 
          name: "", 
          owner: "Aman Sharma", 
          date: new Date().toISOString().split("T")[0],
          description: "" 
        });
        setShowAddTaskModal(false);
        // Create an audit notification
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Incident Registered",
            message: `A new service ticket was added: "${newTicket.name}" assigned to ${newTicket.owner}.`
          })
        });
      }
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  // Toggle Ticket Status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const isDone = currentStatus === "Done";
    const nextStatus = isDone ? "In Progress" : "Done";
    const nextGroup = isDone ? "active" : "done";

    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: nextStatus,
          group: nextGroup
        })
      });

      if (res.ok) {
        setTickets(tickets.map(t => (t.id === id || t._id === id) ? { ...t, status: nextStatus, group: nextGroup } : t));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Update Field directly
  const handleFieldChange = async (id: string, field: string, value: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });

      if (res.ok) {
        setTickets(tickets.map(t => (t.id === id || t._id === id) ? { ...t, [field]: value } : t));
      }
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    }
  };

  // Inline rename save
  const saveInlineRename = async (id: string) => {
    if (!editNameValue.trim()) return setEditingTaskId(null);
    await handleFieldChange(id, "name", editNameValue);
    setEditingTaskId(null);
  };

  // Delete Ticket
  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Are you sure you want to remove this incident ticket?")) return;

    try {
      const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTickets(tickets.filter(t => t.id !== id && t._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete ticket:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  const activeIncidents = tickets.filter(t => t.group === "active");
  const resolvedIncidents = tickets.filter(t => t.group === "done");

  return (
    <div className="space-y-6">
      
      {/* Upper Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Service Board Operations</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">🚀 Double click on ticket descriptions to rename inline, or click rows to open detailed metrics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMembersModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 shadow-2xs cursor-pointer transition-colors"
          >
            <Users className="h-4 w-4 text-blue-600" />
            <span>Workspace Members</span>
          </button>

          <button 
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Ticket</span>
          </button>
        </div>
      </div>

      {/* Boards Mapping */}
      <div className="space-y-8">
        
        {/* Active Incidents Board */}
        <GroupContainer 
          title="ACTIVE INCIDENTS" 
          count={activeIncidents.length} 
          tasks={activeIncidents} 
          color="border-l-blue-500 dark:border-l-blue-600" 
          availableMembers={members}
          onRowSelect={(id: string) => router.push(`/workspace/${id}`)}
          onToggle={(id: string, status: string) => handleToggleStatus(id, status)} 
          onDelete={handleDeleteTicket}
          editingTaskId={editingTaskId}
          editNameValue={editNameValue}
          setEditNameValue={setEditNameValue}
          startEditing={(id: string, name: string) => { setEditingTaskId(id); setEditNameValue(name); }}
          saveInlineUpdate={saveInlineRename}
          onOwnerChange={(id: string, val: string) => handleFieldChange(id, "owner", val)}
          onDateChange={(id: string, val: string) => handleFieldChange(id, "date", val)}
        />

        {/* Resolved Incidents Board */}
        <GroupContainer 
          title="RESOLVED INCIDENTS" 
          count={resolvedIncidents.length} 
          tasks={resolvedIncidents} 
          color="border-l-emerald-500 dark:border-l-emerald-600" 
          availableMembers={members}
          onRowSelect={(id: string) => router.push(`/workspace/${id}`)}
          onToggle={(id: string, status: string) => handleToggleStatus(id, status)} 
          onDelete={handleDeleteTicket}
          editingTaskId={editingTaskId}
          editNameValue={editNameValue}
          setEditNameValue={setEditNameValue}
          startEditing={(id: string, name: string) => { setEditingTaskId(id); setEditNameValue(name); }}
          saveInlineUpdate={saveInlineRename}
          onOwnerChange={(id: string, val: string) => handleFieldChange(id, "owner", val)}
          onDateChange={(id: string, val: string) => handleFieldChange(id, "date", val)}
        />

      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl w-[380px] shadow-2xl relative">
            <button 
              onClick={() => setShowMembersModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="font-extrabold text-base text-gray-900 dark:text-white">Workspace Members</h2>
            <div className="mt-4 space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl">
                  <div className={`h-8.5 w-8.5 ${m.color} text-white font-black text-xs rounded-lg flex items-center justify-center shadow-2xs`}>{m.initial}</div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{m.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleCreateTicket} 
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl w-[420px] shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b dark:border-gray-800 pb-3">
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">Register Incident Ticket</h2>
              <button 
                type="button" 
                onClick={() => setShowAddTaskModal(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Ticket Title</label>
              <input 
                type="text" 
                required 
                placeholder="Error details or description parameters..." 
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800" 
                value={newTicket.name} 
                onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Assignee</label>
                <select 
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500"
                  value={newTicket.owner}
                  onChange={(e) => setNewTicket({ ...newTicket, owner: e.target.value })}
                >
                  {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Timeline limit</label>
                <input 
                  type="date" 
                  required 
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500" 
                  value={newTicket.date} 
                  onChange={(e) => setNewTicket({ ...newTicket, date: e.target.value })} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Diagnostic Description</label>
              <textarea 
                placeholder="Log internal diagnostics or gateway logs..." 
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs outline-none focus:border-blue-500 h-20 resize-none" 
                value={newTicket.description} 
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} 
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98 cursor-pointer mt-2"
            >
              DEPLOY TICKET MODULE
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

// Group container board wrapper
function GroupContainer({ 
  title, count, tasks, color, availableMembers, onRowSelect, onToggle, onDelete, 
  editingTaskId, editNameValue, setEditNameValue, startEditing, saveInlineUpdate,
  onOwnerChange, onDateChange 
}: any) {
  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center gap-2 text-gray-500 font-bold px-1">
        <ChevronDown className="h-4 w-4" />
        <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-gray-700 dark:text-gray-300">{title}</h3>
        <span className="text-[10px] bg-gray-200/80 dark:bg-gray-850 text-gray-650 dark:text-gray-400 font-black px-2 py-0.5 rounded-full">{count}</span>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xs overflow-hidden">
        {/* Table Headers */}
        <div className="grid grid-cols-12 bg-gray-50/70 dark:bg-gray-800/40 p-3.5 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase border-b border-gray-200 dark:border-gray-800">
          <div className="col-span-5 pl-2">Ticket Description</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-3 text-center">Assigned Agent</div>
          <div className="col-span-2 text-right pr-4">Timeline Limit</div>
        </div>

        {tasks.length === 0 ? (
          <p className="text-xs text-gray-450 dark:text-gray-500 italic py-8 text-center bg-white dark:bg-gray-900">No tickets found in this segment.</p>
        ) : (
          tasks.map((task: any) => {
            const taskId = task.id || task._id;
            return (
              <div 
                key={taskId} 
                onClick={() => onRowSelect(taskId)}
                className={`grid grid-cols-12 border-b border-gray-100 dark:border-gray-800/50 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-gray-800/30 text-xs border-l-4 cursor-pointer transition-all ${color}`}
              >
                
                {/* COLUMN 1: INTERACTIVE INCIDENT TITLE */}
                <div className="col-span-5 font-bold text-gray-800 dark:text-gray-200 pr-4 pl-1" onClick={(e) => e.stopPropagation()}>
                  {editingTaskId === taskId ? (
                    <input 
                      type="text" 
                      className="w-full p-1.5 border border-blue-500 dark:border-blue-400 rounded-lg text-xs bg-white dark:bg-gray-800 outline-none focus:ring-1 focus:ring-blue-100"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      onBlur={() => saveInlineUpdate(taskId)}
                      onKeyDown={(e) => e.key === "Enter" && saveInlineUpdate(taskId)}
                      autoFocus
                    />
                  ) : (
                    <div 
                      onDoubleClick={() => startEditing(taskId, task.name)}
                      className="flex items-center gap-2 group/text truncate"
                      title="Double click to update name directly"
                    >
                      <span className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-extrabold">{task.name}</span>
                      <Edit2 className="h-3 w-3 text-gray-300 opacity-0 group-hover/text:opacity-100 transition-opacity ml-auto shrink-0" />
                    </div>
                  )}
                </div>
                
                {/* COLUMN 2: TOGGLE STATUS */}
                <div className="col-span-2 flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => onToggle(taskId, task.status)} 
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase border shadow-3xs cursor-pointer active:scale-95 transition-all ${
                      task.status === 'Done' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                    }`}
                  >
                    {task.status === 'Done' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    <span>{task.status}</span>
                  </button>
                </div>

                {/* COLUMN 3: DROPDOWN ASSIGNEE */}
                <div className="col-span-3 flex justify-center px-2" onClick={(e) => e.stopPropagation()}>
                  <div className="relative w-full max-w-[150px] flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <UserCheck className="h-3 w-3 text-gray-400 dark:text-gray-500 shrink-0" />
                    <select 
                      value={task.owner} 
                      onChange={(e) => onOwnerChange(taskId, e.target.value)}
                      className="w-full bg-transparent text-[10px] font-extrabold text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer appearance-none"
                    >
                      {availableMembers.map((m: any) => <option key={m.id} value={m.name} className="dark:bg-gray-900">{m.name}</option>)}
                    </select>
                    <ChevronDown className="h-3 w-3 text-gray-400 ml-auto pointer-events-none shrink-0" />
                  </div>
                </div>

                {/* COLUMN 4: CALENDAR LIMIT & DELETE */}
                <div className="col-span-2 flex items-center justify-end gap-2 text-gray-400 pr-1" onClick={(e) => e.stopPropagation()}>
                  <div className="relative flex items-center gap-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1">
                    <Calendar className="h-3 w-3 text-gray-400 shrink-0" />
                    <input 
                      type="date" 
                      value={task.date}
                      onChange={(e) => onDateChange(taskId, e.target.value)}
                      className="bg-transparent text-[10px] font-bold text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer w-[92px]"
                    />
                  </div>
                  <button 
                    onClick={() => onDelete(taskId)} 
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
